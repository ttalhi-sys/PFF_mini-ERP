import { createClient } from "@/lib/supabase/server"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AdminAuditPage() {
    const supabase = createClient()

    // Fetch last 100 audit logs
    const { data: logs, error } = await supabase
        .from('audit_logs')
        .select(`
            *,
            profile:profiles!audit_logs_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

    if (error) {
        console.error("Error fetching audit logs", error)
        return <div className="p-8 text-red-500">Erreur de chargement des journaux d'audit.</div>
    }

    const getActionBadge = (action: string) => {
        if (action.includes('CREATE') || action.includes('Ajout')) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">Création</Badge>
        if (action.includes('UPDATE') || action.includes('Modif')) return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0">Modification</Badge>
        if (action.includes('DELETE') || action.includes('Suppr')) return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-0">Suppression</Badge>
        if (action.includes('LOGIN') || action.includes('Connexion')) return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-0">Connexion</Badge>
        return <Badge variant="outline">{action}</Badge>
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-slate-100 rounded-xl">
                    <Activity className="h-6 w-6 text-slate-700" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Journaux d'Audit</h1>
                    <p className="text-gray-500 mt-1">Traçabilité complète des actions du système (100 dernières)</p>
                </div>
            </div>

            <div className="rounded-md border bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="w-[180px] font-semibold">Date & Heure</TableHead>
                            <TableHead className="font-semibold">Utilisateur</TableHead>
                            <TableHead className="font-semibold">Action</TableHead>
                            <TableHead className="font-semibold">Entité Affectée</TableHead>
                            <TableHead className="font-semibold">Détails</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs?.map((log: any) => (
                            <TableRow key={log.id} className="hover:bg-slate-50/50">
                                <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                                    {new Date(log.created_at).toLocaleString('fr-FR', {
                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                                    })}
                                </TableCell>
                                <TableCell className="font-medium text-slate-800">
                                    {log.profile?.full_name || 'Système'}
                                </TableCell>
                                <TableCell>
                                    {getActionBadge(log.action)}
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">
                                    <span className="font-medium uppercase tracking-wider text-xs">{log.entity_type}</span>
                                    {log.entity_id && <span className="text-slate-400 ml-1">#{log.entity_id.split('-')[0]}</span>}
                                </TableCell>
                                <TableCell className="text-sm text-slate-500 max-w-[300px] truncate" title={log.details}>
                                    {log.details || '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!logs || logs.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    Aucun journal d'audit enregistré.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
