"use client"

import { Progress } from "@/components/ui/progress"
import { Clock } from "lucide-react"

interface ProgressBarProps {
  currentQuestion: number
  totalQuestions: number
  timeRemaining: number
  totalTime: number
}

export function ProgressBar({ currentQuestion, totalQuestions, timeRemaining, totalTime }: ProgressBarProps) {
  const progressPercentage = (currentQuestion / totalQuestions) * 100
  const timePercentage = ((totalTime - timeRemaining) / totalTime) * 100

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Question Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Question Progress</span>
          <span className="text-sm text-muted-foreground">
            {currentQuestion} of {totalQuestions}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Time Remaining */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Time Remaining</span>
          </div>
          <span className={`text-sm font-mono ${timeRemaining < 300 ? "text-red-600" : "text-muted-foreground"}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
        <Progress value={100 - timePercentage} className={`h-2 ${timeRemaining < 300 ? "[&>div]:bg-red-500" : ""}`} />
      </div>
    </div>
  )
}
