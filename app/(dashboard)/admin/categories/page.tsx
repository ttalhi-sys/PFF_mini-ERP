import { createClient } from "@/lib/supabase/server"
import { CategoriesTable, CategoryWithCount } from "@/components/admin/CategoriesTable"

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
    const supabase = createClient()

    // Query categories and perform a left join to count equipment
    const { data: categoriesData, error } = await supabase
        .from('categories')
        .select(`
            id,
            name,
            description,
            icon,
            created_at,
            equipment!left(id)
        `)
        .order('name')

    if (error) {
        console.error("Error fetching categories:", error)
    }

    // Process the data to get the counts
    const categories: CategoryWithCount[] = (categoriesData || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        created_at: cat.created_at || new Date().toISOString(),
        // Check if the relation returned an array and count it
        equipment_count: Array.isArray(cat.equipment) ? cat.equipment.length : 0
    }))

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <CategoriesTable initialCategories={categories} />
        </div>
    )
}
