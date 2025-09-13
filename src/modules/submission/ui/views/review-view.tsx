"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ChevronLeft, ChevronRight, Flag, CheckCircle, XCircle } from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"

interface ReviewQuestion {
    id: string
    type: "multiple_choice" | "multiple_select"
    question: string
    options?: string[]
    studentAnswer: any
    correctAnswer?: any
    isCorrect?: boolean
    points: number
    maxPoints: number
    explanation?: string
}

interface ReviewData {
    testId: string
    testTitle: string
    questions: ReviewQuestion[]
    answers: Record<string, any>
    flaggedQuestions: string[]
    timeSpent: number
    submittedAt: string
}

export default function TestReviewPage({
    testId,
    userId
}: {
    testId: string
    userId?: string
}) {
    const router = useRouter()
    const [reviewData, setReviewData] = useState<ReviewData | null>(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

    const trpc = useTRPC();

    const { data: testResult, isLoading, error } = useSuspenseQuery(
        trpc.submission.getResults.queryOptions({
            testId: testId,
            studentId: userId || ""
        }),
    )

    const { data: testData } = useSuspenseQuery(
        trpc.test.getById.queryOptions({
            id: testId
        })
    )

    useEffect(() => {
        if (testResult && testData) {
            const transformedReviewData: ReviewData = {
                testId: testResult.testId,
                testTitle: testResult.testTitle,
                timeSpent: testResult.timeSpent,
                submittedAt: testResult.submittedAt,
                answers: {},
                flaggedQuestions: [],
                questions: testResult.questionResults.map(result => ({
                    id: result.questionId,
                    type: result.type as "multiple_choice" | "multiple_select",
                    question: result.question,
                    options: testData.questions.find(q => q.id === result.questionId)?.options,
                    studentAnswer: result.studentAnswer,
                    correctAnswer: result.correctAnswer,
                    isCorrect: result.isCorrect,
                    points: result.points,
                    maxPoints: result.maxPoints,
                    explanation: result.feedback || generateExplanation(result)
                }))
            }

            testResult.questionResults.forEach(result => {
                transformedReviewData.answers[result.questionId] = result.studentAnswer
            })

            setReviewData(transformedReviewData)
        }
    }, [testResult, testData])

    const generateExplanation = (result: any): string => {
        if (result.isCorrect) {
            return "Correct! Well done on this question."
        } else {
            switch (result.type) {
                case 'multiple_choice':
                    return "This answer is incorrect. Please review the material for this topic."
                case 'multiple_select':
                    return "You didn't select all the correct options. Review the question and consider all possible answers."
                default:
                    return "This answer needs improvement. Consider reviewing the relevant concepts."
            }
        }
    }

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

        if (!studentAnswer) {
            return <span className="text-gray-500 italic">No answer provided</span>
        }

        switch (type) {
            case "multiple_choice":
                return <span className="font-medium">{studentAnswer}</span>

            case "multiple_select":
                if (Array.isArray(studentAnswer)) {
                    return (
                        <div className="flex flex-wrap gap-1">
                            {studentAnswer.map((answer: string, index: number) => (
                                <Badge key={index} variant="outline">
                                    {answer}
                                </Badge>
                            ))}
                        </div>
                    )
                }
                return <span className="font-medium">{studentAnswer}</span>

            default:
                return <span className="font-medium">{studentAnswer}</span>
        }
    }

    // Show error if user ID is missing
    if (!userId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="text-center p-6">
                        <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
                        <p className="text-gray-600 mb-4">Please log in to view the test review.</p>
                        <Button onClick={() => router.push("/login")}>Go to Login</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading review...</p>
                </div>
            </div>
        )
    }

    if (error || !reviewData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="text-center p-6">
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Review Not Available</h2>
                        <p className="text-gray-600 mb-4">
                            {error ? "Error loading test review." : "Unable to load test review."}
                        </p>
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
                            onClick={() => router.push(`/test/${testId}/results`)}
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
                                            {currentQuestion.options.map((option, index) => {
                                                const isStudentAnswer = Array.isArray(currentQuestion.studentAnswer)
                                                    ? currentQuestion.studentAnswer.includes(option)
                                                    : currentQuestion.studentAnswer === option

                                                const isCorrectAnswer = Array.isArray(currentQuestion.correctAnswer)
                                                    ? currentQuestion.correctAnswer.includes(option)
                                                    : currentQuestion.correctAnswer === option

                                                return (
                                                    <div
                                                        key={index}
                                                        className={`flex items-center gap-2 p-2 border rounded ${isCorrectAnswer ? 'bg-green-50 border-green-200' :
                                                            isStudentAnswer && !isCorrectAnswer ? 'bg-red-50 border-red-200' : ''
                                                            }`}
                                                    >
                                                        <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                                                            {String.fromCharCode(65 + index)}
                                                        </span>
                                                        <span>{option}</span>
                                                        {isStudentAnswer && (
                                                            <Badge variant="outline" className="ml-auto">
                                                                Your Answer
                                                            </Badge>
                                                        )}
                                                        {isCorrectAnswer && (
                                                            <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                                                        )}
                                                    </div>
                                                )
                                            })}
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
                                            <div className={`p-4 border rounded-lg ${currentQuestion.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                                }`}>
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