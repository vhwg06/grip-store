'use client'

import { useState } from "react"
import { useAdminArticles } from "@/application/hooks/useAdmin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { deleteArticle } from "@/adapters/api/admin.api"
import { toast } from "sonner"
import Link from "next/link"
import { AdminArticle } from "@/domain/admin"
import { PlusCircle, Edit, Trash2 } from "lucide-react"

export function AdminArticlesContent() {
    const { data: articles, mutate, isLoading } = useAdminArticles()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return
        setDeletingId(id)
        try {
            await deleteArticle(id)
            toast.success("Xóa bài viết thành công")
            mutate()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setDeletingId(null)
        }
    }

    if (isLoading) return <div>Đang tải...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Quản lý Tin tức & Blog</h1>
                <Link href="/admin/article/new">
                    <Button><PlusCircle className="w-4 h-4 mr-2" /> Thêm bài viết</Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách bài viết</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ảnh</TableHead>
                                    <TableHead>Tiêu đề</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Ngày đăng</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!articles || articles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            Chưa có bài viết nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    articles.map((a: AdminArticle) => (
                                        <TableRow key={a.id}>
                                            <TableCell>
                                                {a.featuredImage ? (
                                                    <div className="w-16 h-12 relative rounded overflow-hidden bg-neutral-100">
                                                        <img src={a.featuredImage} alt={a.title} className="object-cover w-full h-full" />
                                                    </div>
                                                ) : <div className="w-16 h-12 bg-neutral-100 rounded" />}
                                            </TableCell>
                                            <TableCell className="font-medium max-w-[300px] truncate">{a.title}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}`}>
                                                    {a.isActive ? "Xuất bản" : "Nháp"}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('vi-VN') : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/article/edit/${a.id}`}>
                                                        <Button variant="outline" size="icon"><Edit className="w-4 h-4" /></Button>
                                                    </Link>
                                                    <Button 
                                                        variant="destructive" 
                                                        size="icon"
                                                        onClick={() => handleDelete(a.id)}
                                                        disabled={deletingId === a.id}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
