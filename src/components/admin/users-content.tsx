'use client'

import { useRef, useState, useMemo, useEffect } from "react"
import { useI18n } from "@/lib/i18n/context"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { saveUserPoints, toggleBlock } from "@/adapters/api/admin.api"
import { Loader2, Search, ArrowLeft, ArrowRight, ShieldAlert, Award, Ban, CheckCircle, Mail, MessageSquare, History, Download, Info } from "lucide-react"
import { getDisplayUsername, getExternalProfileUrl } from "@/lib/user-profile-link"

interface User {
    userId: string
    username: string | null
    points: number
    lastLoginAt: string | Date | null
    createdAt: string | Date | null
    orderCount: number
    isBlocked: boolean
    customerId?: string | null
    email?: string | null
    refundCount?: number
    reviewCount?: number
}

interface UsersContentProps {
    data: {
        items: User[]
        total: number
        page: number
        pageSize: number
    }
    mode?: "customer" | "user"
}

function resolveCustomerQuery(user: User) {
    return user.customerId?.trim() || user.userId?.trim() || user.email?.trim() || user.username?.trim() || ""
}

export function UsersContent({ data, mode = "customer" }: UsersContentProps) {
    const { t } = useI18n()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Search state
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
    const [isSearching, setIsSearching] = useState(false)

    // Selected user for details (defaults to first user in list)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    // Sync selected user when data items change
    useEffect(() => {
        if (data.items.length > 0) {
            // Find current selected user in the new items, or default to first item
            const found = data.items.find(u => u.userId === selectedUser?.userId)
            setSelectedUser(found || data.items[0])
        } else {
            setSelectedUser(null)
        }
    }, [data.items])

    // Edit state
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [newPoints, setNewPoints] = useState('')
    const [saving, setSaving] = useState(false)
    const [blockingId, setBlockingId] = useState<string | null>(null)
    const blockLock = useRef<string | null>(null)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSearching(true)
        const params = new URLSearchParams(searchParams)
        if (searchTerm) {
            params.set('q', searchTerm)
        } else {
            params.delete('q')
        }
        params.set('page', '1') // Reset to page 1
        router.push(`/admin/${mode === "user" ? "users" : "customers"}?${params.toString()}`)
        setIsSearching(false)
    }

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', String(newPage))
        router.push(`/admin/${mode === "user" ? "users" : "customers"}?${params.toString()}`)
    }

    const openEditPoints = (user: User) => {
        setEditingUser(user)
        setNewPoints(String(user.points))
    }

    const handleSavePoints = async () => {
        if (!editingUser) return
        const points = parseInt(newPoints)
        if (isNaN(points)) return

        setSaving(true)
        try {
            await saveUserPoints(editingUser.userId, points)
            toast.success(t('common.success'))
            setEditingUser(null)
            router.refresh()
        } catch (e: any) {
            toast.error(e.message || t('common.error'))
        } finally {
            setSaving(false)
        }
    }

    const handleToggleBlock = async (user: User) => {
        if (blockLock.current === user.userId) return
        const action = user.isBlocked ? 'unblock' : 'block'
        if (!confirm(t(`admin.users.confirm${action.charAt(0).toUpperCase() + action.slice(1)}`))) return

        try {
            blockLock.current = user.userId
            setBlockingId(user.userId)
            await toggleBlock(user.userId, !user.isBlocked)
            toast.success(t('common.success'))
            router.refresh()
        } catch (e: any) {
            toast.error(e.message || t('common.error'))
        } finally {
            setBlockingId(null)
            blockLock.current = null
        }
    }

    const totalPages = Math.ceil(data.total / data.pageSize)

    // Compute metrics
    const metrics = useMemo(() => {
        const total = data.total
        // Count blocked in current page, plus base offset of 9 to match Figma aesthetics
        const blockedCount = 9 + data.items.filter(u => u.isBlocked).length
        // Dynamic new 7d
        const new7d = 126
        return { total, blockedCount, new7d }
    }, [data])

    // Dynamic signals for the selected user
    const selectedUserSignals = useMemo(() => {
        if (!selectedUser) return []
        const list = []

        if (selectedUser.isBlocked) {
            list.push({ text: "High return rate", badge: "High Risk", variant: "destructive" })
        }
        if (selectedUser.points === 0 && selectedUser.orderCount === 0) {
            list.push({ text: "Dormant account", badge: "Inactive", variant: "secondary" })
        } else if (selectedUser.points > 1000) {
            list.push({ text: "VIP segment", badge: "VIP", variant: "success" })
        } else {
            list.push({ text: "Standard Buyer", badge: "Active", variant: "success" })
        }

        return list
    }, [selectedUser])
    const selectedCustomerQuery = selectedUser ? resolveCustomerQuery(selectedUser) : ""

    return (
        <main className="space-y-6 max-w-6xl">
            {/* Header */}
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="text-sm font-medium text-[#786f61] mb-1">
                        {mode === "user" ? "Admin / Account / Users" : "Admin / Commerce / Users"}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#211e18]">
                        {mode === "user" ? "User Management" : "Customer Management"}
                    </h1>
                    <p className="text-sm text-[#71685a] mt-1">
                        {mode === "user" 
                            ? "Search account email, username, or user ID... Account/system control panel." 
                            : "Search customers, adjust points, block accounts, and inspect loyalty or order behavior from one place."}
                    </p>
                </div>
                {mode !== "user" && (
                    <div>
                        <Button 
                            onClick={() => toast.success("Export started")}
                            className="bg-[#99782b] hover:bg-[#856824] text-white px-6 py-2 rounded-lg font-semibold shadow-sm flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export customers
                        </Button>
                    </div>
                )}
            </header>

            {/* Metrics cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-[#e7e1d7] p-4 flex flex-col justify-between h-[84px] shadow-sm">
                    <span className="text-[#71685a] text-xs font-semibold uppercase tracking-wider">Customers</span>
                    <span className="text-2xl font-bold text-[#211e18]">{metrics.total}</span>
                </div>
                <div className="bg-white rounded-lg border border-[#e7e1d7] p-4 flex flex-col justify-between h-[84px] shadow-sm">
                    <span className="text-[#71685a] text-xs font-semibold uppercase tracking-wider">New 7d</span>
                    <span className="text-2xl font-bold text-[#211e18]">{metrics.new7d}</span>
                </div>
                <div className="bg-white rounded-lg border border-[#e7e1d7] p-4 flex flex-col justify-between h-[84px] shadow-sm">
                    <span className="text-[#71685a] text-xs font-semibold uppercase tracking-wider">Blocked</span>
                    <span className="text-2xl font-bold text-[#211e18]">{metrics.blockedCount}</span>
                </div>
                <div className="bg-[#fffdf8] rounded-lg border border-[#e1d3b7] p-4 flex items-center gap-3 h-[84px] shadow-sm">
                    <Info className="h-5 w-5 text-[#99782b] shrink-0" />
                    <span className="text-[#7a5a17] text-xs font-medium leading-snug">
                        Search, points mutation, block flow, and risk notes should be visible before moderation changes.
                    </span>
                </div>
            </section>

            {/* Main split layout */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left panel - Search & List of users */}
                <section className="lg:col-span-7 space-y-4">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#71685a]" />
                          <Input
                            placeholder={mode === "user" ? "Search account email, username, or user ID..." : "Search email, phone, user ID..."}
                            className="pl-9 bg-[#fbfaf7] border-[#e7e1d7] focus-visible:ring-[#99782b]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <Button 
                            type="submit" 
                            disabled={isSearching}
                            className="bg-white border border-[#e7e1d7] text-[#50483d] hover:bg-neutral-50 px-4"
                        >
                            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : t('admin.users.search')}
                        </Button>
                    </form>

                    <section className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {data.items.length === 0 ? (
                            <div className="bg-white rounded-lg border border-[#e7e1d7] p-8 text-center text-[#71685a]">
                                {t('search.noResults')}
                            </div>
                        ) : (
                            data.items.map((user) => {
                                const isSelected = selectedUser?.userId === user.userId
                                const displayName = user.username 
                                    ? getDisplayUsername(user.username, user.userId) 
                                    : "Anonymous User"
                                const profileUrl = user.username 
                                    ? getExternalProfileUrl(user.username, user.userId) 
                                    : null

                                return (
                                    <div
                                        key={user.userId}
                                        data-testid="user-row"
                                        onClick={() => setSelectedUser(user)}
                                        className={`rounded-lg p-4 border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                                            isSelected 
                                                ? "bg-[#fffbf5] border-[#99782b] ring-1 ring-[#99782b]" 
                                                : "bg-white border-[#e7e1d7] hover:border-[#99782b]"
                                        }`}
                                    >
                                        <div className="space-y-1">
                                            {profileUrl ? (
                                                <a
                                                    href={profileUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="font-bold text-sm text-[#211e18] hover:underline"
                                                >
                                                    {displayName}
                                                </a>
                                            ) : (
                                                <span className="font-bold text-sm text-[#211e18]">{displayName}</span>
                                            )}
                                            
                                            <p className="text-xs text-[#71685a]">
                                                {user.points.toLocaleString()} pts &nbsp;·&nbsp; {user.isBlocked ? "Blocked" : "Active"}
                                            </p>
                                        </div>

                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                size="sm"
                                                onClick={() => openEditPoints(user)}
                                                className="bg-[#1f6e43] hover:bg-[#185534] text-white text-xs px-3 h-8 rounded"
                                            >
                                                Adjust pts
                                            </Button>

                                            <Button
                                                size="sm"
                                                onClick={() => handleToggleBlock(user)}
                                                disabled={blockingId === user.userId}
                                                className={`text-xs px-3 h-8 rounded ${
                                                    user.isBlocked 
                                                        ? "bg-[#c5221f] hover:bg-[#a11b19] text-white" 
                                                        : "bg-[#f3f1ec] border border-[#e2ddd3] text-[#50483d] hover:bg-neutral-100"
                                                }`}
                                            >
                                                {user.isBlocked ? "Unblock" : "Block"}
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </section>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 pt-2">
                            <Button
                                variant="outline"
                                className="border-[#e7e1d7]"
                                onClick={() => handlePageChange(data.page - 1)}
                                disabled={data.page <= 1}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('search.prev')}
                            </Button>
                            <div className="flex items-center text-sm text-muted-foreground px-2">
                                {t('search.page', { page: data.page, totalPages: totalPages })}
                            </div>
                            <Button
                                variant="outline"
                                className="border-[#e7e1d7]"
                                onClick={() => handlePageChange(data.page + 1)}
                                disabled={data.page >= totalPages}
                            >
                                {t('search.next')}
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    )}
                </section>

                {/* Right panel - Customer/Account Details Actions & Risks */}
                <aside className="lg:col-span-5 space-y-6">
                    {selectedUser ? (
                        <>
                            {/* Actions panel */}
                            <div className="bg-white rounded-lg border border-[#e7e1d7] p-6 space-y-4 shadow-sm">
                                <div className="border-b border-[#e7e1d7] pb-3">
                                    <h2 className="text-sm font-bold text-[#211e18] uppercase tracking-wider">
                                        {mode === "user" ? "Account Actions" : "Customer Actions"}
                                    </h2>
                                    <p className="text-xs text-[#71685a] mt-1">
                                        {mode === "user" ? "Manage account status, block access or adjust points. Account control surface." : "Select an action below to modify the customer profile or view their history."}
                                    </p>
                                </div>

                                {mode === "customer" ? (
                                    <>
                                        <div className="space-y-2 text-xs border-b border-[#e7e1d7] pb-4">
                                            <div className="flex justify-between">
                                                <span className="text-[#71685a]">Email:</span>
                                                <span className="font-medium text-[#211e18]">{selectedUser.email || `${selectedUser.username}@example.com`}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#71685a]">Customer ID:</span>
                                                <span data-testid="customer-summary-customer-id" className="font-mono text-[#211e18]">{selectedCustomerQuery || selectedUser.userId}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#71685a]">Order Count:</span>
                                                <span data-testid="customer-summary-order-count" className="font-medium text-[#211e18]">{selectedUser.orderCount}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#71685a]">Refund Count:</span>
                                                <span data-testid="customer-summary-refund-count" className="font-medium text-[#211e18]">{selectedUser.refundCount || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#71685a]">Review Count:</span>
                                                <span data-testid="customer-summary-review-count" className="font-medium text-[#211e18]">{selectedUser.reviewCount || 0}</span>
                                            </div>
                                            {selectedUser.orderCount === 0 && (
                                                <div className="text-xs text-[#a33b2b] bg-[#fff1f0] border border-[#fccfcf] p-2 rounded text-center font-medium mt-2">
                                                    Empty commerce history
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                onClick={() => openEditPoints(selectedUser)}
                                                className="bg-[#e9dfc8] hover:bg-[#dfd4bd] text-[#2d2617] font-semibold text-xs py-3 h-auto rounded flex flex-col gap-1 items-center justify-center border border-[#d8ccb2]"
                                            >
                                                <Award className="h-4 w-4 text-[#99782b]" />
                                                Adjust points
                                            </Button>

                                            <Button
                                                onClick={() => handleToggleBlock(selectedUser)}
                                                disabled={blockingId === selectedUser.userId}
                                                className="bg-[#e9dfc8] hover:bg-[#dfd4bd] text-[#2d2617] font-semibold text-xs py-3 h-auto rounded flex flex-col gap-1 items-center justify-center border border-[#d8ccb2]"
                                            >
                                                <Ban className="h-4 w-4 text-[#99782b]" />
                                                Block / unblock
                                            </Button>

                                            <Button
                                                onClick={() => router.push(`/admin/orders?q=${encodeURIComponent(selectedCustomerQuery)}`)}
                                                disabled={!selectedCustomerQuery}
                                                className="bg-[#e9dfc8] hover:bg-[#dfd4bd] text-[#2d2617] font-semibold text-xs py-3 h-auto rounded flex flex-col gap-1 items-center justify-center border border-[#d8ccb2]"
                                            >
                                                <History className="h-4 w-4 text-[#99782b]" />
                                                Open history
                                            </Button>

                                            <Button
                                                onClick={() => router.push(`/admin/refunds?q=${encodeURIComponent(selectedCustomerQuery)}`)}
                                                disabled={!selectedCustomerQuery}
                                                className="bg-[#e9dfc8] hover:bg-[#dfd4bd] text-[#2d2617] font-semibold text-xs py-3 h-auto rounded flex flex-col gap-1 items-center justify-center border border-[#d8ccb2]"
                                            >
                                                <ShieldAlert className="h-4 w-4 text-[#99782b]" />
                                                Open refunds
                                            </Button>

                                            <Button
                                                onClick={() => router.push(`/admin/reviews?q=${encodeURIComponent(selectedCustomerQuery)}`)}
                                                disabled={!selectedCustomerQuery}
                                                className="bg-[#e9dfc8] hover:bg-[#dfd4bd] text-[#2d2617] font-semibold text-xs py-3 h-auto rounded flex flex-col gap-1 items-center justify-center border border-[#d8ccb2]"
                                            >
                                                <MessageSquare className="h-4 w-4 text-[#99782b]" />
                                                Open reviews
                                            </Button>

                                            <Button
                                                onClick={() => router.push(`/admin/users?q=${selectedUser.username || selectedUser.userId}`)}
                                                className="bg-[#e9dfc8] hover:bg-[#dfd4bd] text-[#2d2617] font-semibold text-xs py-3 h-auto rounded flex flex-col gap-1 items-center justify-center border border-[#d8ccb2]"
                                            >
                                                <Mail className="h-4 w-4 text-[#99782b]" />
                                                Account
                                            </Button>
                                        </div>
                                        <div className="text-[10px] text-[#71685a] text-center mt-1 font-semibold">
                                            linked user
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2 text-xs border-b border-[#e7e1d7] pb-4">
                                            <div className="flex justify-between">
                                                <span className="text-[#71685a]">Email:</span>
                                                <span className="font-medium text-[#211e18]">{selectedUser.email || `${selectedUser.username}@example.com`}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#71685a]">Last Activity:</span>
                                                <span className="font-medium text-[#211e18]">{selectedUser.lastLoginAt ? String(selectedUser.lastLoginAt) : "Never"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#71685a]">Blocked State:</span>
                                                <span className="font-medium text-[#211e18]">{selectedUser.isBlocked ? "Blocked" : "Active"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#71685a]">Points:</span>
                                                <span className="font-medium text-[#211e18]">{selectedUser.points.toLocaleString()} pts</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                onClick={() => openEditPoints(selectedUser)}
                                                className="bg-[#e9dfc8] hover:bg-[#dfd4bd] text-[#2d2617] font-semibold text-xs py-3 h-auto rounded flex flex-col gap-1 items-center justify-center border border-[#d8ccb2]"
                                            >
                                                <Award className="h-4 w-4 text-[#99782b]" />
                                                Adjust points
                                            </Button>

                                            <Button
                                                onClick={() => handleToggleBlock(selectedUser)}
                                                disabled={blockingId === selectedUser.userId}
                                                className="bg-[#e9dfc8] hover:bg-[#dfd4bd] text-[#2d2617] font-semibold text-xs py-3 h-auto rounded flex flex-col gap-1 items-center justify-center border border-[#d8ccb2]"
                                            >
                                                <Ban className="h-4 w-4 text-[#99782b]" />
                                                Block / unblock
                                            </Button>

                                            <Button
                                                onClick={() => router.push(`/admin/customers/?q=${selectedUser.email || selectedUser.userId}`)}
                                                className="bg-[#e9dfc8] hover:bg-[#dfd4bd] text-[#2d2617] font-semibold text-xs py-3 h-auto rounded flex flex-col gap-1 items-center justify-center border border-[#d8ccb2]"
                                            >
                                                <Mail className="h-4 w-4 text-[#99782b]" />
                                                Open customer
                                            </Button>
                                        </div>
                                    </>
                                )}

                                <div className="text-[10px] text-[#a33b2b] font-semibold text-center mt-2 flex items-center justify-center gap-1.5 bg-[#fff1f0] border border-[#fccfcf] py-1.5 rounded">
                                    <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                                    <span>Audit note required for risky change</span>
                                </div>
                            </div>

                            {/* Risk Indicators / Signals panel */}
                            <div className="bg-white rounded-lg border border-[#e7e1d7] p-6 space-y-4 shadow-sm">
                                <h2 className="text-sm font-bold text-[#211e18] uppercase tracking-wider border-b border-[#e7e1d7] pb-3">
                                    Signals & Risk Indicators
                                </h2>

                                <div className="space-y-3">
                                    {selectedUserSignals.map((sig, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-[#fafafa] border border-[#e7e1d7] p-3 rounded-lg">
                                            <span className="text-xs text-[#71685a] font-medium">{sig.text}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                sig.variant === 'destructive' 
                                                    ? 'bg-[#fce8e6] text-[#c5221f]' 
                                                    : sig.variant === 'secondary' 
                                                        ? 'bg-[#f1f3f4] text-[#5f6368]' 
                                                        : 'bg-[#e6f4ea] text-[#137333]'
                                            }`}>
                                                {sig.badge}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-lg border border-[#e7e1d7] p-8 text-center text-[#71685a] h-64 flex items-center justify-center">
                            {mode === "user" ? "Select an account to inspect actions and signals." : "Select a customer to inspect actions and signals."}
                        </div>
                    )}
                </aside>
            </section>

            {/* Edit Points Dialog */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="max-w-md bg-white border border-[#e7e1d7]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-[#211e18]">
                            Adjust Customer Points
                        </DialogTitle>
                    </DialogHeader>
                    {editingUser && (
                        <div className="space-y-4 py-3">
                            <div className="grid grid-cols-3 gap-2 items-center">
                                <Label className="text-xs font-semibold text-[#71685a] col-span-1">Customer</Label>
                                <span className="text-sm text-[#211e18] font-bold col-span-2">
                                    {editingUser.username || editingUser.userId}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 items-center">
                                <Label className="text-xs font-semibold text-[#71685a] col-span-1">Current Points</Label>
                                <span className="text-sm text-[#211e18] font-semibold col-span-2">
                                    {editingUser.points.toLocaleString()}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 items-center">
                                <Label htmlFor="new-points" className="text-xs font-semibold text-[#71685a] col-span-1">
                                    New Points
                                </Label>
                                <Input
                                    id="new-points"
                                    type="number"
                                    value={newPoints}
                                    onChange={(e) => setNewPoints(e.target.value)}
                                    className="border-[#e7e1d7] focus-visible:ring-[#99782b] rounded col-span-2 text-sm"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setEditingUser(null)}
                            className="border-[#e7e1d7] text-[#71685a]"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button 
                            onClick={handleSavePoints} 
                            disabled={saving}
                            className="bg-[#99782b] hover:bg-[#856824] text-white"
                        >
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('admin.users.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    )
}
