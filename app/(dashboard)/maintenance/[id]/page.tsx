import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import WorkOrderDetail from '@/components/maintenance/WorkOrderDetail';
import { WorkOrderWithRelations } from '@/lib/types/maintenance';

export default async function WorkOrderPage({ params }: { params: { id: string } }) {
    const supabase = createClient();

    // Fetch the specific work order with joins
    const { data, error } = await supabase
        .from('work_orders')
        .select(`
      *,
      equipment:equipment_id(id, name, code),
      assigned_user:profiles!work_orders_assigned_to_fkey(id, full_name, avatar_url),
      creator:profiles!work_orders_created_by_fkey(id, full_name)
    `)
        .eq('id', params.id)
        .single();

    if (error || !data) {
        console.error('Work order not found:', error);
        notFound();
    }

    return (
        <div className="p-6">
            <WorkOrderDetail workOrder={data as WorkOrderWithRelations} />
        </div>
    );
}
