'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loanSchema } from '@/lib/validators/loan.schema';
import { LoanFormValues } from '@/lib/types/loans';
import { calculateLoanTotal } from '@/lib/business-logic/loan-billing';

import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import { Plus, Trash2, CalendarIcon, X, Check, ChevronsUpDown } from 'lucide-react';
import { format, differenceInDays, parseISO, isValid } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
function EquipmentCombobox({ value, onChange, options, disabled = false }: {
    value: string;
    onChange: (val: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: any[];
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <FormControl>
                <PopoverTrigger
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        /* buttonVariants styles inline since we can't easily import buttonVariants without changing imports up top, wait, we can just import buttonVariants! Oh wait I forgot to import buttonVariants. Actually let's use the explicit classes from button.tsx: */
                        "inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
                        "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground h-8 px-2.5",
                        "w-full justify-between bg-white font-normal",
                        !value && "text-muted-foreground"
                    )}
                >
                    <span className="truncate">
                        {value
                            ? (() => {
                                const eq = options.find((e) => e.id === value);
                                return eq ? `${eq.code} - ${eq.name}` : "Sélection...";
                            })()
                            : "Sélectionnez un équipement disponible"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </PopoverTrigger>
            </FormControl>
            <PopoverContent className="w-[300px] md:w-[400px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Rechercher par code ou nom..." />
                    <CommandList className="bg-white max-h-[250px] overflow-y-auto">
                        <CommandEmpty>Aucun équipement trouvé.</CommandEmpty>
                        <CommandGroup>
                            {options.map((eq) => (
                                <CommandItem
                                    key={eq.id}
                                    value={`${eq.code} ${eq.name}`}
                                    onSelect={() => {
                                        onChange(eq.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 flex-shrink-0 h-4 w-4",
                                            eq.id === value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {eq.code} - {eq.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

interface LoanFormProps {
    prefillCode: string;
}

export function LoanForm({ prefillCode }: LoanFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialEquipmentId = searchParams.get('equipment');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [equipmentOptions, setEquipmentOptions] = useState<any[]>([]);

    useEffect(() => {
        const fetchEquipment = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('equipment')
                .select('id, name, code, rate_per_day, rate_per_week, rate_per_month')
                .eq('is_loanable', true)
                .order('code', { ascending: true });
            
            console.log('Client fetch equipment:', data, error);
            if (data) setEquipmentOptions(data);
        };
        fetchEquipment();
    }, []);

    const initialItem = {
        equipment_id: initialEquipmentId || '',
        quantity: 1,
        condition_before: 'NEUF',
        rate_per_day: null,
        rate_per_week: null,
        rate_per_month: null,
        subtotal: 0
    };

    const form = useForm<LoanFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(loanSchema) as any,
        defaultValues: {
            borrower_name: '',
            borrower_email: '',
            borrower_phone: '',
            borrower_type: 'internal',
            borrower_org: '',
            responsible_id: '',
            checkout_date: format(new Date(), 'yyyy-MM-dd'),
            expected_return: '',
            notes: '',
            items: [initialItem]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items'
    });

    const watchItems = form.watch('items');
    const watchCheckout = form.watch('checkout_date');
    const watchExpected = form.watch('expected_return');

    const [estimatedTotal, setEstimatedTotal] = useState(0);
    const [durationDays, setDurationDays] = useState(0);

    // Effect mapping equipment selection to their nested rate values
    useEffect(() => {
        const subscription = form.watch((value, { name, type }) => {
            if (name && name.startsWith('items.') && name.endsWith('.equipment_id') && type === 'change') {
                const indexMatch = name.match(/items\.(\d+)\.equipment_id/);
                if (indexMatch) {
                    const index = parseInt(indexMatch[1], 10);
                    const selectedId = value.items?.[index]?.equipment_id;
                    const eqp = equipmentOptions.find(e => e.id === selectedId);
                    if (eqp) {
                        form.setValue(`items.${index}.rate_per_day`, eqp.rate_per_day || 0);
                        form.setValue(`items.${index}.rate_per_week`, eqp.rate_per_week || 0);
                        form.setValue(`items.${index}.rate_per_month`, eqp.rate_per_month || 0);
                    }
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [form, equipmentOptions]);

    // Effect to calculate live billing duration and totals
    useEffect(() => {
        if (watchCheckout && watchExpected) {
            const start = parseISO(watchCheckout);
            const end = parseISO(watchExpected);

            if (isValid(start) && isValid(end) && end >= start) {
                const days = differenceInDays(end, start);
                setDurationDays(Math.max(1, days)); // Minimum billable day = 1

                // Calculate the true total based on rates

                const sum = calculateLoanTotal(watchCheckout, watchExpected, watchItems);
                setEstimatedTotal(sum);
            } else {
                setDurationDays(0);
                setEstimatedTotal(0);
            }
        }
    }, [watchCheckout, watchExpected, watchItems]);

    // Because the form values are slightly mismatched with database types, accept unknown
    const onSubmit = async (data: unknown) => {
        const validated = data as LoanFormValues;
        setIsSubmitting(true);
        const supabase = createClient();

        try {
            // Get session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Non autorisé");

            // Insert core loan record
            const { data: loan, error: loanErr } = await supabase
                .from('loans')
                .insert({
                    code: prefillCode, // Assigned from server
                    borrower_name: validated.borrower_name,
                    borrower_email: validated.borrower_email || null,
                    borrower_phone: validated.borrower_phone || null,
                    borrower_type: validated.borrower_type,
                    borrower_org: validated.borrower_org || null,
                    responsible_id: validated.responsible_id || null,
                    checkout_date: validated.checkout_date,
                    expected_return: validated.expected_return,
                    notes: validated.notes || null,
                    status: 'reserved',
                    total_amount: estimatedTotal,
                    created_by: session.user.id
                })
                .select()
                .single();

            if (loanErr) throw loanErr;

            // Insert loan items mapping
            const itemsToInsert = validated.items.map(item => ({
                loan_id: loan.id,
                equipment_id: item.equipment_id,
                quantity: item.quantity,
                condition_before: item.condition_before,
                subtotal: calculateLoanTotal(validated.checkout_date, validated.expected_return, [item]),
                rate_type: durationDays <= 7 ? 'day' : (durationDays <= 30 ? 'week' : 'month'),
                rate_applied: item.rate_per_day // Using base reference, real cost is in subtotal
            }));

            const { error: itemsErr } = await supabase
                .from('loan_items')
                .insert(itemsToInsert);

            if (itemsErr) throw itemsErr;

            // For reserved status, we explicitly do NOT change equipment status yet.
            // Equipment status changes to 'loaned' when the loan is explicitly moved to 'active' on the detail page.

            toast.success("Réservation créée avec succès");
            router.push(`/loans/${loan.id}`);
            router.refresh();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Erreur de sauvegarde:", error);
            toast.error("Erreur lors de la sauvegarde: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10 max-w-5xl">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">

                        {/* SECTION 1: Emprunteur */}
                        <Card>
                            <CardHeader>
                                <CardTitle>1. Informations de l&apos;emprunteur</CardTitle>
                                <CardDescription>Détails sur la personne ou l&apos;organisation empruntant le matériel.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="borrower_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nom complet *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Jean Dupont" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="borrower_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type d&apos;emprunteur *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionnez le type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-white max-h-[250px] overflow-y-auto">
                                                    <SelectItem value="internal">Interne (LabGFHA)</SelectItem>
                                                    <SelectItem value="external">Externe (Autre département/Université)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="borrower_email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="jean.dupont@email.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="borrower_phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Téléphone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+1 555-123-4567" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="borrower_org"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Organisation / Département</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Département de Physique" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="responsible_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Responsable interne (Garant)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nom du responsable interne" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* SECTION 2: Équipements empruntés */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <CardTitle>2. Équipements empruntés</CardTitle>
                                    <CardDescription>Liste des équipements concernés par ce prêt.</CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="hidden md:flex text-blue-600 border-blue-200 hover:bg-blue-50"
                                    onClick={() => append({ ...initialItem, equipment_id: '' })}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter un équipement
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-3 items-end p-4 bg-slate-50 border rounded-md relative">
                                        <div className="absolute top-2 right-2 md:hidden">
                                            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                                                <X className="h-4 w-4 text-slate-400" />
                                            </Button>
                                        </div>
                                        <div className="col-span-12 md:col-span-6">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.equipment_id`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-semibold">Équipement</FormLabel>
                                                        <EquipmentCombobox
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            options={equipmentOptions}
                                                        />
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-6 md:col-span-2">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.quantity`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-semibold">Qté</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min="1" className="bg-white" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-6 md:col-span-3">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.condition_before`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-semibold">État avant</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-white">
                                                                    <SelectValue placeholder="État" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="bg-white max-h-[250px] overflow-y-auto">
                                                                <SelectItem value="NEUF">Neuf</SelectItem>
                                                                <SelectItem value="TRES_BON">Très bon</SelectItem>
                                                                <SelectItem value="BON">Bon</SelectItem>
                                                                <SelectItem value="MOYEN">Moyen</SelectItem>
                                                                <SelectItem value="MAUVAIS">Mauvais</SelectItem>
                                                                <SelectItem value="HORS_SERVICE">Hors service</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="hidden md:block md:col-span-1 text-right">
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="w-full h-10 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full md:hidden mt-2 text-blue-600 border-blue-200"
                                    onClick={() => append({ ...initialItem, equipment_id: '' })}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter un équipement
                                </Button>

                            </CardContent>
                        </Card>

                        {/* SECTION 3: Période */}
                        <Card>
                            <CardHeader>
                                <CardTitle>3. Période & Notes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="checkout_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date de sortie prévue *</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="expected_return"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date de retour prévue *</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes supplémentaires</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Instructions spéciales, lieu d'utilisation, etc." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                    </div>


                    {/* SECTION 4: Récapitulatif estimé (SIDEBAR) */}
                    <div className="lg:col-span-1">
                        <Card className="bg-blue-50/50 border-blue-100 shadow-sm sticky top-6">
                            <CardHeader className="pb-3 border-b border-blue-100/50">
                                <CardTitle className="flex items-center text-blue-900">
                                    <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                                    Récapitulatif estimé
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600">Durée calculée:</span>
                                    <span className="font-semibold text-slate-900">{durationDays} jour(s)</span>
                                </div>

                                <div className="space-y-3">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Détails de facturation</span>
                                    {watchItems.length === 0 || !watchItems[0].equipment_id ? (
                                        <div className="text-sm text-slate-500 italic">Veuillez sélectionner des équipements</div>
                                    ) : (
                                        watchItems.map((item, idx) => {
                                            if (!item.equipment_id) return null;
                                            const eqp = equipmentOptions.find(e => e.id === item.equipment_id);
                                            const itemSub = durationDays > 0 ? calculateLoanTotal(watchCheckout, watchExpected, [item]) : 0;

                                            return (
                                                <div key={idx} className="flex justify-between text-sm py-1 border-b border-blue-100/50 last:border-0 pb-2">
                                                    <div className="truncate pr-2 w-2/3">
                                                        <span className="text-slate-700">{eqp?.name || 'Inconnu'}</span>
                                                        <div className="text-xs text-slate-400">Qté: {item.quantity}</div>
                                                    </div>
                                                    <div className="font-medium">{new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(itemSub)}</div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-blue-100/50 pt-4 flex-col gap-4">
                                <div className="w-full flex justify-between items-center bg-white p-3 rounded-md border border-blue-100 shadow-sm">
                                    <span className="font-semibold text-blue-900">Total estimé</span>
                                    <span className="text-lg font-bold text-blue-700">
                                        {new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(estimatedTotal)}
                                    </span>
                                </div>

                                <div className="w-full grid grid-cols-2 gap-2 mt-2">
                                    <Button type="button" variant="outline" onClick={() => router.back()}>
                                        Annuler
                                    </Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                                        {isSubmitting ? 'En cours...' : 'Enregistrer'}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    );
}
