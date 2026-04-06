import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LoanForm } from '@/components/loans/LoanForm';
import { createClient } from '@/lib/supabase/server';
import { generateSequentialCode } from '@/lib/business-logic/code-generator';

export const metadata = {
    title: 'Nouvel Emprunt | LabGFHA',
    description: 'Enregistrer un nouvel emprunt de matériel.',
};

export default async function NewLoanPage() {
    const supabase = createClient();

    // 1. Equipments are fetched on the client side

    // 2. Profile Options are no longer needed as responsible_id is a free text input

    // 3. Generate sequential loan code format EMP-YYYY-001
    const nextCode = await generateSequentialCode(supabase, 'EMP', 'loans', 'code');

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/loans" className="text-slate-500 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nouvel Emprunt</h1>
                    <p className="text-slate-500 mt-1">Créez une nouvelle réservation de matériel avec facturation intégrée.</p>
                </div>
            </div>

            <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-500">Chargement...</div>}>
                <LoanForm
                    prefillCode={nextCode}
                />
            </Suspense>
        </div>
    );
}
