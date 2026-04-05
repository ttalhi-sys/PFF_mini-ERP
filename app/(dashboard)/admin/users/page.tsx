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
import { Button } from "@/components/ui/button"
import { Search, Plus, UserPlus, ShieldAlert, CheckCircle2, MoreHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
    const supabase = createClient()

    // Admin check - In a real app we'd verify the user's role here

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name')

    if (error) {
        return <div className="p-8 text-red-500">Erreur de chargement des utilisateurs.</div>
    }

    const getRoleBadge = (role: string) => {
        switch (role?.toUpperCase()) {
            case 'ADMIN': return <Badge variant="destructive" className="bg-purple-600 hover:bg-purple-700">Administrateur</Badge>
            case 'TECHNICIEN': return <Badge variant="default" className="bg-blue-600">Technicien</Badge>
            case 'GESTIONNAIRE': return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">Gestionnaire</Badge>
            default: return <Badge variant="secondary">Utilisateur</Badge>
        }
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
                    <p className="text-gray-500 mt-1">Gérez les accès et les rôles de l'équipe du LabGFHA</p>
                </div>
                <Button className="bg-[#135bec] hover:bg-[#135bec]/90 shrink-0">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Inviter un utilisateur
                </Button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input placeholder="Rechercher par nom ou email..." className="pl-9 bg-slate-50" />
                </div>
                <select className="h-10 px-3 py-2 rounded-md border border-input bg-slate-50 text-sm focus-visible:outline-none">
                    <option value="Tous">Tous les rôles</option>
                    <option value="Admin">Administrateurs</option>
                    <option value="Technicien">Techniciens</option>
                    <option value="Utilisateur">Utilisateurs</option>
                </select>
            </div>

            <div className="rounded-md border bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="font-semibold">Utilisateur</TableHead>
                            <TableHead className="font-semibold">Email</TableHead>
                            <TableHead className="font-semibold">Rôle</TableHead>
                            <TableHead className="font-semibold">Statut</TableHead>
                            <TableHead className="font-semibold">Dernière connexion</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {profiles?.map((profile: any) => (
                            <TableRow key={profile.id} className="hover:bg-slate-50/50">
                                <TableCell className="font-medium flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-semibold border">
                                        {profile.full_name?.charAt(0) || '?'}
                                    </div>
                                    {profile.full_name || 'Sans Nom'}
                                </TableCell>
                                <TableCell className="text-slate-500">{profile.email}</TableCell>
                                <TableCell>{getRoleBadge(profile.role)}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 gap-1 flex w-fit items-center">
                                        <CheckCircle2 className="w-3 h-3" /> Actif
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-slate-500">
                                    {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('fr-FR') : 'Jamais'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <span className="sr-only">Menu Actions</span>
                                        <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!profiles || profiles.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Aucun profil trouvé.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
