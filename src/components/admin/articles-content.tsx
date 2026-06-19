"use client"

import { deleteArticle, saveArticle } from "@/adapters/api/admin.api"
import { useAdminArticles } from "@/application/hooks/useAdmin"
import MediaUploader from "@/components/admin/media-uploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { AdminArticle } from "@/domain/admin"
import { CalendarDays, FileText, Plus, Search, SquarePen, Trash2 } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

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

  const composeMode = searchParams.get("compose")
  const selectedId = searchParams.get("articleId")
  const deferredQuery = useDeferredValue(query)

  const selectedArticle = useMemo(
    () => articles.find((article) => article.id === selectedId) ?? null,
    [articles, selectedId],
  )

  useEffect(() => {
    const next = toEditorState(composeMode === "new" ? null : selectedArticle)
    setEditorState(next)
    setSlugTouched(Boolean(next.id) || next.slug.length > 0)
  }, [composeMode, selectedArticle])

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
      formData.set("content", nextState.content)
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
      await deleteArticle(editorState.id)
      await mutate()
      toast.success("Article deleted")

      const nextArticles = articles.filter((article) => article.id !== editorState.id)
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
            <Link href="/admin/article/new">
              <Plus className="mr-2 h-4 w-4" />
              New article
            </Link>
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
                type="button"
                onClick={() => setStatusFilter("published")}
                className={`h-[30px] rounded-[7px] px-4 text-xs font-semibold ${
                  statusFilter === "published"
                    ? "bg-[#e9dfc8] text-[#3a2f18] hover:bg-[#e9dfc8]"
                    : "border border-[#e7e1d7] bg-white text-[#71685a] hover:bg-[#faf6ee]"
                }`}
              >
                Published
              </Button>
              <Button
                type="button"
                onClick={() => setStatusFilter("draft")}
                className={`h-[30px] rounded-[7px] px-4 text-xs font-semibold ${
                  statusFilter === "draft"
                    ? "bg-[#e9dfc8] text-[#3a2f18] hover:bg-[#e9dfc8]"
                    : "border border-[#e7e1d7] bg-white text-[#71685a] hover:bg-[#faf6ee]"
                }`}
              >
                Draft
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
                filteredArticles.map((article) => {
                  const isSelected = article.id === selectedId && composeMode !== "new"

                  return (
                    <div
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
                      className={`block w-full rounded-lg border p-4 text-left transition-all ${
                        isSelected
                          ? "border-[#99782b] bg-[#fbfaf7] shadow-[0_0_0_1px_#99782b]"
                          : "border-[#e7e1d7] bg-white hover:border-[#d7ccbb] hover:bg-[#fdfbf7]"
                      }`}
                    >
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
                        <Link
                          href={`/admin/article/edit/${article.id}`}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[#71685a] transition-colors hover:bg-[#f3f1ec] hover:text-[#2d2617]"
                        >
                          <SquarePen className="h-3.5 w-3.5" />
                          Open
                        </Link>
                      </div>
                    </div>
                  )
                })
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
                  <div className="flex flex-wrap items-center gap-3 rounded-t-lg border-b border-[#e7e1d7] px-5 py-3 text-xs font-semibold text-[#4c4437]">
                    <span>Formatting</span>
                    <span>Heading</span>
                    <span>List</span>
                    <span>Link</span>
                    <span>Media</span>
                    <span>Quote</span>
                  </div>
                  <Textarea
                    id="content"
                    data-testid="article-content-editor"
                    value={editorState.content}
                    onChange={(event) => handleFieldChange("content", event.target.value)}
                    placeholder="<h2>Choose by riding posture</h2>"
                    className="min-h-[180px] rounded-t-none border-0 bg-white px-5 py-4 text-sm leading-6 text-[#3a352b] focus-visible:ring-0"
                  />
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
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deleting ? "Deleting..." : "Delete"}
                    </Button>
                  ) : null}
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
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={saving || deleting}
                    className="h-10 rounded-lg border-[#e2ddd3] bg-white px-4 text-sm font-semibold text-[#50483d] hover:bg-[#f6f1e8]"
                  >
                    Save draft
                  </Button>
                  <Button
                    type="button"
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
    </div>
  )
}
