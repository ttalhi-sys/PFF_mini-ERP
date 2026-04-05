import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Wrench, AlertCircle, Calendar,
    ArrowRight, Clock, Box, ShieldAlert,
    CheckCircle2, Plus
} from "lucide-react"
import Link from "next/link"
import { MaintenanceTrendsChart, InventoryStatusChart } from "@/components/reports/DashboardCharts"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = createClient()

    // Fetch quick KPIs
    const { count: eqCount } = await supabase.from('equipment').select('*', { count: 'exact', head: true })
    const { count: woCount } = await supabase.from('work_orders').select('*', { count: 'exact', head: true }).in('status', ['Ouvert', 'En cours'])
    const { count: loanCount } = await supabase.from('loans').select('*', { count: 'exact', head: true }).in('status', ['En cours', 'En retard'])
    const { count: incCount } = await supabase.from('sst_incidents').select('*', { count: 'exact', head: true }).in('status', ['Nouveau', 'En investigation'])
    const { count: tktCount } = await supabase.from('helpdesk_tickets').select('*', { count: 'exact', head: true }).in('status', ['Ouvert', 'Assigné'])

    // Fetch action items (Overdue loans & critical tickets)
    const { data: overdueLoans } = await supabase
        .from('loans')
        .select('id, code, expected_return, borrower_name')
        .eq('status', 'En retard')
        .limit(3)

    const { data: activeIncidents } = await supabase
        .from('sst_incidents')
        .select('id, code, severity, incident_type, status')
        .in('status', ['Nouveau', 'En investigation'])
        .in('severity', ['Critique', 'Élevée'])
        .limit(3)

    // Data for charts
    const { data: eqStatusData } = await supabase.from('equipment').select('status')
    const statusCounts = (eqStatusData || []).reduce((acc: any, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1
        return acc
    }, {})

    const inventoryData = [
        { name: 'Opérationnel', value: statusCounts['Opérationnel'] || 0 },
        { name: 'En Panne', value: statusCounts['En Panne'] || 0 },
        { name: 'En Maintenance', value: statusCounts['En Maintenance'] || 0 },
        { name: 'Déclassé', value: statusCounts['Déclassé'] || 0 },
    ].filter(item => item.value > 0).concat(eqStatusData?.length === 0 ? [{ name: 'Aucun', value: 1 }] : [])

    const maintenanceData = [
        { month: 'Oct', créés: 12, résolus: 10 },
        { month: 'Nov', créés: 15, résolus: 14 },
        { month: 'Déc', créés: 8, résolus: 11 },
        { month: 'Jan', créés: 22, résolus: 18 },
        { month: 'Fév', créés: 18, résolus: 20 },
        { month: 'Mar', créés: (woCount || 0) + 5, résolus: 8 },
    ]

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Vue d'ensemble</h1>
                <p className="text-gray-500 mt-1">Gérez l'ensemble des opérations du laboratoire depuis ce centre de contrôle.</p>
            </div>

            {/* KPI Row (5 Cards) */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-5 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-medium text-slate-500">Équipements</p>
                            <Box className="w-4 h-4 text-[#135bec]" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">{eqCount || 0}</h3>
                            <p className="text-xs text-slate-400 mt-1">Total enregistrés</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-5 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-medium text-slate-500">Bons de Travail</p>
                            <Wrench className="w-4 h-4 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">{woCount || 0}</h3>
                            <p className="text-xs text-orange-600 font-medium mt-1">Actifs en cours</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-5 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-medium text-slate-500">Emprunts</p>
                            <Calendar className="w-4 h-4 text-purple-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">{loanCount || 0}</h3>
                            <p className="text-xs text-purple-600 font-medium mt-1">En circulation</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-5 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-medium text-slate-500">Incidents SST</p>
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">{incCount || 0}</h3>
                            <p className="text-xs text-red-600 font-medium mt-1">À investiguer</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-5 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-medium text-slate-500">Tickets Support</p>
                            <AlertCircle className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">{tktCount || 0}</h3>
                            <p className="text-xs text-blue-600 font-medium mt-1">En attente traitement</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Charts area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[340px]">
                        <MaintenanceTrendsChart data={maintenanceData} />
                        <InventoryStatusChart data={inventoryData} />
                    </div>
                </div>

                {/* Right Action Panel */}
                <div className="space-y-6">
                    <Card className="border-red-200 shadow-sm bg-red-50/30">
                        <CardHeader className="pb-3 border-b border-red-100 bg-red-50/50">
                            <h3 className="font-bold flex items-center text-red-800 text-sm uppercase tracking-wider">
                                <Clock className="w-4 h-4 mr-2" /> Actions Requises
                            </h3>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-red-100">
                                {activeIncidents?.map(inc => (
                                    <div key={inc.id} className="p-4 hover:bg-white/50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <Badge variant="destructive" className="bg-red-600 text-[10px] px-1.5 py-0 h-4">
                                                {inc.severity}
                                            </Badge>
                                            <span className="text-xs text-slate-500 font-medium">{inc.code}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-800 mb-2 truncate">
                                            Nouvel incident SST signalé
                                        </p>
                                        <Link href={`/sst/incidents/${inc.id}`}>
                                            <Button variant="outline" size="sm" className="w-full text-red-700 border-red-200 hover:bg-red-100 bg-white">
                                                Investiguer <ArrowRight className="w-3 h-3 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                ))}

                                {overdueLoans?.map(loan => (
                                    <div key={loan.id} className="p-4 hover:bg-white/50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600 text-[10px] px-1.5 py-0 h-4 border-0">
                                                En Retard
                                            </Badge>
                                            <span className="text-xs text-slate-500 font-medium">{loan.code}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-800 mb-2 truncate">
                                            Retour attendu: {loan.borrower_name}
                                        </p>
                                        <Link href={`/loans/${loan.id}`}>
                                            <Button variant="outline" size="sm" className="w-full text-orange-700 border-orange-200 hover:bg-orange-100 bg-white">
                                                Relancer <ArrowRight className="w-3 h-3 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                ))}

                                {(!activeIncidents?.length && !overdueLoans?.length) && (
                                    <div className="p-8 text-center text-slate-500">
                                        <CheckCircle2 className="w-8 h-8 mx-auto text-green-500 mb-2 opacity-50" />
                                        <p className="text-sm">Aucune action critique urgente.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="pb-3 border-b border-slate-100">
                            <h3 className="font-bold flex items-center text-slate-800 text-sm uppercase tracking-wider">
                                <Plus className="w-4 h-4 mr-2 text-[#135bec]" /> Accès Rapide
                            </h3>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                            <Link href="/equipment/new" className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group">
                                <div className="w-8 h-8 rounded-md bg-[#135bec]/10 text-[#135bec] flex items-center justify-center mr-3 group-hover:bg-[#135bec] group-hover:text-white transition-colors">
                                    <Box className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-slate-800">Ajouter Équipement</h4>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                            </Link>

                            <Link href="/maintenance/new" className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group">
                                <div className="w-8 h-8 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center mr-3 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                    <Wrench className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-slate-800">Nouveau Bon de Travail</h4>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                            </Link>

                            <Link href="/sst/incidents/new" className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group">
                                <div className="w-8 h-8 rounded-md bg-red-100 text-red-600 flex items-center justify-center mr-3 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                    <ShieldAlert className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-slate-800">Signaler un Incident</h4>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
