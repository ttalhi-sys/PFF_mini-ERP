import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { WorkOrderWithRelations } from '@/lib/types/maintenance';
import WorkOrderTable from '@/components/maintenance/WorkOrderTable';
import WorkOrderKanban from '@/components/maintenance/WorkOrderKanban';

export default async function MaintenancePage({
    searchParams,
}: {
    searchParams: { view?: string };
}) {
    const supabase = createClient();
    const currentView = searchParams.view === 'kanban' ? 'kanban' : 'table';

    // Fetch work orders joined with equipment and assigned_user profiles
    const { data: workOrders, error } = await supabase
        .from('work_orders')
        .select(`
      *,
      equipment:equipment_id(id, name, code),
      assigned_user:profiles!work_orders_assigned_to_fkey(id, full_name, avatar_url),
      creator:profiles!work_orders_created_by_fkey(id, full_name)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching work orders:', error);
    }

    const data = (workOrders || []) as WorkOrderWithRelations[];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ordres de travail</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {data.length} ordre{data.length !== 1 ? 's' : ''} au total
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* View Toggles */}
                    <div className="bg-gray-100 p-1 rounded-md flex">
                        <Link
                            href="/maintenance?view=table"
                            className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${currentView === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Tableau
                        </Link>
                        <Link
                            href="/maintenance?view=kanban"
                            className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${currentView === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Kanban
                        </Link>
                        <Link
                            href="/maintenance/calendar"
                            className="px-3 py-1.5 text-sm font-medium text-gray-500 rounded-sm hover:text-gray-900 transition-colors"
                        >
                            Calendrier
                        </Link>
                    </div>

                    <Link
                        href="/maintenance/new"
                        className="inline-flex items-center justify-center bg-blue-600 text-white font-medium text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Nouvel ordre
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            {currentView === 'kanban' ? (
                <WorkOrderKanban data={data} />
            ) : (
                <WorkOrderTable data={data} />
            )}
        </div>
    );
}
