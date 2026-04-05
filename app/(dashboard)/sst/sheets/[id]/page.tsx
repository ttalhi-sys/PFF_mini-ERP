import { createClient } from "@/lib/supabase/server"
import { SSTSheetDetail } from "@/components/sst/SSTSheetDetail"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function SSTSheetDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    // Assuming the dynamic [id] is equipment_id since sst_sheets operates on equipment as the main entity
    // or it's simply the sst_sheets id. Usually, 1 equipment = 1 sheet, so we look up by equipment_id or sheet id.
    // The link from the grid passes sheet.equipment_id.

    // We try querying by sheet's ID first, if not found, we query by equipment_id just in case.
    const { data: sheetById, error: err1 } = await supabase
        .from('sst_sheets')
        .select(`
            *,
            equipment:equipment_id(id, code, name),
            reviewer:reviewed_by(id, full_name)
        `)
        .eq('equipment_id', params.id)
        .single()

    let sheet = sheetById

    if (!sheet) {
        // Fallback to checking by actual sheet UUID
        const { data: sheetByUUID } = await supabase
            .from('sst_sheets')
            .select(`
                *,
                equipment:equipment_id(id, code, name),
                reviewer:reviewed_by(id, full_name)
            `)
            .eq('id', params.id)
            .single()

        sheet = sheetByUUID
    }

    if (!sheet) {
        if (err1) console.error("Error fetching sheet:", err1)
        notFound()
    }

    return (
        <div className="flex-1 space-y-6 container mx-auto py-8">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <SSTSheetDetail sheet={sheet as any} />
        </div>
    )
}
