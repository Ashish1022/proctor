"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CheckCircle, Circle, AlertCircle } from "lucide-react"

interface Question {
  id: string
  type: "multiple_choice" | "multiple_select" | "text" | "essay" | "true_false"
  question: string
  options?: string[]
  correctAnswer?: string | string[]
  points: number
  timeLimit?: number
}

interface QuestionNavigationProps {
  questions: Question[]
  currentIndex: number
  answers: Record<string, any>
  flaggedQuestions: Set<string>
  onNavigate: (index: number) => void
}

export function QuestionNavigation({ 
  questions, 
  currentIndex, 
  answers, 
  flaggedQuestions, 
  onNavigate 
}: QuestionNavigationProps) {
  
  const isAnswered = (questionId: string) => {
    const answer = answers[questionId]
    if (answer === null || answer === undefined) return false
    if (Array.isArray(answer)) return answer.length > 0
    if (typeof answer === 'string') return answer.trim().length > 0
    return Boolean(answer)
  }

  const isFlagged = (questionId: string) => {
    return flaggedQuestions.has(questionId)
  }

  const getQuestionIcon = (question: Question) => {
    if (isAnswered(question.id)) {
      return <CheckCircle className="w-4 h-4" />
    }
    if (isFlagged(question.id)) {
      return <AlertCircle className="w-4 h-4" />
    }
    return <Circle className="w-4 h-4" />
  }

  const getQuestionStatus = (question: Question) => {
    if (isAnswered(question.id)) return "answered"
    if (isFlagged(question.id)) return "flagged"
    return "unanswered"
  }

  const answeredCount = questions.filter(q => isAnswered(q.id)).length
  const flaggedCount = questions.filter(q => isFlagged(q.id)).length
  const unansweredCount = questions.length - answeredCount

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-medium text-foreground mb-4">Question Navigation</h3>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {questions.map((question, index) => (
          <Button
            key={question.id}
            variant={currentIndex === index ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-10 w-10 p-0 relative",
              getQuestionStatus(question) === "answered" &&
                currentIndex !== index &&
                "border-green-500 bg-green-50 text-green-700 hover:bg-green-100",
              getQuestionStatus(question) === "flagged" &&
                currentIndex !== index &&
                "border-yellow-500 bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
            )}
            onClick={() => onNavigate(index)}
          >
            {index + 1}
            {isFlagged(question.id) && <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />}
          </Button>
        ))}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-muted-foreground">Answered: {answeredCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-muted-foreground">Flagged: {flaggedCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Unanswered: {unansweredCount}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs"
          onClick={() => {
            const nextUnanswered = questions.findIndex((q, i) => i > currentIndex && !isAnswered(q.id))
            if (nextUnanswered !== -1) {
              onNavigate(nextUnanswered)
            }
          }}
          disabled={!questions.some((q, i) => i > currentIndex && !isAnswered(q.id))}
        >
          Next Unanswered
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs"
          onClick={() => {
            const firstFlagged = questions.findIndex(q => isFlagged(q.id))
            if (firstFlagged !== -1) {
              onNavigate(firstFlagged)
            }
          }}
          disabled={flaggedCount === 0}
        >
          Review Flagged
        </Button>
      </div>
    </div>
  )
}