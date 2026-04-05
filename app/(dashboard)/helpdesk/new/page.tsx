import { createClient } from "@/lib/supabase/server"
import { TicketForm } from "@/components/helpdesk/TicketForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function NewTicketPage({
    searchParams
}: {
    searchParams: { equipment?: string }
}) {
    const supabase = createClient()

    // Get current user id
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch equipment list for the dropdown
    const { data: equipmentList } = await supabase
        .from('equipment')
        .select('id, name, code')
        .eq('is_archived', false)
        .order('name')

    const preselectedEquipmentId = searchParams.equipment;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-6">
                <Link
                    href="/helpdesk"
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour aux tickets
                </Link>
            </div>

            <TicketForm
                equipmentList={equipmentList || []}
                userId={user?.id || ''}
                preselectedEquipmentId={preselectedEquipmentId}
            />
        </div>
    )
}
