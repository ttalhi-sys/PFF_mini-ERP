'use client';

import { useRouter } from 'next/navigation';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, FileText, CheckCircle, XCircle, ArrowLeftRight } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LoanTableProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loans: any[]; // Replacing this with specific types shortly, using any for initial stub
}

export function LoanTable({ loans }: LoanTableProps) {
    const router = useRouter();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'reserved': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'returned': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'reserved': return 'Réservé';
            case 'active': return 'Actif';
            case 'returned': return 'Retourné';
            case 'cancelled': return 'Annulé';
            case 'overdue': return 'En retard';
            default: return status;
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        return format(parseISO(dateStr), 'dd MMM yyyy', { locale: fr });
    };

    return (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead>CODE</TableHead>
                        <TableHead>EMPRUNTEUR</TableHead>
                        <TableHead>TYPE</TableHead>
                        <TableHead>ÉQUIPEMENTS</TableHead>
                        <TableHead>DATE DE SORTIE</TableHead>
                        <TableHead>RETOUR PRÉVU</TableHead>
                        <TableHead>RETOUR RÉEL</TableHead>
                        <TableHead>STATUT</TableHead>
                        <TableHead>MONTANT</TableHead>
                        <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loans.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={10} className="text-center py-10 text-slate-500">
                                <ArrowLeftRight className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                                <p>Aucun emprunt trouvé.</p>
                            </TableCell>
                        </TableRow>
                    ) : (
                        loans.map((loan) => {
                            // Determine computed status if active and overdue
                            let displayStatus = loan.status;
                            const isOverdue = displayStatus === 'active' && loan.expected_return && isPast(parseISO(loan.expected_return));
                            if (isOverdue) displayStatus = 'overdue';

                            return (
                                <TableRow
                                    key={loan.id}
                                    className={`cursor-pointer hover:bg-slate-50 transition-colors ${isOverdue ? 'bg-red-50/30 border-l-4 border-l-red-500' : 'border-l-4 border-l-transparent'}`}
                                    onClick={() => router.push(`/loans/${loan.id}`)}
                                >
                                    <TableCell className="font-mono text-blue-600 font-medium">
                                        {loan.code}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-slate-900">{loan.borrower_name}</div>
                                        {loan.borrower_org && <div className="text-xs text-slate-500">{loan.borrower_org}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={loan.borrower_type === 'internal' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}>
                                            {loan.borrower_type === 'internal' ? 'Interne' : 'Externe'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{loan.loan_items?.[0]?.count || 0}</Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {formatDate(loan.checkout_date)}
                                    </TableCell>
                                    <TableCell className={isOverdue ? 'text-red-600 font-medium font-semibold' : 'text-slate-600'}>
                                        {formatDate(loan.expected_return)}
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {formatDate(loan.actual_return)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`${getStatusColor(displayStatus)} border`} variant="outline">
                                            {getStatusText(displayStatus)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {loan.total_amount ? new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(loan.total_amount) : '0,00 $'}
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="h-8 w-8 p-0 hover:bg-slate-100 rounded-md inline-flex items-center justify-center">
                                                <span className="sr-only">Ouvrir le menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => router.push(`/loans/${loan.id}`)}>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Voir les détails
                                                </DropdownMenuItem>
                                                {/* TODO: Implémenter les actions rapides du tableau */}
                                                {/* {(displayStatus === 'active' || displayStatus === 'overdue') && (
                                                    <DropdownMenuItem onClick={() => router.push(`/loans/${loan.id}?action=return`)}>
                                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                        Enregistrer retour
                                                    </DropdownMenuItem>
                                                )}
                                                {displayStatus === 'returned' && (
                                                    <DropdownMenuItem onClick={() => router.push(`/loans/${loan.id}?action=invoice`)}>
                                                        <FileText className="mr-2 h-4 w-4 text-blue-600" />
                                                        Générer facture
                                                    </DropdownMenuItem>
                                                )}
                                                {displayStatus === 'reserved' && (
                                                    <DropdownMenuItem className="text-red-600" onClick={() => console.log('Cancel loan')}>
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Annuler
                                                    </DropdownMenuItem>
                                                )} */}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
