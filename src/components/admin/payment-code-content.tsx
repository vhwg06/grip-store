'use client'

import { useState, useMemo } from "react"
import { useI18n } from "@/lib/i18n/context"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { saveAdminCollect } from "@/adapters/api/admin.api"
import { toast } from "sonner"
import { QrCode, Upload, AlertCircle, Info, Landmark, Wallet, Banknote } from "lucide-react"

export function AdminPaymentCodeContent({ payLink, payee, sources }: { payLink: string; payee?: string | null; sources?: any[] }) {
    const { t } = useI18n()
    const router = useRouter()

    const [accountName, setAccountName] = useState(payee || "")
    const [bankNumber, setBankNumber] = useState(payLink || "")
    const [selectedSource, setSelectedSource] = useState("vcb")
    const [saving, setSaving] = useState(false)

    const isReady = !!(payee && payLink && payLink.length >= 10)

    // Validation
    const isBankNumberInvalid = bankNumber.length > 0 && bankNumber.length < 10
    const validationError = isBankNumberInvalid ? "Invalid bank code: VCB branch code not recognized." : null

    // QR Image preview generator
    const qrUrl = useMemo(() => {
        if (!bankNumber) return ""
        const encoded = encodeURIComponent(bankNumber)
        return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encoded}`
    }, [bankNumber])

    const handleSave = async () => {
        if (bankNumber.length < 10 || !accountName) {
            toast.error("Invalid input: payee cannot be empty and payLink must be at least 10 characters")
            return
        }
        setSaving(true)
        try {
            await saveAdminCollect(bankNumber, accountName)
            toast.success(t('common.success'))
            router.refresh()
        } catch (e: any) {
            toast.error(e.message || t('common.error'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6 max-w-6xl">
            {/* Header section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="text-sm font-medium text-[#786f61] mb-1">
                        Admin / Payments / Collect
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#211e18]">
                        Payment Collect
                    </h1>
                    <p className="text-sm text-[#71685a] mt-1">
                        Manage QR payment instructions, bank transfer copy, and storefront payment collection surfaces.
                    </p>
                </div>
                <div>
                    <Button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="bg-[#99782b] hover:bg-[#856824] text-white px-6 py-2 rounded-lg font-semibold shadow-sm"
                    >
                        {saving ? t('common.processing') : "Save payment codes"}
                    </Button>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-[#e7e1d7] p-4 flex flex-col justify-between h-[84px] shadow-sm">
                    <span className="text-[#71685a] text-xs font-semibold uppercase tracking-wider">Bank accounts</span>
                    <span className="text-2xl font-bold text-[#211e18]">3</span>
                </div>
                <div className="bg-white rounded-lg border border-[#e7e1d7] p-4 flex flex-col justify-between h-[84px] shadow-sm">
                    <span className="text-[#71685a] text-xs font-semibold uppercase tracking-wider">QR sets</span>
                    <span className="text-2xl font-bold text-[#211e18]">5</span>
                </div>
                <div className="bg-white rounded-lg border border-[#e7e1d7] p-4 flex flex-col justify-between h-[84px] shadow-sm">
                    <span className="text-[#71685a] text-xs font-semibold uppercase tracking-wider">Manual checks</span>
                    <span className="text-2xl font-bold text-[#211e18]">8</span>
                </div>
                {isReady && (
                    <div className="bg-[#fffdf8] rounded-lg border border-[#e1d3b7] p-4 flex items-center gap-3 h-[84px] shadow-sm">
                        <Info className="h-5 w-5 text-[#99782b] shrink-0" />
                        <span className="text-[#7a5a17] text-xs font-medium leading-snug">
                            Verify configurations before saving to live checkout.
                        </span>
                    </div>
                )}
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left panel - Payment Sources List */}
                <div className="lg:col-span-5 space-y-4">
                    <h2 className="text-lg font-bold text-[#211e18]">Payment Sources</h2>
                    
                    {(sources && sources.length > 0 ? sources : [
                        { id: "vcb", key: "vcb", label: "VCB QR primary", enabled: true, status: "active" },
                        { id: "acb", key: "acb", label: "ACB transfer fallback", enabled: true, status: "active" },
                        { id: "momo", key: "momo", label: "MoMo disabled", enabled: false, status: "inactive" },
                        { id: "cash", key: "cash", label: "Store cash pickup", enabled: true, status: "active" }
                    ]).map((src) => {
                        const isSelected = selectedSource === src.key
                        const Icon = src.key === "momo" ? Wallet : (src.key === "cash" ? Banknote : Landmark)
                        const isActive = isReady && (src.status === "active" || src.enabled)
                        return (
                            <div 
                                key={src.id}
                                onClick={() => setSelectedSource(src.key)}
                                className={`rounded-lg p-4 border transition-all cursor-pointer ${
                                    isSelected 
                                    ? "bg-[#fffbf5] border-[#99782b] ring-1 ring-[#99782b]" 
                                    : "bg-white border-[#e7e1d7] hover:border-[#99782b]"
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-3">
                                        <div className="mt-1 p-2 rounded bg-[#faf9f6] border border-[#e7e1d7]">
                                            <Icon className={`h-5 w-5 ${isActive ? "text-[#99782b]" : "text-[#a89f91]"}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm text-[#211e18]">{src.label}</h3>
                                            <p className="text-xs text-[#71685a] mt-0.5">
                                                {src.key === "vcb" ? "Vietcombank QR collection" : src.key === "momo" ? "MoMo e-wallet gateway" : "Asia Commercial Bank transfer"}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                        isActive ? "bg-[#e6f4ea] text-[#137333]" : "bg-[#f1f3f4] text-[#5f6368]"
                                    }`}>
                                        {isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>


                {/* Right panel - Form & Live Preview */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Top Right Card - Form Configuration */}
                    <div className="bg-white rounded-lg border border-[#e7e1d7] p-6 space-y-4 shadow-sm">
                        <h2 className="text-lg font-bold text-[#211e18] uppercase tracking-wider text-xs">
                            Configuration: {selectedSource.toUpperCase()} QR
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="accountName" className="text-xs font-semibold text-[#71685a]">
                                    Account Name
                                </Label>
                                <Input 
                                    id="accountName"
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    className="border-[#e7e1d7] focus-visible:ring-[#99782b] rounded-md text-sm"
                                    placeholder="Enter bank payee account name"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="bankNumber" className="text-xs font-semibold text-[#71685a]">
                                    Bank Number
                                </Label>
                                <Input 
                                    id="bankNumber"
                                    value={bankNumber}
                                    onChange={(e) => setBankNumber(e.target.value)}
                                    className={`focus-visible:ring-[#99782b] rounded-md text-sm ${
                                        isBankNumberInvalid ? "border-[#a33b2b] bg-[#fff1f0]" : "border-[#e7e1d7]"
                                    }`}
                                    placeholder="Enter bank card/account number or payment URL"
                                />
                                {validationError && (
                                    <div className="flex items-center gap-2 text-xs font-medium text-[#a33b2b] bg-[#fff1f0] border border-[#fccfcf] rounded-md px-3 py-2 mt-1">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>{validationError}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-[#71685a]">
                                    QR Image
                                </Label>
                                <div className="border border-dashed border-[#e7e1d7] bg-[#faf9f6] rounded-md p-4 text-center cursor-pointer hover:bg-neutral-50 transition-colors">
                                    <Upload className="h-6 w-6 text-[#71685a] mx-auto mb-2" />
                                    <span className="text-xs text-[#71685a] block">
                                        Click to upload QR code image or drag & drop
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Right Card - Live Preview Mockup */}
                    <div className="bg-white rounded-lg border border-[#e7e1d7] p-6 space-y-4 shadow-sm">
                        <h2 className="text-lg font-bold text-[#211e18] uppercase tracking-wider text-xs">
                            Live Preview (Storefront Checkout)
                        </h2>

                        <div className="bg-[#fafafa] border border-[#e7e1d7] rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="space-y-1.5">
                                <h3 className="font-bold text-sm text-[#211e18] flex items-center gap-2">
                                    <Landmark className="h-4 w-4 text-[#99782b]" />
                                    {accountName || "Payee Name Placeholder"}
                                </h3>
                                <p className="text-xs text-[#71685a] font-medium">
                                    Acc: {bankNumber || "Account number"} (Vietcombank)
                                </p>
                                <p className="text-[10px] text-[#7a5a17] font-semibold flex items-center gap-1 bg-[#fff7e7] px-2 py-0.5 rounded w-fit mt-2">
                                    <Info className="h-3 w-3 shrink-0" />
                                    QR expires in 10:00. Please copy details correctly.
                                </p>
                            </div>
                            
                            <div className="flex flex-col items-center justify-center border border-[#e7e1d7] rounded-lg bg-white p-2 w-[100px] h-[100px] shrink-0 self-center">
                                {qrUrl ? (
                                    <img src={qrUrl} alt="Storefront QR mockup" className="w-[84px] h-[84px]" />
                                ) : (
                                    <>
                                        <QrCode className="h-6 w-6 text-[#b6b0a6] mb-1" />
                                        <span className="text-[10px] text-[#b6b0a6] font-medium">QR Code</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
