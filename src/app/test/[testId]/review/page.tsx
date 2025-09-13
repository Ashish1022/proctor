"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ChevronLeft, ChevronRight, Flag, CheckCircle, XCircle } from "lucide-react"

interface ReviewData {
  testId: string
  testTitle: string
  questions: ReviewQuestion[]
  answers: Record<string, any>
  flaggedQuestions: string[]
  timeSpent: number
  submittedAt: string
}

interface ReviewQuestion {
  id: string
  type: "multiple-choice" | "multiple-select" | "text" | "essay" | "true-false"
  question: string
  options?: string[]
  studentAnswer: any
  correctAnswer?: any
  isCorrect?: boolean
  points: number
  maxPoints: number
  explanation?: string
}

export default function TestReviewPage({ params }: { params: { testId: string } }) {
  const router = useRouter()
  const [reviewData, setReviewData] = useState<ReviewData | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock review data - in production, fetch from API
    const mockReviewData: ReviewData = {
      testId: params.testId,
      testTitle: "Advanced JavaScript Assessment",
      timeSpent: 4500,
      submittedAt: new Date().toISOString(),
      answers: {
        q1: "object",
        q2: ["var", "let", "const"],
        q3: "object",
        q4: "Synchronous programming executes code sequentially...",
        q5: "false",
      },
      flaggedQuestions: ["q4"],
      questions: [
        {
          id: "q1",
          type: "multiple-choice",
          question: "Which of the following is NOT a primitive data type in JavaScript?",
          options: ["string", "number", "object", "boolean", "undefined"],
          studentAnswer: "object",
          correctAnswer: "object",
          isCorrect: true,
          points: 2,
          maxPoints: 2,
          explanation:
            "Object is a reference type, not a primitive type. The primitive types in JavaScript are: string, number, boolean, undefined, null, symbol, and bigint.",
        },
        {
          id: "q2",
          type: "multiple-select",
          question:
            "Which of the following are valid ways to declare a variable in JavaScript? (Select all that apply)",
          options: ["var", "let", "const", "define", "variable"],
          studentAnswer: ["var", "let", "const"],
          correctAnswer: ["var", "let", "const"],
          isCorrect: true,
          points: 3,
          maxPoints: 3,
          explanation:
            "var, let, and const are the three valid ways to declare variables in JavaScript. 'define' and 'variable' are not valid keywords.",
        },
        {
          id: "q3",
          type: "text",
          question: "What is the output of: console.log(typeof null)?",
          studentAnswer: "object",
          correctAnswer: "object",
          isCorrect: true,
          points: 2,
          maxPoints: 2,
          explanation:
            "This is a well-known JavaScript quirk. typeof null returns 'object' due to a bug in the original JavaScript implementation that has been kept for backward compatibility.",
        },
        {
          id: "q4",
          type: "essay",
          question:
            "Explain the difference between synchronous and asynchronous programming in JavaScript. Provide examples of each.",
          studentAnswer:
            "Synchronous programming executes code sequentially, line by line. Each operation must complete before the next one starts. For example, console.log statements execute in order. Asynchronous programming allows operations to run concurrently without blocking the main thread. Examples include setTimeout, fetch API, and Promises.",
          points: 8,
          maxPoints: 10,
          explanation:
            "Good explanation covering the basic concepts. You correctly identified that synchronous code executes sequentially and provided relevant examples. For full points, you could have mentioned the event loop, callbacks, and how async/await works.",
        },
        {
          id: "q5",
          type: "true-false",
          question: "JavaScript is a statically typed language.",
          studentAnswer: "false",
          correctAnswer: "false",
          isCorrect: true,
          points: 1,
          maxPoints: 1,
          explanation:
            "Correct! JavaScript is a dynamically typed language, meaning variable types are determined at runtime rather than compile time.",
        },
      ],
    }

    setTimeout(() => {
      setReviewData(mockReviewData)
      setLoading(false)
    }, 1000)
  }, [params.testId])

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNextQuestion = () => {
    if (reviewData && currentQuestionIndex < reviewData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handleNavigateToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const renderAnswer = (question: ReviewQuestion) => {
    const { studentAnswer, type } = question

    switch (type) {
      case "multiple-choice":
      case "true-false":
        return <span className="font-medium">{studentAnswer}</span>

      case "multiple-select":
        return (
          <div className="flex flex-wrap gap-1">
            {studentAnswer?.map((answer: string, index: number) => (
              <Badge key={index} variant="outline">
                {answer}
              </Badge>
            ))}
          </div>
        )

      case "text":
        return <span className="font-medium">{studentAnswer}</span>

      case "essay":
        return (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm leading-relaxed">{studentAnswer}</p>
          </div>
        )

      default:
        return <span>No answer provided</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading review...</p>
        </div>
      </div>
    )
  }

  if (!reviewData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Review Not Available</h2>
            <p className="text-gray-600 mb-4">Unable to load test review.</p>
            <Button onClick={() => router.push("/student")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = reviewData.questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/test/${params.testId}/results`)}
              className="bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Results
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Test Review</h1>
              <p className="text-gray-600">{reviewData.testTitle}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                  {reviewData.questions.map((question, index) => (
                    <Button
                      key={question.id}
                      variant={currentQuestionIndex === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleNavigateToQuestion(index)}
                      className={`relative ${currentQuestionIndex === index ? "" : "bg-transparent"}`}
                    >
                      <span>{index + 1}</span>
                      {reviewData.flaggedQuestions.includes(question.id) && (
                        <Flag className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500" />
                      )}
                      {question.isCorrect !== undefined && (
                        <div className="absolute -bottom-1 -right-1">
                          {question.isCorrect ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Review */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    Question {currentQuestionIndex + 1} of {reviewData.questions.length}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {reviewData.flaggedQuestions.includes(currentQuestion.id) && (
                      <Badge variant="outline" className="bg-yellow-50 border-yellow-300">
                        <Flag className="h-3 w-3 mr-1" />
                        Flagged
                      </Badge>
                    )}
                    {currentQuestion.isCorrect !== undefined && (
                      <Badge variant={currentQuestion.isCorrect ? "default" : "destructive"}>
                        {currentQuestion.points}/{currentQuestion.maxPoints} points
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question */}
                <div>
                  <h3 className="font-medium mb-3">Question:</h3>
                  <p className="text-lg leading-relaxed">{currentQuestion.question}</p>
                </div>

                {/* Options (for multiple choice/select) */}
                {currentQuestion.options && (
                  <div>
                    <h3 className="font-medium mb-3">Options:</h3>
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                          <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Tabs defaultValue="your-answer" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="your-answer">Your Answer</TabsTrigger>
                    <TabsTrigger value="correct-answer">Correct Answer</TabsTrigger>
                    <TabsTrigger value="explanation">Explanation</TabsTrigger>
                  </TabsList>

                  <TabsContent value="your-answer" className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-3">Your Answer:</h3>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        {renderAnswer(currentQuestion)}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="correct-answer" className="space-y-4">
                    {currentQuestion.correctAnswer ? (
                      <div>
                        <h3 className="font-medium mb-3">Correct Answer:</h3>
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          {Array.isArray(currentQuestion.correctAnswer)
                            ? currentQuestion.correctAnswer.join(", ")
                            : currentQuestion.correctAnswer}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6 text-gray-500">
                        This question will be manually graded by your instructor.
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="explanation" className="space-y-4">
                    {currentQuestion.explanation ? (
                      <div>
                        <h3 className="font-medium mb-3">Explanation:</h3>
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="leading-relaxed">{currentQuestion.explanation}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6 text-gray-500">No explanation available for this question.</div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <span className="text-sm text-gray-500">
                    {currentQuestionIndex + 1} of {reviewData.questions.length}
                  </span>

                  <Button
                    variant="outline"
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === reviewData.questions.length - 1}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
