import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoanTable } from '@/components/loans/LoanTable';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
    title: 'Gestion des Emprunts | LabGFHA',
    description: 'Suivi et facturation des emprunts de matériel du laboratoire.',
};

export default async function LoansPage() {
    const supabase = createClient();

    // Fetch all active, reserved, returned or overdue loans
    // Fetch loan items as an aggregate or simply as an array connection
    const { data: loans, error } = await supabase
        .from('loans')
        .select(`
            *
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching loans:', error);
    }

    // Now manually aggregate the count so we have loan_items property
    let enrichedLoans = [];
    if (loans) {
        // We will do a second query to get items count to simplify type complexity or just fetch them as items and map
        const loanIds = loans.map(l => l.id);
        const { data: items } = await supabase
            .from('loan_items')
            .select('loan_id')
            .in('loan_id', loanIds);

        enrichedLoans = loans.map(loan => {
            const itemCount = items?.filter(i => i.loan_id === loan.id).length || 0;
            return {
                ...loan,
                loan_items: [{ count: itemCount }] // Mock inner array simply to satisfy table visual without complex SQL RPC
            };
        });
    }


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Emprunts de matériel</h1>
                    <p className="text-slate-500 mt-1">Gérez les réservations, les retours et les factures.</p>
                </div>
                <Link href="/loans/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm transition-all duration-200">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouvel Emprunt
                    </Button>
                </Link>
            </div>

            <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-500">Chargement...</div>}>
                <LoanTable loans={enrichedLoans} />
            </Suspense>
        </div>
    );
}
