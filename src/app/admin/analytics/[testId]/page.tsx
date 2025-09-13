"use client"

import { useState } from "react"
import { AdminSidebar } from "@/modules/admin/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ArrowLeft, Download, Trophy, Users, Target, Search, FileText, Eye } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"

export default function TestAnalyticsPage() {
    const params = useParams()
    const testId = params.testId as string
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    const trpc = useTRPC()

    // Get analytics data
    const { data: analyticsData, isLoading, error } = useSuspenseQuery(
        trpc.submission.getAnalytics.queryOptions({ testId })
    )

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)

        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        return `${minutes} min`
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const handleDownloadPDF = () => {
        console.log("Downloading PDF report for test:", testId)
        // Implement PDF generation logic here
    }

    const handleViewDetails = (studentId: string) => {
        // Navigate to student details or open modal
        console.log("View details for student:", studentId)
    }

    // Filter students based on search and status
    const filteredStudents = analyticsData?.studentRankings.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all"
        return matchesSearch && matchesStatus
    }) || []

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Loading analytics...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !analyticsData) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardContent className="text-center p-6">
                            <h2 className="text-xl font-semibold mb-2">Error Loading Analytics</h2>
                            <p className="text-gray-600 mb-4">Unable to load test analytics data.</p>
                            <Link href="/admin/analytics">
                                <Button>Back to Analytics</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const { testDetails, studentRankings, scoreDistribution, questionAnalysis } = analyticsData

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar />

            <div className="lg:pl-64">
                <div className="p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/admin/analytics">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Analytics
                            </Button>
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">{testDetails.title}</h1>
                            <p className="text-gray-600 mt-2">Individual performance analysis and detailed metrics</p>
                            <p className="text-sm text-gray-500 mt-1">Created on {formatDate(testDetails.createdAt)}</p>
                        </div>
                        <Button onClick={handleDownloadPDF} className="bg-primary hover:bg-primary/90">
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF Report
                        </Button>
                    </div>

                    {/* Test Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Students</p>
                                        <p className="text-3xl font-bold text-gray-900">{testDetails.totalStudents}</p>
                                        <p className="text-sm text-gray-500 mt-1">Completed test</p>
                                    </div>
                                    <Users className="w-8 h-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Average Score</p>
                                        <p className="text-3xl font-bold text-gray-900">{testDetails.averageScore}%</p>
                                        <p className="text-sm text-gray-500 mt-1">Class average</p>
                                    </div>
                                    <Target className="w-8 h-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Highest Score</p>
                                        <p className="text-3xl font-bold text-gray-900">{testDetails.highestScore}%</p>
                                        <p className="text-sm text-gray-500 mt-1">Top performer</p>
                                    </div>
                                    <Trophy className="w-8 h-8 text-yellow-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                                        <p className="text-3xl font-bold text-gray-900">{testDetails.passRate}%</p>
                                        <p className="text-sm text-gray-500 mt-1">Above 60%</p>
                                    </div>
                                    <FileText className="w-8 h-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="rankings" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="rankings">Student Rankings</TabsTrigger>
                            <TabsTrigger value="distribution">Score Distribution</TabsTrigger>
                            <TabsTrigger value="questions">Question Analysis</TabsTrigger>
                        </TabsList>

                        <TabsContent value="rankings">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>Student Rankings & Scores</CardTitle>
                                            <CardDescription>
                                                Complete ranking of all students with detailed performance metrics
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <Input
                                                    placeholder="Search students..."
                                                    className="pl-10 w-64"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All</SelectItem>
                                                    <SelectItem value="passed">Passed</SelectItem>
                                                    <SelectItem value="failed">Failed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Rank</TableHead>
                                                <TableHead>Student Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Score</TableHead>
                                                <TableHead>Points</TableHead>
                                                <TableHead>Time Spent</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredStudents.map((student) => (
                                                <TableRow key={student.studentId}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {student.rank <= 3 && (
                                                                <Trophy
                                                                    className={`w-4 h-4 ${student.rank === 1
                                                                        ? "text-yellow-500"
                                                                        : student.rank === 2
                                                                            ? "text-gray-400"
                                                                            : "text-amber-600"
                                                                        }`}
                                                                />
                                                            )}
                                                            <span className="font-semibold">#{student.rank}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{student.name}</TableCell>
                                                    <TableCell className="text-gray-600">{student.email}</TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`font-semibold ${student.score >= 90
                                                                ? "text-green-600"
                                                                : student.score >= 80
                                                                    ? "text-blue-600"
                                                                    : student.score >= 70
                                                                        ? "text-yellow-600"
                                                                        : student.score >= 60
                                                                            ? "text-orange-600"
                                                                            : "text-red-600"
                                                                }`}
                                                        >
                                                            {student.score}%
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {student.obtainedScore}/{student.totalScore}
                                                    </TableCell>
                                                    <TableCell>{formatTime(student.timeSpent)}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewDetails(student.studentId)}
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            View Details
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    {filteredStudents.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            No students found matching your criteria.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="distribution">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Score Distribution</CardTitle>
                                        <CardDescription>Distribution of scores across all students</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={scoreDistribution.filter(d => d.count > 0)}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="count"
                                                    label={({ range, count }) => `${range}: ${count}`}
                                                >
                                                    {scoreDistribution.filter(d => d.count > 0).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Score Range Analysis</CardTitle>
                                        <CardDescription>Number of students in each score range</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={scoreDistribution}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="range" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="count" fill="#624CF5" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="questions">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Question-wise Analysis</CardTitle>
                                    <CardDescription>Performance analysis for each question</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-6">
                                        <ResponsiveContainer width="100%" height={400}>
                                            <BarChart data={questionAnalysis}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="questionNumber" />
                                                <YAxis />
                                                <Tooltip
                                                    formatter={(value, name) => [value, name === "correct" ? "Correct Answers" : "Incorrect Answers"]}
                                                    labelFormatter={(label) => {
                                                        const question = questionAnalysis.find(q => q.questionNumber === label)
                                                        return question ? `${label}: ${question.questionText.substring(0, 50)}...` : label
                                                    }}
                                                />
                                                <Bar dataKey="correct" fill="#10B981" name="correct" />
                                                <Bar dataKey="incorrect" fill="#EF4444" name="incorrect" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Detailed Question Analysis</h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Question</TableHead>
                                                    <TableHead>Correct</TableHead>
                                                    <TableHead>Incorrect</TableHead>
                                                    <TableHead>Success Rate</TableHead>
                                                    <TableHead>Difficulty</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {questionAnalysis.map((question) => (
                                                    <TableRow key={question.questionId}>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">{question.questionNumber}</div>
                                                                <div className="text-sm text-gray-600">
                                                                    {question.questionText.substring(0, 60)}...
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-green-600 font-semibold">
                                                                {question.correct}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-red-600 font-semibold">
                                                                {question.incorrect}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`font-semibold ${question.successRate >= 80 ? 'text-green-600' :
                                                                question.successRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                                }`}>
                                                                {question.successRate}%
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={
                                                                question.difficulty === 'Easy' ? 'default' :
                                                                    question.difficulty === 'Medium' ? 'secondary' : 'destructive'
                                                            }>
                                                                {question.difficulty}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}