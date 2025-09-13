"use client"

import { useState } from "react"
import { AdminSidebar } from "@/modules/admin/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Edit, Trash2, Mail, UserCheck, UserX, Users, GraduationCap, Shield } from "lucide-react"

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  // Mock data for users
  const users = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice.johnson@email.com",
      role: "student",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
      testsCompleted: 12,
      averageScore: 85,
      lastActive: "2024-01-20",
      joinedDate: "2023-09-15",
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob.smith@email.com",
      role: "student",
      status: "inactive",
      avatar: "/placeholder.svg?height=40&width=40",
      testsCompleted: 8,
      averageScore: 72,
      lastActive: "2024-01-10",
      joinedDate: "2023-10-22",
    },
    {
      id: 3,
      name: "Dr. Sarah Wilson",
      email: "sarah.wilson@email.com",
      role: "admin",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
      testsCreated: 25,
      lastActive: "2024-01-21",
      joinedDate: "2023-08-01",
    },
    {
      id: 4,
      name: "Mike Chen",
      email: "mike.chen@email.com",
      role: "instructor",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
      testsCreated: 15,
      studentsManaged: 45,
      lastActive: "2024-01-19",
      joinedDate: "2023-09-30",
    },
  ]

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "instructor":
        return "bg-blue-100 text-blue-800"
      case "student":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />
      case "instructor":
        return <GraduationCap className="w-4 h-4" />
      case "student":
        return <Users className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">Manage students, instructors, and administrators</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">1,247</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Students</p>
                    <p className="text-3xl font-bold text-gray-900">1,156</p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Instructors</p>
                    <p className="text-3xl font-bold text-gray-900">78</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Today</p>
                    <p className="text-3xl font-bold text-gray-900">342</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all-users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all-users">All Users</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="instructors">Instructors</TabsTrigger>
              <TabsTrigger value="admins">Administrators</TabsTrigger>
            </TabsList>

            <TabsContent value="all-users" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="student">Students</SelectItem>
                        <SelectItem value="instructor">Instructors</SelectItem>
                        <SelectItem value="admin">Administrators</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Users List */}
              <div className="space-y-4">
                {users.map((user) => (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                              <Badge className={getRoleColor(user.role)}>
                                {getRoleIcon(user.role)}
                                <span className="ml-1 capitalize">{user.role}</span>
                              </Badge>
                              <Badge className={getStatusColor(user.status)}>
                                {user.status === "active" ? (
                                  <UserCheck className="w-3 h-3 mr-1" />
                                ) : (
                                  <UserX className="w-3 h-3 mr-1" />
                                )}
                                {user.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600">{user.email}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              {user.role === "student" && (
                                <>
                                  <span>Tests: {user.testsCompleted}</span>
                                  <span>Avg Score: {user.averageScore}%</span>
                                </>
                              )}
                              {(user.role === "admin" || user.role === "instructor") && (
                                <>
                                  <span>Tests Created: {user.testsCreated}</span>
                                  {user.studentsManaged && <span>Students: {user.studentsManaged}</span>}
                                </>
                              )}
                              <span>Last Active: {user.lastActive}</span>
                              <span>Joined: {user.joinedDate}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Other tabs would have filtered content */}
            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Student Management</CardTitle>
                  <CardDescription>Manage student accounts and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Student-specific management interface would go here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructors">
              <Card>
                <CardHeader>
                  <CardTitle>Instructor Management</CardTitle>
                  <CardDescription>Manage instructor accounts and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Instructor-specific management interface would go here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admins">
              <Card>
                <CardHeader>
                  <CardTitle>Administrator Management</CardTitle>
                  <CardDescription>Manage administrator accounts and system access</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Administrator-specific management interface would go here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
