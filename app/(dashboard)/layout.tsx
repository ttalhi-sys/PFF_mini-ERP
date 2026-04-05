import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-[#F3F4F6]">
            {/* Sidebar is fixed on the left */}
            <Sidebar />

            {/* Main content wrapper with margin-left compensating for Sidebar width */}
            <div className="flex flex-col flex-1 min-w-0 ml-16 lg:ml-[240px] transition-all duration-300">
                <Header />

                {/* Scrollable page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
