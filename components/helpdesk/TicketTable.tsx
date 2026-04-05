"use client"

import { useState } from "react"
import { HelpdeskTicket } from "@/lib/types/helpdesk"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Eye, Filter } from "lucide-react"
import Link from "next/link"

interface TicketTableProps {
    tickets: HelpdeskTicket[]
}

export function TicketTable({ tickets }: TicketTableProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("Tous")

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch =
            ticket.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.title.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === "Tous" || ticket.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'OUVERT': return 'destructive'
            case 'ASSIGNE': return 'default'
            case 'EN_COURS': return 'outline'
            case 'RESOLU': return 'default'
            case 'CLOTURE': return 'secondary'
            default: return 'outline'
        }
    }

    const formatStatus = (status: string) => {
        switch (status) {
            case 'OUVERT': return 'Ouvert'
            case 'ASSIGNE': return 'Assigné'
            case 'EN_COURS': return 'En cours'
            case 'RESOLU': return 'Résolu'
            case 'CLOTURE': return 'Clôturé'
            default: return status
        }
    }

    const getPriorityBadge = (priority: string | null) => {
        if (!priority) return null
        switch (priority) {
            case 'Critique': return <Badge variant="destructive">Critique</Badge>
            case 'Haute': return <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">Haute</Badge>
            case 'Moyenne': return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Moyenne</Badge>
            case 'Basse': return <Badge variant="secondary">Basse</Badge>
            default: return <Badge variant="outline">{priority}</Badge>
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        type="text"
                        placeholder="Rechercher un ticket..."
                        className="pl-8 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-48">
                        <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <select
                            className="w-full h-10 pl-8 pr-3 py-2 rounded-md border border-input bg-white text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="Tous">Tous les statuts</option>
                            <option value="OUVERT">Ouvert</option>
                            <option value="ASSIGNE">Assigné</option>
                            <option value="EN_COURS">En cours</option>
                            <option value="RESOLU">Résolu</option>
                            <option value="CLOTURE">Clôturé</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="rounded-md border bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="w-[120px] font-semibold">Code</TableHead>
                            <TableHead className="font-semibold">Catégorie</TableHead>
                            <TableHead className="font-semibold">Titre</TableHead>
                            <TableHead className="font-semibold">Demandeur</TableHead>
                            <TableHead className="font-semibold text-center">Priorité</TableHead>
                            <TableHead className="font-semibold text-center">Statut</TableHead>
                            <TableHead className="font-semibold">Date</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                    Aucun ticket trouvé.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTickets.map((ticket) => (
                                <TableRow key={ticket.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-medium">{ticket.code}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs bg-slate-50">
                                            {ticket.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[250px] truncate" title={ticket.title}>
                                        {ticket.title}
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">
                                        {ticket.submitter?.full_name || 'Utilisateur inconnu'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {getPriorityBadge(ticket.priority)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={getStatusVariant(ticket.status)}>
                                            {formatStatus(ticket.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">
                                        {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
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
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <Link href={`/helpdesk/${ticket.id}`} className="w-full">
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                                        <span>Voir les détails</span>
                                                    </DropdownMenuItem>
                                                </Link>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
                Affichage de {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
            </div>
        </div>
    )
}
