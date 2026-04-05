import { createClient } from "@/lib/supabase/server"
import { LocationsTable, LocationWithCount } from "@/components/admin/LocationsTable"

export const dynamic = 'force-dynamic'

export default async function AdminLocationsPage() {
    const supabase = createClient()

    // Query locations and perform a left join to count equipment
    const { data: locationsData, error } = await supabase
        .from('locations')
        .select(`
            id,
            name,
            description,
            building,
            floor,
            zone,
            room,
            created_at,
            equipment!left(id)
        `)
        .order('name')

    if (error) {
        console.error("Error fetching locations:", error)
    }

    // Process the data to get the counts
    const locations: LocationWithCount[] = (locationsData || []).map(loc => ({
        id: loc.id,
        name: loc.name,
        description: loc.description,
        building: loc.building,
        floor: loc.floor,
        zone: loc.zone,
        room: loc.room,
        created_at: loc.created_at || new Date().toISOString(),
        // Check if the relation returned an array and count it
        equipment_count: Array.isArray(loc.equipment) ? loc.equipment.length : 0
    }))

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <LocationsTable initialLocations={locations} />
        </div>
    )
}
