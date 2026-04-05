import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface InvoiceTemplateProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loan: any;
}

export function InvoiceTemplate({ loan }: InvoiceTemplateProps) {
    if (!loan || loan.status !== 'returned' || !loan.invoice_code) {
        return null;
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        return format(parseISO(dateString), 'dd MMMM yyyy', { locale: fr });
    };

    return (
        <div className="bg-white p-8 border rounded-lg shadow-sm w-full max-w-4xl mx-auto my-8">
            <div className="flex justify-between items-start border-b pb-6 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">FACTURE</h1>
                    <p className="text-slate-500 font-mono mt-1">{loan.invoice_code}</p>
                </div>
                <div className="text-right text-slate-600 text-sm">
                    <p className="font-bold text-slate-800">LabGFHA - Université</p>
                    <p>123 Avenue des Sciences</p>
                    <p>Département de Physique</p>
                    <p>contact@labgfha.edu</p>
                </div>
            </div>

            <div className="flex justify-between items-start mb-8">
                <div className="text-sm">
                    <p className="text-slate-500 font-semibold mb-1 uppercase text-xs tracking-wider">Facturé à :</p>
                    <p className="font-bold text-slate-800 text-lg">{loan.borrower_name}</p>
                    {loan.borrower_org && <p className="text-slate-600">{loan.borrower_org}</p>}
                    {loan.borrower_email && <p className="text-slate-600">{loan.borrower_email}</p>}
                    {loan.borrower_phone && <p className="text-slate-600">{loan.borrower_phone}</p>}
                </div>
                <div className="text-sm text-right">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <span className="text-slate-500">Date de facture :</span>
                        <span className="font-medium">{formatDate(loan.actual_return)}</span>

                        <span className="text-slate-500">Code d&apos;emprunt :</span>
                        <span className="font-mono">{loan.code}</span>

                        <span className="text-slate-500">Période :</span>
                        <span className="font-medium">
                            {formatDate(loan.checkout_date)} au {formatDate(loan.actual_return)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold border-y">
                        <tr>
                            <th className="py-3 px-4">Description de l&apos;équipement</th>
                            <th className="py-3 px-4 text-center">Qté</th>
                            <th className="py-3 px-4 text-center">Jours facturés</th>
                            <th className="py-3 px-4 text-right">Tarif Appliqué</th>
                            <th className="py-3 px-4 text-right">Montant partiel</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y border-b">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {loan.loan_items?.map((item: any) => (
                            <tr key={item.id}>
                                <td className="py-4 px-4">
                                    <p className="font-medium text-slate-900">{item.equipment?.name || 'Équipement inconnu'}</p>
                                    <p className="text-xs text-slate-500 font-mono">ID: {item.equipment?.code}</p>
                                </td>
                                <td className="py-4 px-4 text-center">{item.quantity}</td>
                                <td className="py-4 px-4 text-center">{item.days_billed || '-'}</td>
                                <td className="py-4 px-4 text-right text-slate-600">
                                    {item.rate_applied ? `${item.rate_applied} $ / ${item.rate_type === 'day' ? 'jour' : item.rate_type === 'week' ? 'semaine' : 'mois'}` : 'Inclus'}
                                </td>
                                <td className="py-4 px-4 text-right font-medium">
                                    {new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(item.subtotal || 0)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end pt-4 pb-8">
                <div className="w-1/2 p-4 bg-slate-50 rounded-lg border">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-600">Sous-total</span>
                        <span className="font-medium">{new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(loan.total_amount || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-600">Taxes (0%)</span>
                        <span className="font-medium">0,00 $</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                        <span className="text-lg font-bold text-slate-900">Total à payer</span>
                        <span className="text-2xl font-bold text-blue-700">
                            {new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(loan.total_amount || 0)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="text-center text-xs text-slate-500 mt-8 pt-8 border-t">
                <p>Merci de votre confiance. Les factures sont payables dans les 30 jours suivant leur réception.</p>
                <p className="mt-1">Pour toute question concernant cette facture, contactez le service comptabilité au +1 555-000-1111.</p>
            </div>
        </div>
    );
}
