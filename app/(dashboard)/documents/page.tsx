import { createClient } from "@/lib/supabase/server"
import { DocumentGrid } from "@/components/documents/DocumentGrid"
import { DocumentUploadModal } from "@/components/documents/DocumentUploadModal"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"

export const dynamic = 'force-dynamic'

export default async function DocumentsPage({
    searchParams
}: {
    searchParams: { q?: string, type?: string, entity?: string }
}) {
    const supabase = createClient()

    // Get current user id
    const { data: { user } } = await supabase.auth.getUser()

    // Build the query
    let query = supabase
        .from('documents')
        .select(`
            *,
            uploader:profiles!documents_uploaded_by_fkey(id, full_name, email)
        `)
        .order('created_at', { ascending: false })

    if (searchParams.q) {
        query = query.ilike('name', `%${searchParams.q}%`)
    }

    if (searchParams.type && searchParams.type !== 'Tous') {
        query = query.eq('file_type', searchParams.type)
    }

    if (searchParams.entity && searchParams.entity !== 'Toutes') {
        query = query.eq('linked_entity_type', searchParams.entity)
    }

    const { data: documents, error } = await query

    if (error) {
        console.error("Error fetching documents:", error)
        return <div className="p-8 text-red-500">Erreur de chargement des documents.</div>
    }

    // Prepare mock equipment list for linking
    const { data: eqList } = await supabase.from('equipment').select('id, code, name').eq('is_archived', false).limit(50)
    const formattedEntities = eqList?.map(eq => ({ id: eq.id, name: `${eq.code} - ${eq.name}`, type: 'Équipement' })) || []

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Bibliothèque de documents</h1>
                    <p className="text-gray-500 mt-1">{documents?.length || 0} documents indexés</p>
                </div>
                <DocumentUploadModal userId={user?.id || ''} entities={formattedEntities} />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input placeholder="Rechercher par nom de fichier..." className="pl-9 bg-slate-50" />
                </div>

                <div className="flex gap-4">
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <select className="w-full h-10 pl-9 pr-3 py-2 rounded-md border border-input bg-slate-50 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                            <option value="Tous">Tous les types</option>
                            <option value="Manuel">Manuels</option>
                            <option value="Rapport">Rapports</option>
                            <option value="Photo">Photos</option>
                        </select>
                    </div>
                </div>
            </div>

            <DocumentGrid documents={documents as any || []} />
        </div>
    )
}
