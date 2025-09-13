"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AdminSidebar } from "@/modules/admin/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Copy, Trash2, Users, Clock, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

const tests = [
  {
    id: 1,
    title: "Mathematics Final Exam",
    subject: "Mathematics",
    questions: 50,
    duration: 120,
    students: 45,
    status: "active",
    created: "2024-01-15",
    lastModified: "2024-01-20",
  },
  {
    id: 2,
    title: "History Quiz - Chapter 5",
    subject: "History",
    questions: 25,
    duration: 45,
    students: 32,
    status: "draft",
    created: "2024-01-10",
    lastModified: "2024-01-18",
  },
  {
    id: 3,
    title: "Science Lab Assessment",
    subject: "Science",
    questions: 30,
    duration: 90,
    students: 28,
    status: "completed",
    created: "2024-01-08",
    lastModified: "2024-01-16",
  },
  {
    id: 4,
    title: "English Literature Review",
    subject: "English",
    questions: 40,
    duration: 75,
    students: 38,
    status: "active",
    created: "2024-01-12",
    lastModified: "2024-01-19",
  },
  {
    id: 5,
    title: "Physics Mechanics Test",
    subject: "Physics",
    questions: 35,
    duration: 60,
    students: 22,
    status: "scheduled",
    created: "2024-01-14",
    lastModified: "2024-01-21",
  },
]

export default function TestsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter();

  const filteredTests = tests.filter(
    (test) =>
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "draft":
        return "secondary"
      case "completed":
        return "outline"
      case "scheduled":
        return "default"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Tests</h1>
              <p className="text-muted-foreground">Create and manage your test library</p>
            </div>
            <Button className="gap-2 w-fit" onClick={()=>router.push('/admin/tests/create')}>
              <Plus className="w-4 h-4" />
              Create New Test
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                    <p className="text-2xl font-bold text-foreground">24</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Tests</p>
                    <p className="text-2xl font-bold text-foreground">8</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold text-foreground">165</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Duration</p>
                    <p className="text-2xl font-bold text-foreground">78m</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tests Table */}
          <Card className="border-0 shadow-sm bg-card">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="font-heading">All Tests</CardTitle>
                  <CardDescription>Manage your test collection</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="font-medium">Test Name</TableHead>
                    <TableHead className="font-medium">Subject</TableHead>
                    <TableHead className="font-medium">Questions</TableHead>
                    <TableHead className="font-medium">Duration</TableHead>
                    <TableHead className="font-medium">Students</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium">Last Modified</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTests.map((test) => (
                    <TableRow key={test.id} className="border-border hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{test.title}</p>
                          <p className="text-sm text-muted-foreground">Created {test.created}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-transparent">
                          {test.subject}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{test.questions}</TableCell>
                      <TableCell className="text-muted-foreground">{test.duration}m</TableCell>
                      <TableCell className="text-muted-foreground">{test.students}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(test.status)} className="capitalize">
                          {test.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{test.lastModified}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="w-4 h-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Edit className="w-4 h-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Copy className="w-4 h-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive">
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
