import { createClient } from "@/lib/supabase/server"
import { SSTSheetCard } from "@/components/sst/SSTSheetCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function SSTSheetsPage() {
    const supabase = await createClient()

    // Fetch sheets joined with equipment
    const { data: sheets, error } = await supabase
        .from('sst_sheets')
        .select(`
            *,
            equipment:equipment_id(id, code, name)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching sst sheets:", error)
    }

    return (
        <div className="flex-1 space-y-6 container mx-auto py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Fiches de sécurité</h1>
                    <p className="text-gray-500 mt-1">{sheets?.length || 0} fiches documentées</p>
                </div>

                <div className="flex items-center bg-gray-100 p-1 flex-shrink-0 rounded-lg">
                    <Button variant="default" className="bg-white text-gray-900 shadow-sm hover:bg-gray-50">
                        Fiches
                    </Button>
                    <Link href="/sst/incidents">
                        <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-200">
                            Incidents
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex w-full sm:w-1/2 md:w-1/3 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Rechercher une fiche ou un équipement..."
                        className="pl-10"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select className="h-10 border border-gray-200 rounded-md px-3 text-sm flex-grow sm:flex-grow-0 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Toutes les catégories</option>
                        <option>Mécanique/Pneumatique</option>
                        <option>Ergonomique</option>
                        <option>Électrique/Optique</option>
                        <option>Électrique faible</option>
                    </select>

                    <Link href="/sst/sheets/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                            <Plus className="w-4 h-4 mr-2" />
                            Nouvelle fiche
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {sheets?.map((sheet) => (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    <SSTSheetCard key={sheet.id} sheet={sheet as any} />
                ))}
            </div>

            {(!sheets || sheets.length === 0) && (
                <div className="text-center py-24 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune fiche de sécurité</h3>
                    <p className="text-gray-500">Créez votre première fiche pour commencer à documenter les risques.</p>
                </div>
            )}
        </div>
    )
}
