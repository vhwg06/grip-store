'use client'

import { useMemo, useRef, useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { saveBanner, deleteBanner } from "@/adapters/api/admin.api"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { AdminBanner } from "@/domain/admin"
import { useAdminBanners } from "@/application/hooks/useAdmin"

export function AdminBannersContent() {
  const { t } = useI18n()
  const { data: banners = [], mutate, isLoading } = useAdminBanners()
  
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [image, setImage] = useState("")
  const [mobileImage, setMobileImage] = useState("")
  const [ctaText, setCtaText] = useState("")
  const [ctaLink, setCtaLink] = useState("")
  const [sortOrder, setSortOrder] = useState("0")
  const [isActive, setIsActive] = useState(true)
  
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const deleteLock = useRef<number | null>(null)

  const sorted = useMemo(() => {
    return [...banners].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  }, [banners])

  const handleCreate = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.set('title', title)
      formData.set('subtitle', subtitle)
      formData.set('image', image)
      formData.set('mobileImage', mobileImage)
      formData.set('ctaText', ctaText)
      formData.set('ctaLink', ctaLink)
      formData.set('sortOrder', sortOrder)
      formData.set('isActive', String(isActive))
      
      await saveBanner(formData)
      toast.success(t('common.success'))
      
      setTitle("")
      setSubtitle("")
      setImage("")
      setMobileImage("")
      setCtaText("")
      setCtaLink("")
      setSortOrder("0")
      setIsActive(true)
      
      mutate()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (row: AdminBanner, next: Partial<AdminBanner>) => {
    try {
      const formData = new FormData()
      formData.set('id', String(row.id))
      formData.set('title', next.title !== undefined ? String(next.title) : String(row.title ?? ''))
      formData.set('subtitle', next.subtitle !== undefined ? String(next.subtitle) : String(row.subtitle ?? ''))
      formData.set('image', next.image ?? row.image)
      formData.set('mobileImage', next.mobileImage !== undefined ? String(next.mobileImage) : String(row.mobileImage ?? ''))
      formData.set('ctaText', next.ctaText !== undefined ? String(next.ctaText) : String(row.ctaText ?? ''))
      formData.set('ctaLink', next.ctaLink !== undefined ? String(next.ctaLink) : String(row.ctaLink ?? ''))
      formData.set('sortOrder', String(next.sortOrder ?? row.sortOrder ?? 0))
      formData.set('isActive', String(next.isActive !== undefined ? next.isActive : row.isActive))
      
      await saveBanner(formData)
      toast.success(t('common.success'))
      mutate()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight">Quản lý Banner</h1>

      <Card>
        <CardHeader>
          <CardTitle>Thêm Banner mới</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="floating-field">
            <Input id="banner-image" value={image} onChange={(e) => setImage(e.target.value)} placeholder=" " />
            <Label htmlFor="banner-image" className="floating-label">Ảnh Banner (URL)</Label>
          </div>
          <div className="floating-field">
            <Input id="banner-mobile-image" value={mobileImage} onChange={(e) => setMobileImage(e.target.value)} placeholder=" " />
            <Label htmlFor="banner-mobile-image" className="floating-label">Ảnh Mobile (Tùy chọn URL)</Label>
          </div>
          <div className="floating-field">
            <Input id="banner-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder=" " />
            <Label htmlFor="banner-title" className="floating-label">Tiêu đề lớn</Label>
          </div>
          <div className="floating-field">
            <Input id="banner-subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder=" " />
            <Label htmlFor="banner-subtitle" className="floating-label">Tiêu đề nhỏ / Phụ đề</Label>
          </div>
          <div className="floating-field">
            <Input id="banner-cta" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder=" " />
            <Label htmlFor="banner-cta" className="floating-label">Chữ nút (VD: Xem ngay)</Label>
          </div>
          <div className="floating-field">
            <Input id="banner-link" value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} placeholder=" " />
            <Label htmlFor="banner-link" className="floating-label">Link đích</Label>
          </div>
          <div className="floating-field">
            <Input id="banner-sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} placeholder=" " />
            <Label htmlFor="banner-sort" className="floating-label">Thứ tự hiển thị</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="banner-active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked as boolean)}
            />
            <Label htmlFor="banner-active" className="cursor-pointer">Hiển thị (Active)</Label>
          </div>
          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <Button onClick={handleCreate} disabled={saving || !image.trim()}>
              {saving ? t('common.processing') : t('common.add')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hình ảnh</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Nút bấm</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thứ tự</TableHead>
              <TableHead className="text-right">{t('admin.categories.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="w-[120px]">
                    {b.image ? (
                        <div className="w-20 h-10 bg-neutral-100 rounded overflow-hidden">
                            <img src={b.image} alt={b.title || 'banner'} className="object-cover w-full h-full" />
                        </div>
                    ) : '-'}
                </TableCell>
                <TableCell>
                  <Input
                    defaultValue={b.title || ''}
                    onBlur={(e) => {
                      const v = e.target.value.trim()
                      if (b.title !== v) handleUpdate(b, { title: v })
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    defaultValue={b.ctaText || ''}
                    onBlur={(e) => {
                      const v = e.target.value.trim()
                      if (b.ctaText !== v) handleUpdate(b, { ctaText: v })
                    }}
                  />
                </TableCell>
                <TableCell>
                    <Checkbox
                        checked={b.isActive}
                        onCheckedChange={(checked) => handleUpdate(b, { isActive: checked as boolean })}
                    />
                </TableCell>
                <TableCell className="w-[100px]">
                  <Input
                    type="number"
                    defaultValue={String(b.sortOrder ?? 0)}
                    onBlur={(e) => {
                      const v = Number.parseInt(e.target.value, 10) || 0
                      if ((b.sortOrder ?? 0) !== v) handleUpdate(b, { sortOrder: v })
                    }}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      if (deleteLock.current === b.id) return
                      if (!confirm(t('common.confirm') + '?')) return
                      deleteLock.current = b.id
                      setDeletingId(b.id)
                      try {
                        await deleteBanner(b.id)
                        toast.success(t('common.success'))
                        mutate()
                      } catch (e: any) {
                        toast.error(e.message)
                      } finally {
                        setDeletingId(null)
                        deleteLock.current = null
                      }
                    }}
                    disabled={deletingId === b.id}
                  >
                    {t('common.delete')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Chưa có banner nào</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
