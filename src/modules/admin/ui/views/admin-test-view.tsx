"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminSidebar } from "@/modules/admin/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Eye, Edit, Copy, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"

export default function TestsPage() {
    const router = useRouter();

    const trpc = useTRPC();

    const { data: tests } = useQuery(trpc.test.getAll.queryOptions());

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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Tests</h1>
                            <p className="text-muted-foreground">Create and manage your test library</p>
                        </div>
                        <Button className="gap-2 w-fit" onClick={() => router.push('/admin/tests/create')}>
                            <Plus className="w-4 h-4" />
                            Create New Test
                        </Button>
                    </div>

                    <Card className="border-0 shadow-sm bg-card">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <CardTitle className="font-heading">All Tests</CardTitle>
                                    <CardDescription>Manage your test collection</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border">
                                        <TableHead className="font-medium">Test Name</TableHead>
                                        <TableHead className="font-medium">Duration</TableHead>
                                        <TableHead className="font-medium">Status</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tests?.map((test) => (
                                        <TableRow key={test.id} className="border-border hover:bg-muted/30">
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-foreground">{test.title}</p>
                                                    <p className="text-sm text-muted-foreground">Created {test.createdAt.toLocaleDateString()}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{test.duration}m</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusColor(test.status)} className="capitalize">
                                                    {test.status}
                                                </Badge>
                                            </TableCell>
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
