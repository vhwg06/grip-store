'use client'

import { useMemo, useRef, useState } from "react"
import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { saveFAQ, deleteFAQ } from "@/adapters/api/admin.api"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { AdminFAQ } from "@/domain/admin"
import { useAdminFAQs } from "@/application/hooks/useAdmin"

export function AdminFAQsContent() {
  const { t } = useI18n()
  const { data: faqs = [], mutate, isLoading } = useAdminFAQs()
  
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [sortOrder, setSortOrder] = useState("0")
  const [isActive, setIsActive] = useState(true)
  
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const deleteLock = useRef<number | null>(null)

  const sorted = useMemo(() => {
    return [...faqs].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  }, [faqs])

  const handleCreate = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.set('question', question)
      formData.set('answer', answer)
      formData.set('sortOrder', sortOrder)
      formData.set('isActive', String(isActive))
      
      await saveFAQ(formData)
      toast.success(t('common.success'))
      
      setQuestion("")
      setAnswer("")
      setSortOrder("0")
      setIsActive(true)
      
      mutate()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (row: AdminFAQ, next: Partial<AdminFAQ>) => {
    try {
      const formData = new FormData()
      formData.set('id', String(row.id))
      formData.set('question', next.question ?? row.question)
      formData.set('answer', next.answer ?? row.answer)
      formData.set('sortOrder', String(next.sortOrder ?? row.sortOrder ?? 0))
      formData.set('isActive', String(next.isActive !== undefined ? next.isActive : row.isActive))
      
      await saveFAQ(formData)
      toast.success(t('common.success'))
      mutate()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight">Quản lý Câu hỏi thường gặp (FAQ)</h1>

      <Card>
        <CardHeader>
          <CardTitle>Thêm câu hỏi mới</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          <div className="grid gap-2 lg:col-span-2">
            <Label htmlFor="faq-question">Câu hỏi</Label>
            <Input id="faq-question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Nhập câu hỏi..." />
          </div>
          <div className="grid gap-2 lg:col-span-2">
            <Label htmlFor="faq-answer">Câu trả lời (Hỗ trợ Markdown)</Label>
            <Textarea 
                id="faq-answer" 
                value={answer} 
                onChange={(e) => setAnswer(e.target.value)} 
                placeholder="Nhập nội dung trả lời..." 
                className="min-h-[100px]"
            />
          </div>
          <div className="floating-field">
            <Input id="faq-sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} placeholder=" " />
            <Label htmlFor="faq-sort" className="floating-label">Thứ tự hiển thị</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="faq-active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked as boolean)}
            />
            <Label htmlFor="faq-active" className="cursor-pointer">Hiển thị (Active)</Label>
          </div>
          <div className="md:col-span-1 lg:col-span-2 flex justify-end">
            <Button onClick={handleCreate} disabled={saving || !question.trim() || !answer.trim()}>
              {saving ? t('common.processing') : t('common.add')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Câu hỏi</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thứ tự</TableHead>
              <TableHead className="text-right">{t('admin.categories.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((f) => (
              <TableRow key={f.id}>
                <TableCell>
                  <Input
                    defaultValue={f.question}
                    onBlur={(e) => {
                      const v = e.target.value.trim()
                      if (v && f.question !== v) handleUpdate(f, { question: v })
                    }}
                  />
                </TableCell>
                <TableCell>
                    <Checkbox
                        checked={f.isActive}
                        onCheckedChange={(checked) => handleUpdate(f, { isActive: checked as boolean })}
                    />
                </TableCell>
                <TableCell className="w-[100px]">
                  <Input
                    type="number"
                    defaultValue={String(f.sortOrder ?? 0)}
                    onBlur={(e) => {
                      const v = Number.parseInt(e.target.value, 10) || 0
                      if ((f.sortOrder ?? 0) !== v) handleUpdate(f, { sortOrder: v })
                    }}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      if (deleteLock.current === f.id) return
                      if (!confirm(t('common.confirm') + '?')) return
                      deleteLock.current = f.id
                      setDeletingId(f.id)
                      try {
                        await deleteFAQ(f.id)
                        toast.success(t('common.success'))
                        mutate()
                      } catch (e: any) {
                        toast.error(e.message)
                      } finally {
                        setDeletingId(null)
                        deleteLock.current = null
                      }
                    }}
                    disabled={deletingId === f.id}
                  >
                    {t('common.delete')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Chưa có câu hỏi nào</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
