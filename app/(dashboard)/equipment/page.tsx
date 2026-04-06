import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Search, Plus, Download } from "lucide-react"
import { EquipmentTable } from "@/components/equipment/EquipmentTable"

// Need searchParams to be available in Page props
export default async function EquipmentListPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const supabase = createClient()

    // Parse params
    const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1
    const pageSize = 25
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const searchQ = typeof searchParams.q === "string" ? searchParams.q : ""
    const statusFilter = typeof searchParams.status === "string" ? searchParams.status : "all"
    const catFilter = typeof searchParams.category === "string" ? searchParams.category : "all"
    const locFilter = typeof searchParams.location === "string" ? searchParams.location : "all"

    // Base Query
    let query = supabase
        .from("equipment")
        .select(`
      *,
      categories ( id, name ),
      locations ( id, name ),
      profiles!equipment_responsible_id_fkey ( id, full_name )
    `, { count: "exact" })
        .eq("is_archived", false)
        .order("created_at", { ascending: false })

    // Apply filters
    if (searchQ) {
        query = query.or(`name.ilike.%${searchQ}%,code.ilike.%${searchQ}%,manufacturer.ilike.%${searchQ}%`)
    }
    if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter)
    }
    if (catFilter && catFilter !== "all") {
        query = query.eq("category_id", catFilter)
    }
    if (locFilter && locFilter !== "all") {
        query = query.eq("location_id", locFilter)
    }

    // Fetch paginated data
    const { data: equipment, count, error } = await query.range(from, to)

    // Fetch filter options concurrently
    const [
        { data: categories },
        { data: locations }
    ] = await Promise.all([
        supabase.from("categories").select("id, name").order("name"),
        supabase.from("locations").select("id, name").order("name")
    ])

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Équipements</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {count || 0} équipements au total
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* TODO: Implémenter l'exportation CSV */}
                    {/* <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        Exporter
                    </button> */}
                    <Link
                        href="/equipment/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E40AF] text-white rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvel équipement
                    </Link>
                </div>
            </div>

            {/* Filters (Server-side via form submission) */}
            <form className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 items-end">

                <div className="flex-1 min-w-[200px]">
                    <label htmlFor="q" className="hidden">Recherche</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            name="q"
                            id="q"
                            defaultValue={searchQ}
                            placeholder="Rechercher par nom, code, fabricant..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                <div className="w-full sm:w-auto">
                    <select
                        name="status"
                        defaultValue={statusFilter}
                        className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="EN_SERVICE">En service</option>
                        <option value="EN_STOCK">En stock</option>
                        <option value="RESERVE">Réservé</option>
                        <option value="EN_MAINTENANCE">En maintenance</option>
                        <option value="PRETE">Prêté</option>
                        <option value="HORS_SERVICE">Hors service</option>
                    </select>
                </div>

                <div className="w-full sm:w-auto">
                    <select
                        name="category"
                        defaultValue={catFilter}
                        className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="all">Toutes les catégories</option>
                        {categories?.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full sm:w-auto">
                    <select
                        name="location"
                        defaultValue={locFilter}
                        className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="all">Toutes les localisations</option>
                        {locations?.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
                    Filtrer
                </button>
            </form>

            {/* Data Table */}
            {error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
                    Erreur lors du chargement des équipements. {(error as Error).message || String(error)}
                </div>
            ) : (
                <EquipmentTable
                    data={equipment || []}
                    totalCount={count || 0}
                    page={page}
                    pageSize={pageSize}
                />
            )}
        </div>
    )
}
