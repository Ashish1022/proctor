"use client"

import { useEffect, useState } from "react"
import { useProctoring } from "@/hooks/use-proctoring"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, Mic, Monitor, Eye, AlertCircle, CheckCircle } from "lucide-react"

interface ProctoringPanelProps {
    testId: string
    onProctoringReady: (ready: boolean) => void
}

export function ProctoringPanel({ testId, onProctoringReady }: ProctoringPanelProps) {
    const [proctoringEnabled, setProctoringEnabled] = useState(false)

    const proctoringConfig = {
        enableWebcam: true,
        enableAudio: true,
        enableScreenRecording: true,
        faceDetection: true,
        eyeTracking: true,
        recordingQuality: "medium" as const,
    }

    const {
        webcamStream,
        audioStream,
        screenStream,
        isRecording,
        faceDetected,
        eyesOnScreen,
        webcamVideoRef,
        canvasRef,
        startRecording,
        stopRecording,
        initializeWebcam,
        initializeScreenRecording,
    } = useProctoring(proctoringConfig, testId)

    const [permissionsGranted, setPermissionsGranted] = useState({
        camera: false,
        microphone: false,
        screen: false,
    })

    useEffect(() => {
        setPermissionsGranted({
            camera: !!webcamStream,
            microphone: !!audioStream,
            screen: !!screenStream,
        })
    }, [webcamStream, audioStream, screenStream])

    useEffect(() => {
        const allPermissionsGranted =
            permissionsGranted.camera && permissionsGranted.microphone && permissionsGranted.screen
        onProctoringReady(allPermissionsGranted)
    }, [permissionsGranted, onProctoringReady])

    const handleStartProctoring = async () => {
        await initializeWebcam()
        await initializeScreenRecording()
        startRecording()
        setProctoringEnabled(true)
    }

    const handleStopProctoring = () => {
        stopRecording()
        setProctoringEnabled(false)
    }

    return (
        <div className="space-y-4">
            {/* Proctoring Setup Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Test Proctoring Setup
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Permission Status */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <Camera className="h-5 w-5 text-gray-500" />
                            <div className="flex-1">
                                <div className="font-medium">Camera</div>
                                <div className="text-sm text-gray-500">Required for identity verification</div>
                            </div>
                            {permissionsGranted.camera ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                        </div>

                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <Mic className="h-5 w-5 text-gray-500" />
                            <div className="flex-1">
                                <div className="font-medium">Microphone</div>
                                <div className="text-sm text-gray-500">Required for audio monitoring</div>
                            </div>
                            {permissionsGranted.microphone ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                        </div>

                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <Monitor className="h-5 w-5 text-gray-500" />
                            <div className="flex-1">
                                <div className="font-medium">Screen</div>
                                <div className="text-sm text-gray-500">Required for screen recording</div>
                            </div>
                            {permissionsGranted.screen ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {!proctoringEnabled ? (
                            <Button onClick={handleStartProctoring} className="flex-1">
                                Enable Proctoring
                            </Button>
                        ) : (
                            <Button onClick={handleStopProctoring} variant="outline" className="flex-1 bg-transparent">
                                Disable Proctoring
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Live Monitoring Card */}
            {proctoringEnabled && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Live Monitoring
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Webcam Preview */}
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
                                    <video ref={webcamVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                                    <canvas ref={canvasRef} className="hidden" />
                                    <div className="absolute top-2 left-2">
                                        <Badge variant={isRecording ? "default" : "secondary"}>
                                            {isRecording ? "Recording" : "Not Recording"}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">Webcam Feed</div>
                            </div>

                            {/* Status Indicators */}
                            <div className="w-48 space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${faceDetected ? "bg-green-500" : "bg-red-500"}`} />
                                    <span className="text-sm">Face Detected: {faceDetected ? "Yes" : "No"}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${eyesOnScreen ? "bg-green-500" : "bg-yellow-500"}`} />
                                    <span className="text-sm">Eyes on Screen: {eyesOnScreen ? "Yes" : "No"}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${isRecording ? "bg-green-500" : "bg-gray-500"}`} />
                                    <span className="text-sm">Recording: {isRecording ? "Active" : "Inactive"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Proctoring Alerts */}
                        {(!faceDetected || !eyesOnScreen) && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-2 text-yellow-800">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="font-medium">Proctoring Alert</span>
                                </div>
                                <div className="text-sm text-yellow-700 mt-1">
                                    {!faceDetected && "No face detected in camera feed. "}
                                    {!eyesOnScreen && "Eyes not focused on screen. "}
                                    Please ensure you are visible and focused on the test.
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
