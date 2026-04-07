'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { generateSequentialCode } from '@/lib/business-logic/code-generator';

interface ReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loan: any;
}

export function ReturnModal({ isOpen, onClose, loan }: ReturnModalProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form states array. If items change, we need to map them
    const [conditions, setConditions] = useState<Record<string, string>>({});

    const handleConditionChange = (itemId: string, value: string) => {
        setConditions(prev => ({
            ...prev,
            [itemId]: value
        }));
    };

    const handleConfirmReturn = async () => {
        // Validate all items have a condition selected
        const items = loan.loan_items || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const missing = items.find((item: any) => !conditions[item.id]);

        if (missing) {
            toast.error("Veuillez sélectionner l'état de retour pour tous les équipements.");
            return;
        }

        setIsSubmitting(true);
        const supabase = createClient();

        try {
            // 1. Generate Invoice Code
            const invoiceCode = await generateSequentialCode(supabase, 'FACT', 'loans', 'invoice_code');

            // 2. Update Loan record
            const today = new Date().toISOString();
            const { error: loanErr } = await supabase
                .from('loans')
                .update({
                    status: 'returned',
                    actual_return: today,
                    invoice_code: invoiceCode
                })
                .eq('id', loan.id);

            if (loanErr) throw loanErr;

            // 3. Update all Loan Items concurrently and free up Equipment
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updates = items.map(async (item: any) => {
                const condition = conditions[item.id];

                // Update loan_item
                const { error: itemErr } = await supabase
                    .from('loan_items')
                    .update({ condition_after: condition })
                    .eq('id', item.id);

                if (itemErr) throw itemErr;

                // Update equipment back to available and update condition
                const { error: eqpErr } = await supabase
                    .from('equipment')
                    .update({
                        status: 'EN_SERVICE',
                        condition: condition // Reflect the reality back to the inventory
                    })
                    .eq('id', item.equipment_id);

                if (eqpErr) throw eqpErr;
            });

            await Promise.all(updates);

            toast.success("Retour enregistré avec succès", {
                description: `La facture ${invoiceCode} a été générée.`
            });
            onClose();
            router.refresh();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Erreur d'enregistrement du retour:", error);
            toast.error("Erreur: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!loan || !loan.loan_items) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Enregistrer le retour</DialogTitle>
                    <DialogDescription>
                        Évaluez l&apos;état de chaque équipement lors du retour. Cela mettra à jour l&apos;inventaire et finalisera l&apos;emprunt.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {loan.loan_items.map((item: any) => (
                        <div key={item.id} className="flex flex-col space-y-2 border-b pb-4 last:border-0">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-slate-800">
                                    {item.equipment?.name || item.equipment_id}
                                    <span className="ml-2 text-xs text-slate-500 font-mono">({item.equipment?.code})</span>
                                </span>
                                <Badge variant="outline" className="text-xs">
                                    Qté: {item.quantity}
                                </Badge>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-sm text-slate-500 w-1/3">
                                    État départ: <span className="font-semibold text-slate-700">{item.condition_before}</span>
                                </div>
                                <div className="flex-1">
                                    <Select
                                        value={conditions[item.id] || ''}
                                        onValueChange={(val) => handleConditionChange(item.id as string, val as string)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner l'état de retour" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white max-h-[250px] overflow-y-auto">
                                            <SelectItem value="Neuf">Neuf</SelectItem>
                                            <SelectItem value="Bon">Bon</SelectItem>
                                            <SelectItem value="Passable">Passable</SelectItem>
                                            <SelectItem value="Endommagé">Endommagé (Signalé)</SelectItem>
                                            <SelectItem value="Perdu">Perdu</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Annuler
                    </Button>
                    <Button onClick={handleConfirmReturn} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                        {isSubmitting ? 'Traitement...' : 'Confirmer le retour'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Ensure Badge is imported (adding locally here since we used it above)
import { Badge } from '@/components/ui/badge';
