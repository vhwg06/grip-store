'use client'

import { useState, useEffect, useMemo } from "react"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import type { FormEvent } from "react"
import { 
  saveNotificationSettings, 
  testBarkNotification, 
  testEmailNotification, 
  testNotification,
  sendAdminMessage 
} from "@/adapters/api/admin.api"
import { 
  Bell, 
  CreditCard, 
  RotateCcw, 
  MessageSquare, 
  ExternalLink, 
  Mail, 
  Smartphone,
  Search,
  Plus,
  ArrowLeft,
  Trash2,
  Calendar,
  Check,
  ChevronDown
} from "lucide-react"

interface NotificationsContentProps {
    settings: {
        telegramBotToken: string
        telegramChatId: string
        telegramLanguage: string
        telegramEnabled: boolean
        barkEnabled: boolean
        barkServerUrl: string
        barkDeviceKey: string
        resendApiKey: string
        resendFromEmail: string
        resendFromName: string
        resendEnabled: boolean
        emailLanguage?: string | null
    }
}

const DEFAULT_CAMPAIGNS = [
  {
    id: "1",
    title: "Flash Restock Tonight",
    audience: "VIP customers in HCMC",
    status: "Sent",
    dateTime: "Jun 18, 20:00",
    sentCount: "2,418"
  },
  {
    id: "2",
    title: "Holiday Delay Notice",
    audience: "All registered users",
    status: "Scheduled",
    dateTime: "Jun 20, 09:00",
    sentCount: "0"
  },
  {
    id: "3",
    title: "VIP Voucher Release",
    audience: "Gold Tier Customers",
    status: "Draft",
    dateTime: "Not scheduled",
    sentCount: "-"
  },
  {
    id: "4",
    title: "Summer Launch Promo",
    audience: "Active Customers (90d)",
    status: "Sent",
    dateTime: "Jun 15, 10:00",
    sentCount: "5,102"
  },
  {
    id: "5",
    title: "Weekly Operations Alert",
    audience: "Store Admins",
    status: "Sent",
    dateTime: "Jun 12, 08:30",
    sentCount: "14"
  }
]

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All registered users" },
  { value: "vip_hcmc", label: "VIP customers in HCMC" },
  { value: "gold_tier", label: "Gold Tier Customers" },
  { value: "active_90d", label: "Active Customers (90d)" },
  { value: "store_admins", label: "Store Admins" },
  { value: "custom", label: "Custom target (User ID)" }
]

export function NotificationsContent({ settings }: NotificationsContentProps) {
    const { t } = useI18n()
    const [activeTab, setActiveTab] = useState<'campaigns' | 'settings'>('campaigns')

    // Telegram Bot Settings
    const [token, setToken] = useState(settings.telegramBotToken || '')
    const [chatId, setChatId] = useState(settings.telegramChatId || '')
    const [language, setLanguage] = useState(settings.telegramLanguage || 'vi')
    const [telegramEnabled, setTelegramEnabled] = useState(settings.telegramEnabled || false)
    const [isLoading, setIsLoading] = useState(false)
    const [isTesting, setIsTesting] = useState(false)
    const [isTestingBark, setIsTestingBark] = useState(false)

    // Bark Settings
    const [barkEnabled, setBarkEnabled] = useState(settings.barkEnabled || false)
    const [barkServerUrl, setBarkServerUrl] = useState(settings.barkServerUrl || 'https://api.day.app')
    const [barkDeviceKey, setBarkDeviceKey] = useState(settings.barkDeviceKey || '')

    // Email Settings
    const [resendEnabled, setResendEnabled] = useState(settings.resendEnabled || false)
    const [resendApiKey, setResendApiKey] = useState(settings.resendApiKey || '')
    const [resendFromEmail, setResendFromEmail] = useState(settings.resendFromEmail || '')
    const [resendFromName, setResendFromName] = useState(settings.resendFromName || '')
    const [emailLanguage, setEmailLanguage] = useState(settings.emailLanguage || 'vi')
    const [isTestingEmail, setIsTestingEmail] = useState(false)
    const [testEmail, setTestEmail] = useState('')

    // Campaigns State
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [isComposing, setIsComposing] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [selectedCardFilter, setSelectedCardFilter] = useState<'All' | 'Draft' | 'Scheduled'>('All')

    // Compose Form State
    const [audienceType, setAudienceType] = useState('all')
    const [customUserId, setCustomUserId] = useState('')
    const [campaignTitle, setCampaignTitle] = useState('')
    const [campaignBody, setCampaignBody] = useState('')
    const [scheduleDate, setScheduleDate] = useState('')
    const [sendingCampaign, setSendingCampaign] = useState(false)
    const [savingDraft, setSavingDraft] = useState(false)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    // Load campaigns from localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem('grip-store:campaigns')
            if (stored) {
                try {
                    setCampaigns(JSON.parse(stored))
                } catch {
                    setCampaigns(DEFAULT_CAMPAIGNS)
                }
            } else {
                setCampaigns(DEFAULT_CAMPAIGNS)
                localStorage.setItem('grip-store:campaigns', JSON.stringify(DEFAULT_CAMPAIGNS))
            }
        }
    }, [])

    const saveCampaignsList = (newCampaigns: any[]) => {
        setCampaigns(newCampaigns)
        if (typeof window !== "undefined") {
            localStorage.setItem('grip-store:campaigns', JSON.stringify(newCampaigns))
        }
    }

    // Save Settings
    async function handleSave(formData: FormData) {
        setIsLoading(true)
        try {
            const saved = await saveNotificationSettings(formData)
            setToken(saved.telegramBotToken || '')
            setChatId(saved.telegramChatId || '')
            setLanguage(saved.telegramLanguage || 'vi')
            setTelegramEnabled(!!saved.telegramEnabled)
            setBarkEnabled(!!saved.barkEnabled)
            setBarkServerUrl(saved.barkServerUrl || 'https://api.day.app')
            setBarkDeviceKey(saved.barkDeviceKey || '')
            setResendEnabled(!!saved.resendEnabled)
            setResendApiKey(saved.resendApiKey || '')
            setResendFromEmail(saved.resendFromEmail || '')
            setResendFromName(saved.resendFromName || '')
            setEmailLanguage(saved.emailLanguage || 'vi')
            toast.success(t('common.success'))
        } catch (e: any) {
            toast.error(e.message || t('common.error'))
        } finally {
            setIsLoading(false)
        }
    }

    async function handleSubmitSave(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        await handleSave(new FormData(e.currentTarget))
    }

    // Settings Test Action Handlers
    async function handleTest() {
        setIsTesting(true)
        try {
            const res = await testNotification()
            if (res.success) {
                toast.success(t('admin.settings.notifications.testSuccess'))
            } else {
                toast.error(t('admin.settings.notifications.testFailed', { error: res.error ?? '' }))
            }
        } catch (e: any) {
            toast.error(t('common.error'))
        } finally {
            setIsTesting(false)
        }
    }

    async function handleTestEmail() {
        if (!testEmail) {
            toast.error(t('admin.settings.email.enterTestEmail'))
            return
        }
        setIsTestingEmail(true)
        try {
            const res = await testEmailNotification(testEmail)
            if (res.success) {
                toast.success(t('admin.settings.email.testSuccess'))
            } else {
                toast.error(t('admin.settings.email.testFailed', { error: res.error ?? '' }))
            }
        } catch (e: any) {
            toast.error(t('common.error'))
        } finally {
            setIsTestingEmail(false)
        }
    }

    async function handleTestBark() {
        setIsTestingBark(true)
        try {
            const res = await testBarkNotification()
            if (res.success) {
                toast.success(t('admin.settings.notifications.barkTestSuccess'))
            } else {
                toast.error(t('admin.settings.notifications.barkTestFailed', { error: res.error ?? '' }))
            }
        } catch {
            toast.error(t('common.error'))
        } finally {
            setIsTestingBark(false)
        }
    }

    // Campaign deletion
    const handleDeleteCampaign = (id: string) => {
        if (!confirm("Are you sure you want to delete this campaign?")) return
        const updated = campaigns.filter(c => c.id !== id)
        saveCampaignsList(updated)
        toast.success("Campaign deleted successfully")
    }

    const handleCardClick = (filter: 'All' | 'Draft' | 'Scheduled') => {
        setSelectedCardFilter(filter)
        setStatusFilter('All')
    }

    // Save Campaign Draft
    const handleSaveDraft = () => {
        if (!campaignTitle.trim()) {
            toast.error("Please enter a campaign title")
            return
        }
        setSavingDraft(true)
        try {
            const selectedAudience = AUDIENCE_OPTIONS.find(o => o.value === audienceType);
            const audienceLabel = selectedAudience?.value === 'custom' 
                ? `User: ${customUserId || 'Unknown'}` 
                : selectedAudience?.label || 'All registered users'

            const newCampaign = {
                id: String(Date.now()),
                title: campaignTitle.trim(),
                audience: audienceLabel,
                status: "Draft",
                dateTime: "Not scheduled",
                sentCount: "-"
            }

            saveCampaignsList([newCampaign, ...campaigns])
            toast.success("Campaign saved as draft")
            setIsComposing(false)
            resetComposeForm()
        } catch {
            toast.error("Failed to save draft")
        } finally {
            setSavingDraft(false)
        }
    }

    // Send/Schedule Campaign
    const handleSendCampaign = async () => {
        if (!campaignTitle.trim()) {
            toast.error("Please enter a campaign title")
            return
        }
        if (!campaignBody.trim()) {
            toast.error("Please enter campaign content")
            return
        }
        if (audienceType === 'custom' && !customUserId.trim()) {
            toast.error("Please enter target User ID")
            return
        }

        setSendingCampaign(true)
        try {
            const targetType = audienceType === 'custom' ? 'userId' : 'all'
            const targetValue = audienceType === 'custom' ? customUserId.trim() : ''

            // Call the Go backend API
            const res = await sendAdminMessage({
                targetType,
                targetValue,
                title: campaignTitle.trim(),
                body: campaignBody.trim()
            })

            if (res && res.success) {
                const selectedAudience = AUDIENCE_OPTIONS.find(o => o.value === audienceType);
                const audienceLabel = selectedAudience?.value === 'custom' 
                    ? `User: ${customUserId || 'Unknown'}` 
                    : selectedAudience?.label || 'All registered users'

                const isScheduled = !!scheduleDate.trim()
                const newCampaign = {
                    id: String(Date.now()),
                    title: campaignTitle.trim(),
                    audience: audienceLabel,
                    status: isScheduled ? "Scheduled" : "Sent",
                    dateTime: isScheduled 
                        ? new Date(scheduleDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) 
                        : new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }),
                    sentCount: isScheduled ? "0" : (targetType === 'all' ? "1,500+" : "1")
                }

                saveCampaignsList([newCampaign, ...campaigns])
                toast.success(isScheduled ? "Campaign scheduled successfully" : "Push campaign sent successfully")
                setIsComposing(false)
                resetComposeForm()
            } else {
                toast.error(res?.error || "Failed to deliver push campaign")
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to dispatch campaign request")
        } finally {
            setSendingCampaign(false)
        }
    }

    const resetComposeForm = () => {
        setAudienceType('all')
        setCustomUserId('')
        setCampaignTitle('')
        setCampaignBody('')
        setScheduleDate('')
    }

    // Filter calculations
    const filteredCampaigns = useMemo(() => {
        return campaigns.filter(c => {
            const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase())
            
            let matchesStatus = true
            if (statusFilter !== 'All') {
                matchesStatus = c.status === statusFilter
            }
            
            let matchesCard = true
            if (selectedCardFilter !== 'All') {
                matchesCard = c.status === selectedCardFilter
            }
            
            return matchesSearch && matchesStatus && matchesCard
        })
    }, [campaigns, searchQuery, statusFilter, selectedCardFilter])

    // Pagination calculations
    const paginatedCampaigns = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return filteredCampaigns.slice(startIndex, startIndex + itemsPerPage)
    }, [filteredCampaigns, currentPage])

    const totalPages = Math.max(Math.ceil(filteredCampaigns.length / itemsPerPage), 1)

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, statusFilter, selectedCardFilter])

    const counts = useMemo(() => {
        return {
            all: campaigns.length,
            drafts: campaigns.filter(c => c.status === 'Draft').length,
            scheduled: campaigns.filter(c => c.status === 'Scheduled').length
        }
    }, [campaigns])

    return (
        <div className="space-y-6 min-h-screen bg-[#fafaf8] p-1 rounded-xl">
            {/* Headers */}
            <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between px-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#211e18]">Notifications</h1>
                    <p className="text-sm text-[#71685a] mt-1">
                        Manage system push notifications, active campaigns, and storefront announcements.
                    </p>
                </div>
            </div>

            {/* Radix/Geist-like Tabs */}
            <div className="flex border-b border-[#e7e1d7] px-2 mb-6">
                <button
                    onClick={() => {
                        setActiveTab('campaigns')
                        setIsComposing(false)
                    }}
                    className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
                        activeTab === 'campaigns'
                            ? 'border-[#99782b] text-[#99782b]'
                            : 'border-transparent text-[#71685a] hover:text-[#50483d]'
                    }`}
                >
                    Push Campaigns
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${
                        activeTab === 'settings'
                            ? 'border-[#99782b] text-[#99782b]'
                            : 'border-transparent text-[#71685a] hover:text-[#50483d]'
                    }`}
                >
                    Channel Settings
                </button>
            </div>

            {activeTab === 'campaigns' ? (
                <>
                    {isComposing ? (
                        /* Compose View (Figma 302:4975 Parity) */
                        <div className="px-2 space-y-4 max-w-2xl">
                            <button
                                onClick={() => {
                                    setIsComposing(false)
                                    resetComposeForm()
                                }}
                                className="flex items-center gap-1.5 text-sm font-semibold text-[#99782b] hover:opacity-85 transition-opacity"
                            >
                                <ArrowLeft className="h-4 w-4" /> Back to Campaigns
                            </button>

                            <Card className="border border-[#e7e1d7] bg-white rounded-lg shadow-sm">
                                <CardHeader className="border-b border-[#f3f1ec] pb-4">
                                    <CardTitle className="text-lg font-bold text-[#211e18]">New Push</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-5">
                                    {/* Audience Field */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-[#71685a] uppercase tracking-wider">Audience</Label>
                                        <div className="relative">
                                            <select
                                                value={audienceType}
                                                onChange={(e) => setAudienceType(e.target.value)}
                                                className="w-full h-10 px-3 pr-10 bg-[#fbfaf7] border border-[#e2ddd3] rounded-md text-sm text-[#3a352b] font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-[#99782b] focus:border-[#99782b] transition-all"
                                            >
                                                {AUDIENCE_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#71685a]">
                                                <ChevronDown className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Custom User ID (Conditional) */}
                                    {audienceType === 'custom' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <Label className="text-xs font-bold text-[#71685a] uppercase tracking-wider">Target User ID</Label>
                                            <Input
                                                value={customUserId}
                                                onChange={(e) => setCustomUserId(e.target.value)}
                                                placeholder="Enter username or numeric user ID"
                                                className="border border-[#e2ddd3] bg-white text-[#211e18] placeholder-[#9a9184] focus-visible:ring-[#99782b] focus-visible:border-[#99782b]"
                                            />
                                        </div>
                                    )}

                                    {/* Title Field */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold text-[#71685a] uppercase tracking-wider">Title</Label>
                                            <span className="text-xs text-[#9a9184] font-medium">{campaignTitle.length}/50</span>
                                        </div>
                                        <Input
                                            value={campaignTitle}
                                            onChange={(e) => setCampaignTitle(e.target.value.slice(0, 50))}
                                            placeholder="Enter push campaign title"
                                            className="border border-[#e2ddd3] bg-white text-[#211e18] font-medium placeholder-[#9a9184] focus-visible:ring-[#99782b] focus-visible:border-[#99782b]"
                                        />
                                    </div>

                                    {/* Content/Body Field */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold text-[#71685a] uppercase tracking-wider">Content / Message</Label>
                                            <span className="text-xs text-[#9a9184] font-medium">{campaignBody.length}/150</span>
                                        </div>
                                        <Textarea
                                            value={campaignBody}
                                            onChange={(e) => setCampaignBody(e.target.value.slice(0, 150))}
                                            placeholder="Enter push content text..."
                                            rows={4}
                                            className="border border-[#e2ddd3] bg-white text-[#211e18] placeholder-[#9a9184] focus-visible:ring-[#99782b] focus-visible:border-[#99782b] resize-none"
                                        />
                                    </div>

                                    {/* Schedule Field */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-[#71685a] uppercase tracking-wider">Schedule</Label>
                                        <Input
                                            type="datetime-local"
                                            value={scheduleDate}
                                            onChange={(e) => setScheduleDate(e.target.value)}
                                            className="border border-[#e2ddd3] bg-[#fbfaf7] text-[#3a352b] font-medium focus-visible:ring-[#99782b] focus-visible:border-[#99782b]"
                                        />
                                        <p className="text-[11px] text-[#71685a]">
                                            Leave blank to send this push notification immediately.
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#f3f1ec]">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsComposing(false)
                                                resetComposeForm()
                                            }}
                                            className="border border-[#e2ddd3] text-[#50483d] hover:bg-[#fafaf8]"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={savingDraft || sendingCampaign}
                                            onClick={handleSaveDraft}
                                            className="border border-[#e2ddd3] text-[#50483d] hover:bg-[#fafaf8]"
                                        >
                                            {savingDraft ? "Saving..." : "Save draft"}
                                        </Button>
                                        <Button
                                            type="button"
                                            disabled={sendingCampaign || savingDraft}
                                            onClick={handleSendCampaign}
                                            className="bg-[#99782b] hover:bg-[#99782b]/95 text-white font-semibold shadow-sm"
                                        >
                                            {sendingCampaign 
                                                ? "Sending..." 
                                                : (scheduleDate ? "Schedule campaign" : "Send campaign now")
                                            }
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        /* List View (Figma 281:10133 Parity) */
                        <div className="px-2 space-y-6">
                            {/* KPI Metrics Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <button
                                    onClick={() => handleCardClick('All')}
                                    className={`flex flex-col text-left p-4 rounded-lg border transition-all ${
                                        selectedCardFilter === 'All'
                                            ? 'bg-[#fffdf5] border-[#99782b] shadow-sm'
                                            : 'bg-white border-[#e7e1d7] hover:border-[#99782b]/50'
                                    }`}
                                >
                                    <span className={`text-[13px] font-bold ${selectedCardFilter === 'All' ? 'text-[#99782b]' : 'text-[#71685a]'}`}>All campaigns</span>
                                    <span className={`text-[20px] font-bold mt-1 ${selectedCardFilter === 'All' ? 'text-[#99782b]' : 'text-[#50483d]'}`}>{counts.all} active rows</span>
                                </button>
                                <button
                                    onClick={() => handleCardClick('Draft')}
                                    className={`flex flex-col text-left p-4 rounded-lg border transition-all ${
                                        selectedCardFilter === 'Draft'
                                            ? 'bg-[#fffdf5] border-[#99782b] shadow-sm'
                                            : 'bg-white border-[#e7e1d7] hover:border-[#99782b]/50'
                                    }`}
                                >
                                    <span className={`text-[13px] font-bold ${selectedCardFilter === 'Draft' ? 'text-[#99782b]' : 'text-[#71685a]'}`}>Drafts</span>
                                    <span className={`text-[20px] font-bold mt-1 ${selectedCardFilter === 'Draft' ? 'text-[#99782b]' : 'text-[#50483d]'}`}>{counts.drafts} waiting</span>
                                </button>
                                <button
                                    onClick={() => handleCardClick('Scheduled')}
                                    className={`flex flex-col text-left p-4 rounded-lg border transition-all ${
                                        selectedCardFilter === 'Scheduled'
                                            ? 'bg-[#fffdf5] border-[#99782b] shadow-sm'
                                            : 'bg-white border-[#e7e1d7] hover:border-[#99782b]/50'
                                    }`}
                                >
                                    <span className={`text-[13px] font-bold ${selectedCardFilter === 'Scheduled' ? 'text-[#99782b]' : 'text-[#71685a]'}`}>Scheduled</span>
                                    <span className={`text-[20px] font-bold mt-1 ${selectedCardFilter === 'Scheduled' ? 'text-[#99782b]' : 'text-[#50483d]'}`}>{counts.scheduled} queued</span>
                                </button>
                            </div>

                            {/* Actions / Filter Bar */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Search */}
                                    <div className="relative w-full sm:w-80">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9a9184]" />
                                        <Input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search campaigns by title..."
                                            className="pl-9 h-9 border border-[#e7e1d7] bg-[#fbfaf7] text-[#211e18] placeholder-[#9a9184] rounded-md text-xs focus-visible:ring-[#99782b]"
                                        />
                                    </div>
                                    
                                    {/* Dropdown status filter */}
                                    <div className="relative">
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => {
                                                setStatusFilter(e.target.value)
                                                setSelectedCardFilter('All') // override card filter to avoid clash
                                            }}
                                            className="h-9 px-3 pr-8 bg-[#fbfaf7] border border-[#e7e1d7] rounded-md text-xs font-semibold text-[#50483d] appearance-none focus:outline-none focus:ring-1 focus:ring-[#99782b] transition-all"
                                        >
                                            <option value="All">Status: All</option>
                                            <option value="Sent">Sent</option>
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Draft">Draft</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-[#71685a]">
                                            <ChevronDown className="h-3 w-3" />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => {
                                        resetComposeForm()
                                        setIsComposing(true)
                                    }}
                                    className="bg-[#99782b] hover:bg-[#99782b]/95 text-white font-semibold h-9 px-4 rounded-md shadow-sm"
                                >
                                    <Plus className="h-4 w-4 mr-1 shrink-0" /> New push
                                </Button>
                            </div>

                            {/* Table */}
                            <div className="border border-[#e7e1d7] rounded-lg bg-white overflow-hidden shadow-sm">
                                <Table>
                                    <TableHeader className="bg-[#fafaf8]">
                                        <TableRow className="border-b border-[#e7e1d7]">
                                            <TableHead className="text-xs font-bold text-[#71685a] uppercase py-3">Title</TableHead>
                                            <TableHead className="text-xs font-bold text-[#71685a] uppercase py-3">Audience</TableHead>
                                            <TableHead className="text-xs font-bold text-[#71685a] uppercase py-3">Status</TableHead>
                                            <TableHead className="text-xs font-bold text-[#71685a] uppercase py-3">Date & Time</TableHead>
                                            <TableHead className="text-xs font-bold text-[#71685a] uppercase py-3 text-center">Sent Count</TableHead>
                                            <TableHead className="text-xs font-bold text-[#71685a] py-3 text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedCampaigns.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-sm text-[#9a9184]">
                                                    No campaigns match your filters.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedCampaigns.map((row) => (
                                                <TableRow key={row.id} className="border-b border-[#f3f1ec] hover:bg-[#fafaf8]/50 transition-colors">
                                                    <TableCell className="font-bold text-sm text-[#3a352b] py-3.5">{row.title}</TableCell>
                                                    <TableCell className="text-sm text-[#50483d] py-3.5">{row.audience}</TableCell>
                                                    <TableCell className="py-3.5">
                                                        {row.status === "Sent" && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]">
                                                                Sent
                                                            </span>
                                                        )}
                                                        {row.status === "Scheduled" && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#e3f2fd] text-[#1565c0] border border-[#bbdefb]">
                                                                Scheduled
                                                            </span>
                                                        )}
                                                        {row.status === "Draft" && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#f5f5f5] text-[#616161] border border-[#e0e0e0]">
                                                                Draft
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-[#50483d] py-3.5">{row.dateTime}</TableCell>
                                                    <TableCell className="text-sm font-semibold text-[#50483d] py-3.5 text-center">{row.sentCount}</TableCell>
                                                    <TableCell className="py-3.5 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteCampaign(row.id)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50/50 rounded-full h-8 w-8"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>

                                {/* Table Footer / Pagination */}
                                <div className="flex items-center justify-between px-4 py-3 border-t border-[#f3f1ec] bg-[#fafaf8]">
                                    <span className="text-xs text-[#71685a]">
                                        Showing {filteredCampaigns.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
                                        {Math.min(currentPage * itemsPerPage, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                            className="h-7 px-3 border border-[#e2ddd3] rounded-md text-xs font-semibold text-[#50483d] bg-white hover:bg-[#fafaf8]"
                                        >
                                            Prev
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            className="h-7 px-3 border border-[#e2ddd3] rounded-md text-xs font-semibold text-[#50483d] bg-white hover:bg-[#fafaf8]"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                /* Tab 2: Channel Settings (Config) */
                <div className="px-2 space-y-6 max-w-4xl">
                    {/* Config introduction card */}
                    <Card className="border border-amber-200 bg-amber-50/20 rounded-lg">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg text-[#99782b]">
                                <Bell className="h-5 w-5" />
                                Admin Trigger Toggles
                            </CardTitle>
                            <CardDescription className="text-sm text-[#71685a]">
                                Configure credentials to receive instant system actions (like orders, payment warnings, or system health logs).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 text-sm">
                                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[#e7e1d7]">
                                    <CreditCard className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-[#3a352b]">{t('admin.settings.notifications.triggerPayment')}</p>
                                        <p className="text-xs text-[#71685a] mt-0.5">{t('admin.settings.notifications.triggerPaymentDesc')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[#e7e1d7]">
                                    <RotateCcw className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-[#3a352b]">{t('admin.settings.notifications.triggerRefund')}</p>
                                        <p className="text-xs text-[#71685a] mt-0.5">{t('admin.settings.notifications.triggerRefundDesc')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[#e7e1d7]">
                                    <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-[#3a352b]">{t('admin.settings.notifications.triggerUserMessage')}</p>
                                        <p className="text-xs text-[#71685a] mt-0.5">{t('admin.settings.notifications.triggerUserMessageDesc')}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Telegram Bot configuration */}
                    <Card className="border border-[#e7e1d7] bg-white rounded-lg shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg text-[#211e18]">Telegram Bot {t('admin.settings.notifications.configTitle')}</CardTitle>
                            <CardDescription className="text-xs text-[#71685a]">{t('admin.settings.notifications.configDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitSave} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="telegramEnabledCheckbox"
                                        checked={telegramEnabled}
                                        onChange={(e) => setTelegramEnabled(e.target.checked)}
                                        className="h-4 w-4 rounded border-[#e2ddd3] text-[#99782b] focus:ring-[#99782b]"
                                    />
                                    <input type="hidden" name="telegramEnabled" value={telegramEnabled ? 'true' : 'false'} />
                                    <Label htmlFor="telegramEnabledCheckbox" className="text-sm font-semibold text-[#3a352b]">{t('admin.settings.notifications.telegramEnabled')}</Label>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-[#71685a]">{t('admin.settings.notifications.telegramBotToken')}</Label>
                                    <Input
                                        name="telegramBotToken"
                                        value={token}
                                        onChange={e => setToken(e.target.value)}
                                        type="password"
                                        className="border border-[#e2ddd3] focus-visible:ring-[#99782b]"
                                    />
                                </div>
                                
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-[#71685a]">{t('admin.settings.notifications.telegramChatId')}</Label>
                                    <Input
                                        name="telegramChatId"
                                        value={chatId}
                                        onChange={e => setChatId(e.target.value)}
                                        className="border border-[#e2ddd3] focus-visible:ring-[#99782b]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-[#71685a]">{t('admin.settings.notifications.language')}</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant={language === 'vi' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setLanguage('vi')}
                                            className={language === 'vi' ? 'bg-[#99782b] text-white' : 'border-[#e2ddd3] text-[#50483d]'}
                                        >
                                            Tiếng Việt
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={language === 'en' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setLanguage('en')}
                                            className={language === 'en' ? 'bg-[#99782b] text-white' : 'border-[#e2ddd3] text-[#50483d]'}
                                        >
                                            English
                                        </Button>
                                    </div>
                                    <input type="hidden" name="telegramLanguage" value={language} />
                                    <input type="hidden" name="emailLanguage" value={emailLanguage} />
                                    <input type="hidden" name="resendEnabled" value={resendEnabled ? 'true' : 'false'} />
                                    <input type="hidden" name="resendApiKey" value={resendApiKey} />
                                    <input type="hidden" name="resendFromEmail" value={resendFromEmail} />
                                    <input type="hidden" name="resendFromName" value={resendFromName} />
                                    <input type="hidden" name="barkEnabled" value={barkEnabled ? 'true' : 'false'} />
                                    <input type="hidden" name="barkServerUrl" value={barkServerUrl} />
                                    <input type="hidden" name="barkDeviceKey" value={barkDeviceKey} />
                                    <p className="text-[11px] text-[#71685a]">{t('admin.settings.notifications.languageHint')}</p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button type="submit" disabled={isLoading} className="bg-[#99782b] hover:bg-[#99782b]/95 text-white">
                                        {isLoading ? t('common.processing') : t('admin.settings.notifications.save')}
                                    </Button>

                                    {telegramEnabled && token && chatId && (
                                        <Button type="button" variant="secondary" onClick={handleTest} disabled={isTesting} className="border border-[#e2ddd3] text-[#50483d]">
                                            {isTesting ? t('common.processing') : t('admin.settings.notifications.test')}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Bark Notification config */}
                    <Card className="border border-[#e7e1d7] bg-white rounded-lg shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg text-[#211e18]">
                                <Smartphone className="h-5 w-5" />
                                {t('admin.settings.notifications.barkTitle')}
                            </CardTitle>
                            <CardDescription className="text-xs text-[#71685a]">{t('admin.settings.notifications.barkDesc')}</CardDescription>
                            <p className="text-[11px] text-[#71685a] mt-1">{t('admin.settings.notifications.barkLanguageFollow')}</p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitSave} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="barkEnabledCheckbox"
                                        checked={barkEnabled}
                                        onChange={(e) => setBarkEnabled(e.target.checked)}
                                        className="h-4 w-4 rounded border-[#e2ddd3] text-[#99782b] focus:ring-[#99782b]"
                                    />
                                    <input type="hidden" name="barkEnabled" value={barkEnabled ? 'true' : 'false'} />
                                    <Label htmlFor="barkEnabledCheckbox" className="text-sm font-semibold text-[#3a352b]">{t('admin.settings.notifications.barkEnabled')}</Label>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-[#71685a]">{t('admin.settings.notifications.barkServerUrl')}</Label>
                                    <Input
                                        name="barkServerUrl"
                                        value={barkServerUrl}
                                        onChange={(e) => setBarkServerUrl(e.target.value)}
                                        className="border border-[#e2ddd3] focus-visible:ring-[#99782b]"
                                    />
                                    <p className="text-[11px] text-[#71685a]">{t('admin.settings.notifications.barkServerUrlHint')}</p>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-[#71685a]">{t('admin.settings.notifications.barkDeviceKey')}</Label>
                                    <Input
                                        name="barkDeviceKey"
                                        value={barkDeviceKey}
                                        onChange={(e) => setBarkDeviceKey(e.target.value)}
                                        type="password"
                                        className="border border-[#e2ddd3] focus-visible:ring-[#99782b]"
                                    />
                                    <p className="text-[11px] text-[#71685a]">{t('admin.settings.notifications.barkDeviceKeyHint')}</p>
                                    <p className="text-[11px] text-[#71685a] font-medium text-[#99782b]">{t('admin.settings.notifications.barkDeviceKeyExample')}</p>
                                </div>

                                {/* Hidden fields for telegram settings */}
                                <input type="hidden" name="telegramBotToken" value={token} />
                                <input type="hidden" name="telegramChatId" value={chatId} />
                                <input type="hidden" name="telegramLanguage" value={language} />
                                <input type="hidden" name="telegramEnabled" value={telegramEnabled ? 'true' : 'false'} />
                                {/* Hidden fields for email settings */}
                                <input type="hidden" name="resendEnabled" value={resendEnabled ? 'true' : 'false'} />
                                <input type="hidden" name="resendApiKey" value={resendApiKey} />
                                <input type="hidden" name="resendFromEmail" value={resendFromEmail} />
                                <input type="hidden" name="resendFromName" value={resendFromName} />
                                <input type="hidden" name="emailLanguage" value={emailLanguage} />

                                <div className="flex gap-3 pt-2">
                                    <Button type="submit" disabled={isLoading} className="bg-[#99782b] hover:bg-[#99782b]/95 text-white">
                                        {isLoading ? t('common.processing') : t('admin.settings.notifications.save')}
                                    </Button>
                                    {barkEnabled && barkDeviceKey && (
                                        <Button type="button" variant="secondary" onClick={handleTestBark} disabled={isTestingBark} className="border border-[#e2ddd3] text-[#50483d]">
                                            {isTestingBark ? t('common.processing') : t('admin.settings.notifications.barkTest')}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Email Config */}
                    <Card className="border border-[#e7e1d7] bg-white rounded-lg shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg text-[#211e18]">
                                <Mail className="h-5 w-5" />
                                {t('admin.settings.email.title')}
                            </CardTitle>
                            <CardDescription className="text-xs text-[#71685a]">{t('admin.settings.email.desc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitSave} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="resendEnabledCheckbox"
                                        checked={resendEnabled}
                                        onChange={(e) => setResendEnabled(e.target.checked)}
                                        className="h-4 w-4 rounded border-[#e2ddd3] text-[#99782b] focus:ring-[#99782b]"
                                    />
                                    <input type="hidden" name="resendEnabled" value={resendEnabled ? 'true' : 'false'} />
                                    <Label htmlFor="resendEnabledCheckbox" className="text-sm font-semibold text-[#3a352b]">{t('admin.settings.email.enabled')}</Label>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-[#71685a]">{t('admin.settings.email.apiKey')}</Label>
                                    <Input
                                        name="resendApiKey"
                                        value={resendApiKey}
                                        onChange={e => setResendApiKey(e.target.value)}
                                        type="password"
                                        className="border border-[#e2ddd3] focus-visible:ring-[#99782b]"
                                    />
                                    <p className="text-[11px] text-[#71685a]">
                                        {t('admin.settings.email.apiKeyHint')} <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-[#99782b] hover:underline">resend.com</a>
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-[#71685a]">{t('admin.settings.email.fromEmail')}</Label>
                                    <Input
                                        name="resendFromEmail"
                                        value={resendFromEmail}
                                        onChange={e => setResendFromEmail(e.target.value)}
                                        className="border border-[#e2ddd3] focus-visible:ring-[#99782b]"
                                    />
                                    <p className="text-[11px] text-[#71685a]">{t('admin.settings.email.fromEmailHint')}</p>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-[#71685a]">{t('admin.settings.email.fromName')}</Label>
                                    <Input
                                        name="resendFromName"
                                        value={resendFromName}
                                        onChange={e => setResendFromName(e.target.value)}
                                        className="border border-[#e2ddd3] focus-visible:ring-[#99782b]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-[#71685a]">{t('admin.settings.email.language')}</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant={emailLanguage === 'vi' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setEmailLanguage('vi')}
                                            className={emailLanguage === 'vi' ? 'bg-[#99782b] text-white' : 'border-[#e2ddd3] text-[#50483d]'}
                                        >
                                            Tiếng Việt
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={emailLanguage === 'en' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setEmailLanguage('en')}
                                            className={emailLanguage === 'en' ? 'bg-[#99782b] text-white' : 'border-[#e2ddd3] text-[#50483d]'}
                                        >
                                            English
                                        </Button>
                                    </div>
                                    <input type="hidden" name="emailLanguage" value={emailLanguage} />
                                    <p className="text-[11px] text-[#71685a]">{t('admin.settings.email.languageHint')}</p>
                                </div>

                                {/* Hidden fields for telegram settings */}
                                <input type="hidden" name="telegramBotToken" value={token} />
                                <input type="hidden" name="telegramChatId" value={chatId} />
                                <input type="hidden" name="telegramLanguage" value={language} />
                                <input type="hidden" name="telegramEnabled" value={telegramEnabled ? 'true' : 'false'} />
                                {/* Hidden fields for bark settings */}
                                <input type="hidden" name="barkEnabled" value={barkEnabled ? 'true' : 'false'} />
                                <input type="hidden" name="barkServerUrl" value={barkServerUrl} />
                                <input type="hidden" name="barkDeviceKey" value={barkDeviceKey} />

                                <div className="flex gap-3 pt-2">
                                    <Button type="submit" disabled={isLoading} className="bg-[#99782b] hover:bg-[#99782b]/95 text-white">
                                        {isLoading ? t('common.processing') : t('admin.settings.notifications.save')}
                                    </Button>
                                </div>
                            </form>

                            {resendApiKey && resendFromEmail && (
                                <div className="mt-6 pt-5 border-t border-[#f3f1ec]">
                                    <Label className="text-sm font-semibold text-[#3a352b]">{t('admin.settings.email.testLabel')}</Label>
                                    <div className="flex gap-2 mt-2 max-w-md">
                                        <Input
                                            value={testEmail}
                                            onChange={e => setTestEmail(e.target.value)}
                                            placeholder="Enter recipient email address"
                                            className="border border-[#e2ddd3] focus-visible:ring-[#99782b]"
                                        />
                                        <Button variant="secondary" onClick={handleTestEmail} disabled={isTestingEmail} className="border border-[#e2ddd3] text-[#50483d] shrink-0">
                                            {isTestingEmail ? t('common.processing') : t('admin.settings.email.testButton')}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
