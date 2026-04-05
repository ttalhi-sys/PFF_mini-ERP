"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Wrench,
    Settings,
    Package,
    ShieldAlert,
    FileText,
    Ticket,
    BarChart3,
    Settings2,
    Hexagon // Using Hexagon as a placeholder for the small blue icon
} from "lucide-react"

const mainNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/equipment", label: "Équipements", icon: Wrench },
    { href: "/maintenance", label: "Maintenance", icon: Settings },
    { href: "/loans", label: "Emprunts", icon: Package },
    { href: "/sst/sheets", label: "Santé & Sécurité", icon: ShieldAlert },
    { href: "/documents", label: "Documents", icon: FileText },
    { href: "/helpdesk", label: "Helpdesk", icon: Ticket },
    { href: "/reports", label: "Rapports", icon: BarChart3 },
]

const adminNavItems = [
    { href: "/admin/users", label: "Administration", icon: Settings2 },
]

export default function Sidebar() {
    const pathname = usePathname()

    const renderItem = (item: { href: string; label: string; icon: React.ElementType }) => {
        // Exact match for dashboard, partial for others to keep them highlighted across sub-routes
        const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href)
        const Icon = item.icon

        return (
            <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 transition-colors border-l-[3px] ${isActive
                    ? "bg-[#1E40AF] text-white border-white"
                    : "text-[#9CA3AF] hover:text-white hover:bg-gray-800/50 border-transparent"
                    }`}
            >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="hidden lg:block font-medium text-sm">{item.label}</span>
            </Link>
        )
    }

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-16 lg:w-[240px] bg-[#111827] flex flex-col transition-all duration-300">
            {/* Logo Area */}
            <div className="flex items-center justify-center lg:justify-start gap-3 px-0 lg:px-4 h-16 shrink-0 border-b border-gray-800/50">
                <div className="bg-blue-600 p-1 rounded-md shrink-0">
                    <Hexagon className="w-5 h-5 text-white" fill="currentColor" />
                </div>
                <span className="hidden lg:block text-white font-bold text-lg tracking-tight">LabGFHA</span>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4 flex flex-col scrollbar-none">
                <nav className="flex flex-col gap-0.5">
                    {mainNavItems.map(renderItem)}
                </nav>

                {/* Separator and Admin */}
                <div className="mt-4 flex flex-col gap-0.5">
                    <div className="px-4 mb-2 hidden lg:block">
                        <div className="h-px bg-gray-800 w-full"></div>
                    </div>
                    <nav className="flex flex-col gap-0.5">
                        {adminNavItems.map(renderItem)}
                    </nav>
                </div>
            </div>

            {/* User Section Bottom */}
            <div className="p-4 border-t border-gray-800 flex items-center justify-center lg:justify-start gap-3 bg-[#111827] shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium text-white">NT</span>
                </div>
                <div className="hidden lg:flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-white truncate">Nadir Talhi</span>
                    <span className="text-xs text-gray-400 truncate">Administrateur</span>
                </div>
            </div>
        </aside>
    )
}
