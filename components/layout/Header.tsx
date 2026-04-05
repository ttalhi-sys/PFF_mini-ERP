"use client"
import { usePathname, useRouter } from "next/navigation"
import { Search, ChevronDown, LogOut } from "lucide-react"
import { NotificationBell } from "./NotificationBell"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
    const pathname = usePathname()
    const router = useRouter()

    // Basic breadcrumb generation for demo purposes
    const getBreadcrumbs = () => {
        if (pathname === "/") return "Dashboard"

        const parts = pathname.split("/").filter(Boolean)
        // Capitalize and format paths simply
        const formattedParts = parts.map(part => {
            // Very basic formatting
            if (part === "equipment") return "Équipements"
            if (part === "loans") return "Emprunts"
            if (part === "sst") return "Santé & Sécurité"
            if (part === "sheets") return "Fiches"
            return part.charAt(0).toUpperCase() + part.slice(1)
        })

        return formattedParts.join(" > ")
    }

    const [userId, setUserId] = useState<string | null>(null)

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient()
            const { data } = await supabase.auth.getUser()
            if (data.user) {
                setUserId(data.user.id)
            }
        }
        fetchUser()
    }, [])

    return (
        <header className="h-[64px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 transition-all duration-300">
            {/* Left side: Breadcrumb */}
            <div className="flex items-center">
                <h1 className="text-sm font-medium text-gray-600">
                    {getBreadcrumbs()}
                </h1>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:flex items-center">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-64"
                    />
                </div>

                {/* Notifications */}
                {userId && <NotificationBell userId={userId} />}

                <div className="h-6 w-px bg-gray-200 mx-1"></div>

                {/* User Dropdown Profile Menu */}
                <DropdownMenu>
                    {/* @ts-expect-error Radix UI asChild type mismatch */}
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-md transition-colors outline-none">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">NT</span>
                            </div>
                            <div className="hidden sm:flex flex-col xs:hidden">
                                <span className="text-sm font-medium text-gray-700 leading-none">Nadir Talhi</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Se déconnecter</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
