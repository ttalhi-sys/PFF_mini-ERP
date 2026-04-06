"use client"

import { HelpdeskTicket } from "@/lib/types/helpdesk"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertCircle, Clock, Info, CheckCircle2, User, Hammer, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { generateSequentialCode } from "@/lib/business-logic/code-generator"

interface TicketDetailProps {
    ticket: HelpdeskTicket
}

export function TicketDetail({ ticket }: TicketDetailProps) {
    const router = useRouter()
    const [isUpdating, setIsUpdating] = useState(false)
    const supabase = createClient()

    const handleStatusChange = async (newStatus: HelpdeskTicket['status']) => {
        try {
            setIsUpdating(true)

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updates: Record<string, any> = { status: newStatus }

            if (newStatus === 'EN_COURS' && !ticket.assigned_to) {
                // In a real app we might assign to the current user, or require an assignee first
                // For now, allow the state change
            }

            if (newStatus === 'RESOLU') {
                updates.resolved_at = new Date().toISOString()
            }

            if (newStatus === 'CLOTURE') {
                updates.closed_at = new Date().toISOString()
            }

            const { error } = await supabase
                .from('helpdesk_tickets')
                .update(updates)
                .eq('id', ticket.id)

            if (error) throw error

            toast.success(`Le profil du ticket a été mis à jour: ${newStatus}`)
            router.refresh()
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error("Erreur lors de la mise à jour du statut")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleConvertToWO = async () => {
        try {
            setIsUpdating(true)
            const code = await generateSequentialCode(supabase, 'WO', 'work_orders', 'code')
            const { data: woData, error: woError } = await supabase
                .from('work_orders')
                .insert({
                    code,
                    title: `[Ticket ${ticket.code}] ${ticket.title}`,
                    description: ticket.description,
                    equipment_id: ticket.equipment_id || null,
                    type: 'CORRECTIF',
                    priority: ticket.priority === 'Critique' || ticket.priority === 'Haute' ? 'ELEVEE' : ticket.priority === 'Moyenne' ? 'MOYENNE' : 'FAIBLE',
                    status: 'NOUVEAU',
                    created_by: ticket.submitted_by,
                })
                .select('id')
                .single()
            if (woError) throw woError

            // Link ticket to the created WO
            await supabase
                .from('helpdesk_tickets')
                .update({ converted_to_type: 'work_order', converted_to_id: woData.id })
                .eq('id', ticket.id)

            toast.success('Ordre de travail créé avec succès')
            router.push(`/maintenance/${woData.id}`)
        } catch (error) {
            console.error('Error converting to WO:', error)
            toast.error("Erreur lors de la conversion en OT")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleConvertToIncident = async () => {
        try {
            setIsUpdating(true)
            const code = await generateSequentialCode(supabase, 'INC', 'sst_incidents', 'code')
            const { data: incData, error: incError } = await supabase
                .from('sst_incidents')
                .insert({
                    code,
                    description: `[Ticket ${ticket.code}] ${ticket.title}\n\n${ticket.description}`,
                    equipment_id: ticket.equipment_id || null,
                    incident_type: 'INCIDENT',
                    severity: ticket.priority === 'Critique' || ticket.priority === 'Haute' ? 'ELEVEE' : ticket.priority === 'Moyenne' ? 'MOYENNE' : 'FAIBLE',
                    status: 'SIGNALE',
                    incident_date: new Date().toISOString(),
                    created_by: ticket.submitted_by,
                })
                .select('id')
                .single()
            if (incError) throw incError

            // Link ticket to the created incident
            await supabase
                .from('helpdesk_tickets')
                .update({ converted_to_type: 'sst_incident', converted_to_id: incData.id })
                .eq('id', ticket.id)

            toast.success('Incident SST créé avec succès')
            router.push(`/sst/incidents/${incData.id}`)
        } catch (error) {
            console.error('Error converting to incident:', error)
            toast.error("Erreur lors de la conversion en incident")
        } finally {
            setIsUpdating(false)
        }
    }

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

    const priorityLabels: Record<string, string> = { ELEVEE: 'Élevée', MOYENNE: 'Moyenne', FAIBLE: 'Faible' };
    const statusLabels: Record<string, string> = { OUVERT: 'Ouvert', ASSIGNE: 'Assigné', EN_COURS: 'En cours', RESOLU: 'Résolu', CLOTURE: 'Clôturé' };

    const getPriorityBadge = (priority: string | null) => {
        if (!priority) return null
        switch (priority) {
            case 'ELEVEE': return <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">Élevée</Badge>
            case 'MOYENNE': return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Moyenne</Badge>
            case 'FAIBLE': return <Badge variant="secondary">Faible</Badge>
            default: return <Badge variant="outline">{priorityLabels[priority] || priority}</Badge>
        }
    }

    // Determine available status transitions based on current status
    let nextActions: { label: string, status: HelpdeskTicket['status'], icon: any, variant: any }[] = []

    if (ticket.status === 'OUVERT') {
        nextActions = [{ label: "Prendre en charge (Assigner)", status: 'ASSIGNE', icon: User, variant: "default" }]
    } else if (ticket.status === 'ASSIGNE') {
        nextActions = [{ label: "Commencer le travail", status: 'EN_COURS', icon: Settings, variant: "default" }]
    } else if (ticket.status === 'EN_COURS') {
        nextActions = [{ label: "Marquer comme résolu", status: 'RESOLU', icon: CheckCircle2, variant: "default" }]
    } else if (ticket.status === 'RESOLU') {
        nextActions = [{ label: "Clôturer le ticket", status: 'CLOTURE', icon: CheckCircle2, variant: "outline" }]
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {/* Main Ticket Info */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50 border-b">
                        <div>
                            <CardTitle className="text-2xl">{ticket.title}</CardTitle>
                            <CardDescription className="uppercase font-semibold tracking-wider text-[#135bec] mt-1">
                                {ticket.code}
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            {getPriorityBadge(ticket.priority)}
                            <Badge variant={getStatusVariant(ticket.status) as any} className="text-sm">
                                {statusLabels[ticket.status] || ticket.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="mb-6 whitespace-pre-wrap text-slate-700 bg-slate-50 p-4 rounded-md border text-sm leading-relaxed">
                            {ticket.description}
                        </div>

                        {ticket.equipment && (
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-4 mb-4">
                                <Settings className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-blue-900 mb-1">Équipement lié au ticket</h4>
                                    <p className="text-sm text-blue-800 mb-2">
                                        Ce ticket concerne l'équipement <strong>{ticket.equipment.code}</strong> - {ticket.equipment.name}.
                                    </p>
                                    <Link href={`/equipment/${ticket.equipment.id}`}>
                                        <Button size="sm" variant="outline" className="bg-white hover:bg-blue-50">
                                            Voir la fiche de l'équipement
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {(ticket.status === 'RESOLU' || ticket.status === 'CLOTURE') && ticket.resolved_at && (
                            <div className="bg-green-50 border border-green-100 p-4 rounded-lg flex items-start gap-4 mb-4">
                                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-green-900 mb-1">Résolution</h4>
                                    <p className="text-sm text-green-800">
                                        Ce ticket a été marqué comme résolu le {new Date(ticket.resolved_at).toLocaleDateString()}.
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tracking Timeline (Simplified) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Historique et Timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative border-l-2 border-slate-200 ml-3 pl-6 pb-4 space-y-6">
                            <div className="relative">
                                <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-[#135bec] bg-white"></div>
                                <p className="text-sm font-medium">Création du ticket</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(ticket.created_at).toLocaleString('fr-FR')} par {ticket.submitter?.full_name}
                                </p>
                            </div>

                            {ticket.resolved_at && (
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-green-500 bg-white"></div>
                                    <p className="text-sm font-medium">Ticket résolu</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(ticket.resolved_at).toLocaleString('fr-FR')}
                                    </p>
                                </div>
                            )}

                            {ticket.closed_at && (
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-slate-500 bg-white"></div>
                                    <p className="text-sm font-medium">Ticket clôturé</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(ticket.closed_at).toLocaleString('fr-FR')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar with Actions */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Info className="w-5 h-5" />
                            Informations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1">Catégorie</p>
                            <Badge variant="outline">{ticket.category}</Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1">Demandeur</p>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-xs border">
                                    {ticket.submitter?.full_name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{ticket.submitter?.full_name || 'Inconnu'}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1">Assigné à</p>
                            {ticket.assignee ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#135bec]/10 text-[#135bec] flex items-center justify-center font-semibold text-xs border border-[#135bec]/20">
                                        {ticket.assignee.full_name?.charAt(0)}
                                    </div>
                                    <p className="text-sm font-medium">{ticket.assignee.full_name}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic">Non assigné</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Workflow Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Actions de gestion</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {nextActions.map((action, idx) => {
                            const Icon = action.icon;
                            return (
                                <Button
                                    key={idx}
                                    variant={action.variant as any}
                                    className="w-full justify-start"
                                    onClick={() => handleStatusChange(action.status)}
                                    disabled={isUpdating}
                                >
                                    <Icon className="mr-2 h-4 w-4" />
                                    {action.label}
                                </Button>
                            )
                        })}

                        {nextActions.length === 0 && (
                            <p className="text-sm text-muted-foreground italic text-center py-2">
                                Aucune action de statut disponible.
                            </p>
                        )}

                        <hr className="my-2" />

                        {(ticket.status !== 'CLOTURE') && (
                            <div className="space-y-2 pt-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Conversions</p>
                                <Button
                                    variant="outline"
                                    className="w-full shadow-sm text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 justify-start"
                                    disabled={isUpdating || !!ticket.converted_to_id}
                                    onClick={handleConvertToWO}
                                >
                                    <Hammer className="mr-2 h-4 w-4" />
                                    Convertir en OT
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full shadow-sm text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 justify-start"
                                    disabled={isUpdating || !!ticket.converted_to_id}
                                    onClick={handleConvertToIncident}
                                >
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Convertir en Incident
                                </Button>
                                {ticket.converted_to_id && (
                                    <p className="text-xs text-orange-600 mt-2 italic text-center leading-tight">
                                        Ce ticket a déjà été converti.
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
