"use client";

import { useState } from "react";
import { useCreateTest } from "@/hooks/use-create-test";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

interface Question {
    questionText: string;
    questionType: "multiple_choice" | "multiple_select" | "code";
    options: string[];
    correctAnswers: number[];
    marks: number;
    order: number;
    codeSnippet?: string;
    language?: string;
}

type UserYear = 'BE' | 'SE' | 'TE';

export default function CreateTestPage() {
    const { createTest, isCreating } = useCreateTest();

    const [testTitle, setTestTitle] = useState("");
    const [testDescription, setTestDescription] = useState("");
    const [testInstructions, setTestInstructions] = useState("");
    const [duration, setDuration] = useState(60);
    const [startTime, setStartTime] = useState<Date | undefined>();
    const [endTime, setEndTime] = useState<Date | undefined>();
    const [targetYears, setTargetYears] = useState<UserYear[]>([]);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Question>({
        questionText: "",
        questionType: "multiple_choice",
        options: ["", "", "", ""],
        correctAnswers: [],
        marks: 1,
        order: 0,
    });

    const yearOptions: { value: UserYear; label: string }[] = [
        { value: 'BE', label: '(BE)' },
        { value: 'SE', label: '(SE)' },
        { value: 'TE', label: '(TE)' }
    ];

    const languageOptions = [
        { value: "javascript", label: "JavaScript" },
        { value: "python", label: "Python" },
        { value: "java", label: "Java" },
        { value: "cpp", label: "C++" },
        { value: "c", label: "C" },
        { value: "html", label: "HTML" },
        { value: "css", label: "CSS" },
        { value: "sql", label: "SQL" },
        { value: "php", label: "PHP" },
        { value: "go", label: "Go" }
    ];

    const handleTargetYearChange = (year: UserYear, checked: boolean) => {
        if (checked) {
            setTargetYears([...targetYears, year]);
        } else {
            setTargetYears(targetYears.filter(y => y !== year));
        }
    };

    const addQuestion = () => {
        if (!currentQuestion.questionText.trim()) {
            toast.error("Please enter question text");
            return;
        }

        if (currentQuestion.options.filter(opt => opt.trim()).length < 2) {
            toast.error("Please provide at least 2 options");
            return;
        }

        if (currentQuestion.correctAnswers.length === 0) {
            toast.error("Please select correct answer(s)");
            return;
        }

        const newQuestion: Question = {
            ...currentQuestion,
            order: questions.length,
            options: currentQuestion.options.filter(opt => opt.trim()),
            codeSnippet: currentQuestion.questionType === "code" ? currentQuestion.codeSnippet : undefined,
            language: currentQuestion.questionType === "code" ? currentQuestion.language : undefined,
        };

        setQuestions([...questions, newQuestion]);
        setCurrentQuestion({
            questionText: "",
            questionType: "multiple_choice",
            options: ["", "", "", ""],
            correctAnswers: [],
            marks: 1,
            order: 0,
            codeSnippet: "",
            language: undefined,
        });
        toast.success("Question added successfully");
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
        toast.success("Question removed");
    };

    const updateQuestionOption = (index: number, value: string) => {
        const newOptions = [...currentQuestion.options];
        newOptions[index] = value;
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    const addOption = () => {
        setCurrentQuestion({
            ...currentQuestion,
            options: [...currentQuestion.options, ""]
        });
    };

    const removeOption = (index: number) => {
        const newOptions = currentQuestion.options.filter((_, i) => i !== index);
        const newCorrectAnswers = currentQuestion.correctAnswers
            .filter(ans => ans !== index)
            .map(ans => ans > index ? ans - 1 : ans);

        setCurrentQuestion({
            ...currentQuestion,
            options: newOptions,
            correctAnswers: newCorrectAnswers
        });
    };

    const handleSaveTest = async () => {
        if (!testTitle.trim()) {
            toast.error("Please provide a test title");
            return;
        }

        if (targetYears.length === 0) {
            toast.error("Please select at least one target year");
            return;
        }

        if (questions.length === 0) {
            toast.error("Please add at least one question");
            return;
        }

        try {
            createTest({
                title: testTitle,
                description: testDescription,
                instructions: testInstructions,
                duration,
                startTime,
                endTime,
                targetYears,
                questions: questions.map((q, index) => ({
                    ...q,
                    order: index
                }))
            });

            toast.success("Test created successfully!");
        } catch {
            toast.error("Failed to create test. Please try again.");
        }
    };

    const handleCorrectAnswerChange = (optionIndex: number, isSelected: boolean) => {
        if (currentQuestion.questionType === 'multiple_choice') {
            setCurrentQuestion({
                ...currentQuestion,
                correctAnswers: isSelected ? [optionIndex] : []
            });
        } else {
            const newCorrectAnswers = isSelected
                ? [...currentQuestion.correctAnswers, optionIndex]
                : currentQuestion.correctAnswers.filter(ans => ans !== optionIndex);

            setCurrentQuestion({
                ...currentQuestion,
                correctAnswers: newCorrectAnswers
            });
        }
    };

    const renderCodePreview = (code: string, language: string) => {
        return (
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 uppercase">{language}</span>
                </div>
                <pre className="whitespace-pre-wrap">{code}</pre>
            </div>
        );
    };

    const renderQuestionPreview = (question: Question) => {
        return (
            <div className="space-y-4 p-4 border rounded-lg bg-white">
                <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">
                        {question.questionType === "code" ? "Code Question" :
                            question.questionType.replace("_", " ")}
                    </Badge>
                    <Badge variant="secondary">{question.marks} pts</Badge>
                </div>

                <div className="prose max-w-none">
                    <p className="text-lg font-medium">{question.questionText}</p>
                </div>

                {question.questionType === "code" && question.codeSnippet && (
                    <div className="mt-4">
                        {renderCodePreview(question.codeSnippet, question.language || "javascript")}
                    </div>
                )}

                {(question.questionType !== "code" || question.options.length > 0) && (
                    <div className="space-y-2 mt-4">
                        {question.questionType === "code" && (
                            <Label className="text-sm font-medium text-gray-700">
                                Possible Outputs:
                            </Label>
                        )}
                        {question.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input
                                    type={question.questionType === 'multiple_choice' || question.questionType === 'code' ? 'radio' : 'checkbox'}
                                    checked={question.correctAnswers.includes(index)}
                                    readOnly
                                    className="text-blue-600"
                                />
                                <span className={`${question.correctAnswers.includes(index) ? 'font-medium text-green-700' : ''} ${question.questionType === "code" ? 'font-mono text-sm bg-gray-100 px-2 py-1 rounded' : ''
                                    }`}>
                                    {option}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => window.history.back()}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Create New Test</h1>
                            <p className="text-gray-600">Build a comprehensive assessment</p>
                        </div>
                    </div>
                    <Button onClick={handleSaveTest} disabled={isCreating}>
                        <Save className="h-4 w-4 mr-2" />
                        {isCreating ? "Saving..." : "Save Test"}
                    </Button>
                </div>

                <Tabs defaultValue="basic" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Test Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Test Title *</Label>
                                    <Input
                                        id="title"
                                        value={testTitle}
                                        onChange={(e) => setTestTitle(e.target.value)}
                                        placeholder="Enter test title"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={testDescription}
                                        onChange={(e) => setTestDescription(e.target.value)}
                                        placeholder="Enter test description"
                                        className="mt-2"
                                        rows={4}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="instructions">Instructions</Label>
                                    <Textarea
                                        id="instructions"
                                        value={testInstructions}
                                        onChange={(e) => setTestInstructions(e.target.value)}
                                        placeholder="Enter test instructions for students"
                                        className="mt-2"
                                        rows={3}
                                    />
                                </div>

                                {/* Target Years Selection */}
                                <div>
                                    <Label>Target Year Categories *</Label>
                                    <div className="mt-2 space-y-2">
                                        <p className="text-sm text-gray-600">Select which year categories can take this test:</p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {yearOptions.map((option) => (
                                                <div key={option.value} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={option.value}
                                                        checked={targetYears.includes(option.value)}
                                                        onCheckedChange={(checked) =>
                                                            handleTargetYearChange(option.value, checked as boolean)
                                                        }
                                                    />
                                                    <Label htmlFor={option.value} className="text-sm font-normal">
                                                        {option.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                        {targetYears.length > 0 && (
                                            <div className="flex gap-2 mt-2">
                                                <span className="text-sm text-gray-600">Selected:</span>
                                                {targetYears.map((year) => (
                                                    <Badge key={year} variant="secondary">{year}</Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="questions" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Question Builder */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Add Question</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Question Type</Label>
                                        <Select
                                            value={currentQuestion.questionType}
                                            onValueChange={(value: "multiple_choice" | "multiple_select" | "code") =>
                                                setCurrentQuestion({ ...currentQuestion, questionType: value, correctAnswers: [] })
                                            }
                                        >
                                            <SelectTrigger className="mt-2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                                <SelectItem value="multiple_select">Multiple Select</SelectItem>
                                                <SelectItem value="code">Code Question</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Question Text *</Label>
                                        <Textarea
                                            value={currentQuestion.questionText}
                                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                                            placeholder="Enter your question"
                                            className="mt-2"
                                            rows={3}
                                        />
                                    </div>

                                    {currentQuestion.questionType === "code" && (
                                        <>
                                            <div>
                                                <Label>Programming Language</Label>
                                                <Select
                                                    value={currentQuestion.language}
                                                    onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, language: value })}
                                                >
                                                    <SelectTrigger className="mt-2">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {languageOptions.map((lang) => (
                                                            <SelectItem key={lang.value} value={lang.value}>
                                                                {lang.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Code Snippet</Label>
                                                <Textarea
                                                    value={currentQuestion.codeSnippet}
                                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, codeSnippet: e.target.value })}
                                                    placeholder="Paste your code here..."
                                                    className="mt-2 font-mono text-sm"
                                                    rows={8}
                                                />
                                                {currentQuestion.codeSnippet && (
                                                    <div className="mt-2">
                                                        <Label className="text-xs text-gray-600">Preview:</Label>
                                                        {renderCodePreview(currentQuestion.codeSnippet, currentQuestion.language || "javascript")}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <Label>Options *</Label>
                                        <div className="space-y-2 mt-2">
                                            {currentQuestion.options.map((option, index) => (
                                                <div key={index} className="flex gap-2 items-center">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type={currentQuestion.questionType === 'multiple_choice' ? 'radio' : 'checkbox'}
                                                            name="correct-answer"
                                                            checked={currentQuestion.correctAnswers.includes(index)}
                                                            onChange={(e) => handleCorrectAnswerChange(index, e.target.checked)}
                                                        />
                                                    </div>
                                                    <Input
                                                        value={option}
                                                        onChange={(e) => updateQuestionOption(index, e.target.value)}
                                                        placeholder={`Option ${index + 1}`}
                                                    />
                                                    {currentQuestion.options.length > 2 && (
                                                        <Button variant="outline" size="sm" onClick={() => removeOption(index)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            <Button variant="outline" size="sm" onClick={addOption}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Option
                                            </Button>
                                        </div>
                                    </div>

                                    {/* <div>
                                        <Label>Options *</Label>
                                        <div className="space-y-2 mt-2">
                                            {currentQuestion.options.map((option, index) => (
                                                <div key={index} className="flex gap-2 items-center">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type={currentQuestion.questionType === 'multiple_choice' ? 'radio' : 'checkbox'}
                                                            name="correct-answer"
                                                            checked={currentQuestion.correctAnswers.includes(index)}
                                                            onChange={(e) => handleCorrectAnswerChange(index, e.target.checked)}
                                                        />
                                                    </div>
                                                    <Input
                                                        value={option}
                                                        onChange={(e) => updateQuestionOption(index, e.target.value)}
                                                        placeholder={`Option ${index + 1}`}
                                                    />
                                                    {currentQuestion.options.length > 2 && (
                                                        <Button variant="outline" size="sm" onClick={() => removeOption(index)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            <Button variant="outline" size="sm" onClick={addOption}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Option
                                            </Button>
                                        </div>
                                    </div> */}

                                    <div>
                                        <Label>Marks</Label>
                                        <Input
                                            type="number"
                                            value={currentQuestion.marks}
                                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) || 1 })}
                                            min="1"
                                            className="mt-2"
                                        />
                                    </div>

                                    <Button onClick={addQuestion} className="w-full">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Question
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Questions List */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Questions ({questions.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {questions.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No questions added yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 max-h-96 overflow-y-auto">
                                            {questions.map((question, index) => (
                                                <div key={index} className="p-4 border rounded-lg">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">Q{index + 1}</span>
                                                            <Badge variant="outline">
                                                                {question.questionType.replace("_", " ")}
                                                            </Badge>
                                                            <Badge variant="secondary">{question.marks} pts</Badge>
                                                        </div>
                                                        <Button variant="outline" size="sm" onClick={() => removeQuestion(index)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <p className="text-sm text-gray-700 line-clamp-2">{question.questionText}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Test Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Duration (minutes) *</Label>
                                    <Input
                                        type="number"
                                        value={duration}
                                        onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                                        min="1"
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label>Available From</Label>
                                    <Input
                                        type="datetime-local"
                                        onChange={(e) => setStartTime(e.target.value ? new Date(e.target.value) : undefined)}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label>Available Until</Label>
                                    <Input
                                        type="datetime-local"
                                        onChange={(e) => setEndTime(e.target.value ? new Date(e.target.value) : undefined)}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Display selected target years in settings tab */}
                                <div>
                                    <Label>Target Year Categories</Label>
                                    <div className="mt-2">
                                        {targetYears.length === 0 ? (
                                            <p className="text-sm text-gray-500">No target years selected. Please select in Basic Info tab.</p>
                                        ) : (
                                            <div className="flex gap-2">
                                                {targetYears.map((year) => (
                                                    <Badge key={year} variant="secondary">{year}</Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}