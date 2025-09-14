import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Code } from "lucide-react";

interface Question {
    id: string
    type: "multiple_choice" | "multiple_select" | "code"
    questionText: string
    options?: string[]
    correctAnswers?: number[]
    marks: number
    timeLimit?: number
    codeSnippet?: string;
    language?: string;
}

interface TestQuestionProps {
    question: Question;
    answer: any;
    onAnswerChange: (answer: any) => void;
}

export function TestQuestion({ question, answer, onAnswerChange }: TestQuestionProps) {

    const renderCodePreview = (code: string, language: string) => {
        const getLanguageColor = (lang: string) => {
            const colors: Record<string, string> = {
                javascript: "text-yellow-300",
                python: "text-blue-300",
                java: "text-red-300",
                cpp: "text-purple-300",
                c: "text-green-300",
                html: "text-orange-300",
                css: "text-pink-300",
                sql: "text-cyan-300",
                php: "text-indigo-300",
                go: "text-teal-300"
            };
            return colors[lang] || "text-gray-300";
        };

        return (
            <div className="bg-gray-900 text-gray-100 rounded-lg overflow-hidden border">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        <span className={`text-xs font-medium uppercase tracking-wide ${getLanguageColor(language)}`}>
                            {language}
                        </span>
                    </div>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                </div>
                <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">
                        <code>{code}</code>
                    </pre>
                </div>
            </div>
        );
    };

    const renderQuestionContent = () => {
        switch (question.type) {
            case "multiple_choice":
                return (
                    <div className="space-y-3">
                        <RadioGroup value={answer || ""} onValueChange={onAnswerChange}>
                            {question.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                                    <RadioGroupItem value={option} id={`option-${index}`} />
                                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                );

            case "multiple_select":
                return (
                    <div className="space-y-3">
                        {question.options?.map((option, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                                <Checkbox
                                    id={`option-${index}`}
                                    checked={answer?.includes(option) || false}
                                    onCheckedChange={(checked) => {
                                        const currentAnswers = answer || [];
                                        if (checked) {
                                            onAnswerChange([...currentAnswers, option]);
                                        } else {
                                            onAnswerChange(currentAnswers.filter((a: string) => a !== option));
                                        }
                                    }}
                                />
                                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                                    {option}
                                </Label>
                            </div>
                        ))}
                    </div>
                );

            case "code":
                return (
                    <div className="space-y-4">
                        {question.codeSnippet && (
                            <div className="mb-6">
                                {renderCodePreview(question.codeSnippet, question.language || "javascript")}
                            </div>
                        )}
                        <div className="space-y-3">
                            <RadioGroup value={answer || ""} onValueChange={onAnswerChange}>
                                {question.options?.map((option, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                                        <RadioGroupItem value={option} id={`option-${index}`} />
                                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                );

            default:
                return <div className="text-red-500">Unsupported question type: {question.type}</div>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Question Header */}
            <div className="flex items-start gap-3">
                <div className="flex-1">
                    <div className="prose max-w-none mb-4">
                        <p className="text-lg font-medium leading-relaxed text-gray-800">
                            {question.questionText}
                        </p>
                    </div>

                    {/* Question Type Badge */}
                    <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline" className="flex items-center gap-1">
                            {question.type === "code" && <Code className="h-3 w-3" />}
                            {question.type === "code" ? "Code Question" :
                                question.type === "multiple_choice" ? "Multiple Choice" : "Multiple Select"}
                        </Badge>
                        {question.language && question.type === "code" && (
                            <Badge variant="secondary" className="text-xs">
                                {question.language.toUpperCase()}
                            </Badge>
                        )}
                        <Badge variant="outline">{question.marks} points</Badge>
                    </div>
                </div>
            </div>

            {/* Question Content */}
            {renderQuestionContent()}

            {/* Answer Status Indicator */}
            <div className="flex items-center gap-2 pt-4 border-t">
                <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${answer && (Array.isArray(answer) ? answer.length > 0 : answer.toString().trim())
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                        }`}></div>
                    <span className="text-sm text-gray-600">
                        {answer && (Array.isArray(answer) ? answer.length > 0 : answer.toString().trim())
                            ? 'Answered'
                            : 'Not answered'}
                    </span>
                </div>
            </div>
        </div>
    );
}