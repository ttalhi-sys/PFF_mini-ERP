import { createClient } from "@/lib/supabase/server"
import { EquipmentForm } from "@/components/equipment/EquipmentForm"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function NewEquipmentPage() {
    const supabase = createClient()

    // Fetch reference data for selects
    const [
        { data: categories },
        { data: locations }
    ] = await Promise.all([
        supabase.from("categories").select("id, name").order("name"),
        supabase.from("locations").select("id, name").order("name")
    ])

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
            <div className="flex flex-col gap-1">
                <Link
                    href="/equipment"
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Retour aux équipements
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Nouvel Équipement</h1>
                <p className="text-gray-500 text-sm">
                    Renseignez les informations ci-dessous pour ajouter un nouvel équipement au système.
                </p>
            </div>

            <EquipmentForm
                categories={categories || []}
                locations={locations || []}
            />
        </div>
    )
}
