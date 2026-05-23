"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/application/hooks/useAuth"
import type { ReactNode } from "react"

export function LoginModal({ trigger }: { trigger?: ReactNode }) {
  const { loginWithLinuxDO, loginWithGitHub } = useAuth()
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger ?? <Button>Sign in</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <Button onClick={() => loginWithLinuxDO()}>Continue with LinuxDO</Button>
          <Button variant="outline" onClick={() => loginWithGitHub()}>Continue with GitHub</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
