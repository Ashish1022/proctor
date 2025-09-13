"use client"

import { useState } from "react"
import { AdminSidebar } from "@/modules/admin/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Settings, Mail, Shield, Palette, Bell, Clock } from "lucide-react"

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [autoGrading, setAutoGrading] = useState(true)
  const [publicRegistration, setPublicRegistration] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage your platform configuration and preferences</p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
              <TabsTrigger value="appearance">Theme</TabsTrigger>
              <TabsTrigger value="notifications">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    General Settings
                  </CardTitle>
                  <CardDescription>Basic platform configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="platform-name">Platform Name</Label>
                      <Input id="platform-name" defaultValue="TestPlatform Pro" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="platform-url">Platform URL</Label>
                      <Input id="platform-url" defaultValue="https://testplatform.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platform-description">Platform Description</Label>
                    <Textarea
                      id="platform-description"
                      defaultValue="A comprehensive online testing platform for educational institutions."
                      className="min-h-20"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Admin Email</Label>
                      <Input id="admin-email" type="email" defaultValue="admin@testplatform.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="support-email">Support Email</Label>
                      <Input id="support-email" type="email" defaultValue="support@testplatform.com" />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Platform Features</h4>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Public Registration</Label>
                        <p className="text-sm text-gray-600">Allow users to register without invitation</p>
                      </div>
                      <Switch checked={publicRegistration} onCheckedChange={setPublicRegistration} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Maintenance Mode</Label>
                        <p className="text-sm text-gray-600">Temporarily disable platform access</p>
                      </div>
                      <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Configuration
                  </CardTitle>
                  <CardDescription>Configure email settings and templates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-host">SMTP Host</Label>
                      <Input id="smtp-host" defaultValue="smtp.gmail.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">SMTP Port</Label>
                      <Input id="smtp-port" defaultValue="587" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-username">SMTP Username</Label>
                      <Input id="smtp-username" defaultValue="noreply@testplatform.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-password">SMTP Password</Label>
                      <Input id="smtp-password" type="password" placeholder="••••••••" />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Email Notifications</h4>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Send Email Notifications</Label>
                        <p className="text-sm text-gray-600">Enable automatic email notifications</p>
                      </div>
                      <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-signature">Email Signature</Label>
                    <Textarea
                      id="email-signature"
                      defaultValue="Best regards,&#10;The TestPlatform Team"
                      className="min-h-20"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Configure security and authentication settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <Input id="session-timeout" type="number" defaultValue="60" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                      <Input id="max-login-attempts" type="number" defaultValue="5" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-policy">Password Policy</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - 6 characters minimum</SelectItem>
                        <SelectItem value="medium">Medium - 8 characters, mixed case</SelectItem>
                        <SelectItem value="high">High - 12 characters, mixed case, numbers, symbols</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Two-Factor Authentication</h4>
                    <div className="space-y-2">
                      <Label htmlFor="2fa-method">2FA Method</Label>
                      <Select defaultValue="disabled">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disabled">Disabled</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="app">Authenticator App</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="testing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Testing Configuration
                  </CardTitle>
                  <CardDescription>Configure test behavior and grading settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="default-test-duration">Default Test Duration (minutes)</Label>
                      <Input id="default-test-duration" type="number" defaultValue="60" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-attempts">Max Test Attempts</Label>
                      <Input id="max-attempts" type="number" defaultValue="3" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Grading Settings</h4>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-Grading</Label>
                        <p className="text-sm text-gray-600">Automatically grade multiple choice questions</p>
                      </div>
                      <Switch checked={autoGrading} onCheckedChange={setAutoGrading} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passing-grade">Passing Grade (%)</Label>
                      <Input id="passing-grade" type="number" defaultValue="70" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade-scale">Grading Scale</Label>
                    <Select defaultValue="percentage">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (0-100%)</SelectItem>
                        <SelectItem value="letter">Letter Grades (A-F)</SelectItem>
                        <SelectItem value="points">Points Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Appearance & Branding
                  </CardTitle>
                  <CardDescription>Customize the look and feel of your platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex items-center gap-4">
                      <Input id="primary-color" defaultValue="#624CF5" className="w-32" />
                      <div className="w-8 h-8 rounded border" style={{ backgroundColor: "#624CF5" }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo-upload">Platform Logo</Label>
                    <Input id="logo-upload" type="file" accept="image/*" />
                    <p className="text-sm text-gray-600">Recommended size: 200x50px</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="favicon-upload">Favicon</Label>
                    <Input id="favicon-upload" type="file" accept="image/*" />
                    <p className="text-sm text-gray-600">Recommended size: 32x32px</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme-mode">Theme Mode</Label>
                    <Select defaultValue="light">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto (System)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>Configure system alerts and notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">System Alerts</h4>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>New User Registration</Label>
                          <p className="text-sm text-gray-600">Notify when new users register</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Test Completion</Label>
                          <p className="text-sm text-gray-600">Notify when tests are completed</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>System Errors</Label>
                          <p className="text-sm text-gray-600">Notify about system errors</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Low Storage Warning</Label>
                          <p className="text-sm text-gray-600">Notify when storage is running low</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="notification-email">Notification Email</Label>
                    <Input id="notification-email" type="email" defaultValue="admin@testplatform.com" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-8">
            <Button variant="outline">Reset to Defaults</Button>
            <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
