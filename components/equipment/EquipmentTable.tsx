"use client"

import Link from "next/link"
import { MoreHorizontal } from "lucide-react"
import { DataTable, ColumnDef } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { EquipmentWithJoins } from "@/lib/types/equipment"

export function EquipmentTable({
    data,
    totalCount,
    page,
    pageSize
}: {
    data: EquipmentWithJoins[]
    totalCount: number
    page: number
    pageSize: number
}) {
    const columns: ColumnDef<EquipmentWithJoins>[] = [
        {
            header: "Code",
            cell: (item) => (
                <Link
                    href={`/equipment/${item.id}`}
                    className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                    {item.code}
                </Link>
            ),
        },
        {
            header: "Nom",
            cell: (item) => (
                <Link
                    href={`/equipment/${item.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                    {item.name}
                </Link>
            ),
        },
        {
            header: "Catégorie",
            cell: (item) => (
                <span className="text-gray-500">
                    {item.categories?.name || "—"}
                </span>
            ),
        },
        {
            header: "Localisation",
            cell: (item) => (
                <span className="text-gray-500">
                    {item.locations?.name || "—"}
                </span>
            ),
        },
        {
            header: "Statut",
            cell: (item) => (
                <StatusBadge status={item.status || "new"} />
            ),
        },
        {
            header: "Condition",
            cell: (item) => (
                <span className="text-sm text-gray-600">
                    {item.condition || "—"}
                </span>
            ),
        },
        {
            header: "Propriétaire",
            cell: (item) => (
                <span className="text-sm text-gray-600">
                    {item.owner || "ÉTS"}
                </span>
            ),
        },
        {
            header: "",
            className: "w-12 text-right",
            cell: (item) => (
                <div className="relative group inline-block text-left cursor-pointer">
                    <button className="p-2 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {/* Simple Dropdown Hover fallback (ideal would be radix dropdown, keeping it simple for now) */}
                    <div className="hidden group-hover:block absolute right-0 z-10 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                            <Link href={`/equipment/${item.id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Voir
                            </Link>
                            <Link href={`/equipment/${item.id}/edit`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Modifier
                            </Link>
                            <Link href={`/maintenance/new?equipment=${item.id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Créer un OT
                            </Link>
                        </div>
                    </div>
                </div>
            ),
        },
    ]

    return (
        <DataTable
            columns={columns}
            data={data}
            totalCount={totalCount}
            pageSize={pageSize}
            currentPage={page}
            emptyMessage="Aucun équipement ne correspond à vos critères de recherche."
        />
    )
}
