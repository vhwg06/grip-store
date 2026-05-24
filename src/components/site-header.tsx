"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "lucide-react"
import { SignInButton } from "@/components/signin-button"
import { SignOutButton } from "@/components/signout-button"
import { HeaderLogo, HeaderNav, HeaderUserMenuItems, HeaderUnreadBadge, LanguageSwitcher } from "@/components/header-client-parts"
import { ModeToggle } from "@/components/mode-toggle"
import { CheckInButton } from "@/components/checkin-button"
import { useAuth } from "@/application/hooks/useAuth"
import { usePublicSettings } from "@/application/hooks/useCatalog"

export function SiteHeader() {
    const { user, isAdmin } = useAuth()
    const { settings } = usePublicSettings()
    const showNavigator = false

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/20 bg-gradient-to-b from-background/90 via-background/70 to-background/55 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 relative after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/25 after:to-transparent">
            <div className="container flex h-16 items-center gap-2 md:gap-3">
                <div className="flex items-center gap-4 md:gap-8 min-w-0">
                    <HeaderLogo shopNameOverride={settings?.shopName ?? null} shopLogoOverride={settings?.shopLogo ?? null} />
                    <HeaderNav isAdmin={isAdmin} isLoggedIn={!!user} showNav={showNavigator} />
                </div>
                <div className="hidden md:flex flex-1 justify-center px-4" />
                <div className="ml-auto flex items-center justify-end gap-2 md:gap-3">
                    <nav className="flex items-center space-x-1 rounded-full border border-border/20 bg-muted/20 px-1.5 py-1 md:px-2">
                        <LanguageSwitcher />
                        <ModeToggle />
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 overflow-visible rounded-full bg-background/70 hover:bg-background/90 transition-all duration-200 hover:-translate-y-0.5 hover:ring-2 hover:ring-primary/25 hover:ring-offset-2 hover:ring-offset-background">
                                        <HeaderUnreadBadge className="absolute -top-1 -right-1 z-10 pointer-events-none shadow-sm" />
                                        <Avatar className="relative z-0 h-8 w-8" data-testid="user-avatar">
                                            <AvatarImage src={user.avatar_url || ''} alt={user.username || user.email || ''} />
                                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.username || user.email}</p>
                                            <p className="text-xs leading-none text-muted-foreground">ID: {user.id}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <div className="px-2 py-1">
                                        <CheckInButton enabled={settings?.checkinEnabled !== false} />
                                    </div>
                                    <DropdownMenuSeparator />
                                    <HeaderUserMenuItems isAdmin={isAdmin} showNav={showNavigator} />
                                    <DropdownMenuSeparator />
                                    <SignOutButton />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <SignInButton />
                        )}
                    </nav>
                </div>
            </div>
        </header>
    )
}
