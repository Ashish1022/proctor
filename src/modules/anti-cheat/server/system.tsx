import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Mic, MicOff, Eye, EyeOff, AlertTriangle, Shield, Maximize } from 'lucide-react';

// Types
interface Violation {
    id: number;
    type: ViolationType;
    description: string;
    severity: ViolationSeverity;
    timestamp: string;
}

type ViolationType =
    | 'tab_switch'
    | 'fullscreen_exit'
    | 'camera_disabled'
    | 'audio_disabled'
    | 'suspicious_keys'
    | 'copy_paste'
    | 'right_click'
    | 'developer_tools'
    | 'inactive_too_long';

type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';

interface AntiCheatSystemProps {
    onViolation?: (violation: Violation, allViolations: Violation[]) => void;
    onSystemReady?: (ready: boolean) => void;
    onQuizTerminated?: () => void;
    isQuizActive?: boolean;
    strictMode?: boolean;
    maxViolations?: number;
}

interface SystemStatus {
    camera: boolean;
    audio: boolean;
    fullscreen: boolean;
    visible: boolean;
    ready: boolean;
}

const AntiCheatSystem: React.FC<AntiCheatSystemProps> = ({
    onViolation,
    onSystemReady,
    onQuizTerminated,
    isQuizActive = false,
    strictMode = true,
    maxViolations = 3
}) => {
    // Core state
    const [violations, setViolations] = useState<Violation[]>([]);
    const [systemStatus, setSystemStatus] = useState<SystemStatus>({
        camera: false,
        audio: false,
        fullscreen: false,
        visible: true,
        ready: false
    });
    const [tabSwitches, setTabSwitches] = useState(0);

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const visibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const devToolsIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Violation types constant
    const VIOLATION_TYPES: Record<string, ViolationType> = {
        TAB_SWITCH: 'tab_switch',
        FULLSCREEN_EXIT: 'fullscreen_exit',
        CAMERA_DISABLED: 'camera_disabled',
        AUDIO_DISABLED: 'audio_disabled',
        SUSPICIOUS_KEYS: 'suspicious_keys',
        COPY_PASTE: 'copy_paste',
        RIGHT_CLICK: 'right_click',
        DEVELOPER_TOOLS: 'developer_tools',
        INACTIVE_TOO_LONG: 'inactive_too_long',
    } as const;

    // Add violation function
    const addViolation = useCallback((type: ViolationType, description: string, severity: ViolationSeverity = 'medium') => {
        const violation: Violation = {
            id: Date.now(),
            type,
            description,
            severity,
            timestamp: new Date().toISOString(),
        };

        setViolations(prev => {
            const newViolations = [...prev, violation];
            onViolation?.(violation, newViolations);

            // Auto-terminate quiz if too many violations
            if (newViolations.length >= maxViolations && strictMode) {
                handleQuizTermination();
            }

            return newViolations;
        });
    }, [maxViolations, strictMode, onViolation]);

    // Initialize camera and microphone
    const initializeMedia = useCallback(async (): Promise<void> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
                audio: true
            });

            mediaStreamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            setSystemStatus(prev => ({ ...prev, camera: true, audio: true }));

            // Monitor media tracks
            const videoTrack = stream.getVideoTracks()[0];
            const audioTrack = stream.getAudioTracks()[0];

            if (videoTrack) {
                videoTrack.addEventListener('ended', () => {
                    setSystemStatus(prev => ({ ...prev, camera: false }));
                    addViolation(VIOLATION_TYPES.CAMERA_DISABLED, 'Camera was disabled during quiz', 'high');
                });
            }

            if (audioTrack) {
                audioTrack.addEventListener('ended', () => {
                    setSystemStatus(prev => ({ ...prev, audio: false }));
                    addViolation(VIOLATION_TYPES.AUDIO_DISABLED, 'Microphone was disabled during quiz', 'high');
                });
            }

        } catch (error) {
            console.error('Media access denied:', error);
            addViolation(VIOLATION_TYPES.CAMERA_DISABLED, 'Failed to access camera/microphone', 'critical');
        }
    }, [addViolation, VIOLATION_TYPES]);

    // Fullscreen monitoring
    const handleFullscreenChange = useCallback((): void => {
        const isCurrentlyFullscreen = !!document.fullscreenElement;
        setSystemStatus(prev => ({ ...prev, fullscreen: isCurrentlyFullscreen }));

        if (isQuizActive && !isCurrentlyFullscreen && strictMode) {
            addViolation(VIOLATION_TYPES.FULLSCREEN_EXIT, 'Exited fullscreen mode', 'high');
        }
    }, [isQuizActive, strictMode, addViolation, VIOLATION_TYPES]);

    // Tab visibility monitoring
    const handleVisibilityChange = useCallback((): void => {
        const isVisible = !document.hidden;
        setSystemStatus(prev => ({ ...prev, visible: isVisible }));

        if (!isVisible && isQuizActive) {
            setTabSwitches(prev => {
                const newCount = prev + 1;
                addViolation(VIOLATION_TYPES.TAB_SWITCH, `Switched tabs/windows (${newCount} times)`, 'medium');
                return newCount;
            });

            // Start timeout for prolonged absence
            visibilityTimeoutRef.current = setTimeout(() => {
                addViolation(VIOLATION_TYPES.INACTIVE_TOO_LONG, 'Away from quiz for too long', 'high');
            }, 30000); // 30 seconds
        } else if (isVisible && visibilityTimeoutRef.current) {
            clearTimeout(visibilityTimeoutRef.current);
            visibilityTimeoutRef.current = null;
        }
    }, [isQuizActive, addViolation, VIOLATION_TYPES]);

    // Keyboard monitoring
    const handleKeyDown = useCallback((event: KeyboardEvent): void => {
        if (!isQuizActive) return;

        const key = event.key.toLowerCase();

        // Detect suspicious key combinations
        const suspiciousKeys = ['f12', 'f11'];

        if (suspiciousKeys.includes(key)) {
            event.preventDefault();
            addViolation(VIOLATION_TYPES.SUSPICIOUS_KEYS, `Attempted to use ${key.toUpperCase()}`, 'medium');
        }

        // Check for Ctrl+C or Ctrl+V
        if (event.ctrlKey && (key === 'c' || key === 'v')) {
            event.preventDefault();
            addViolation(VIOLATION_TYPES.COPY_PASTE, `Attempted to ${key === 'c' ? 'copy' : 'paste'}`, 'medium');
        }

        // Developer tools detection
        if ((event.ctrlKey && event.shiftKey && (key === 'i' || key === 'j')) || key === 'f12') {
            event.preventDefault();
            addViolation(VIOLATION_TYPES.DEVELOPER_TOOLS, 'Attempted to open developer tools', 'high');
        }
    }, [isQuizActive, addViolation, VIOLATION_TYPES]);

    // Right-click prevention
    const handleContextMenu = useCallback((event: MouseEvent): void => {
        if (isQuizActive && strictMode) {
            event.preventDefault();
            addViolation(VIOLATION_TYPES.RIGHT_CLICK, 'Right-click attempted', 'low');
        }
    }, [isQuizActive, strictMode, addViolation, VIOLATION_TYPES]);

    // Developer tools detection
    const detectDevTools = useCallback((): void => {
        if (!isQuizActive) return;

        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;

        if ((widthThreshold || heightThreshold) && strictMode) {
            addViolation(VIOLATION_TYPES.DEVELOPER_TOOLS, 'Developer tools detected', 'critical');
        }
    }, [isQuizActive, strictMode, addViolation, VIOLATION_TYPES]);

    // Force fullscreen
    const enterFullscreen = useCallback((): void => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(console.error);
        }
    }, []);

    // Terminate quiz
    const handleQuizTermination = useCallback((): void => {
        onQuizTerminated?.();
    }, [onQuizTerminated]);

    // Get severity color
    const getSeverityColor = (severity: ViolationSeverity): string => {
        const colors = {
            low: 'text-yellow-500',
            medium: 'text-orange-500',
            high: 'text-red-500',
            critical: 'text-red-700',
        };
        return colors[severity];
    };

    // Initialize system
    useEffect(() => {
        const initialize = async (): Promise<void> => {
            await initializeMedia();

            // Set up event listeners
            document.addEventListener('fullscreenchange', handleFullscreenChange);
            document.addEventListener('visibilitychange', handleVisibilityChange);
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('contextmenu', handleContextMenu);

            // Start monitoring
            devToolsIntervalRef.current = setInterval(detectDevTools, 1000);

            setSystemStatus(prev => ({ ...prev, ready: true }));
            onSystemReady?.(true);
        };

        initialize();

        // Cleanup
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('contextmenu', handleContextMenu);

            if (devToolsIntervalRef.current) {
                clearInterval(devToolsIntervalRef.current);
            }

            if (visibilityTimeoutRef.current) {
                clearTimeout(visibilityTimeoutRef.current);
            }

            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [initializeMedia, handleFullscreenChange, handleVisibilityChange, handleKeyDown, handleContextMenu, detectDevTools, onSystemReady]);

    return (
        <div className="fixed top-4 right-4 z-50">
            {/* System Status Panel */}
            <div className="bg-white rounded-lg shadow-lg p-4 mb-4 min-w-80">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <Shield className="mr-2" size={20} />
                        Anti-Cheat System
                    </h3>
                    <div className={`w-3 h-3 rounded-full ${systemStatus.ready ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>

                {/* System Status Indicators */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center">
                        <Camera className={`mr-2 ${systemStatus.camera ? 'text-green-500' : 'text-red-500'}`} size={16} />
                        <span className="text-sm">Camera</span>
                    </div>
                    <div className="flex items-center">
                        {systemStatus.audio ?
                            <Mic className="mr-2 text-green-500" size={16} /> :
                            <MicOff className="mr-2 text-red-500" size={16} />
                        }
                        <span className="text-sm">Audio</span>
                    </div>
                    <div className="flex items-center">
                        <Maximize className={`mr-2 ${systemStatus.fullscreen ? 'text-green-500' : 'text-red-500'}`} size={16} />
                        <span className="text-sm">Fullscreen</span>
                    </div>
                    <div className="flex items-center">
                        {systemStatus.visible ?
                            <Eye className="mr-2 text-green-500" size={16} /> :
                            <EyeOff className="mr-2 text-red-500" size={16} />
                        }
                        <span className="text-sm">Focus</span>
                    </div>
                </div>

                {/* Violation Counter */}
                <div className="border-t pt-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Violations</span>
                        <span className={`text-sm font-bold ${violations.length >= maxViolations ? 'text-red-500' : 'text-gray-600'}`}>
                            {violations.length}/{maxViolations}
                        </span>
                    </div>

                    {violations.length > 0 && (
                        <div className="max-h-32 overflow-y-auto space-y-1">
                            {violations.slice(-3).map((violation) => (
                                <div key={violation.id} className="text-xs p-2 bg-gray-50 rounded">
                                    <div className={`font-medium ${getSeverityColor(violation.severity)}`}>
                                        {violation.description}
                                    </div>
                                    <div className="text-gray-500">
                                        {new Date(violation.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                {!systemStatus.fullscreen && isQuizActive && (
                    <button
                        onClick={enterFullscreen}
                        className="w-full mt-3 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                        Enter Fullscreen
                    </button>
                )}

                {violations.length >= maxViolations && (
                    <div className="mt-3 p-2 bg-red-100 text-red-700 text-sm rounded flex items-center">
                        <AlertTriangle className="mr-2" size={16} />
                        Maximum violations reached!
                    </div>
                )}
            </div>

            {/* Video Preview */}
            {systemStatus.camera && (
                <div className="bg-black rounded-lg overflow-hidden">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-48 h-36 object-cover"
                    />
                </div>
            )}
        </div>
    );
};

export default AntiCheatSystem;