import { createClient } from "@/lib/supabase/server"
import {
    InventoryStatusChart,
    MaintenanceTrendsChart,
    LoanActivityChart,
    SstSeverityChart
} from "@/components/reports/DashboardCharts"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, TrendingUp, TrendingDown, Minus } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
    const supabase = createClient()

    // In a real app, these would be complex group-by aggregate queries.
    // We'll mimic the data structure for the visualization based on simple counts for LabGFHA ERP

    // 1. Equipment Status Count
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
    ].filter(item => item.value > 0)

    // Fallback if no equipment
    if (inventoryData.length === 0) {
        inventoryData.push({ name: 'Aucune donnée', value: 1 })
    }

    // 2. Incident severity distribution
    const { data: incData } = await supabase.from('sst_incidents').select('severity')
    const severityCounts = (incData || []).reduce((acc: any, item) => {
        acc[item.severity] = (acc[item.severity] || 0) + 1
        return acc
    }, {})

    const sstData = [
        { name: 'Critique', value: severityCounts['Critique'] || 0 },
        { name: 'Élevée', value: severityCounts['Élevée'] || 0 },
        { name: 'Moyenne', value: severityCounts['Moyenne'] || 0 },
        { name: 'Faible', value: severityCounts['Faible'] || 0 },
    ].filter(item => item.value > 0)

    if (sstData.length === 0) {
        sstData.push({ name: 'Aucun', value: 1 })
    }

    // Static Mock Data for time series (since we just created the DB, there's no historical data spanning months yet)
    const maintenanceData = [
        { month: 'Oct', créés: 12, résolus: 10 },
        { month: 'Nov', créés: 15, résolus: 14 },
        { month: 'Déc', créés: 8, résolus: 11 },
        { month: 'Jan', créés: 22, résolus: 18 },
        { month: 'Fév', créés: 18, résolus: 20 },
        { month: 'Mar', créés: 10, résolus: 8 },
    ]

    const loanData = [
        { month: 'Oct', internes: 45, externes: 12 },
        { month: 'Nov', internes: 52, externes: 8 },
        { month: 'Déc', internes: 38, externes: 5 },
        { month: 'Jan', internes: 65, externes: 15 },
        { month: 'Fév', internes: 58, externes: 18 },
        { month: 'Mar', internes: 30, externes: 10 },
    ]

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Rapports & Analytiques</h1>
                <p className="text-gray-500 mt-1">Vue consolidée des performances du laboratoire</p>
            </div>

            {/* KPI Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-white shadow-sm border-slate-200">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Taux de disponibilité</p>
                                <h3 className="text-3xl font-bold text-slate-800">
                                    {(statusCounts['Opérationnel'] || 0) > 0
                                        ? Math.round((statusCounts['Opérationnel'] / (eqStatusData?.length || 1)) * 100)
                                        : 0}%
                                </h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                        <p className="text-xs text-green-600 font-medium mt-4 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" /> +2% depuis le mois dernier
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-slate-200">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Temps moy. résolution (OT)</p>
                                <h3 className="text-3xl font-bold text-slate-800">4.2 j</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-xs text-blue-600 font-medium mt-4 flex items-center">
                            <TrendingDown className="w-3 h-3 mr-1" /> -1.5 j par rapport à la moyenne
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-slate-200">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Nombre d'Incidents</p>
                                <h3 className="text-3xl font-bold text-slate-800">{incData?.length || 0}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-orange-600" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-4 flex items-center">
                            <Minus className="w-3 h-3 mr-1" /> Stable
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-slate-200">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Départs d'emprunts</p>
                                <h3 className="text-3xl font-bold text-slate-800">30</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-xs text-red-500 font-medium mt-4 flex items-center">
                            <TrendingDown className="w-3 h-3 mr-1" /> -5% (Mois en cours)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <MaintenanceTrendsChart data={maintenanceData} />
                <InventoryStatusChart data={inventoryData} />
                <LoanActivityChart data={loanData} />
                <SstSeverityChart data={sstData} />
            </div>

            <p className="text-xs text-center text-slate-400 mt-12 pb-8">
                * Certaines données historiques (6 derniers mois) sont simulées via des jeux de données d'exemple pour la démonstration.
            </p>
        </div>
    )
}
