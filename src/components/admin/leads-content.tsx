'use client'

import { useState } from "react"
import { useAdminLeads } from "@/application/hooks/useAdmin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { updateAdminLead } from "@/adapters/api/admin.api"
import { toast } from "sonner"
import { ClientDate } from "@/components/client-date"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const STATUS_MAP: Record<string, string> = {
    'NEW': 'Mới',
    'CONTACTED': 'Đã liên hệ',
    'RESOLVED': 'Hoàn thành'
}

export function AdminLeadsContent() {
    const { data: leads, mutate, isLoading } = useAdminLeads()

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await updateAdminLead(id, { status: status as any })
            toast.success("Cập nhật trạng thái thành công")
            mutate()
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const handleNoteUpdate = async (id: string, note: string) => {
        try {
            await updateAdminLead(id, { notes: note })
            toast.success("Cập nhật ghi chú thành công")
            mutate()
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    if (isLoading) return <div>Đang tải...</div>

    return (
        <div className="space-y-6 max-w-6xl">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Quản lý Khách hàng tiềm năng (Leads)</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách yêu cầu tư vấn / liên hệ</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ngày gửi</TableHead>
                                    <TableHead>Thông tin liên hệ</TableHead>
                                    <TableHead>Nội dung</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Ghi chú nội bộ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!leads || leads.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            Chưa có dữ liệu
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    leads.map((lead) => (
                                        <TableRow key={lead.id}>
                                            <TableCell className="w-[120px]">
                                                <ClientDate value={lead.createdAt} format="dateTime" />
                                            </TableCell>
                                            <TableCell className="w-[200px]">
                                                <div className="font-medium">{lead.name}</div>
                                                <div className="text-sm">{lead.phone}</div>
                                                <div className="text-sm text-muted-foreground">{lead.email}</div>
                                            </TableCell>
                                            <TableCell className="max-w-[250px]">
                                                <div className="text-sm whitespace-pre-wrap">{lead.message}</div>
                                            </TableCell>
                                            <TableCell className="w-[150px]">
                                                <Select
                                                    defaultValue={lead.status}
                                                    onValueChange={(val) => handleStatusChange(lead.id, val)}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(STATUS_MAP).map(([key, label]) => (
                                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Textarea 
                                                    defaultValue={lead.notes || ''} 
                                                    onBlur={(e) => {
                                                        if (e.target.value !== (lead.notes || '')) {
                                                            handleNoteUpdate(lead.id, e.target.value)
                                                        }
                                                    }}
                                                    placeholder="Thêm ghi chú..."
                                                    className="min-h-[60px]"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
