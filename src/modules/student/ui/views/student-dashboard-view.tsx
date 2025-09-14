"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudentHeader } from "@/modules/student/ui/header"
import { Clock, Calendar, Play, BookOpen, CheckCircle } from "lucide-react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import { useRouter } from "next/navigation"

export default function StudentDashboard({ year, userId, name }: { year: string; userId: string; name: string }) {
    const trpc = useTRPC();

    const { data: studentData } = useSuspenseQuery(trpc.test.getTestByYear.queryOptions({ year: year, userId: userId }));

    const completedTests = studentData.submittedTests || []
    const pendingTests = studentData.availableTests || []

    const getStatusIcon = (hasSubmission: boolean) => {
        if (hasSubmission) {
            return <CheckCircle className="w-4 h-4 text-green-600" />
        }
        return <Play className="w-4 h-4 text-primary" />
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString()
    }

    const router = useRouter();

    return (
        <div className="min-h-screen bg-background">
            <StudentHeader />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">Welcome back, {name}!</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Ready to continue your learning journey? Here are your upcoming tests.
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                    <div className="xl:col-span-2">
                        <Card className="border-0 shadow-sm bg-card">
                            <CardHeader className="pb-4 px-4 sm:px-6">
                                <CardTitle className="font-heading text-lg sm:text-xl">Available Tests</CardTitle>
                                <CardDescription className="text-sm">Tests you can take right now</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 px-4 sm:px-6">
                                {pendingTests.map((test) => (
                                    <div
                                        key={test.id}
                                        className="p-4 sm:p-6 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                                                    {getStatusIcon(!!test.userSubmission)}
                                                    <h3 className="font-medium text-foreground text-sm sm:text-base truncate">{test.title}</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge variant="outline" className="bg-transparent text-xs">
                                                            General
                                                        </Badge>
                                                        <Badge className="text-xs bg-gray-100 text-gray-800">
                                                            Medium
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                        <span>{test.duration} min</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                        <span>{test.questionCount} questions</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                        <span>Due {test.endTime ? formatDate(test.endTime.toISOString()) : 'Not set'}</span>
                                                    </div>
                                                </div>
                                                <div className="text-xs sm:text-sm text-muted-foreground">
                                                    Status: {test.userSubmission?.status || 'Not Started'}
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                {!test.userSubmission ? (
                                                    <Button
                                                        className="gap-2 w-full sm:w-auto text-sm"
                                                        onClick={() => router.push(`/test/${test.id}`)}
                                                    >
                                                        <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        Start Test
                                                    </Button>
                                                ) : test.userSubmission.status === 'in_progress' && (
                                                    <Button
                                                        className="gap-2 w-full sm:w-auto text-sm"
                                                        onClick={() => router.push(`/test/${test.id}`)}
                                                    >
                                                        <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        Continue Test
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {completedTests.length > 0 && (
                                    <>
                                        <div className="pt-6">
                                            <h3 className="font-medium text-foreground mb-4 text-base sm:text-lg">Completed Tests</h3>
                                        </div>
                                        {completedTests.map((test) => (
                                            <div
                                                key={test.id}
                                                className="p-4 sm:p-6 border border-border rounded-lg bg-muted/20"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                                                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                            <h3 className="font-medium text-foreground text-sm sm:text-base truncate">{test.title}</h3>
                                                            <div className="flex flex-wrap gap-2">
                                                                <Badge variant="outline" className="bg-transparent text-xs">
                                                                    General
                                                                </Badge>
                                                                <Badge className="text-xs bg-green-100 text-green-800">Completed</Badge>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs sm:text-sm text-muted-foreground">
                                                            Submitted: {test.userSubmission?.submittedAt ? formatDate(test.userSubmission.submittedAt.toISOString()) : 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {pendingTests.length === 0 && completedTests.length === 0 && (
                                    <div className="text-center py-8 text-sm sm:text-base text-muted-foreground">
                                        No tests available for your year group.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6 xl:mt-0 mt-6">
                        <Card>
                            <CardHeader className="px-4 sm:px-6">
                                <CardTitle className="text-base sm:text-lg">Your Progress</CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs sm:text-sm text-muted-foreground">Total Tests</span>
                                        <span className="font-medium text-sm sm:text-base">{studentData.totalTests}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs sm:text-sm text-muted-foreground">Completed</span>
                                        <span className="font-medium text-sm sm:text-base">{completedTests.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs sm:text-sm text-muted-foreground">Pending</span>
                                        <span className="font-medium text-sm sm:text-base">{pendingTests.length}</span>
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