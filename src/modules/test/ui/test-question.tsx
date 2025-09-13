"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface Question {
    id: string
    type: "multiple_choice" | "multiple_select" | "text" | "essay" | "true_false"
    question: string
    options?: string[]
    correctAnswer?: string | string[]
    points: number
    timeLimit?: number
}

interface TestQuestionProps {
    question: Question
    answer: any
    onAnswerChange: (answer: any) => void
}

export function TestQuestion({ question, answer, onAnswerChange }: TestQuestionProps) {
    const renderQuestionContent = () => {
        switch (question.type) {
            case "multiple_choice":
                return (
                    <div className="space-y-3">
                        <RadioGroup value={answer || ""} onValueChange={onAnswerChange}>
                            {question.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`option-${index}`} />
                                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                )

            case "multiple_select":
                return (
                    <div className="space-y-3">
                        {question.options?.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`option-${index}`}
                                    checked={answer?.includes(option) || false}
                                    onCheckedChange={(checked) => {
                                        const currentAnswers = answer || []
                                        if (checked) {
                                            onAnswerChange([...currentAnswers, option])
                                        } else {
                                            onAnswerChange(currentAnswers.filter((a: string) => a !== option))
                                        }
                                    }}
                                />
                                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                    {option}
                                </Label>
                            </div>
                        ))}
                    </div>
                )

            case "text":
                return (
                    <Input
                        value={answer || ""}
                        onChange={(e) => onAnswerChange(e.target.value)}
                        placeholder="Enter your answer..."
                        className="w-full"
                    />
                )

            case "essay":
                return (
                    <div className="space-y-2">
                        <Textarea
                            value={answer || ""}
                            onChange={(e) => onAnswerChange(e.target.value)}
                            placeholder="Write your detailed answer here..."
                            className="w-full min-h-32"
                            rows={6}
                        />
                        <div className="text-sm text-gray-500 text-right">
                            {(answer || "").length} characters
                        </div>
                    </div>
                )

            case "true_false":
                return (
                    <div className="space-y-3">
                        <RadioGroup value={answer || ""} onValueChange={onAnswerChange}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" id="true" />
                                <Label htmlFor="true" className="cursor-pointer">
                                    True
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id="false" />
                                <Label htmlFor="false" className="cursor-pointer">
                                    False
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                )

            default:
                return <div>Unsupported question type</div>
        }
    }

    return (
        <div className="space-y-4">
            <div className="prose max-w-none">
                <p className="text-lg font-medium leading-relaxed">{question.question}</p>
            </div>
            {renderQuestionContent()}
        </div>
    )
}