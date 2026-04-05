import { createClient } from "@/lib/supabase/server"
import { IncidentTable } from "@/components/sst/IncidentTable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function IncidentsPage() {
    const supabase = await createClient()

    // Fetch all incidents
    const { data: incidents, error } = await supabase
        .from('sst_incidents')
        .select(`
            *,
            equipment:equipment_id(id, name, code),
            responsible:responsible_id(id, full_name, email)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching sst incidents:", error)
    }

    return (
        <div className="flex-1 space-y-6 container mx-auto py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Incidents de sécurité</h1>
                    <p className="text-gray-500 mt-1">{incidents?.length || 0} incidents déclarés</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex items-center bg-gray-100 p-1 flex-shrink-0 rounded-lg">
                        <Link href="/sst/sheets">
                            <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-200">
                                Fiches
                            </Button>
                        </Link>
                        <Button variant="default" className="bg-white text-gray-900 shadow-sm hover:bg-gray-50">
                            Incidents
                        </Button>
                    </div>

                    <Link href="/sst/incidents/new">
                        <Button className="bg-red-600 hover:bg-red-700 whitespace-nowrap shadow-sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Déclarer un incident
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Incident Table */}
            <div className="pt-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <IncidentTable incidents={(incidents as any) || []} />
            </div>
        </div>
    )
}
