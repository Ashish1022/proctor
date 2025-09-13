"use client"

import { useState, useEffect } from "react"
import { useAntiCheating } from "@/hooks/use-anti-cheating"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Shield, Eye, EyeOff } from "lucide-react"

interface AntiCheatMonitorProps {
  onForceSubmit: () => void
  testId: string
}

export function AntiCheatMonitor({ onForceSubmit, testId }: AntiCheatMonitorProps) {
  const [showViolations, setShowViolations] = useState(true)

  const antiCheatConfig = {
    enableFullscreen: true,
    blockCopyPaste: true,
    blockRightClick: true,
    blockKeyboardShortcuts: true,
    detectTabSwitch: true,
    detectWindowBlur: true,
    detectDevTools: true,
    maxViolations: 3,
    autoSubmitOnViolation: true,
  }

  const handleViolation = (event: any) => {
    console.log("[v0] Anti-cheat violation detected:", event)
    // Send violation to server
    fetch("/api/test/violations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testId,
        violation: event,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error)
  }

  const { violations, violationCount, isFullscreen, isWindowFocused, enterFullscreen } = useAntiCheating(
    antiCheatConfig,
    handleViolation,
  )

  useEffect(() => {
    const handleForceSubmit = () => {
      onForceSubmit()
    }

    window.addEventListener("force-submit-test", handleForceSubmit)
    return () => window.removeEventListener("force-submit-test", handleForceSubmit)
  }, [onForceSubmit])

  const getViolationColor = (count: number) => {
    if (count === 0) return "bg-green-100 text-green-800"
    if (count <= 2) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getViolationIcon = (type: string) => {
    switch (type) {
      case "tab_switch":
        return "🔄"
      case "window_blur":
        return "👁️"
      case "copy_paste":
        return "📋"
      case "right_click":
        return "🖱️"
      case "keyboard_shortcut":
        return "⌨️"
      case "fullscreen_exit":
        return "🖥️"
      case "dev_tools":
        return "🔧"
      default:
        return "⚠️"
    }
  }

  const handleToggleViolations = () => {
    setShowViolations(prev => !prev)
  }

  if (!showViolations) {
    // Minimized view - just show violation count
    return (
      <div 
        className="fixed bottom-4 right-4 z-50 cursor-pointer"
        onClick={handleToggleViolations}
        title="Click to expand security monitor"
      >
        <Badge className={`${getViolationColor(violationCount)} px-3 py-2 text-sm font-medium shadow-lg hover:scale-105 transition-transform`}>
          <Shield className="h-3 w-3 mr-1" />
          {violationCount}/3
        </Badge>
      </div>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Monitor
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggleViolations}
            className="h-6 w-6 p-0"
            title="Minimize monitor"
          >
            <EyeOff className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isFullscreen ? "bg-green-500" : "bg-red-500"}`} />
            Fullscreen: {isFullscreen ? "Active" : "Inactive"}
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isWindowFocused ? "bg-green-500" : "bg-red-500"}`} />
            Focus: {isWindowFocused ? "Active" : "Lost"}
          </div>
        </div>

        {/* Violation Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Violations:</span>
          <Badge className={getViolationColor(violationCount)}>{violationCount}/3</Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!isFullscreen && (
            <Button size="sm" onClick={enterFullscreen} className="flex-1 text-xs">
              Enter Fullscreen
            </Button>
          )}
        </div>

        {/* Violations List */}
        {violations.length > 0 && (
          <div className="space-y-2 border-t pt-3">
            <div className="text-xs font-medium text-gray-600">
              Recent Violations ({violations.length}):
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {violations.slice(-5).map((violation, index) => (
                <div key={index} className="flex items-center gap-2 text-xs p-2 bg-gray-50 rounded">
                  <span>{getViolationIcon(violation.type)}</span>
                  <span className="flex-1">{violation.details}</span>
                  <span className="text-gray-500">{violation.timestamp.toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning */}
        {violationCount >= 2 && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            <AlertTriangle className="h-3 w-3" />
            <span>Warning: Test will auto-submit after 3 violations</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}