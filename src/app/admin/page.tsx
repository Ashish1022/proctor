"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminSidebar } from "@/modules/admin/ui/sidebar"
import { Users, FileText, TrendingUp, Clock, Plus, MoreHorizontal, Eye, Edit } from "lucide-react"

const stats = [
  {
    title: "Total Tests",
    value: "24",
    change: "+12%",
    changeType: "positive" as const,
    icon: FileText,
  },
  {
    title: "Active Students",
    value: "1,234",
    change: "+5%",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Completion Rate",
    value: "87%",
    change: "+3%",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
  {
    title: "Avg. Duration",
    value: "45m",
    change: "-2m",
    changeType: "neutral" as const,
    icon: Clock,
  },
]

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

const recentActivity = [
  {
    id: 1,
    action: "New test created",
    details: "Mathematics Final Exam",
    user: "Sarah Johnson",
    time: "2 hours ago",
  },
  {
    id: 2,
    action: "Student completed test",
    details: "History Quiz - Chapter 5",
    user: "Mike Chen",
    time: "4 hours ago",
  },
  {
    id: 3,
    action: "Test published",
    details: "Science Lab Assessment",
    user: "Emily Davis",
    time: "1 day ago",
  },
  {
    id: 4,
    action: "User registered",
    details: "New student account",
    user: "Alex Rodriguez",
    time: "2 days ago",
  },
]

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with your tests today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title} className="border-0 shadow-sm bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span
                      className={`text-sm font-medium ${
                        stat.changeType === "positive"
                          ? "text-green-600"
                          : stat.changeType === "neutral"
                            ? "text-red-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">from last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Tests */}
            <div className="lg:col-span-2">
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
                        className={`p-6 flex items-center justify-between hover:bg-muted/30 transition-colors ${
                          index !== recentTests.length - 1 ? "border-b border-border" : ""
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

            {/* Recent Activity */}
            <div>
              <Card className="border-0 shadow-sm bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="font-heading">Recent Activity</CardTitle>
                  <CardDescription>Latest actions in your platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{activity.action}</p>
                        <p className="text-sm text-muted-foreground truncate">{activity.details}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{activity.user}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
