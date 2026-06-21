'use client'

import { useMemo, useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { saveFAQ, deleteFAQ } from "@/adapters/api/admin.api"
import { toast } from "sonner"
import { AdminFAQ } from "@/domain/admin"
import { useAdminFAQs } from "@/application/hooks/useAdmin"
import { Star, ShieldCheck, AlertTriangle, HelpCircle, Info, Plus, Trash2, Edit2, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function AdminFAQsContent() {
  const { t } = useI18n()
  const { data: faqs = [], mutate, isLoading } = useAdminFAQs()

  const [selectedFaq, setSelectedFaq] = useState<AdminFAQ | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "DRAFT">("ALL")

  // Form states
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [sortOrder, setSortOrder] = useState("0")
  const [isActive, setIsActive] = useState(true)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Populate form when selectedFaq changes
  useEffect(() => {
    if (selectedFaq) {
      setQuestion(selectedFaq.question)
      setAnswer(selectedFaq.answer)
      setSortOrder(String(selectedFaq.sortOrder ?? 0))
      setIsActive(selectedFaq.isActive)
    } else {
      setQuestion("")
      setAnswer("")
      setSortOrder("0")
      setIsActive(true)
    }
  }, [selectedFaq])

  // Filter and sort FAQs
  const filteredFAQs = useMemo(() => {
    return faqs
      .filter((f: any) => {
        // Tab filter
        if (activeTab === "ACTIVE" && !f.isActive) return false
        if (activeTab === "DRAFT" && f.isActive) return false

        // Search filter
        const q = searchQuery.toLowerCase()
        if (!q) return true
        return (
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q)
        )
      })
      .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
  }, [faqs, searchQuery, activeTab])

  // Handle Save (Create or Update)
  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      toast.error("Question and answer are required")
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      if (selectedFaq) {
        formData.set('id', String(selectedFaq.id))
      }
      formData.set('question', question.trim())
      formData.set('answer', answer.trim())
      formData.set('sortOrder', sortOrder)
      formData.set('isActive', String(isActive))

      const res = await saveFAQ(formData)
      if (res.success) {
        toast.success(t('common.success'))
        if (!selectedFaq && res.id) {
          // If created, select it
          const newFaq: AdminFAQ = {
            id: Number(res.id),
            question: question.trim(),
            answer: answer.trim(),
            sortOrder: Number(sortOrder),
            isActive: isActive
          }
          setSelectedFaq(newFaq)
        } else if (selectedFaq) {
          setSelectedFaq({
            ...selectedFaq,
            question: question.trim(),
            answer: answer.trim(),
            sortOrder: Number(sortOrder),
            isActive: isActive
          })
        }
        mutate()
      } else {
        toast.error(res.error || "Failed to save FAQ")
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to save FAQ")
    } finally {
      setSaving(false)
    }
  }

  // Handle Delete
  const handleDelete = async () => {
    if (!selectedFaq) return
    if (!confirm("Are you sure you want to delete this FAQ?")) return

    setDeleting(true)
    try {
      const res = await deleteFAQ(selectedFaq.id)
      if (res.success) {
        toast.success(t('common.success'))
        setSelectedFaq(null)
        mutate()
      } else {
        toast.error(res.error || "Failed to delete FAQ")
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to delete FAQ")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="w-[1056px] space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-[#787774] mb-1 font-medium mt-[26px]">
          <span>Admin</span>
          <span>/</span>
          <span>CMS</span>
          <span>/</span>
          <span className="text-foreground font-medium">FAQ</span>
        </div>
        <h1 className="text-[32px] font-bold tracking-tight text-[#211e18] font-svn-gilroy mt-[57px] leading-none">
          FAQ Management
        </h1>
        <p className="text-sm text-[#71685a] mt-[12px]">
          Manage frequently asked questions, update answers, reorder presentation sequence, and set visibility rules.
        </p>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-[36px]">
        {/* Left List Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3.5">
              <span className="text-sm font-bold text-foreground">FAQ Items</span>
              <Button
                size="sm"
                onClick={() => setSelectedFaq(null)}
                className="bg-[#99782b] hover:bg-[#99782b]/90 text-white text-xs font-semibold h-8 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Create FAQ
              </Button>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search FAQ by question or answer..."
                  className="pl-9 bg-white border-[#e7e1d7] rounded-lg text-sm"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1 bg-[#f3f1ec] p-1 rounded-lg border border-[#e7e1d7] w-fit">
                <button
                  onClick={() => setActiveTab("ALL")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    activeTab === "ALL"
                      ? "bg-white text-[#2d2617] shadow-sm"
                      : "text-[#71685a] hover:text-[#2d2617]"
                  }`}
                >
                  All ({faqs.length})
                </button>
                <button
                  onClick={() => setActiveTab("ACTIVE")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    activeTab === "ACTIVE"
                      ? "bg-white text-[#2d2617] shadow-sm"
                      : "text-[#71685a] hover:text-[#2d2617]"
                  }`}
                >
                  Active ({faqs.filter((f: any) => f.isActive).length})
                </button>
                <button
                  onClick={() => setActiveTab("DRAFT")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    activeTab === "DRAFT"
                      ? "bg-white text-[#2d2617] shadow-sm"
                      : "text-[#71685a] hover:text-[#2d2617]"
                  }`}
                >
                  Draft ({faqs.filter((f: any) => !f.isActive).length})
                </button>
              </div>
            </div>

            {/* List */}
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading FAQs...</div>
            ) : filteredFAQs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground italic">No FAQs found</div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto pr-1">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {filteredFAQs.map((f: any) => {
                      const isSelected = selectedFaq?.id === f.id
                      return (
                        <tr
                          key={f.id}
                          onClick={() => setSelectedFaq(f)}
                          className={`group border-b last:border-b-0 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary/5"
                              : "hover:bg-muted/40"
                          }`}
                        >
                          <td className="p-3.5 flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-sm text-foreground line-clamp-1">{f.question}</span>
                                <span className="text-[10px] font-mono text-muted-foreground shrink-0">Order: {f.sortOrder}</span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 italic">
                                "{f.answer}"
                              </p>
                              <div className="flex items-center gap-1.5 pt-1">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] px-1.5 py-0 font-medium ${
                                    f.isActive
                                      ? "bg-green-500/10 text-green-600 border-none"
                                      : "bg-neutral-500/10 text-neutral-600 border-none"
                                  }`}
                                >
                                  {f.isActive ? "Active" : "Draft"}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={async (e) => {
                                  e.stopPropagation();
                                  setSelectedFaq(f);
                                  setTimeout(handleDelete, 0);
                              }}
                              className="text-xs font-semibold text-[#a33b2b] hover:bg-[#fff1f0] hover:text-[#a33b2b] h-8 px-2 shrink-0"
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Detail/Edit Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b pb-3.5 bg-muted/10">
              <CardTitle className="text-base font-bold font-svn-gilroy">
                {selectedFaq ? "Edit FAQ Details" : "New FAQ Entry"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Question */}
              <div className="grid gap-1.5">
                <Label htmlFor="faq-question" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Question
                </Label>
                <Input
                  id="faq-question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter the question..."
                  className="bg-white border-[#e7e1d7] rounded-lg"
                />
              </div>

              {/* Answer */}
              <div className="grid gap-1.5">
                <Label htmlFor="faq-answer" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Answer (Markdown Supported)
                </Label>
                <Textarea
                  id="faq-answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter the detailed answer..."
                  className="min-h-[120px] bg-white border-[#e7e1d7] rounded-lg leading-relaxed text-sm"
                />
              </div>

              {/* Order and Active status */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="grid gap-1.5">
                  <Label htmlFor="faq-sort" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Display Order
                  </Label>
                  <Input
                    id="faq-sort"
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-white border-[#e7e1d7] rounded-lg"
                  />
                </div>
                <div className="flex flex-col gap-1.5 justify-end pb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="faq-active"
                      checked={isActive}
                      onCheckedChange={(checked) => setIsActive(checked as boolean)}
                    />
                    <Label htmlFor="faq-active" className="text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer">
                      Is Active
                    </Label>
                  </div>
                </div>
              </div>

              {/* Public Reflection Note */}
              <div className="bg-amber-50/60 dark:bg-amber-950/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-400 flex items-start gap-2 mt-4">
                <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Public Reflection:</span> Active FAQs are sorted by Display Order and published instantly to the customer Help Center. Draft FAQs are invisible.
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2 border-t">
                <Button
                  onClick={handleSave}
                  disabled={saving || !question.trim() || !answer.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-[#99782b] hover:bg-[#99782b]/90 text-white"
                >
                  {saving ? "Saving..." : selectedFaq ? "Save Changes" : "Add / Create FAQ"}
                </Button>

                {selectedFaq && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4 shrink-0" />
                      Delete Entry
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedFaq(null)}
                      className="w-full border-border/60"
                    >
                      Cancel / Create New
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
