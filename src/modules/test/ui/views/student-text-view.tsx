"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AntiCheatMonitor } from "@/modules/test/anti-cheat/monitor"
import { QuestionNavigation } from "@/modules/test/ui/question-navigation"
import { TestQuestion } from "@/modules/test/ui/test-question"
import { TestTimer } from "@/modules/test/ui/test-timer"
import { AlertTriangle, Flag, ChevronLeft, ChevronRight, Send } from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import toast from "react-hot-toast"

interface Question {
    id: string
    type: "multiple_choice" | "multiple_select"
    question: string
    options?: string[]
    correctAnswer?: string | string[]
    points: number
    timeLimit?: number
}

interface TestData {
    id: string
    title: string
    description: string
    duration: number
    questions: Question[]
    settings: {
        shuffleQuestions: boolean
        showResults: boolean
        allowReview: boolean
        requireProctoring: boolean
        antiCheatEnabled: boolean
    }
}

export default function TestPage({
    testId,
    userId
}: {
    testId: string
    userId?: string
}) {
    const router = useRouter()
    const [testData, setTestData] = useState<TestData | null>(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
    const [timeRemaining, setTimeRemaining] = useState(0)
    const [testStarted, setTestStarted] = useState(false)
    const [testSubmitted, setTestSubmitted] = useState(false)
    const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false)

    const trpc = useTRPC();

    const { data: testDataResponse } = useSuspenseQuery(
        trpc.test.getById.queryOptions({ id: testId })
    )

    const { data: existingSubmission } = useSuspenseQuery(
        trpc.submission.getSubmission.queryOptions({
            testId,
            studentId: userId || ""
        }),
    )

    const startTestMutation = useMutation(trpc.submission.startTest.mutationOptions({
        onSuccess: (data) => {
            console.log('Test started:', data)
            toast.success("Test started successfully!")
        },
        onError: (error) => {
            toast.error("Failed to start test. Please try again.")
            console.error('Start test error:', error)
        }
    }))

    const submitTestMutation = useMutation(trpc.submission.submit.mutationOptions({
        onSuccess: (data) => {
            console.log('Test submitted successfully:', data)
            toast.success("Test submitted successfully!")
            router.push(`/test/${testId}/results`)
        },
        onError: (error) => {
            console.error('Submit test error:', error)
            toast.error("Failed to submit test. Please try again.")
            setTestSubmitted(false)
        }
    }))

    useEffect(() => {
        if (testDataResponse) {
            const transformedTestData: TestData = {
                id: testDataResponse.id,
                title: testDataResponse.title,
                description: testDataResponse.description || "",
                duration: testDataResponse.duration,
                questions: testDataResponse.questions.map(q => ({
                    id: q.id,
                    type: q.questionType as Question["type"],
                    question: q.questionText,
                    options: q.options || undefined,
                    correctAnswer: q.correctAnswers,
                    points: q.marks,
                    timeLimit: undefined
                })),
                settings: {
                    shuffleQuestions: true,
                    showResults: true,
                    allowReview: true,
                    requireProctoring: true,
                    antiCheatEnabled: true,
                }
            }

            setTestData(transformedTestData)
            setTimeRemaining(transformedTestData.duration * 60)
        }
    }, [testDataResponse])

    useEffect(() => {
        if (existingSubmission) {
            if (existingSubmission.status === 'submitted') {
                setTestSubmitted(true)
            } else if (existingSubmission.status === 'in_progress') {
                if (existingSubmission.answers && existingSubmission.answers.length > 0) {
                    const existingAnswersMap: Record<string, any> = {}
                    existingSubmission.answers.forEach(answer => {
                        if (answer.selectedAnswers.length > 0) {
                            const question = testDataResponse?.questions.find(q => q.id === answer.questionId)
                            if (question) {
                                if (question.questionType === 'multiple_choice') {
                                    existingAnswersMap[answer.questionId] = question.options?.[answer.selectedAnswers[0]]
                                } else if (question.questionType === 'multiple_select') {
                                    existingAnswersMap[answer.questionId] = answer.selectedAnswers.map(
                                        index => question.options?.[index]
                                    ).filter(Boolean)
                                }
                            }
                        }
                    })
                    setAnswers(existingAnswersMap)
                }
                setTestStarted(true)
            }
        }
    }, [existingSubmission, testDataResponse])

    useEffect(() => {
        if (!testStarted || testSubmitted || timeRemaining <= 0) return

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    handleForceSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [testStarted, testSubmitted, timeRemaining])

    const handleStartTest = async () => {
        if (!userId) {
            toast.error("User not authenticated")
            return
        }

        try {
            await startTestMutation.mutateAsync({
                testId,
                studentId: userId
            })
            setTestStarted(true)
        } catch (error) {
            console.error('Failed to start test:', error)
        }
    }

    const handleAnswerChange = (questionId: string, answer: any) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }))
    }

    const handleFlagQuestion = (questionId: string) => {
        setFlaggedQuestions((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(questionId)) {
                newSet.delete(questionId)
            } else {
                newSet.add(questionId)
            }
            return newSet
        })
    }

    const handleNavigateToQuestion = (index: number) => {
        setCurrentQuestionIndex(index)
    }

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
        }
    }

    const handleNextQuestion = () => {
        if (testData && currentQuestionIndex < testData.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        }
    }

    const handleForceSubmit = useCallback(() => {
        if (testData) {
            setTestSubmitted(true)
            submitTest(true)
        }
    }, [testData])

    const handleSubmitTest = () => {
        setShowSubmitConfirmation(true)
    }

    const confirmSubmitTest = () => {
        setTestSubmitted(true)
        setShowSubmitConfirmation(false)
        submitTest(false)
    }

    const submitTest = async (forced: boolean) => {
        if (!testData || !userId) return

        const submissionData = {
            testId: testId,
            studentId: userId,
            answers,
            timeSpent: testData.duration * 60 - timeRemaining,
            flaggedQuestions: Array.from(flaggedQuestions),
            forced,
        }

        console.log("Submitting test data:", submissionData)

        try {
            await submitTestMutation.mutateAsync(submissionData)
        } catch (error) {
            console.error("Failed to submit test:", error)
            setTestSubmitted(false)
        }
    }

    const getAnsweredQuestionsCount = () => {
        return Object.keys(answers).filter(questionId => {
            const answer = answers[questionId]
            if (answer === null || answer === undefined) return false
            if (Array.isArray(answer)) return answer.length > 0
            if (typeof answer === 'string') return answer.trim().length > 0
            return Boolean(answer)
        }).length
    }

    if (!testData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading test...</p>
                </div>
            </div>
        )
    }

    if (testSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="text-center p-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Test Submitted Successfully</h2>
                        <p className="text-gray-600 mb-4">Your answers have been recorded and will be reviewed.</p>
                        <Button
                            onClick={() => router.push(`/test/${testId}/results`)}
                            disabled={submitTestMutation.isPending}
                        >
                            {submitTestMutation.isPending ? "Processing..." : "View Results"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!testStarted) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-4xl mx-auto">
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-2xl">{testData.title}</CardTitle>
                            <p className="text-gray-600">{testData.description}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{testData.questions.length}</div>
                                    <div className="text-sm text-blue-600">Questions</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{testData.duration}</div>
                                    <div className="text-sm text-green-600">Minutes</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {testData.questions.reduce((sum, q) => sum + q.points, 0)}
                                    </div>
                                    <div className="text-sm text-purple-600">Total Points</div>
                                </div>
                            </div>

                            {existingSubmission && existingSubmission.status === 'in_progress' && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-yellow-800">
                                        You have an existing test session. You can continue where you left off.
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-center">
                                <Button
                                    onClick={handleStartTest}
                                    size="lg"
                                    className="px-8"
                                    disabled={startTestMutation.isPending}
                                >
                                    {startTestMutation.isPending ? "Starting..." : existingSubmission ? "Continue Test" : "Start Test"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const currentQuestion = testData.questions[currentQuestionIndex]
    const answeredCount = getAnsweredQuestionsCount()

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold">{testData.title}</h1>
                            <div className="flex items-center gap-4 mt-1">
                                <Badge variant="outline">
                                    Question {currentQuestionIndex + 1} of {testData.questions.length}
                                </Badge>
                                <Badge variant="outline">{currentQuestion.points} points</Badge>
                                <Badge variant="outline">
                                    {answeredCount}/{testData.questions.length} answered
                                </Badge>
                            </div>
                        </div>
                        <TestTimer timeRemaining={timeRemaining} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-1">
                        <QuestionNavigation
                            questions={testData.questions}
                            currentIndex={currentQuestionIndex}
                            answers={answers}
                            flaggedQuestions={flaggedQuestions}
                            onNavigate={handleNavigateToQuestion}
                        />
                    </div>

                    <div className="lg:col-span-3">
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">Question {currentQuestionIndex + 1}</CardTitle>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFlagQuestion(currentQuestion.id)}
                                        className={flaggedQuestions.has(currentQuestion.id) ? "bg-yellow-100 border-yellow-300" : ""}
                                    >
                                        <Flag className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <TestQuestion
                                    question={currentQuestion}
                                    answer={answers[currentQuestion.id]}
                                    onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
                                />

                                {/* Navigation Buttons */}
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

                                    <div className="flex gap-2">
                                        {currentQuestionIndex === testData.questions.length - 1 ? (
                                            <Button
                                                onClick={handleSubmitTest}
                                                className="flex items-center gap-2"
                                                disabled={submitTestMutation.isPending}
                                            >
                                                <Send className="h-4 w-4" />
                                                Submit Test
                                            </Button>
                                        ) : (
                                            <Button onClick={handleNextQuestion} className="flex items-center gap-2">
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Anti-cheat monitor */}
            {testData.settings.antiCheatEnabled && (
                <AntiCheatMonitor onForceSubmit={handleForceSubmit} testId={testId} />
            )}

            {/* Submit Confirmation Modal */}
            {showSubmitConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                Confirm Submission
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>Are you sure you want to submit your test? You won't be able to make changes after submission.</p>
                            <div className="text-sm text-gray-600 space-y-1">
                                <div>Answered: {answeredCount} of {testData.questions.length}</div>
                                <div>Flagged: {flaggedQuestions.size}</div>
                                <div>Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowSubmitConfirmation(false)}
                                    className="flex-1"
                                    disabled={submitTestMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={confirmSubmitTest}
                                    className="flex-1"
                                    disabled={submitTestMutation.isPending}
                                >
                                    {submitTestMutation.isPending ? "Submitting..." : "Submit"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}