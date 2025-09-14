"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Trash2, Edit } from "lucide-react"
import { toast } from "sonner"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// UI-friendly types
interface Question {
    id: string
    type: "multiple_choice" | "multiple_select" | "code"
    question: string
    options?: string[]
    correctAnswer?: string | string[]
    points: number
    timeLimit?: number
    explanation?: string
}

interface TestSettings {
    duration: number
    passingScore: number
    maxAttempts: number
}

interface Test {
    id: string
    title: string
    description: string
    settings: TestSettings
    questions: Question[]
}

export default function EditTestPageView({ testId }: { testId: string }) {
    const router = useRouter()
    const trpc = useTRPC()
    const queryClient = useQueryClient()

    const { data: testData, isLoading } = useQuery({
        ...trpc.test.getById.queryOptions({ id: testId }),
        enabled: !!testId
    })

    const updateTestMutation = useMutation({
        ...trpc.test.update.mutationOptions({
            onError: (error) => {
                toast.error(error.message)
            },
            onSuccess: async () => {
                await queryClient.invalidateQueries(trpc.auth.session.queryFilter())
                toast.success("Test updated successfully!")
                router.push("/admin/tests")
            }
        }),
    })

    const [localTest, setLocalTest] = useState<Test | null>(null)
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

    // Map backend data to UI-friendly format
    useEffect(() => {
        if (testData) {
            const mappedTest: Test = {
                id: testData.id,
                title: testData.title,
                description: testData.description || "",
                settings: {
                    duration: testData.duration,
                    passingScore: 70, // default or fetched elsewhere
                    maxAttempts: 1 // default or fetched elsewhere
                },
                questions: testData.questions.map(q => ({
                    id: q.id,
                    type: q.questionType,
                    question: q.questionText,
                    options: q.options,
                    correctAnswer: q.correctAnswers.map(String), // assuming correctAnswers are indices or ids
                    points: q.marks,
                    timeLimit: undefined,
                    explanation: ""
                }))
            }
            setLocalTest(mappedTest)
        }
    }, [testData])

    const handleSaveTest = async () => {
        if (!localTest) return
        try {
            await updateTestMutation.mutateAsync({
                id: localTest.id,
                title: localTest.title,
                description: localTest.description,
                duration: localTest.settings.duration,
            })
        } catch (error) {
            console.error("Update failed", error)
            toast.error("Failed to save test.")
        }
    }

    const handleSaveQuestion = () => {
        if (!localTest || !editingQuestion) return
        const updatedQuestions = localTest.questions.map(q =>
            q.id === editingQuestion.id ? editingQuestion : q
        )
        setLocalTest({
            ...localTest,
            questions: updatedQuestions
        })
        setEditingQuestion(null)
        toast.success("Question saved.")
    }

    const handleDeleteQuestion = (questionId: string) => {
        if (!localTest) return
        if (confirm("Are you sure you want to delete this question?")) {
            setLocalTest({
                ...localTest,
                questions: localTest.questions.filter(q => q.id !== questionId)
            })
            toast.success("Question deleted.")
        }
    }

    if (isLoading || !localTest) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div>Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => router.push("/admin/tests")}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Test</h1>
                            <p className="text-gray-600">{localTest.title}</p>
                        </div>
                    </div>
                    <Button onClick={handleSaveTest} disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                    </Button>
                </div>

                <Tabs defaultValue="basic" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="questions">Questions ({localTest.questions.length})</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Test Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Title</Label>
                                    <Input
                                        value={localTest.title}
                                        onChange={e => setLocalTest({ ...localTest, title: e.target.value })}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        value={localTest.description}
                                        onChange={e => setLocalTest({ ...localTest, description: e.target.value })}
                                        className="mt-2"
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="questions" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Questions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {localTest.questions.length === 0 ? (
                                    <div>No questions found.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {localTest.questions.map((q, idx) => (
                                            <div key={q.id} className="p-4 border rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span>Q{idx + 1}</span>
                                                        <Badge variant="outline">{q.type.replace("_", " ")}</Badge>
                                                        <Badge variant="secondary">{q.points} pts</Badge>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => setEditingQuestion(q)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => handleDeleteQuestion(q.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <p>{q.question}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Duration (minutes)</Label>
                                    <Input
                                        type="number"
                                        value={localTest.settings.duration}
                                        onChange={e => setLocalTest({
                                            ...localTest,
                                            settings: {
                                                ...localTest.settings,
                                                duration: Number.parseInt(e.target.value) || 60
                                            }
                                        })}
                                        min={1}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label>Passing Score (%)</Label>
                                    <Input
                                        type="number"
                                        value={localTest.settings.passingScore}
                                        onChange={e => setLocalTest({
                                            ...localTest,
                                            settings: {
                                                ...localTest.settings,
                                                passingScore: Number.parseInt(e.target.value) || 70
                                            }
                                        })}
                                        min={0}
                                        max={100}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label>Max Attempts</Label>
                                    <Input
                                        type="number"
                                        value={localTest.settings.maxAttempts}
                                        onChange={e => setLocalTest({
                                            ...localTest,
                                            settings: {
                                                ...localTest.settings,
                                                maxAttempts: Number.parseInt(e.target.value) || 1
                                            }
                                        })}
                                        min={1}
                                        className="mt-2"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {editingQuestion && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <CardHeader>
                                <CardTitle>Edit Question</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Question</Label>
                                    <Textarea
                                        value={editingQuestion.question}
                                        onChange={e => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                                        rows={3}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Points</Label>
                                        <Input
                                            type="number"
                                            value={editingQuestion.points}
                                            onChange={e => setEditingQuestion({
                                                ...editingQuestion,
                                                points: Number.parseInt(e.target.value) || 1
                                            })}
                                            min={1}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label>Time Limit</Label>
                                        <Input
                                            type="number"
                                            value={editingQuestion.timeLimit || ""}
                                            onChange={e => setEditingQuestion({
                                                ...editingQuestion,
                                                timeLimit: e.target.value ? Number.parseInt(e.target.value) : undefined
                                            })}
                                            placeholder="Minutes"
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setEditingQuestion(null)}>
                                        Cancel
                                    </Button>
                                    <Button className="flex-1" onClick={handleSaveQuestion}>
                                        Save
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
