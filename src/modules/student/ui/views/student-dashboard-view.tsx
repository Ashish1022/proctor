"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StudentHeader } from "@/modules/student/ui/header"
import { Clock, Calendar, Trophy, TrendingUp, Play, BookOpen, CheckCircle, AlertCircle } from "lucide-react"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import { useRouter } from "next/navigation"

export default function StudentDashboard({ year, userId }: { year: string; userId: string }) {
    const trpc = useTRPC();

    const { data: studentData } = useSuspenseQuery(trpc.test.getTestByYear.queryOptions({ year: year, userId: userId }));
    console.log(studentData)

    const completedTests = studentData.submittedTests || []
    const pendingTests = studentData.availableTests || []

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "Easy":
                return "bg-green-100 text-green-800"
            case "Medium":
                return "bg-yellow-100 text-yellow-800"
            case "Hard":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getStatusIcon = (hasSubmission: boolean) => {
        if (hasSubmission) {
            return <CheckCircle className="w-4 h-4 text-green-600" />
        }
        return <Play className="w-4 h-4 text-primary" />
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString()
    }

    const calculatePercentage = (obtained: number, total: number) => {
        return Math.round((obtained / total) * 100)
    }

    const router = useRouter();

    return (
        <div className="min-h-screen bg-background">
            <StudentHeader />

            <div className="container mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Welcome back, Jane!</h1>
                    <p className="text-muted-foreground">
                        Ready to continue your learning journey? Here are your upcoming tests.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Available Tests */}
                    <div className="lg:col-span-2">
                        <Card className="border-0 shadow-sm bg-card">
                            <CardHeader className="pb-4">
                                <CardTitle className="font-heading">Available Tests</CardTitle>
                                <CardDescription>Tests you can take right now</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Fixed: Use pendingTests instead of undefined availableTests */}
                                {pendingTests.map((test) => (
                                    <div
                                        key={test.id}
                                        className="p-6 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    {getStatusIcon(!!test.userSubmission)}
                                                    <h3 className="font-medium text-foreground">{test.title}</h3>
                                                    {/* Note: subject and difficulty are not in API response */}
                                                    {/* You may need to add these fields to your database/API */}
                                                    <Badge variant="outline" className="bg-transparent">
                                                        General {/* Placeholder - add subject to API */}
                                                    </Badge>
                                                    <Badge className="text-xs bg-gray-100 text-gray-800">
                                                        Medium {/* Placeholder - add difficulty to API */}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{test.duration} min</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <BookOpen className="w-4 h-4" />
                                                        <span>{test.questionCount} questions</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>Due {test.endTime ? formatDate(test.endTime.toISOString()) : 'Not set'}</span>
                                                    </div>
                                                </div>
                                                {test.userSubmission && (
                                                    <div className="mb-3">
                                                        <div className="flex items-center justify-between text-sm mb-1">
                                                            <span className="text-muted-foreground">Your Score</span>
                                                            <span className="font-medium">{test.userSubmission.percentage}%</span>
                                                        </div>
                                                        <Progress value={test.userSubmission.percentage} className="h-2" />
                                                    </div>
                                                )}
                                                <div className="text-sm text-muted-foreground">
                                                    {/* Note: attempts/maxAttempts not in current API - you may need to add this */}
                                                    Status: {test.userSubmission?.status || 'Not Started'}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                {!test.userSubmission ? (
                                                    <Button className="gap-2" onClick={() => router.push(`/test/${test.id}`)}>
                                                        <Play className="w-4 h-4" />
                                                        Start Test
                                                    </Button>
                                                ) : test.userSubmission.status === 'in_progress' ? (
                                                    <Button className="gap-2">
                                                        <Play className="w-4 h-4" />
                                                        Continue Test
                                                    </Button>
                                                ) : (
                                                    <Button variant="outline" className="gap-2 bg-transparent">
                                                        View Results
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Show completed tests as well */}
                                {completedTests.length > 0 && (
                                    <>
                                        <div className="pt-6">
                                            <h3 className="font-medium text-foreground mb-4">Completed Tests</h3>
                                        </div>
                                        {completedTests.map((test) => (
                                            <div
                                                key={test.id}
                                                className="p-6 border border-border rounded-lg bg-muted/20"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                            <h3 className="font-medium text-foreground">{test.title}</h3>
                                                            <Badge variant="outline" className="bg-transparent">
                                                                General
                                                            </Badge>
                                                            <Badge className="text-xs bg-green-100 text-green-800">Completed</Badge>
                                                        </div>
                                                        {test.userSubmission && (
                                                            <div className="mb-3">
                                                                <div className="flex items-center justify-between text-sm mb-1">
                                                                    <span className="text-muted-foreground">Final Score</span>
                                                                    <span className="font-medium">{test.userSubmission.percentage}%</span>
                                                                </div>
                                                                <Progress value={test.userSubmission.percentage} className="h-2" />
                                                            </div>
                                                        )}
                                                        <div className="text-sm text-muted-foreground">
                                                            Submitted: {test.userSubmission?.submittedAt ? formatDate(test.userSubmission.submittedAt.toISOString()) : 'N/A'}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <Button variant="outline" className="gap-2 bg-transparent">
                                                            View Results
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {pendingTests.length === 0 && completedTests.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No tests available for your year group.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stats Sidebar - You can add this if needed */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Your Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Total Tests</span>
                                        <span className="font-medium">{studentData.totalTests}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Completed</span>
                                        <span className="font-medium">{completedTests.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Pending</span>
                                        <span className="font-medium">{pendingTests.length}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}