"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, Award, BarChart3, FileText, ArrowLeft, Download, Share2 } from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"

export default function TestResultsPageView({
    testId,
    userId
}: {
    testId: string 
    userId: string
}) {
    const router = useRouter()
    const trpc = useTRPC()

    const { data: testResult, isLoading, error } = useSuspenseQuery(
        trpc.submission.getResults.queryOptions({
            testId: testId,
            studentId: userId
        })
    )

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`
        }
        return `${minutes}m ${secs}s`
    }

    const getGradeColor = (percentage: number) => {
        if (percentage >= 90) return "text-green-600 bg-green-50 border-green-200"
        if (percentage >= 80) return "text-blue-600 bg-blue-50 border-blue-200"
        if (percentage >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200"
        if (percentage >= 60) return "text-orange-600 bg-orange-50 border-orange-200"
        return "text-red-600 bg-red-50 border-red-200"
    }

    const getGradeLetter = (percentage: number) => {
        if (percentage >= 90) return "A"
        if (percentage >= 80) return "B"
        if (percentage >= 70) return "C"
        if (percentage >= 60) return "D"
        return "F"
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading results...</p>
                </div>
            </div>
        )
    }

    if (error || !testResult) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="text-center p-6">
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Results Not Found</h2>
                        <p className="text-gray-600 mb-4">
                            {error ? "Error loading test results." : "Unable to load test results."}
                        </p>
                        <Button onClick={() => router.push("/student")}>Back to Dashboard</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.push("/student")} className="bg-transparent">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Test Results</h1>
                            <p className="text-gray-600">{testResult.testTitle}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="bg-transparent">
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                        <Button variant="outline" className="bg-transparent">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </div>

                {/* Score Overview */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className={`text-4xl font-bold p-4 rounded-lg border ${getGradeColor(testResult.percentage)}`}>
                                    {getGradeLetter(testResult.percentage)}
                                </div>
                                <div className="text-sm text-gray-600 mt-2">Grade</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">
                                    {testResult.score}/{testResult.totalPoints}
                                </div>
                                <div className="text-sm text-gray-600">Points</div>
                                <div className="text-lg font-semibold text-primary">{testResult.percentage.toFixed(1)}%</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">{formatTime(testResult.timeSpent)}</div>
                                <div className="text-sm text-gray-600">Time Spent</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">
                                    {testResult.questionResults.filter((q) => q.isCorrect).length}
                                </div>
                                <div className="text-sm text-gray-600">Correct Answers</div>
                                <div className="text-sm text-gray-500">out of {testResult.questionResults.length} questions</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="questions">Question Review</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="security">Security Report</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        {/* Performance Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Performance Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {testResult.questionResults.map((result, index) => (
                                        <div key={result.questionId} className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {result.isCorrect ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                    )}
                                                    <span className="font-medium">
                                                        {result.points}/{result.maxPoints} points
                                                    </span>
                                                    <Badge variant={result.isCorrect ? "default" : "destructive"}>
                                                        {result.isCorrect ? "Correct" : "Incorrect"}
                                                    </Badge>
                                                </div>
                                                <Progress value={(result.points / result.maxPoints) * 100} className="h-2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                                    <div className="text-2xl font-bold">{testResult.percentage.toFixed(1)}%</div>
                                    <div className="text-sm text-gray-600">Overall Score</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                    <div className="text-2xl font-bold">{formatTime(testResult.timeSpent)}</div>
                                    <div className="text-sm text-gray-600">Time Taken</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                    <div className="text-2xl font-bold">
                                        {testResult.questionResults.filter((q) => q.isCorrect).length}/{testResult.questionResults.length}
                                    </div>
                                    <div className="text-sm text-gray-600">Questions Correct</div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="questions" className="space-y-4">
                        {testResult.questionResults.map((result, index) => (
                            <Card key={result.questionId}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={result.isCorrect ? "default" : "destructive"}>
                                                {result.points}/{result.maxPoints} points
                                            </Badge>
                                            {result.isCorrect ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-500" />
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-2">Question:</h4>
                                        <p className="text-gray-700">{result.question}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium mb-2">Your Answer:</h4>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                {result.studentAnswer ? (
                                                    Array.isArray(result.studentAnswer) ?
                                                        result.studentAnswer.join(", ") :
                                                        result.studentAnswer
                                                ) : (
                                                    <span className="text-gray-500 italic">No answer provided</span>
                                                )}
                                            </div>
                                        </div>
                                        {result.correctAnswer && (
                                            <div>
                                                <h4 className="font-medium mb-2">Correct Answer:</h4>
                                                <div className="p-3 bg-green-50 rounded-lg">
                                                    {Array.isArray(result.correctAnswer) ?
                                                        result.correctAnswer.join(", ") :
                                                        result.correctAnswer
                                                    }
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {result.feedback && (
                                        <div>
                                            <h4 className="font-medium mb-2">Feedback:</h4>
                                            <div className="p-3 bg-blue-50 rounded-lg text-blue-800">{result.feedback}</div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-medium mb-3">Question Type Performance</h4>
                                        <div className="space-y-2">
                                            {["multiple_choice", "multiple_select"].map((type) => {
                                                const typeQuestions = testResult.questionResults.filter((q) => q.type === type)
                                                if (typeQuestions.length === 0) return null

                                                const correctCount = typeQuestions.filter((q) => q.isCorrect).length
                                                const percentage = (correctCount / typeQuestions.length) * 100

                                                return (
                                                    <div key={type} className="flex items-center gap-4">
                                                        <div className="w-32 text-sm font-medium capitalize">{type.replace("_", " ")}</div>
                                                        <div className="flex-1">
                                                            <Progress value={percentage} className="h-2" />
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {correctCount}/{typeQuestions.length} ({percentage.toFixed(0)}%)
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-3">Time Analysis</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                                <div className="text-2xl font-bold text-blue-600">{formatTime(testResult.timeSpent)}</div>
                                                <div className="text-sm text-blue-600">Total Time</div>
                                            </div>
                                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {formatTime(Math.floor(testResult.timeSpent / testResult.questionResults.length))}
                                                </div>
                                                <div className="text-sm text-green-600">Avg per Question</div>
                                            </div>
                                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {testResult.percentage >= 80 ? "High" : testResult.percentage >= 60 ? "Medium" : "Low"}
                                                </div>
                                                <div className="text-sm text-purple-600">Performance</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security & Integrity Report</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <div>
                                                <div className="font-medium text-green-800">Test Integrity Verified</div>
                                                <div className="text-sm text-green-600">All security measures were active during the test</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-3">Proctoring Summary</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 border rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                    <span className="font-medium">Camera Monitoring</span>
                                                </div>
                                                <div className="text-sm text-gray-600">Active throughout test</div>
                                            </div>
                                            <div className="p-4 border rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                    <span className="font-medium">Screen Recording</span>
                                                </div>
                                                <div className="text-sm text-gray-600">Complete session recorded</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}