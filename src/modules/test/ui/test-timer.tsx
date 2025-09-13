"use client"

import { Clock, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TestTimerProps {
  timeRemaining: number // in seconds
}

export function TestTimer({ timeRemaining }: TestTimerProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const getTimerColor = () => {
    if (timeRemaining <= 300) return "bg-red-100 text-red-800 border-red-200" // 5 minutes
    if (timeRemaining <= 600) return "bg-yellow-100 text-yellow-800 border-yellow-200" // 10 minutes
    return "bg-blue-100 text-blue-800 border-blue-200"
  }

  const isLowTime = timeRemaining <= 300

  return (
    <div className="flex items-center gap-2">
      {isLowTime && <AlertTriangle className="h-4 w-4 text-red-500" />}
      <Badge variant="outline" className={`${getTimerColor()} font-mono text-sm px-3 py-1`}>
        <Clock className="h-3 w-3 mr-1" />
        {formatTime(timeRemaining)}
      </Badge>
    </div>
  )
}
