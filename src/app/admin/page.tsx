"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminSidebar } from "@/modules/admin/ui/sidebar"
import { Plus, MoreHorizontal, Eye, Edit } from "lucide-react"

const recentTests = [
  {
    id: 1,
    title: "Mathematics Final Exam",
    subject: "Mathematics",
    students: 45,
    status: "active",
    created: "2 days ago",
  },
  {
    id: 2,
    title: "History Quiz - Chapter 5",
    subject: "History",
    students: 32,
    status: "draft",
    created: "1 week ago",
  },
  {
    id: 3,
    title: "Science Lab Assessment",
    subject: "Science",
    students: 28,
    status: "completed",
    created: "3 days ago",
  },
  {
    id: 4,
    title: "English Literature Review",
    subject: "English",
    students: 38,
    status: "active",
    created: "5 days ago",
  },
]

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your tests today.</p>
          </div>

          <Card className="border-0 shadow-sm bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading">Recent Tests</CardTitle>
                  <CardDescription>Manage your latest test creations</CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Test
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {recentTests.map((test, index) => (
                  <div
                    key={test.id}
                    className={`p-6 flex items-center justify-between hover:bg-muted/30 transition-colors ${index !== recentTests.length - 1 ? "border-b border-border" : ""
                      }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-foreground">{test.title}</h3>
                        <Badge
                          variant={
                            test.status === "active" ? "default" : test.status === "draft" ? "secondary" : "outline"
                          }
                          className="text-xs"
                        >
                          {test.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{test.subject}</span>
                        <span>•</span>
                        <span>{test.students} students</span>
                        <span>•</span>
                        <span>{test.created}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
