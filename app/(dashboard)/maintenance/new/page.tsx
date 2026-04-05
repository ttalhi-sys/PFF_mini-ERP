import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import WorkOrderForm from '@/components/maintenance/WorkOrderForm';
import { generateSequentialCode } from '@/lib/business-logic/code-generator';

export default async function NewWorkOrderPage({
    searchParams,
}: {
    searchParams: { equipment?: string };
}) {
    const supabase = createClient();

    // Fetch all equipment for the dropdown
    const { data: equipmentList } = await supabase
        .from('equipment')
        .select('id, name, code')
        .eq('status', 'available') // Could be any status really, but keeping it simple
        .order('name');

    // Fetch technicians for the assignment dropdown
    const { data: technicians } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'technician')
        .eq('is_active', true);

    // Generate the new WO code asynchronously
    const generatedCode = await generateSequentialCode(supabase, 'WO', 'work_orders');

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <Link href="/maintenance" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Retour aux ordres de travail
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Nouvel Ordre de Travail</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Renseignez les détails ci-dessous pour planifier une nouvelle intervention de maintenance.
                </p>
            </div>

            <WorkOrderForm
                equipmentList={equipmentList || []}
                technicians={technicians || []}
                initialEquipmentId={searchParams.equipment}
                generatedCode={generatedCode}
            />
        </div>
    );
}
