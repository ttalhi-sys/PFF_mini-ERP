import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { QrCode, Edit2, CornerUpRight } from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "@/components/shared/StatusBadge"
import EquipmentDetail from "@/components/equipment/EquipmentDetail"

export default async function EquipmentDetailPage({
    params,
    searchParams
}: {
    params: { id: string }
    searchParams: { tab?: string }
}) {
    const supabase = createClient()

    // 1. Fetch Main Equipment
    const { data: equipment, error } = await supabase
        .from("equipment")
        .select(`
      *,
      categories ( id, name ),
      locations ( id, name ),
      profiles!equipment_responsible_id_fkey ( id, full_name, role )
    `)
        .eq("id", params.id)
        .single()

    if (error || !equipment) {
        notFound()
    }

    // 2. Fetch Tab Relations Contextually (Server-side fetch for clean hydration)
    const [
        { data: workOrders },
        { data: loanItems },
        { data: sstSheets },
        { data: documents },
        { data: auditLogs }
    ] = await Promise.all([
        supabase.from("work_orders").select("*").eq("equipment_id", equipment.id).order("created_at", { ascending: false }),

        // For loans, we join loan_items with loans
        supabase.from("loan_items").select(`
      *,
      loans ( id, code, borrower_name, status, checkout_date, expected_return, actual_return )
    `).eq("equipment_id", equipment.id),

        supabase.from("sst_sheets").select("*").eq("equipment_id", equipment.id),
        supabase.from("documents").select("*").eq("linked_entity_type", "equipment").eq("linked_entity_id", equipment.id),

        supabase.from("audit_logs").select(`
      *,
      profiles!audit_logs_user_id_fkey ( full_name )
    `).eq("entity_type", "equipment").eq("entity_id", equipment.id).order("created_at", { ascending: false })
    ])

    // Current tab resolving
    const currentTab = searchParams.tab || "general"

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            {/* Top Header Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">

                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                            {equipment.name}
                        </h1>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-blue-600 font-medium px-2 py-0.5 bg-blue-50 rounded text-sm">
                                {equipment.code}
                            </span>
                            <span className="text-gray-500 text-sm flex items-center gap-1">
                                {equipment.manufacturer || "Fabricant inconnu"} • {equipment.locations?.name || "Localisation non définie"}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                            <StatusBadge status={equipment.status || "new"} />
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800">
                                Criticité: {equipment.criticality}
                            </span>
                            {equipment.is_loanable && (
                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                                    Louable
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                            <QrCode className="w-4 h-4" />
                            QR Code
                        </button>
                        <Link
                            href={`/equipment/${equipment.id}/edit`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                            Modifier
                        </Link>
                        <Link
                            href={`/loans/new?equipment=${equipment.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E40AF] text-white rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors shadow-sm"
                        >
                            <CornerUpRight className="w-4 h-4" />
                            Créer un emprunt
                        </Link>
                    </div>
                </div>
            </div>

            {/* Detail Tabs Content */}
            <EquipmentDetail
                equipment={equipment}
                workOrders={workOrders || []}
                loanItems={loanItems || []}
                sstSheets={sstSheets || []}
                documents={documents || []}
                auditLogs={auditLogs || []}
                currentTab={currentTab}
            />
        </div>
    )
}
