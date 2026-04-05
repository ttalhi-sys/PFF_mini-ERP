import { createClient } from "@/lib/supabase/server"
import { TicketDetail } from "@/components/helpdesk/TicketDetail"
import { ArrowLeft, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function TicketPage({ params }: { params: { id: string } }) {
    const supabase = createClient()

    const { data: ticket, error } = await supabase
        .from('helpdesk_tickets')
        .select(`
            *,
            submitter:profiles!helpdesk_tickets_submitted_by_fkey(id, full_name, email),
            assignee:profiles!helpdesk_tickets_assigned_to_fkey(id, full_name, email),
            equipment:equipment!helpdesk_tickets_equipment_id_fkey(id, name, code)
        `)
        .eq('id', params.id)
        .single()

    if (error || !ticket) {
        return (
            <div className="flex-1 space-y-6 container mx-auto py-8 text-center mt-20">
                <ShieldAlert className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Ticket introuvable</h2>
                <p className="text-gray-500 mb-6">Ce ticket n&apos;existe pas ou a été supprimé.</p>
                <Link href="/helpdesk">
                    <Button variant="outline">
                        Retour au helpdesk
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-6">
                <Link
                    href="/helpdesk"
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour aux tickets
                </Link>
            </div>

            <TicketDetail ticket={ticket as any} />
        </div>
    )
}
