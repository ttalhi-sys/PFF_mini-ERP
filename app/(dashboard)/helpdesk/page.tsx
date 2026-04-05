import { createClient } from "@/lib/supabase/server"
import { TicketTable } from "@/components/helpdesk/TicketTable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function HelpdeskPage() {
    const supabase = createClient()

    // Query tickets with profiles for submitter and assignee
    const { data: tickets, error } = await supabase
        .from('helpdesk_tickets')
        .select(`
            *,
            submitter:profiles!helpdesk_tickets_submitted_by_fkey(id, full_name, email),
            assignee:profiles!helpdesk_tickets_assigned_to_fkey(id, full_name, email)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching tickets:", error)
        return <div className="p-8 text-red-500">Erreur de chargement des tickets.</div>
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Tickets de support</h1>
                    <p className="text-gray-500 mt-1">{tickets?.length || 0} tickets enregistrés</p>
                </div>
                <Link href="/helpdesk/new">
                    <Button className="bg-[#135bec] hover:bg-[#135bec]/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau ticket
                    </Button>
                </Link>
            </div>

            <TicketTable tickets={tickets as any || []} />
        </div>
    )
}
