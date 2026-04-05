"use client"

import { useState } from "react"
import { SSTIncident } from "@/lib/types/sst"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface IncidentTableProps {
    incidents: SSTIncident[]
}

export function IncidentTable({ incidents }: IncidentTableProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("Tous")

    // Status Badge Component
    const StatusBadge = ({ status }: { status: SSTIncident['status'] }) => {
        const statusConfig: Record<string, { label: string, class: string }> = {
            SIGNALE: { label: "Signalé", class: "bg-yellow-100 text-yellow-800" },
            INVESTIGATION: { label: "Investigation", class: "bg-blue-100 text-blue-800" },
            ACTION_REQUISE: { label: "Action requise", class: "bg-orange-100 text-orange-800 border-orange-200" },
            RESOLU: { label: "Résolu", class: "bg-green-100 text-green-800" },
            CLOTURE: { label: "Clôturé", class: "bg-gray-100 text-gray-800" }
        }
        const conf = statusConfig[status] || statusConfig.SIGNALE

        return <Badge variant="outline" className={`${conf.class} border-none`}>{conf.label}</Badge>
    }

    // Type Badge Component
    const TypeBadge = ({ type }: { type: SSTIncident['incident_type'] }) => {
        const typeConfig: Record<string, { label: string, class: string }> = {
            INCIDENT: { label: "Incident", class: "bg-red-100 text-red-800" },
            QUASI_INCIDENT: { label: "Quasi-incident", class: "bg-orange-100 text-orange-800" },
            OBSERVATION: { label: "Observation", class: "bg-blue-100 text-blue-800" }
        }
        const conf = typeConfig[type] || typeConfig.INCIDENT

        return <Badge variant="secondary" className={`${conf.class}`}>{conf.label}</Badge>
    }

    // Severity Badge
    const SeverityBadge = ({ severity }: { severity: SSTIncident['severity'] }) => {
        const config: Record<string, string> = {
            'ELEVEE': "bg-red-600 text-white hover:bg-red-700",
            'MOYENNE': "bg-orange-500 text-white hover:bg-orange-600",
            'FAIBLE': "bg-yellow-500 text-white hover:bg-yellow-600"
        }
        
        const severityLabels: Record<string, string> = {
            'ELEVEE': 'Élevée',
            'MOYENNE': 'Moyenne',
            'FAIBLE': 'Faible'
        };

        const cssClass = config[severity] || "bg-gray-500 text-white hover:bg-gray-600"
        return <Badge className={cssClass}>{severityLabels[severity] || severity}</Badge>
    }


    const filteredIncidents = incidents.filter(i => {
        const matchesSearch = i.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (i.equipment?.name && i.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()))

        let matchesStatus = true
        if (statusFilter !== "Tous") {
            matchesStatus = i.status === statusFilter
        }

        return matchesSearch && matchesStatus
    })

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Rechercher INC- / Équipement..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <select
                        className="flex h-10 w-full sm:w-auto items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="Tous">Tous</option>
                        <option value="SIGNALE">Signalé</option>
                        <option value="INVESTIGATION">Investigation</option>
                        <option value="ACTION_REQUISE">Action requise</option>
                        <option value="RESOLU">Résolu</option>
                        <option value="CLOTURE">Clôturé</option>
                    </select>
                    <Button variant="outline" className="shrink-0">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtres
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Équipement</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Sévérité</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Responsable</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredIncidents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-24 text-gray-500">
                                    Aucun incident trouvé.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredIncidents.map((incident) => (
                                <TableRow key={incident.id}>
                                    <TableCell className="font-mono text-blue-600 font-medium">
                                        <Link href={`/sst/incidents/${incident.id}`}>
                                            {incident.code}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {incident.equipment ? (
                                            <Link href={`/equipment/${incident.equipment.id}`} className="hover:underline font-medium">
                                                {incident.equipment.name}
                                            </Link>
                                        ) : (
                                            <span className="text-gray-400 italic">Non spécifié</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(incident.incident_date), 'dd/MM/yyyy HH:mm')}
                                    </TableCell>
                                    <TableCell>
                                        <TypeBadge type={incident.incident_type} />
                                    </TableCell>
                                    <TableCell>
                                        <SeverityBadge severity={incident.severity} />
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={incident.status} />
                                    </TableCell>
                                    <TableCell>
                                        {incident.responsible?.full_name || <span className="text-gray-400 italic">Non assigné</span>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            {/* @ts-ignore */}
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Ouvrir le menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <Link href={`/sst/incidents/${incident.id}`} className="w-full">
                                                    <DropdownMenuItem>Voir les détails</DropdownMenuItem>
                                                </Link>
                                                {incident.status === 'SIGNALE' && (
                                                    <DropdownMenuItem>Lancer investigation</DropdownMenuItem>
                                                )}
                                                {incident.status !== 'CLOTURE' && (
                                                    <DropdownMenuItem className="text-green-600">Marquer résolu</DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-400 pl-2">
                <span>Affichage de {filteredIncidents.length} incident(s)</span>
            </div>
        </div>
    )
}
