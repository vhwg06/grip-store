'use client'

import { saveArticle } from "@/adapters/api/admin.api"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import MediaUploader from "@/components/admin/media-uploader"

export function ArticleForm({ article }: { article?: any }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [featuredImage, setFeaturedImage] = useState(article?.featuredImage || "")
    const [content, setContent] = useState(article?.content || "")

    const editor = useEditor({
        extensions: [StarterKit],
        content: article?.content || "",
        onUpdate: ({ editor }) => {
            setContent(editor.getText() || editor.getHTML() || "")
        },
    })

    useEffect(() => {
        setFeaturedImage(article?.featuredImage || "")
        if (editor && article) {
            editor.commands.setContent(article.content || "")
            setContent(article.content || "")
        }
    }, [article?.id, article?.featuredImage, editor, article])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            // Ensure editor content is correctly set in form submission
            let finalContent = content
            if (editor) {
                const domText = document.querySelector('[data-testid="article-content-editor"]')?.textContent || ""
                const editorText = editor.getText()
                if (domText.trim() !== "" && editorText.trim() === "") {
                    finalContent = domText
                } else {
                    finalContent = editorText.trim() === "" ? "" : editor.getHTML()
                }
            }
            formData.set("content", finalContent)
            formData.set("body", finalContent)
            
            const isActive = formData.get("isActive") === "true"
            formData.set("status", isActive ? "published" : "draft")

            const featuredImageVal = formData.get("featuredImage") as string || ""
            formData.set("image_url", featuredImageVal)

            const authorVal = formData.get("author") as string || ""
            formData.set("author_id", authorVal.trim())
            await saveArticle(formData)
            toast.success("Đã lưu bài viết")
            router.push('/admin/articles')
        } catch (e: any) {
            console.error('Save article error:', e)
            toast.error(e?.message || "Có lỗi xảy ra")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>{article ? "Chỉnh sửa Bài viết" : "Thêm Bài viết mới"}</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-6">
                    {article && <input type="hidden" name="id" value={article.id} />}

                    <div className="grid gap-2">
                        <Label htmlFor="title">Tiêu đề</Label>
                        <Input id="title" name="title" defaultValue={article?.title} placeholder="Tiêu đề bài viết..." required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slug">Đường dẫn (Slug)</Label>
                        <Input id="slug" name="slug" defaultValue={article?.slug} placeholder="De-trong-tu-dong-tao..." />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="excerpt">Tóm tắt</Label>
                        <Textarea
                            id="excerpt"
                            name="excerpt"
                            defaultValue={article?.excerpt}
                            placeholder="Đoạn mô tả ngắn gọn..."
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="content-editor">Nội dung (Rich Text)</Label>
                        <div className="border rounded-md p-1 min-h-[300px] bg-background">
                            <EditorContent
                                editor={editor}
                                id="content-editor"
                                data-testid="article-content-editor"
                                className="min-h-[290px] px-3 py-2 focus-visible:outline-none"
                            />
                        </div>
                        {/* Hidden input to hold state in case standard form submission requires it */}
                        <input type="hidden" name="content" value={content} />
                    </div>

                    <div data-testid="article-featured-media" className="grid gap-2">
                        <MediaUploader
                            label="Ảnh đại diện"
                            value={featuredImage}
                            onChange={(value) => setFeaturedImage(value as string)}
                        />
                        <input type="hidden" id="featuredImage" name="featuredImage" value={featuredImage} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="author">Tác giả</Label>
                            <Input id="author" name="author" defaultValue={article?.author} placeholder="Tên tác giả..." />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tags">Tags (cách nhau bởi dấu phẩy)</Label>
                            <Input id="tags" name="tags" defaultValue={article?.tags?.join(', ')} placeholder="Kiến thức, Xu hướng, Cửa..." />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isActive"
                            name="isActive"
                            defaultChecked={article ? article.isActive : true}
                            className="h-4 w-4 accent-primary"
                            value="true"
                        />
                        <Label htmlFor="isActive" className="cursor-pointer font-medium">Xuất bản (Hiển thị công khai)</Label>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button variant="outline" type="button" onClick={() => router.back()}>Hủy</Button>
                        <Button type="submit" disabled={loading}>{loading ? "Đang lưu..." : "Lưu bài viết"}</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
