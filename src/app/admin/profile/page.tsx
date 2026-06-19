'use client'

import { useState, useEffect } from "react"
import { useProfile } from "@/application/hooks/useProfile"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { 
  User, 
  ShieldCheck, 
  Key, 
  Smartphone, 
  Laptop, 
  AlertCircle, 
  Check, 
  ChevronRight, 
  Lock,
  Loader2
} from "lucide-react"

export default function AdminProfileAliasPage() {
  const { profile, isLoading, updateProfile, refresh } = useProfile()
  
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [is2FAEnabled, setIs2FAEnabled] = useState(true)

  // Sync state with fetched profile data
  useEffect(() => {
    if (profile?.user) {
      setDisplayName(profile.user.name || "GRIP Operations")
      setEmail(profile.user.email || "test_admin@example.com")
    }
  }, [profile])

  const handleSave = async () => {
    setSaving(true)
    try {
      const emailToSave = email || profile?.user?.email || "test_admin@example.com"
      const displayNameToSave = displayName || profile?.user?.name || "GRIP Operations"
      const desktopNotif = profile?.desktopNotificationsEnabled || false

      await updateProfile(emailToSave, displayNameToSave, desktopNotif)
      toast.success("Profile saved successfully!")
      refresh()
    } catch (e: any) {
      toast.error(e.message || "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#99782b]" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-medium text-[#786f61] mb-1">
            Admin / Account / Profile
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#211e18]">
            Admin Profile
          </h1>
          <p className="text-sm text-[#71685a] mt-1">
            Manage admin identity, password hygiene, session trust, and connected contact methods.
          </p>
        </div>
        <div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-[#99782b] hover:bg-[#856824] text-white px-6 py-2 rounded-lg font-semibold shadow-sm"
          >
            {saving ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#e7e1d7] p-4 flex flex-col justify-between h-[84px] shadow-sm">
          <span className="text-[#71685a] text-xs font-semibold uppercase tracking-wider">Roles</span>
          <span className="text-2xl font-bold text-[#211e18]">2</span>
        </div>
        <div className="bg-white rounded-lg border border-[#e7e1d7] p-4 flex flex-col justify-between h-[84px] shadow-sm">
          <span className="text-[#71685a] text-xs font-semibold uppercase tracking-wider">Sessions</span>
          <span className="text-2xl font-bold text-[#211e18]">3</span>
        </div>
        <div className="bg-white rounded-lg border border-[#e7e1d7] p-4 flex flex-col justify-between h-[84px] shadow-sm">
          <span className="text-[#71685a] text-xs font-semibold uppercase tracking-wider">2FA</span>
          <span className="text-2xl font-bold text-[#137333]">Enabled</span>
        </div>
        <div className="bg-[#fffdf8] rounded-lg border border-[#e1d3b7] p-4 flex items-center gap-3 h-[84px] shadow-sm">
          <ShieldCheck className="h-5 w-5 text-[#99782b] shrink-0" />
          <span className="text-[#7a5a17] text-xs font-medium leading-snug">
            Security audit passed. Active sessions match authorized locations.
          </span>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Identity Card */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-lg border border-[#e7e1d7] p-6 space-y-4 shadow-sm">
            <div className="border-b border-[#e7e1d7] pb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-[#99782b]" />
              <h2 className="text-sm font-bold text-[#211e18] uppercase tracking-wider">
                Identity
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-semibold text-[#71685a]">
                  Username
                </Label>
                <Input
                  id="username"
                  value={profile?.user?.username || "admin_grip_ops"}
                  disabled
                  className="bg-[#f3f1ec] border-[#e7e1d7] text-[#786f61] rounded-md text-sm cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-[#71685a]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-[#f3f1ec] border-[#e7e1d7] text-[#786f61] rounded-md text-sm cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="displayName" className="text-xs font-semibold text-[#71685a]">
                  Display name
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="border-[#d1c9bd] focus-visible:ring-[#99782b] rounded-md text-sm text-[#211e18]"
                  placeholder="Enter display name"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Security & Recent Access */}
        <div className="lg:col-span-6 space-y-6">
          {/* Security Card */}
          <div className="bg-white rounded-lg border border-[#e7e1d7] p-6 space-y-4 shadow-sm">
            <div className="border-b border-[#e7e1d7] pb-3 flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#99782b]" />
              <h2 className="text-sm font-bold text-[#211e18] uppercase tracking-wider">
                Security
              </h2>
            </div>

            <div className="space-y-4">
              {/* Password */}
              <div className="flex items-center justify-between bg-[#fafafa] border border-[#e7e1d7] p-3 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-xs font-semibold text-[#71685a]">Password</Label>
                  <p className="text-sm text-[#211e18] tracking-widest">*********</p>
                </div>
                <Button 
                  onClick={() => toast.success("Password mutation request sent")}
                  className="bg-white border border-[#d1c9bd] text-[#50483d] hover:bg-neutral-50 text-xs px-3 h-8 rounded"
                >
                  Change password
                </Button>
              </div>

              {/* 2FA Toggle */}
              <div className="flex items-center justify-between bg-[#fafafa] border border-[#e7e1d7] p-3 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-xs font-semibold text-[#211e18]">Two-Factor Authentication (2FA)</Label>
                  <p className="text-xs text-[#71685a]">Secures account with mobile OTP</p>
                </div>
                <div 
                  onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                  className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-all duration-300 ${
                    is2FAEnabled ? "bg-[#99782b]" : "bg-[#faf9f6] border border-[#e7e1d7]"
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    is2FAEnabled ? "translate-x-5" : "translate-x-0"
                  }`} />
                </div>
              </div>

              {/* Backup Email */}
              <div className="flex items-center justify-between bg-[#fafafa] border border-[#e7e1d7] p-3 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-xs font-semibold text-[#71685a]">Backup Email</Label>
                  <p className="text-sm text-[#211e18]">test_backup@example.com</p>
                </div>
                <Button 
                  onClick={() => toast.success("Backup email settings opened")}
                  className="bg-white border border-[#d1c9bd] text-[#50483d] hover:bg-neutral-50 text-xs px-3 h-8 rounded"
                >
                  Configure
                </Button>
              </div>
            </div>
          </div>

          {/* Recent Access Card */}
          <div className="bg-white rounded-lg border border-[#e7e1d7] p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-[#211e18] uppercase tracking-wider border-b border-[#e7e1d7] pb-3">
              Recent access
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e7e1d7]">
                    <th className="pb-2 text-xs font-bold text-[#786f61] uppercase tracking-wider">Device / Browser</th>
                    <th className="pb-2 text-xs font-bold text-[#786f61] uppercase tracking-wider">Location</th>
                    <th className="pb-2 text-xs font-bold text-[#786f61] uppercase tracking-wider">Time</th>
                    <th className="pb-2 text-xs font-bold text-[#786f61] uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f1ec]">
                  {/* Row 1 */}
                  <tr>
                    <td className="py-2.5 text-xs font-semibold text-[#211e18] flex items-center gap-1.5">
                      <Laptop className="h-3.5 w-3.5 text-[#99782b] shrink-0" />
                      Chrome · macOS
                    </td>
                    <td className="py-2.5 text-xs text-[#3a352b]">Saigon</td>
                    <td className="py-2.5 text-xs text-[#3a352b]">Active now</td>
                    <td className="py-2.5 text-xs font-semibold text-[#786f61] text-right">Current</td>
                  </tr>
                  
                  {/* Row 2 */}
                  <tr>
                    <td className="py-2.5 text-xs text-[#211e18] flex items-center gap-1.5">
                      <Smartphone className="h-3.5 w-3.5 text-[#71685a] shrink-0" />
                      Safari · iOS
                    </td>
                    <td className="py-2.5 text-xs text-[#3a352b]">Hanoi</td>
                    <td className="py-2.5 text-xs text-[#3a352b]">2 hours ago</td>
                    <td className="py-2.5 text-right">
                      <button 
                        onClick={() => toast.success("Session revoked")}
                        className="text-xs font-semibold text-[#c25345] hover:underline"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr>
                    <td className="py-2.5 text-xs text-[#211e18] flex items-center gap-1.5">
                      <Laptop className="h-3.5 w-3.5 text-[#71685a] shrink-0" />
                      Chrome · Windows
                    </td>
                    <td className="py-2.5 text-xs text-[#3a352b]">Da Nang</td>
                    <td className="py-2.5 text-xs text-[#3a352b]">3 days ago</td>
                    <td className="py-2.5 text-right">
                      <button 
                        onClick={() => toast.success("Session revoked")}
                        className="text-xs font-semibold text-[#c25345] hover:underline"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
