import { createClient } from "@/lib/supabase/server"
import { EquipmentForm } from "@/components/equipment/EquipmentForm"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function EditEquipmentPage({
    params,
}: {
    params: { id: string }
}) {
    const supabase = createClient()

    // Fetch reference data and current equipment
    const [
        { data: equipment },
        { data: categories },
        { data: locations }
    ] = await Promise.all([
        supabase.from("equipment").select("*").eq("id", params.id).single(),
        supabase.from("categories").select("id, name").order("name"),
        supabase.from("locations").select("id, name").order("name")
    ])

    if (!equipment) {
        notFound()
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
            <div className="flex flex-col gap-1">
                <Link
                    href={`/equipment/${equipment.id}`}
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Retour à l&apos;équipement
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Modifier: {equipment.name}</h1>
                <p className="text-gray-500 text-sm">
                    Mettez à jour les informations de cet équipement.
                </p>
            </div>

            <EquipmentForm
                initialData={equipment}
                categories={categories || []}
                locations={locations || []}
            />
        </div>
    )
}
