import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Mail, Shield, Building, LogOut, Settings, History, Activity } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const supabase = createClient()

    // Get current auth user
    const { data: { user } } = await supabase.auth.getUser()

    // Get profile details
    let profile = null;
    let recentActivity: any[] = [];

    if (user) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        profile = profileData

        const { data: logsData } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)

        recentActivity = logsData || []
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Mon Profil</h1>
                <p className="text-gray-500 mt-1">Gérez vos informations personnelles et vos préférences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card left */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="shadow-sm border-slate-200 overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-[#135bec] to-blue-400"></div>
                        <CardContent className="px-6 pb-6 pt-0 relative">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center -mt-10 border-4 border-white shadow-sm mb-4">
                                <span className="text-2xl font-bold text-[#135bec]">
                                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || '?'}
                                </span>
                            </div>

                            <h2 className="text-xl font-bold text-slate-800">{profile?.full_name || 'Utilisateur Anonyme'}</h2>
                            <p className="text-slate-500 text-sm mb-4">{profile?.email || user?.email}</p>

                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0 mb-6">
                                Rôle: {profile?.role || 'TECHNICIEN'}
                            </Badge>

                            <form action="/auth/signout" method="post">
                                <Button type="submit" variant="outline" className="w-full text-slate-700 justify-start">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Se déconnecter
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-slate-500 uppercase tracking-wide flex items-center">
                                <Settings className="w-4 h-4 mr-2" /> Préférences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-700">Notifications Email</span>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Activé</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-700">Mode Sombre</span>
                                <Badge variant="outline" className="text-slate-500">Bientôt</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Details right */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="text-lg">Informations détaillées</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-1 mb-1">
                                        <User className="h-3.5 w-3.5" /> Nom complet
                                    </label>
                                    <p className="font-medium text-slate-800">{profile?.full_name || 'Non défini'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-1 mb-1">
                                        <Mail className="h-3.5 w-3.5" /> Adresse Email
                                    </label>
                                    <p className="font-medium text-slate-800">{profile?.email || user?.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-1 mb-1">
                                        <Shield className="h-3.5 w-3.5" /> Niveau d'accès
                                    </label>
                                    <p className="font-medium text-slate-800 capitalize">{profile?.role?.toLowerCase() || 'Standard'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-1 mb-1">
                                        <Building className="h-3.5 w-3.5" /> Département
                                    </label>
                                    <p className="font-medium text-slate-800">Génie Mécanique & Fabrication</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t flex justify-end">
                                <Button className="bg-[#135bec] hover:bg-[#135bec]/90">
                                    Mettre à jour le profil
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between py-4">
                            <CardTitle className="text-lg flex items-center">
                                <History className="h-5 w-5 mr-2 text-slate-500" />
                                Activité Récente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {recentActivity.length > 0 ? (
                                <div className="space-y-6">
                                    {recentActivity.map((log: any, i: number) => (
                                        <div key={log.id} className="relative pl-6 pb-6 last:pb-0">
                                            {/* Timeline line */}
                                            {i !== recentActivity.length - 1 && (
                                                <div className="absolute top-2 left-[11px] bottom-0 w-px bg-slate-200" />
                                            )}

                                            {/* Timeline dot */}
                                            <div className="absolute top-1 left-0 w-[22px] h-[22px] rounded-full bg-blue-50 border-4 border-white flex items-center justify-center shrink-0 shadow-sm">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            </div>

                                            <div className="ml-4">
                                                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                                                    <span className="font-medium text-slate-800">
                                                        {log.action === 'CREATE' && 'Création'}
                                                        {log.action === 'UPDATE' && 'Mise à jour'}
                                                        {log.action === 'DELETE' && 'Suppression'}
                                                        {log.action === 'LOGIN' && 'Connexion'}
                                                        {!['CREATE', 'UPDATE', 'DELETE', 'LOGIN'].includes(log.action) && log.action}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-mono">
                                                        {new Date(log.created_at).toLocaleString('fr-FR', {
                                                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600">
                                                    Action sur <span className="font-semibold text-slate-700">{log.entity_type}</span> {log.entity_id && <span className="text-xs font-mono text-slate-400 ml-1">({log.entity_id.substring(0, 8)})</span>}
                                                </p>
                                                {log.details && Object.keys(log.details).length > 0 && (
                                                    <div className="mt-2 text-xs bg-slate-50 text-slate-500 p-2 rounded border border-slate-100 font-mono overflow-auto">
                                                        {JSON.stringify(log.details)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-500 flex flex-col items-center">
                                    <Activity className="h-8 w-8 text-slate-300 mb-2" />
                                    <p>Aucune activité récente enregistrée</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
