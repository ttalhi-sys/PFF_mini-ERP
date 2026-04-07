"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { sheetFormSchema, SheetFormValues } from "@/lib/validators/sheet.schema"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { EquipmentRow } from "@/lib/types/equipment"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SSTSheetFormProps {
    equipments: EquipmentRow[]
    initialData?: SheetFormValues | null
    onSubmit: (data: SheetFormValues) => Promise<void>
    onCancel: () => void
    isSubmitting?: boolean
}

function EquipmentCombobox({ value, onChange, options, disabled = false }: {
    value: string;
    onChange: (val: string) => void;
    options: EquipmentRow[];
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                role="combobox"
                aria-expanded={open}
                disabled={disabled}
                className={cn(
                    "inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
                    "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground h-10 px-3 py-2",
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
                        : "Sélectionner un équipement..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
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

export function SSTSheetForm({ equipments, initialData, onSubmit, onCancel, isSubmitting = false }: SSTSheetFormProps) {
    const form = useForm<SheetFormValues>({
        resolver: zodResolver(sheetFormSchema),
        defaultValues: initialData || {
            equipment_id: "",
            danger_category: "",
            main_risks: "",
            prevention_measures: "",
            required_ppe: "",
            warnings: "",
            prohibited_actions: "",
            lockout_procedure: "",
            sop_reference: "",
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Informations Générales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="equipment_id"
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>Équipement concerné *</FormLabel>
                                    <FormControl>
                                        <EquipmentCombobox
                                            value={field.value}
                                            onChange={field.onChange}
                                            options={equipments}
                                            disabled={!!initialData} // Lock if editing
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="danger_category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Catégorie de danger</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Mécanique/Pneumatique" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Risques et Mesures</h3>
                    
                    <FormField
                        control={form.control}
                        name="main_risks"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Risques principaux</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Séparés par des retours à la ligne" className="min-h-24" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="prevention_measures"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mesures de prévention</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Séparées par des retours à la ligne" className="min-h-24" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="required_ppe"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>EPI Requis</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Lunettes, Gants de protection" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Procédures et Avertissements</h3>

                    <FormField
                        control={form.control}
                        name="warnings"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Avertissements Spéciaux</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Précautions particulières..." className="min-h-24" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="prohibited_actions"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Actions Strictement Interdites</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Séparées par des retours à la ligne" className="min-h-24" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="lockout_procedure"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Procédure de cadenassage</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Détaillez la procédure de cadenassage..." className="min-h-24" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="sop_reference"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Référence SOP</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: SOP-MEC-001" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex gap-4 justify-end pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        Annuler
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                        {isSubmitting ? "Enregistrement..." : (initialData ? "Modifier la fiche" : "Créer la fiche")}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
