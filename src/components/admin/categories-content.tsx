'use client'

import { useMemo, useRef, useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { saveCategory, deleteCategory } from "@/adapters/api/admin.api"
import { toast } from "sonner"

type CategoryRow = { id: number; name: string; icon: string | null; sortOrder: number; parentId?: number | null; slug?: string }

function slugify(str: string) {
  return String(str)
    .normalize('NFKD') // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove all the accents
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-'); // remove consecutive hyphens
}

export function AdminCategoriesContent({ categories }: { categories: CategoryRow[] }) {
  const { t } = useI18n()
  const [name, setName] = useState("")
  const [icon, setIcon] = useState("")
  const [sortOrder, setSortOrder] = useState("0")
  const [slug, setSlug] = useState("")
  const [parentId, setParentId] = useState<string>("0")
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const deleteLock = useRef<number | null>(null)

  // Auto-generate slug when name changes, if slug is untouched or matches previous name
  useEffect(() => {
    if (name && !slug) {
      setSlug(slugify(name))
    }
  }, [name, slug])

  const sorted = useMemo(() => {
    return [...categories].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.name.localeCompare(b.name))
  }, [categories])

  const handleCreate = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.set('name', name)
      formData.set('icon', icon)
      formData.set('sortOrder', sortOrder)
      if (slug) formData.set('slug', slug)
      if (parentId && parentId !== "0") formData.set('parentId', parentId)

      await saveCategory(formData)
      toast.success(t('common.success'))
      setName("")
      setIcon("")
      setSortOrder("0")
      setSlug("")
      setParentId("0")
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (row: CategoryRow, next: Partial<CategoryRow>) => {
    try {
      const formData = new FormData()
      formData.set('id', String(row.id))
      formData.set('name', next.name ?? row.name)
      formData.set('icon', next.icon ?? row.icon ?? '')
      formData.set('sortOrder', String(next.sortOrder ?? row.sortOrder ?? 0))
      
      const newSlug = next.slug !== undefined ? next.slug : row.slug
      if (newSlug) formData.set('slug', newSlug)
      
      const newParentId = next.parentId !== undefined ? next.parentId : row.parentId
      if (newParentId) formData.set('parentId', String(newParentId))

      await saveCategory(formData)
      toast.success(t('common.success'))
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight">{t('admin.categories.title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.categories.create')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-5">
          <div className="floating-field">
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder=" " />
            <Label htmlFor="cat-name" className="floating-label">{t('admin.categories.name')}</Label>
          </div>
          <div className="floating-field">
            <Input id="cat-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder=" " />
            <Label htmlFor="cat-slug" className="floating-label">Đường dẫn (Slug)</Label>
          </div>
          <div className="floating-field">
            <select
              id="cat-parent"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full h-10 px-3 py-2 border rounded-md"
            >
              <option value="0">Không có (Danh mục gốc)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="floating-field">
            <Input id="cat-icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder=" " />
            <Label htmlFor="cat-icon" className="floating-label">{t('admin.categories.icon')}</Label>
          </div>
          <div className="floating-field">
            <Input id="cat-sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} placeholder=" " />
            <Label htmlFor="cat-sort" className="floating-label">{t('admin.categories.sortOrder')}</Label>
          </div>
          <div className="md:col-span-5 flex justify-end">
            <Button onClick={handleCreate} disabled={saving || !name.trim()}>
              {saving ? t('common.processing') : t('common.add')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.categories.icon')}</TableHead>
              <TableHead>{t('admin.categories.name')}</TableHead>
              <TableHead>Đường dẫn (Slug)</TableHead>
              <TableHead>Danh mục cha</TableHead>
              <TableHead>{t('admin.categories.sortOrder')}</TableHead>
              <TableHead className="text-right">{t('admin.categories.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="w-[80px]">
                  <Input
                    defaultValue={c.icon || ''}
                    onBlur={(e) => {
                      const v = e.target.value.trim()
                      if ((c.icon || '') !== v) handleUpdate(c, { icon: v || null })
                    }}
                    placeholder="🙂"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    defaultValue={c.name}
                    onBlur={(e) => {
                      const v = e.target.value.trim()
                      if (v && c.name !== v) handleUpdate(c, { name: v })
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    defaultValue={c.slug || ''}
                    onBlur={(e) => {
                      const v = e.target.value.trim()
                      if (c.slug !== v) handleUpdate(c, { slug: v || undefined })
                    }}
                    placeholder="auto-slug"
                  />
                </TableCell>
                <TableCell>
                  <select
                    defaultValue={c.parentId || 0}
                    onChange={(e) => {
                      const v = Number(e.target.value) || null
                      if (c.parentId !== v) handleUpdate(c, { parentId: v })
                    }}
                    className="w-full h-9 px-3 border rounded-md"
                  >
                    <option value={0}>Không có</option>
                    {categories.filter(parent => parent.id !== c.id).map((parent) => (
                      <option key={parent.id} value={parent.id}>{parent.name}</option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className="w-[120px]">
                  <Input
                    type="number"
                    defaultValue={String(c.sortOrder ?? 0)}
                    onBlur={(e) => {
                      const v = Number.parseInt(e.target.value, 10) || 0
                      if ((c.sortOrder ?? 0) !== v) handleUpdate(c, { sortOrder: v })
                    }}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      if (deleteLock.current === c.id) return
                      if (!confirm(t('common.confirm') + '?')) return
                      deleteLock.current = c.id
                      setDeletingId(c.id)
                      try {
                        await deleteCategory(c.id)
                        toast.success(t('common.success'))
                      } catch (e: any) {
                        toast.error(e.message)
                      } finally {
                        setDeletingId(null)
                        deleteLock.current = null
                      }
                    }}
                    disabled={deletingId === c.id}
                  >
                    {t('common.delete')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
