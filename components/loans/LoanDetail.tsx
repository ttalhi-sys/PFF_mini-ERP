'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    CheckCircle, XCircle, ArrowLeft, Download, FileText, AlertTriangle
} from 'lucide-react';
import { format, parseISO, isPast, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { ReturnModal } from './ReturnModal';
import { InvoiceTemplate } from './InvoiceTemplate';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface LoanDetailProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loan: any;
}

export function LoanDetail({ loan }: LoanDetailProps) {
    const router = useRouter();
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

    const isReserved = loan.status === 'reserved';
    const isReturned = loan.status === 'returned';


    // Compute if "active" loan is actually "overdue"
    const isOverdue = loan.status === 'active' && loan.expected_return && isPast(parseISO(loan.expected_return));
    const activeOrOverdue = loan.status === 'active' || isOverdue;

    const displayStatus = isOverdue ? 'overdue' : loan.status;

    const getStatusTheme = (status: string) => {
        switch (status) {
            case 'reserved': return { badge: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-200' };
            case 'active': return { badge: 'bg-blue-100 text-blue-800', border: 'border-blue-200' };
            case 'returned': return { badge: 'bg-green-100 text-green-800', border: 'border-green-200' };
            case 'overdue': return { badge: 'bg-red-100 text-red-800', border: 'border-red-200' };
            case 'cancelled': return { badge: 'bg-gray-100 text-gray-800', border: 'border-gray-200' };
            default: return { badge: 'bg-slate-100 text-slate-800', border: 'border-slate-200' };
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '—';
        return format(parseISO(dateString), 'dd MMM yyyy', { locale: fr });
    };

    const handleConfirmCheckout = async () => {
        setIsActionLoading(true);
        const supabase = createClient();

        try {
            // Update the loan status
            const today = new Date().toISOString();
            const { error: loanErr } = await supabase
                .from('loans')
                .update({
                    status: 'active',
                    checkout_date: today // Force precise starting point
                })
                .eq('id', loan.id);

            if (loanErr) throw loanErr;

            // Mark all items as 'PRETE' (loaned) in equipment table
            if (loan.loan_items) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const equipmentIds = loan.loan_items.map((i: any) => i.equipment_id);
                const payload = { status: 'PRETE' };
                console.log('Full equipment update payload:', payload);
                const { error: eqpErr } = await supabase
                    .from('equipment')
                    .update(payload)
                    .in('id', equipmentIds);

                if (eqpErr) throw eqpErr;
            }

            toast.success("Sortie confirmée", {
                description: "Le matériel est officiellement en location."
            });
            router.refresh();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Error checking out:", error);
            toast.error("Erreur lors de la confirmation: " + error.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCancelLoan = async () => {
        if (!confirm("Voulez-vous vraiment annuler cette réservation ?")) return;

        setIsActionLoading(true);
        const supabase = createClient();

        try {
            const { error: loanErr } = await supabase
                .from('loans')
                .update({ status: 'cancelled' })
                .eq('id', loan.id);

            if (loanErr) throw loanErr;

            // Restore all equipment back to 'EN_SERVICE'
            if (loan.loan_items) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const equipmentIds = loan.loan_items.map((i: any) => i.equipment_id);
                const payload = { status: 'EN_SERVICE' };
                console.log('Full equipment update payload:', payload);
                const { error: eqpErr } = await supabase
                    .from('equipment')
                    .update(payload)
                    .in('id', equipmentIds);

                if (eqpErr) throw eqpErr;
            }

            toast.success("Réservation annulée");
            router.refresh();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Error cancelling:", error);
            toast.error("Erreur lors de l'annulation: " + error.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('facture-section');
        if (!element) {
            toast.error("Section facture introuvable");
            return;
        }

        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Facture_${loan.invoice_code || loan.code}.pdf`);
        } catch (error) {
            console.error("Erreur lors de la génération du PDF:", error);
            toast.error("Erreur lors de la génération du PDF");
        }
    };

    return (
        <div className="space-y-6 pb-12 w-full max-w-6xl">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-lg border shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/loans" className="text-slate-500 hover:text-blue-600 flex items-center text-sm transition-colors">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Retour
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Emprunt <span className="text-blue-600 font-mono text-xl">{loan.code}</span></h1>
                        <Badge variant="outline" className={`${getStatusTheme(displayStatus).badge} border-transparent ml-2 uppercase tracking-wider text-xs font-bold`}>
                            {displayStatus === 'reserved' && 'RÉSERVÉ'}
                            {displayStatus === 'active' && 'ACTIF'}
                            {displayStatus === 'overdue' && 'EN RETARD'}
                            {displayStatus === 'returned' && 'RETOURNÉ'}
                            {displayStatus === 'cancelled' && 'ANNULÉ'}
                        </Badge>
                        <Badge variant="secondary" className={loan.borrower_type === 'internal' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}>
                            {loan.borrower_type === 'internal' ? 'Interne' : 'Externe'}
                        </Badge>
                    </div>
                    <p className="text-slate-500 mt-1">
                        Pour: <span className="font-medium text-slate-700">{loan.borrower_name}</span> {loan.borrower_org && `(${loan.borrower_org})`}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {/* Action buttons based on state */}
                    {isReserved && (
                        <>
                            <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={handleCancelLoan} disabled={isActionLoading}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Annuler
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleConfirmCheckout} disabled={isActionLoading}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirmer la sortie
                            </Button>
                        </>
                    )}

                    {activeOrOverdue && (
                        <Button
                            className={isOverdue ? "bg-red-600 text-white hover:bg-red-700 shadow-md animate-pulse" : "bg-green-600 hover:bg-green-700 text-white"}
                            onClick={() => setIsReturnModalOpen(true)}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Enregistrer le retour
                        </Button>
                    )}

                    {isReturned && loan.invoice_code && (
                        <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={handleDownloadPDF}>
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger Facture PDF
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column - Details */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="bg-slate-50 border-b pb-4">
                            <CardTitle className="text-lg flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-slate-500" />
                                Informations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4 text-sm">
                            <div>
                                <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">Coordonnées</h4>
                                <p className="font-medium text-slate-900">{loan.borrower_name}</p>
                                {loan.borrower_email && <p className="text-slate-600">{loan.borrower_email}</p>}
                                {loan.borrower_phone && <p className="text-slate-600">{loan.borrower_phone}</p>}
                            </div>

                            {loan.responsible_id && (
                                <div>
                                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">Garant (Interne)</h4>
                                    <p className="font-medium text-slate-700">{loan.responsible?.full_name || 'Inconnu'}</p>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-100">
                                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Chronologie</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Création</span>
                                        <span className="font-medium">{formatDate(loan.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Sortie</span>
                                        <span className="font-medium">{formatDate(loan.checkout_date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Retour Prévu</span>
                                        <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                                            {formatDate(loan.expected_return)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Retour Réel</span>
                                        <span className="font-medium">{formatDate(loan.actual_return)}</span>
                                    </div>
                                </div>
                            </div>

                            {isOverdue && loan.expected_return && (
                                <div className="mt-2 p-3 bg-red-50 text-red-800 rounded-md border border-red-100 flex items-start">
                                    <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                                    <div>
                                        <span className="font-semibold block">Retard constaté</span>
                                        <span>Dépassé de {differenceInDays(new Date(), parseISO(loan.expected_return))} jours.</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {loan.notes && (
                        <Card>
                            <CardHeader className="pb-3 border-b border-slate-100">
                                <CardTitle className="text-sm">Notes</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{loan.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Equipment Table & Invoice */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Équipements empruntés</CardTitle>
                            <CardDescription>
                                {loan.loan_items?.length || 0} article(s) dans cet emprunt.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Équipement</TableHead>
                                        <TableHead className="text-center">Qté</TableHead>
                                        <TableHead>État avant</TableHead>
                                        {isReturned && <TableHead>État après</TableHead>}
                                        <TableHead className="text-right">Tarif Période</TableHead>
                                        <TableHead className="text-right">S-Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {loan.loan_items?.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium text-slate-900">{item.equipment?.name || 'Inconnu'}</div>
                                                <div className="text-xs font-mono text-slate-500">{item.equipment?.code}</div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary">{item.quantity}</Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-600">{item.condition_before}</TableCell>

                                            {isReturned && (
                                                <TableCell className="text-slate-600 font-medium">
                                                    {item.condition_after || '—'}
                                                </TableCell>
                                            )}

                                            <TableCell className="text-right text-slate-600 text-sm">
                                                {item.rate_applied
                                                    ? `${item.rate_applied} $ / ${item.rate_type === 'day' ? 'j' : item.rate_type === 'week' ? 'sem' : 'mois'}`
                                                    : 'Inclus'
                                                }
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-slate-900">
                                                {new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(item.subtotal || 0)}
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    <TableRow className="bg-slate-50 border-t-2">
                                        <TableCell colSpan={isReturned ? 5 : 4} className="text-right font-bold text-slate-700">
                                            Sous-total
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-slate-900">
                                            {new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(loan.total_amount || 0)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="bg-slate-50">
                                        <TableCell colSpan={isReturned ? 5 : 4} className="text-right font-bold text-slate-700">
                                            TPS (5%)
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-slate-900">
                                            {new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format((loan.total_amount || 0) * 0.05)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="bg-slate-50">
                                        <TableCell colSpan={isReturned ? 5 : 4} className="text-right font-bold text-slate-700">
                                            TVQ (9,975%)
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-slate-900">
                                            {new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format((loan.total_amount || 0) * 0.09975)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="bg-slate-100 border-t-2">
                                        <TableCell colSpan={isReturned ? 5 : 4} className="text-right font-bold text-slate-900">
                                            Total estimé (TTC)
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-blue-700 text-lg">
                                            {new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format((loan.total_amount || 0) * 1.14975)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Visually stunning Invoice section if returned */}
                    {isReturned && loan.invoice_code && (
                        <div id="facture-section" className="mt-8 bg-white p-2 rounded-lg">
                            <InvoiceTemplate loan={loan} />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Components */}
            <ReturnModal
                isOpen={isReturnModalOpen}
                onClose={() => setIsReturnModalOpen(false)}
                loan={loan}
            />
        </div>
    );
}
