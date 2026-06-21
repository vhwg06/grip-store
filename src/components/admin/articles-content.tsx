"use client"

import { deleteArticle, saveArticle } from "@/adapters/api/admin.api"
import { useAdminArticles } from "@/application/hooks/useAdmin"
import MediaUploader from "@/components/admin/media-uploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { AdminArticle } from "@/domain/admin"
import { CalendarDays, FileText, Plus, Search, SquarePen, Trash2, Eye, X, Bold, Italic, Heading1, Heading2, List, ListOrdered, Link as LinkIcon, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { startTransition, useDeferredValue, useEffect, useMemo, useState, useRef } from "react"
import { toast } from "sonner"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TiptapImage from "@tiptap/extension-image"
import { getPresignedUrl, uploadToR2, registerMediaMetadata } from "@/adapters/api/media.api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ReactMarkdown from "react-markdown"

type StatusFilter = "published" | "draft" | "all"

type EditorState = {
  id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string
  author: string
  tags: string
  isActive: boolean
}

const EMPTY_EDITOR: EditorState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featuredImage: "",
  author: "",
  tags: "",
  isActive: false,
}

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function formatArticleDate(value: string | null) {
  if (!value) return "Draft"
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

function formatEditorTimestamp(value: string | null) {
  if (!value) return "Not published yet"
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function toEditorState(article?: AdminArticle | null): EditorState {
  if (!article) return EMPTY_EDITOR

  return {
    id: article.id,
    title: article.title ?? "",
    slug: article.slug ?? "",
    excerpt: article.excerpt ?? "",
    content: article.content ?? "",
    featuredImage: article.featuredImage ?? "",
    author: article.author ?? "",
    tags: Array.isArray(article.tags) ? article.tags.join(", ") : "",
    isActive: Boolean(article.isActive),
  }
}

function buildArticleQuery(pathname: string, articleId?: string | null, compose?: "new" | null) {
  const params = new URLSearchParams()
  if (articleId) params.set("articleId", articleId)
  if (compose) params.set("compose", compose)
  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

export function AdminArticlesContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { data: articles = [], mutate, isLoading } = useAdminArticles()

  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("published")
  const [editorState, setEditorState] = useState<EditorState>(EMPTY_EDITOR)
  const [slugTouched, setSlugTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [editorMode, setEditorMode] = useState<"visual" | "markdown">("visual")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<{ title: string; content: string; author?: string; featuredImage?: string } | null>(null)

  const composeMode = searchParams.get("compose")
  const selectedId = searchParams.get("articleId")
  const deferredQuery = useDeferredValue(query)

  const selectedArticle = useMemo(
    () => articles.find((article) => article.id === selectedId) ?? null,
    [articles, selectedId],
  )

  const handleUploadImageFile = async (file: File): Promise<string | null> => {
    try {
      const presigned = await getPresignedUrl(file.name, file.type)
      await uploadToR2(presigned.upload_url, file)
      await registerMediaMetadata({
        id: presigned.id,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        url: presigned.public_url,
      })
      return presigned.public_url
    } catch (err: any) {
      toast.error(`Image upload failed: ${err.message || err}`)
      return null
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({
        inline: true,
      }),
    ],
    content: editorState.content,
    onUpdate: ({ editor }) => {
      handleFieldChange("content", editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "min-h-[180px] focus:outline-none p-5 bg-white text-sm leading-6 text-[#3a352b] tiptap",
        id: "content-editor",
        "data-testid": "article-content-editor",
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          if (item.type.indexOf("image") !== -1) {
            const file = item.getAsFile()
            if (file) {
              event.preventDefault()
              handleUploadImageFile(file).then((url) => {
                if (url) {
                  view.dispatch(
                    view.state.tr.replaceSelectionWith(
                      view.state.schema.nodes.image.create({ src: url })
                    )
                  )
                }
              })
              return true
            }
          }
        }
        return false
      }
    }
  })

  useEffect(() => {
    if (editor && editorState.content !== editor.getHTML()) {
      if (!editor.isFocused) {
        editor.commands.setContent(editorState.content, false as any)
      }
    }
  }, [editorState.content, editor])

  const handleMarkdownPaste = async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData?.items
    if (!items) return
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile()
        if (file) {
          event.preventDefault()
          const url = await handleUploadImageFile(file)
          if (url) {
            const textarea = event.currentTarget
            const selectionStart = textarea.selectionStart
            const selectionEnd = textarea.selectionEnd
            const text = textarea.value
            const markdownImage = `![image](${url})`
            
            const newContent = text.substring(0, selectionStart) + markdownImage + text.substring(selectionEnd)
            handleFieldChange("content", newContent)
            
            setTimeout(() => {
              textarea.focus()
              textarea.setSelectionRange(
                selectionStart + markdownImage.length,
                selectionStart + markdownImage.length
              )
            }, 0)
          }
        }
      }
    }
  }

  const handleOpenPreview = (data: any) => {
    setPreviewData(data)
    setIsPreviewOpen(true)
  }

  useEffect(() => {
    const next = toEditorState(composeMode === "new" ? null : selectedArticle)
    setEditorState(next)
    setSlugTouched(Boolean(next.id) || next.slug.length > 0)
  }, [composeMode, selectedArticle])

  useEffect(() => {
    if (selectedArticle) {
      setStatusFilter(selectedArticle.isActive ? "published" : "draft")
    }
  }, [selectedArticle])

  useEffect(() => {
    if (isLoading || composeMode === "new" || selectedId || articles.length === 0) return

    const preferred = articles.find((article) => article.isActive) ?? articles[0]
    startTransition(() => {
      router.replace(buildArticleQuery(pathname, preferred.id, null), { scroll: false })
    })
  }, [articles, composeMode, isLoading, pathname, router, selectedId])

  const filteredArticles = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()

    return articles.filter((article) => {
      if (statusFilter === "published" && !article.isActive) return false
      if (statusFilter === "draft" && article.isActive) return false

      if (!normalizedQuery) return true

      const haystack = [article.title, article.slug, article.excerpt ?? ""]
        .join(" ")
        .toLowerCase()

      return haystack.includes(normalizedQuery)
    })
  }, [articles, deferredQuery, statusFilter])

  const publishedCount = useMemo(() => articles.filter((article) => article.isActive).length, [articles])
  const draftCount = articles.length - publishedCount

  const handleRouteState = (articleId?: string | null, compose?: "new" | null) => {
    startTransition(() => {
      router.replace(buildArticleQuery(pathname, articleId, compose), { scroll: false })
    })
  }

  const handleNewArticle = () => {
    setEditorState(EMPTY_EDITOR)
    setSlugTouched(false)
    handleRouteState(null, "new")
  }

  const handleResetEditor = () => {
    const next = toEditorState(composeMode === "new" ? null : selectedArticle)
    setEditorState(next)
    setSlugTouched(Boolean(next.id) || next.slug.length > 0)
  }

  const handleSelectArticle = (article: AdminArticle) => {
    handleRouteState(article.id, null)
  }

  const handleFieldChange = <K extends keyof EditorState>(field: K, value: EditorState[K]) => {
    setEditorState((current) => {
      const next = { ...current, [field]: value }

      if (field === "title" && !slugTouched && !current.id) {
        next.slug = slugify(String(value))
      }

      return next
    })
  }

  const handleSave = async () => {
    await persistArticle(editorState)
  }

  const handleSaveDraft = async () => {
    await persistArticle({ ...editorState, isActive: false })
  }

  const persistArticle = async (nextState: EditorState) => {
    if (!nextState.title.trim()) {
      toast.error("Title is required")
      return
    }

    if (!nextState.slug.trim()) {
      toast.error("Slug is required")
      return
    }

    setSaving(true)

    try {
      const formData = new FormData()
      if (nextState.id) formData.set("id", nextState.id)
      formData.set("title", nextState.title.trim())
      formData.set("slug", nextState.slug.trim())
      formData.set("excerpt", nextState.excerpt.trim())
      let finalContent = nextState.content
      if (editorMode === "visual" && editor) {
        const domText = document.querySelector('[data-testid="article-content-editor"] .ProseMirror')?.textContent || ""
        const editorText = editor.getText()
        if (domText.trim() !== "" && editorText.trim() === "") {
          finalContent = domText
        } else {
          finalContent = editorText.trim() === "" ? "" : editor.getHTML()
        }
      }
      formData.set("content", finalContent)
      formData.set("featuredImage", nextState.featuredImage)
      formData.set("author", nextState.author.trim())
      formData.set("tags", nextState.tags)
      formData.set("isActive", String(nextState.isActive))

      const result = await saveArticle(formData)
      const refreshed = await mutate()

      const latestArticles = Array.isArray(refreshed) ? refreshed : articles
      const resolvedId =
        typeof result.id === "string"
          ? result.id
          : latestArticles.find((article) => article.slug === nextState.slug)?.id

      setEditorState(nextState)
      toast.success(nextState.id ? "Article updated" : "Article created")
      handleRouteState(resolvedId ?? nextState.id ?? null, null)
    } catch (error: any) {
      toast.error(error?.message || "Could not save article")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editorState.id) return
    if (!window.confirm("Delete this article?")) return

    setDeleting(true)

    try {
      const nextArticles = articles.filter((article) => article.id !== editorState.id)
      // Optimistically update local SWR cache
      await mutate(nextArticles, { revalidate: false })

      await deleteArticle(editorState.id)
      await mutate()
      toast.success("Article deleted")

      if (nextArticles.length > 0) {
        handleRouteState(nextArticles[0].id, null)
      } else {
        handleNewArticle()
      }
    } catch (error: any) {
      toast.error(error?.message || "Could not delete article")
    } finally {
      setDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-72 rounded-lg bg-[#ede8de]" />
        <div className="h-[640px] rounded-xl bg-[#f3f1ec]" />
      </div>
    )
  }

  const isCreateMode = composeMode === "new" || !editorState.id
  const activeStatusLabel = editorState.isActive ? "Published" : "Draft"

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-9">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <h1 className="text-[32px] font-bold tracking-[-0.03em] text-[#211e18]">
            Article Management
          </h1>
          <p className="max-w-[720px] text-sm text-[#71685a]">
            Manage drafts and published articles with a cleaner split between list,
            media, and content editing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            asChild
            className="h-[42px] rounded-lg bg-[#99782b] px-5 text-sm font-semibold text-white hover:bg-[#99782b]/90"
          >
            <a href="/admin/article/new">
              <Plus className="mr-2 h-4 w-4" />
              New article
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[386px_minmax(0,1fr)]">
        <section
          data-testid="articles-list-container"
          className="rounded-lg border border-[#e7e1d7] bg-white p-6 shadow-[0_1px_0_rgba(33,30,24,0.02)]"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#211e18]">All articles</h2>
                <p className="mt-1 text-xs text-[#8a806f]">
                  {articles.length} total, {publishedCount} published, {draftCount} draft
                </p>
              </div>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9184]" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title or slug..."
                className="h-10 rounded-lg border-[#e7e1d7] bg-[#fbfaf7] pl-10 text-sm text-[#3a352b] placeholder:text-[#9a9184] focus-visible:ring-[#99782b]/30"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                asChild
                onClick={() => setStatusFilter("published")}
                className={`h-[30px] rounded-[7px] px-4 text-xs font-semibold cursor-pointer ${
                  statusFilter === "published"
                    ? "bg-[#e9dfc8] text-[#3a2f18] hover:bg-[#e9dfc8]"
                    : "border border-[#e7e1d7] bg-white text-[#71685a] hover:bg-[#faf6ee]"
                }`}
              >
                <span>Published</span>
              </Button>
              <Button
                asChild
                onClick={() => setStatusFilter("draft")}
                className={`h-[30px] rounded-[7px] px-4 text-xs font-semibold cursor-pointer ${
                  statusFilter === "draft"
                    ? "bg-[#e9dfc8] text-[#3a2f18] hover:bg-[#e9dfc8]"
                    : "border border-[#e7e1d7] bg-white text-[#71685a] hover:bg-[#faf6ee]"
                }`}
              >
                <span>Draft</span>
              </Button>
              <Button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`h-[30px] rounded-[7px] px-4 text-xs font-semibold ${
                  statusFilter === "all"
                    ? "bg-[#e9dfc8] text-[#3a2f18] hover:bg-[#e9dfc8]"
                    : "border border-[#e7e1d7] bg-white text-[#71685a] hover:bg-[#faf6ee]"
                }`}
              >
                All
              </Button>
            </div>

            <div className="space-y-4">
              {filteredArticles.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#d8d2c8] bg-[#fbfaf7] px-5 py-10 text-center">
                  <p className="text-sm font-medium text-[#3a352b]">No articles found</p>
                  <p className="mt-1 text-xs text-[#8a806f]">
                    Adjust the quick filter or start a new article draft.
                  </p>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <tbody className="space-y-4 flex flex-col w-full">
                    {filteredArticles.map((article) => {
                      const isSelected = article.id === selectedId && composeMode !== "new"

                      return (
                        <tr
                          key={article.id}
                          onClick={() => handleSelectArticle(article)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault()
                              handleSelectArticle(article)
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          className={`block w-full rounded-lg border p-4 text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#99782b] bg-[#fbfaf7] shadow-[0_0_0_1px_#99782b]"
                              : "border-[#e7e1d7] bg-white hover:border-[#d7ccbb] hover:bg-[#fdfbf7]"
                          }`}
                        >
                          <td className="block w-full">
                            <div className="flex gap-4">
                              <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#e9dfc8] text-[11px] font-semibold text-[#6f694d]">
                                {article.featuredImage ? (
                                  <img
                                    src={article.featuredImage}
                                    alt={article.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  "No image"
                                )}
                              </div>
                              <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="line-clamp-2 text-sm font-semibold leading-5 text-[#211e18]">
                                  {article.title || "Untitled article"}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#71685a]">
                                  <span>{article.isActive ? "Published" : "Draft"}</span>
                                  <span className="text-[#c4bbad]">·</span>
                                  <span>{formatArticleDate(article.publishedAt)}</span>
                                </div>
                                <div className="line-clamp-1 text-[12px] text-[#8a806f]">
                                  {article.featuredImage ? article.slug : "Missing featured image"}
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-[#8a806f]">
                              <span>{article.author || "Editorial team"}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  data-testid="article-preview-btn"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleOpenPreview(article)
                                  }}
                                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[#71685a] transition-colors hover:bg-[#f3f1ec] hover:text-[#2d2617]"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  Preview
                                </button>
                                <Link
                                  href={`/admin/article/edit/${article.id}`}
                                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[#71685a] transition-colors hover:bg-[#f3f1ec] hover:text-[#2d2617]"
                                >
                                  <SquarePen className="h-3.5 w-3.5" />
                                  Open
                                </Link>
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    if (window.confirm("Delete this article?")) {
                                      try {
                                        const nextArticles = articles.filter((a) => a.id !== article.id)
                                        // Optimistically update local SWR cache
                                        await mutate(nextArticles, { revalidate: false })

                                        await deleteArticle(article.id)
                                        await mutate()
                                        toast.success("Article deleted")

                                        // If deleted article was selected, route to next one or new
                                        if (article.id === selectedId) {
                                          if (nextArticles.length > 0) {
                                            handleRouteState(nextArticles[0].id, null)
                                          } else {
                                            handleNewArticle()
                                          }
                                        }
                                      } catch (err: any) {
                                        toast.error(err.message || "Failed to delete article")
                                      }
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[#6e4e4e] transition-colors hover:bg-[#fff4f4]"
                                >
                                  <Trash2 className="lucide-trash2 h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#e7e1d7] bg-white p-6 shadow-[0_1px_0_rgba(33,30,24,0.02)]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#211e18]">Article details</h2>
                <p className="mt-1 text-xs text-[#8a806f]">
                  Featured image, slug, excerpt, and content stay in one editing surface.
                </p>
              </div>
              <div
                className={`inline-flex h-[30px] items-center rounded-full px-4 text-xs font-semibold ${
                  editorState.isActive
                    ? "bg-[#ecf7ed] text-[#2f6c3b]"
                    : "bg-[#f1f0ec] text-[#6f675c]"
                }`}
              >
                {activeStatusLabel}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
              <div className="space-y-3">
                <div className="flex h-[132px] w-full items-center justify-center overflow-hidden rounded-lg bg-[#e9dfc8] text-xs font-semibold uppercase tracking-[0.08em] text-[#6f694d]">
                  {editorState.featuredImage ? (
                    <img
                      src={editorState.featuredImage}
                      alt={editorState.title || "Featured article"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "Featured image"
                  )}
                </div>
                <div data-testid="article-featured-media" className="space-y-3">
                  <MediaUploader
                    label="Featured media"
                    value={editorState.featuredImage}
                    onChange={(value) => handleFieldChange("featuredImage", String(value))}
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid gap-5">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-xs font-semibold uppercase tracking-[0.08em] text-[#71685a]">
                      Title
                    </label>
                    <Input
                      id="title"
                      value={editorState.title}
                      onChange={(event) => handleFieldChange("title", event.target.value)}
                      placeholder="Article title"
                      className="h-11 border-[#e7e1d7] text-sm text-[#211e18] focus-visible:ring-[#99782b]/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="slug" className="text-xs font-semibold uppercase tracking-[0.08em] text-[#71685a]">
                      Slug
                    </label>
                    <Input
                      id="slug"
                      value={editorState.slug}
                      onChange={(event) => {
                        setSlugTouched(true)
                        handleFieldChange("slug", slugify(event.target.value))
                      }}
                      placeholder="article-slug"
                      className="h-11 border-[#e7e1d7] text-sm text-[#211e18] focus-visible:ring-[#99782b]/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="excerpt" className="text-xs font-semibold uppercase tracking-[0.08em] text-[#71685a]">
                      Excerpt
                    </label>
                    <Textarea
                      id="excerpt"
                      value={editorState.excerpt}
                      onChange={(event) => handleFieldChange("excerpt", event.target.value)}
                      placeholder="Short summary for list and preview contexts."
                      className="min-h-[92px] resize-none border-[#e7e1d7] text-sm text-[#211e18] focus-visible:ring-[#99782b]/30"
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-[#e7e1d7] bg-[#fbfaf7]">
                  <div className="flex items-center justify-between rounded-t-lg border-b border-[#e7e1d7] bg-[#fbfaf7] px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        data-testid="editor-mode-visual"
                        onClick={() => setEditorMode("visual")}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                          editorMode === "visual"
                            ? "bg-[#e9dfc8] text-[#3a2f18]"
                            : "hover:bg-[#e9dfc8]/30 text-[#71685a]"
                        }`}
                      >
                        Visual (Trực quan)
                      </button>
                      <button
                        type="button"
                        data-testid="editor-mode-markdown"
                        onClick={() => setEditorMode("markdown")}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                          editorMode === "markdown"
                            ? "bg-[#e9dfc8] text-[#3a2f18]"
                            : "hover:bg-[#e9dfc8]/30 text-[#71685a]"
                        }`}
                      >
                        Markdown (Mã nguồn)
                      </button>
                    </div>
                    {editorMode === "visual" && editor && (
                      <div className="flex items-center gap-1.5 text-[#71685a]">
                        <button
                          type="button"
                          onClick={() => editor.chain().focus().toggleBold().run()}
                          className={`p-1 rounded hover:bg-[#e9dfc8]/30 ${editor.isActive("bold") ? "bg-[#e9dfc8]/50" : ""}`}
                          title="Bold"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => editor.chain().focus().toggleItalic().run()}
                          className={`p-1 rounded hover:bg-[#e9dfc8]/30 ${editor.isActive("italic") ? "bg-[#e9dfc8]/50" : ""}`}
                          title="Italic"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                          className={`p-1 rounded hover:bg-[#e9dfc8]/30 ${editor.isActive("heading", { level: 1 }) ? "bg-[#e9dfc8]/50" : ""}`}
                          title="Heading 1"
                        >
                          <Heading1 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                          className={`p-1 rounded hover:bg-[#e9dfc8]/30 ${editor.isActive("heading", { level: 2 }) ? "bg-[#e9dfc8]/50" : ""}`}
                          title="Heading 2"
                        >
                          <Heading2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => editor.chain().focus().toggleBulletList().run()}
                          className={`p-1 rounded hover:bg-[#e9dfc8]/30 ${editor.isActive("bulletList") ? "bg-[#e9dfc8]/50" : ""}`}
                          title="Bullet List"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => editor.chain().focus().toggleOrderedList().run()}
                          className={`p-1 rounded hover:bg-[#e9dfc8]/30 ${editor.isActive("orderedList") ? "bg-[#e9dfc8]/50" : ""}`}
                          title="Ordered List"
                        >
                          <ListOrdered className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {editorMode === "visual" ? (
                    <div className="bg-white rounded-b-lg border-0 min-h-[180px]">
                      <EditorContent editor={editor} />
                    </div>
                  ) : (
                    <Textarea
                      id="content"
                      data-testid="article-content-editor"
                      value={editorState.content}
                      onChange={(event) => handleFieldChange("content", event.target.value)}
                      onPaste={handleMarkdownPaste}
                      placeholder="Nhập nội dung Markdown ở đây..."
                      className="min-h-[180px] rounded-t-none border-0 bg-white px-5 py-4 text-sm leading-6 text-[#3a352b] focus-visible:ring-0"
                    />
                  )}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="author" className="text-xs font-semibold uppercase tracking-[0.08em] text-[#71685a]">
                      Author
                    </label>
                    <Input
                      id="author"
                      value={editorState.author}
                      onChange={(event) => handleFieldChange("author", event.target.value)}
                      placeholder="Author name"
                      className="h-11 border-[#e7e1d7] text-sm text-[#211e18] focus-visible:ring-[#99782b]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="tags" className="text-xs font-semibold uppercase tracking-[0.08em] text-[#71685a]">
                      Tags
                    </label>
                    <Input
                      id="tags"
                      value={editorState.tags}
                      onChange={(event) => handleFieldChange("tags", event.target.value)}
                      placeholder="touring, setup, maintenance"
                      className="h-11 border-[#e7e1d7] text-sm text-[#211e18] focus-visible:ring-[#99782b]/30"
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-[#e7e1d7] bg-[#fbfaf7] px-4 py-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#71685a]">
                        Publish status
                      </div>
                      <div className="text-sm text-[#3a352b]">
                        {editorState.isActive
                          ? `Visible on storefront since ${formatEditorTimestamp(selectedArticle?.publishedAt ?? null)}`
                          : "Draft remains hidden until you publish changes."}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFieldChange("isActive", !editorState.isActive)}
                      className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition-colors ${
                        editorState.isActive
                          ? "border-[#cfe5d3] bg-[#ecf7ed] text-[#2f6c3b]"
                          : "border-[#e2ddd3] bg-white text-[#6f675c]"
                      }`}
                    >
                      {editorState.isActive ? "Published" : "Draft"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-[#eee7db] pt-5 sm:flex-row sm:items-center sm:justify-end">
                  {editorState.id ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDelete}
                      disabled={deleting || saving}
                      className="h-10 rounded-lg border-[#e2ddd3] bg-white px-4 text-sm font-semibold text-[#6e4e4e] hover:bg-[#fff4f4]"
                    >
                      <Trash2 className="lucide-trash2 mr-2 h-4 w-4" />
                      {deleting ? "Deleting..." : "Delete"}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    data-testid="article-preview-btn"
                    onClick={() => {
                      const finalContent = (editorMode === "visual" && editor) ? editor.getHTML() : editorState.content
                      handleOpenPreview({ ...editorState, content: finalContent })
                    }}
                    disabled={saving || deleting}
                    className="h-10 rounded-lg border-[#e2ddd3] bg-white px-4 text-sm font-semibold text-[#50483d] hover:bg-[#f6f1e8]"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetEditor}
                    disabled={saving || deleting}
                    className="h-10 rounded-lg border-[#e2ddd3] bg-white px-4 text-sm font-semibold text-[#50483d] hover:bg-[#f6f1e8]"
                  >
                    Cancel
                  </Button>
                   <Button
                    asChild
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={saving || deleting}
                    className="h-10 rounded-lg border-[#e2ddd3] bg-white px-4 text-sm font-semibold text-[#50483d] hover:bg-[#f6f1e8] cursor-pointer"
                  >
                    <span role="button">Save draft</span>
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleSave}
                    disabled={saving || deleting}
                    className="h-10 rounded-lg bg-[#99782b] px-5 text-sm font-semibold text-white hover:bg-[#99782b]/90"
                  >
                    {saving ? (
                      "Saving..."
                    ) : (
                      <>
                        {isCreateMode ? <Plus className="mr-2 h-4 w-4" /> : <SquarePen className="mr-2 h-4 w-4" />}
                        {editorState.isActive ? "Publish changes" : "Save article"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-[#e7e1d7] bg-[#fbfaf7] px-4 py-3 text-xs text-[#787774]">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#99782b]" />
                <span>{isCreateMode ? "New draft ready for content entry" : editorState.slug || "Slug pending"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#99782b]" />
                <span>{selectedArticle ? formatEditorTimestamp(selectedArticle.publishedAt) : "No publish timestamp yet"}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent data-testid="article-preview-modal" className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-[#e7e1d7] rounded-xl shadow-lg p-0">
          <div className="sticky top-0 bg-[#fbfaf7] border-b border-[#e7e1d7] px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#71685a]">Storefront Live Preview</span>
            </div>
            <button
              type="button"
              data-testid="close-preview-btn"
              onClick={() => setIsPreviewOpen(false)}
              className="p-1.5 rounded-lg hover:bg-[#e9dfc8]/30 text-[#71685a] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {previewData && (
            <div className="p-8 md:p-12 space-y-8 bg-white">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#99782b] font-semibold">
                  <span className="uppercase tracking-wider">Editorial</span>
                  <span>·</span>
                  <span>{previewData.author || "Editorial team"}</span>
                </div>
                <h1 data-testid="preview-title" className="text-3xl md:text-5xl font-bold tracking-tight text-[#211e18] leading-tight">
                  {previewData.title || "Untitled Article"}
                </h1>
              </div>

              {previewData.featuredImage && (
                <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden aspect-[21/9] bg-[#e9dfc8]">
                  <img
                    src={previewData.featuredImage}
                    alt={previewData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="max-w-3xl mx-auto">
                <div className="prose prose-lg prose-neutral max-w-none leading-relaxed text-[#3a352b]">
                  {previewData.content.trim().startsWith("<") ? (
                    <div dangerouslySetInnerHTML={{ __html: previewData.content }} />
                  ) : (
                    <ReactMarkdown>{previewData.content}</ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
