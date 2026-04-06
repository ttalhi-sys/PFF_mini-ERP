"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Database, Tables } from "@/lib/types/database"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { DataTable, ColumnDef } from "@/components/shared/DataTable"
import Link from "next/link"

type WorkOrderRow = Database["public"]["Tables"]["work_orders"]["Row"]
type SstSheetRow = Database["public"]["Tables"]["sst_sheets"]["Row"]
type DocumentRow = Database["public"]["Tables"]["documents"]["Row"]
type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"] & { profiles?: { full_name: string | null } | null }

// loanItems actually joined with loans
type LoanItemRow = Database["public"]["Tables"]["loan_items"]["Row"] & {
    loans?: {
        id: string
        code: string
        borrower_name: string
        status: string
        checkout_date: string | null
        expected_return: string
        actual_return: string | null
    } | null
}

const TABS = [
    { id: "general", label: "Général" },
    { id: "maintenance", label: "Maintenance" },
    { id: "emprunts", label: "Emprunts" },
    { id: "sst", label: "SST" },
    { id: "documents", label: "Documents" },
    { id: "historique", label: "Historique" },
]

export default function EquipmentDetail({
    equipment,
    workOrders,
    loanItems,
    sstSheets,
    documents,
    auditLogs,
    currentTab
}: {
    equipment: Tables<"equipment"> & {
        profiles?: { full_name: string | null } | null
        locations?: { name: string } | null
    }
    workOrders: WorkOrderRow[]
    loanItems: LoanItemRow[]
    sstSheets: SstSheetRow[]
    documents: DocumentRow[]
    auditLogs: AuditLogRow[]
    currentTab: string
}) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState(currentTab)

    // Sync state with URL when needed
    useEffect(() => {
        setActiveTab(currentTab)
    }, [currentTab])

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId)
        router.push(`/equipment/${equipment.id}?tab=${tabId}`, { scroll: false })
    }

    // Common wrapper for cards
    const Card = ({ title, children, className = "" }: { title: string, children: React.ReactNode, className?: string }) => (
        <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">{title}</h3>
            </div>
            <div className="p-5">
                {children}
            </div>
        </div>
    )

    const InfoRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
        <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-gray-500 text-sm">{label}</span>
            <span className="text-gray-900 text-sm font-medium text-right">{value || "—"}</span>
        </div>
    )

    // -- Tab Renders --

    const renderGeneral = () => {
        const specs = equipment.specifications as Record<string, string | number | boolean> || {}

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card title="Informations générales">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                            <div className="flex flex-col gap-1">
                                <InfoRow label="Fabricant" value={equipment.manufacturer} />
                                <InfoRow label="Modèle" value={equipment.model} />
                                <InfoRow label="N° de série" value={equipment.serial_number} />
                                <InfoRow label="Quantité" value={`${equipment.quantity} ${equipment.unit}`} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <InfoRow label="Propriétaire" value={equipment.owner} />
                                <InfoRow label="Responsable" value={equipment.profiles?.full_name} />
                                <InfoRow label="Date d'acquisition" value={equipment.acquisition_date} />
                                <InfoRow label="Source finance." value={equipment.funding_source} />
                            </div>
                        </div>

                        {(equipment.tags && equipment.tags.length > 0) && (
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-500 mb-2">Mots-clés / Tags</p>
                                <div className="flex flex-wrap gap-2">
                                    {equipment.tags.map((tag: string, i: number) => (
                                        <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {equipment.description && (
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-500 mb-2">Description</p>
                                <p className="text-sm text-gray-800 whitespace-pre-line">{equipment.description}</p>
                            </div>
                        )}
                    </Card>

                    <Card title="Spécifications techniques">
                        {Object.keys(specs).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                {Object.entries(specs).map(([key, val]) => (
                                    <InfoRow key={key} label={key} value={String(val)} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">Aucune spécification enregistrée.</p>
                        )}
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="flex flex-col gap-6">
                    <Card title="Valeur et Tarification">
                        <div className="flex flex-col gap-1">
                            <InfoRow label="Valeur estimée" value={equipment.estimated_value ? `${equipment.estimated_value}$` : null} />
                            <InfoRow label="Coût d'acquisition" value={equipment.acquisition_cost ? `${equipment.acquisition_cost}$` : null} />
                        </div>
                        {equipment.is_loanable && (
                            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-1">
                                <p className="text-sm font-medium text-gray-900 mb-2">Tarifs réguliers</p>
                                <InfoRow label="Par jour" value={equipment.rate_per_day ? `${equipment.rate_per_day}$` : "—"} />
                                <InfoRow label="Par semaine" value={equipment.rate_per_week ? `${equipment.rate_per_week}$` : "—"} />
                                <InfoRow label="Par mois" value={equipment.rate_per_month ? `${equipment.rate_per_month}$` : "—"} />
                            </div>
                        )}
                        {equipment.loan_conditions && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm font-medium text-gray-900 mb-2">Conditions d&apos;emprunt</p>
                                <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded">{equipment.loan_conditions}</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        )
    }

    const renderMaintenance = () => {
        const cols: ColumnDef<WorkOrderRow>[] = [
            { header: "OT", cell: (item) => <Link href={`/maintenance/${item.id}`} className="font-mono text-blue-600 hover:underline">{item.code}</Link> },
            { header: "Type", accessorKey: "type" },
            { header: "Titre", accessorKey: "title", className: "max-w-[200px] truncate" },
            { header: "Statut", cell: (item) => <StatusBadge status={item.status || "new"} /> },
            { header: "Priorité", cell: (item) => <span className="text-sm">{item.priority}</span> },
            { header: "Date planifiée", accessorKey: "planned_date" }
        ]

        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-end">
                    <Link href={`/maintenance/new?equipment=${equipment.id}`} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                        + Nouvel ordre de travail
                    </Link>
                </div>
                <DataTable columns={cols} data={workOrders} totalCount={workOrders.length} pageSize={10} currentPage={1} emptyMessage="Aucun ordre de travail." />
            </div>
        )
    }

    const renderEmprunts = () => {
        const cols: ColumnDef<LoanItemRow>[] = [
            { header: "Emprunt", cell: (item) => <Link href={`/loans/${item.loans?.id}`} className="font-mono text-blue-600 hover:underline">{item.loans?.code}</Link> },
            { header: "Emprunteur", cell: (item) => item.loans?.borrower_name },
            { header: "Statut", cell: (item) => <StatusBadge status={item.loans?.status || "active"} /> },
            { header: "Date Sortie", cell: (item) => item.loans?.checkout_date },
            { header: "Retour Prévu", cell: (item) => item.loans?.expected_return },
            { header: "Retour Réel", cell: (item) => item.loans?.actual_return || "—" },
        ]
        return <DataTable columns={cols} data={loanItems} totalCount={loanItems.length} pageSize={10} currentPage={1} emptyMessage="Aucun historique d'emprunt." />
    }

    const renderSST = () => {
        const sheet = sstSheets[0]

        if (!sheet) {
            return (
                <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune fiche SST pour cet équipement</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Une fiche de santé et sécurité au travail aide à prévenir les incidents en listant les risques et équipements requis.</p>
                    <Link href={`/sst/sheets/new?equipment=${equipment.id}`} className="px-4 py-2 bg-[#1E40AF] text-white rounded-lg text-sm font-medium hover:bg-blue-900">
                        Créer une fiche SST
                    </Link>
                </div>
            )
        }

        return (
            <Card title="Fiche de Santé et Sécurité au Travail" className="border-red-200 shadow-sm">
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">Risques principaux</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-line bg-red-50/50 p-4 rounded border border-red-100">{sheet.main_risks}</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">Mesures de prévention</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-line bg-blue-50/50 p-4 rounded border border-blue-100">{sheet.prevention_measures}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-2">EPI Requis</h4>
                            <p className="text-sm text-gray-600">{sheet.required_ppe || "Aucun spécifique"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-2">Avertissements</h4>
                            <p className="text-sm text-gray-600">{sheet.warnings || "—"}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-2">Actions Interdites</h4>
                            <p className="text-sm text-gray-600 font-medium text-red-600">{sheet.prohibited_actions || "—"}</p>
                        </div>
                    </div>

                    {sheet.lockout_procedure && (
                        <div className="pt-6 border-t border-gray-100">
                            <h4 className="text-sm font-bold text-gray-900 mb-2">Procédure de cadenassage</h4>
                            <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded border border-gray-200 font-mono">{sheet.lockout_procedure}</p>
                        </div>
                    )}
                </div>
            </Card>
        )
    }

    const renderDocuments = () => {
        const cols: ColumnDef<DocumentRow>[] = [
            { header: "Nom du document", cell: (item) => <span className="font-medium text-blue-600 hover:underline cursor-pointer">{item.name}</span> },
            { header: "Type", cell: (item) => <span className="text-sm bg-gray-100 px-2 py-1 rounded">{item.file_type}</span> },
            { header: "Version", accessorKey: "version" },
            { header: "Date d'ajout", cell: (item) => new Date(item.created_at || "").toLocaleDateString() },
        ]
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-end">
                    {/* TODO: Implémenter l'upload de documents */}
                    {/* <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                        + Ajouter un document
                    </button> */}
                </div>
                <DataTable columns={cols} data={documents} totalCount={documents.length} pageSize={10} currentPage={1} emptyMessage="Aucun document rattaché." />
            </div>
        )
    }

    const renderHistorique = () => {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                {auditLogs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Aucun historique disponible.</p>
                ) : (
                    <div className="relative border-l border-gray-200 ml-3">
                        {auditLogs.map((log) => (
                            <div key={log.id} className="mb-8 pl-6 relative">
                                <div className="absolute w-3 h-3 bg-gray-200 rounded-full -left-[1.5px] top-1.5 border border-white"></div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-semibold text-gray-500">
                                        {new Date(log.created_at || "").toLocaleString()}
                                    </span>
                                    <p className="text-sm text-gray-900 inline-block">
                                        <span className="font-medium text-blue-600">{log.profiles?.full_name || "Système"}</span> a effectué l&apos;action <span className="font-mono bg-gray-100 px-1 rounded text-xs">{log.action}</span>
                                    </p>
                                    {log.new_values && (
                                        <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 overflow-auto max-h-32">
                                            {JSON.stringify(log.new_values, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-none">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`whitespace-nowrap px-6 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content Manager */}
            <div className="w-full">
                {activeTab === "general" && renderGeneral()}
                {activeTab === "maintenance" && renderMaintenance()}
                {activeTab === "emprunts" && renderEmprunts()}
                {activeTab === "sst" && renderSST()}
                {activeTab === "documents" && renderDocuments()}
                {activeTab === "historique" && renderHistorique()}
            </div>
        </div>
    )
}
