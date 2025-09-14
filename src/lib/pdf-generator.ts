// utils/pdfGenerator.ts
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF
        lastAutoTable: {
            finalY: number
        }
    }
}

interface AnalyticsData {
    testDetails: {
        title: string
        createdAt: string
        totalStudents: number
        averageScore: number
        highestScore: number
        passRate: number
    }
    studentRankings: Array<{
        rank: number
        name: string
        email: string
        score: number
        obtainedScore: number
        totalScore: number
        timeSpent: number
        studentId: string
    }>
    scoreDistribution: Array<{
        range: string
        count: number
        color: string
    }>
    questionAnalysis: Array<{
        questionNumber: string
        questionText: string
        correct: number
        incorrect: number
        successRate: number
        difficulty: string
        questionId: string
    }>
}

export class PDFGenerator {
    private doc: jsPDF
    private pageHeight: number
    private pageWidth: number
    private margin: number
    private currentY: number

    constructor() {
        this.doc = new jsPDF()
        this.pageHeight = this.doc.internal.pageSize.height
        this.pageWidth = this.doc.internal.pageSize.width
        this.margin = 20
        this.currentY = this.margin
    }

    private formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)

        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        return `${minutes} min`
    }

    private formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    private checkPageBreak(requiredHeight: number) {
        if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
            this.doc.addPage()
            this.currentY = this.margin
        }
    }

    private addTitle(title: string, fontSize: number = 16) {
        this.doc.setFontSize(fontSize)
        this.doc.setFont('helvetica', 'bold')
        this.doc.text(title, this.margin, this.currentY)
        this.currentY += fontSize * 0.6
    }

    private addText(text: string, fontSize: number = 12, style: 'normal' | 'bold' = 'normal') {
        this.doc.setFontSize(fontSize)
        this.doc.setFont('helvetica', style)
        this.doc.text(text, this.margin, this.currentY)
        this.currentY += fontSize * 0.6
    }

    private addSpace(space: number = 10) {
        this.currentY += space
    }

    generateReport(data: AnalyticsData): void {
        try {
            // Header
            this.addTitle('Test Analytics Report', 20)
            this.addSpace(5)

            // Test Details
            this.addTitle(data.testDetails.title, 16)
            this.addText(`Generated on: ${this.formatDate(new Date().toISOString())}`)
            this.addText(`Test Created: ${this.formatDate(data.testDetails.createdAt)}`)
            this.addSpace(15)

            // Overview Section
            this.addTitle('Test Overview', 14)
            this.addSpace(5)

            const overviewData = [
                ['Total Students', data.testDetails.totalStudents.toString()],
                ['Average Score', `${data.testDetails.averageScore.toFixed(1)}%`],
                ['Highest Score', `${data.testDetails.highestScore.toFixed(1)}%`],
                ['Pass Rate (>60%)', `${data.testDetails.passRate.toFixed(1)}%`]
            ]

            this.doc.autoTable({
                startY: this.currentY,
                head: [['Metric', 'Value']],
                body: overviewData,
                theme: 'grid',
                styles: { fontSize: 12 },
                headStyles: { fillColor: [99, 76, 245] },
                margin: { left: this.margin }
            })

            this.currentY = this.doc.lastAutoTable.finalY + 20

            // Student Rankings Section
            this.checkPageBreak(100)
            this.addTitle('Student Rankings', 14)
            this.addSpace(5)

            const rankingHeaders = ['Rank', 'Name', 'Email', 'Score', 'Points', 'Time']
            const rankingData = data.studentRankings.map(student => [
                `#${student.rank}`,
                student.name || 'N/A',
                student.email || 'N/A',
                `${student.score.toFixed(1)}%`,
                `${student.obtainedScore}/${student.totalScore}`,
                this.formatTime(student.timeSpent)
            ])

            this.doc.autoTable({
                startY: this.currentY,
                head: [rankingHeaders],
                body: rankingData,
                theme: 'striped',
                styles: { fontSize: 10 },
                headStyles: { fillColor: [99, 76, 245] },
                margin: { left: this.margin },
                columnStyles: {
                    0: { cellWidth: 20 },
                    1: { cellWidth: 40 },
                    2: { cellWidth: 50 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 25 },
                    5: { cellWidth: 25 }
                }
            })

            this.currentY = this.doc.lastAutoTable.finalY + 20

            // Score Distribution Section
            this.checkPageBreak(80)
            this.addTitle('Score Distribution', 14)
            this.addSpace(5)

            const distributionData = data.scoreDistribution
                .filter(item => item.count > 0)
                .map(item => [
                    item.range,
                    item.count.toString(),
                    `${((item.count / data.testDetails.totalStudents) * 100).toFixed(1)}%`
                ])

            if (distributionData.length > 0) {
                this.doc.autoTable({
                    startY: this.currentY,
                    head: [['Score Range', 'Students', 'Percentage']],
                    body: distributionData,
                    theme: 'grid',
                    styles: { fontSize: 12 },
                    headStyles: { fillColor: [99, 76, 245] },
                    margin: { left: this.margin }
                })

                this.currentY = this.doc.lastAutoTable.finalY + 20
            }

            // Question Analysis Section
            this.checkPageBreak(100)
            this.addTitle('Question Analysis', 14)
            this.addSpace(5)

            const questionHeaders = ['Q#', 'Question', 'Correct', 'Incorrect', 'Success Rate', 'Difficulty']
            const questionData = data.questionAnalysis.map(question => [
                question.questionNumber,
                question.questionText && question.questionText.length > 40
                    ? question.questionText.substring(0, 40) + '...'
                    : question.questionText || 'N/A',
                question.correct.toString(),
                question.incorrect.toString(),
                `${question.successRate.toFixed(1)}%`,
                question.difficulty || 'N/A'
            ])

            if (questionData.length > 0) {
                this.doc.autoTable({
                    startY: this.currentY,
                    head: [questionHeaders],
                    body: questionData,
                    theme: 'striped',
                    styles: { fontSize: 9 },
                    headStyles: { fillColor: [99, 76, 245] },
                    margin: { left: this.margin },
                    columnStyles: {
                        0: { cellWidth: 15 },
                        1: { cellWidth: 60 },
                        2: { cellWidth: 20 },
                        3: { cellWidth: 20 },
                        4: { cellWidth: 25 },
                        5: { cellWidth: 25 }
                    }
                })
            }

            // Add footer with generation info
            const totalPages = this.doc.getNumberOfPages()
            for (let i = 1; i <= totalPages; i++) {
                this.doc.setPage(i)
                this.doc.setFontSize(8)
                this.doc.setFont('helvetica', 'normal')
                this.doc.text(
                    `Generated by Test Analytics System - Page ${i} of ${totalPages}`,
                    this.margin,
                    this.pageHeight - 10
                )
                this.doc.text(
                    new Date().toLocaleString(),
                    this.pageWidth - this.margin - 50,
                    this.pageHeight - 10
                )
            }
        } catch (error) {
            console.error('Error in generateReport:', error)
            throw new Error(`Failed to generate PDF report: ${error}`)
        }
    }

    download(filename: string): void {
        try {
            this.doc.save(filename)
        } catch (error) {
            console.error('Error downloading PDF:', error)
            throw new Error(`Failed to download PDF: ${error}`)
        }
    }
}

export const generateAndDownloadPDF = async (data: AnalyticsData, testTitle: string) => {
    try {
        // Validate input data
        if (!data || !data.testDetails) {
            throw new Error('Invalid analytics data provided')
        }

        const generator = new PDFGenerator()
        generator.generateReport(data)

        const sanitizedTitle = testTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        const timestamp = new Date().toISOString().slice(0, 10)
        const filename = `${sanitizedTitle}_analytics_${timestamp}.pdf`

        generator.download(filename)

        return { success: true, filename }
    } catch (error) {
        console.error('Error generating PDF:', error)
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error occurred' 
        }
    }
}