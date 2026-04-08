import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { LoanDetail } from '@/components/loans/LoanDetail';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
    title: 'Détails Emprunt | LabGFHA',
};

export default async function LoanDetailPage({ params }: { params: { id: string } }) {
    const supabase = createClient();

    const { data: loan, error } = await supabase
        .from('loans')
        .select(`
            *,
            responsible:responsible_id(id, full_name),
            creator:created_by(id, full_name),
            loan_items(
                id,
                quantity,
                condition_before,
                condition_after,
                rate_type,
                rate_applied,
                subtotal,
                equipment_id,
                equipment(id, name, code)
            )
        `)
        .eq('id', params.id)
        .single();

    if (error || !loan) {
        console.error("Failed to load loan details:", error);
        notFound();
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-500">Chargement des détails...</div>}>
                <LoanDetail loan={loan} />
            </Suspense>
        </div>
    );
}
