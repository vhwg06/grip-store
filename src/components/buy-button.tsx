'use client'

import { useState, useEffect, useRef } from "react"
import { useCheckout } from "@/application/hooks/useCheckout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useI18n } from "@/lib/i18n/context"

interface BuyButtonProps {
    productId: string
    price: string | number
    productName: string
    disabled?: boolean
    quantity?: number
    autoOpen?: boolean // Auto-open dialog when mounted (for after warning confirmation)
    emailConfigured?: boolean
}

export function BuyButton({ productId, price, productName, disabled, quantity = 1, autoOpen = false, emailConfigured = false }: BuyButtonProps) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [hasAutoOpened, setHasAutoOpened] = useState(false)
    const [email, setEmail] = useState('')
    const isNavigatingRef = useRef(false)
    const { t } = useI18n()
    const { createOrder, submitPaymentForm } = useCheckout()

    const numericalPrice = Number(price) * quantity

    const openDialog = async () => {
        if (disabled) return
        setOpen(true)
    }

    // Auto-open dialog when autoOpen is true (after warning confirmation)
    useEffect(() => {
        if (autoOpen && !hasAutoOpened && !disabled) {
            setHasAutoOpened(true)
            openDialog()
        }
    }, [autoOpen, hasAutoOpened, disabled])

    const handleInitialClick = async () => {
        await openDialog()
    }

    const handleBuy = async () => {
        if (isNavigatingRef.current) return

        try {
            setLoading(true)
            const result = await createOrder({ productId, quantity, email })

            if (!result?.success) {
                const message = result?.error ? t(result.error) : t('common.error')
                toast.error(message)
                if (!isNavigatingRef.current) setLoading(false)
                return
            }

            const { params } = result

            if (!params) {
                toast.error(t('common.error'))
                if (!isNavigatingRef.current) setLoading(false)
                return
            }

            if (params) {
                // Mark as navigating to prevent React errors on Safari
                isNavigatingRef.current = true
                submitPaymentForm(result)
                return
            }

        } catch (e: any) {
            if (!isNavigatingRef.current) {
                toast.error(e.message || "Failed to create order")
                setLoading(false)
            }
        }
    }

    return (
        <>
            <Button
                size="lg"
                className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                onClick={handleInitialClick}
                disabled={disabled}
            >
                {t('common.buyNow')}
            </Button>

            <Dialog open={open} onOpenChange={(v) => !isNavigatingRef.current && setOpen(v)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('common.buyNow')}</DialogTitle>
                        <DialogDescription>{productName} {quantity > 1 ? `x ${quantity}` : ''}</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">{t('buy.modal.price')}</span>
                            <span>{numericalPrice.toFixed(2)}</span>
                        </div>

                    <div className="floating-field">
                        <Input
                            id="email"
                            type="text"
                            placeholder=" "
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Label htmlFor="email" className="floating-label">
                            {emailConfigured ? t('buy.modal.emailLabelConfigured') : t('buy.modal.emailLabelUnconfigured')}
                        </Label>
                    </div>

                        <div className="flex justify-between items-center border-t pt-4 font-bold text-lg">
                            <span>{t('buy.modal.total')}</span>
                            <span>{numericalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleBuy} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('buy.modal.proceedPayment')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
