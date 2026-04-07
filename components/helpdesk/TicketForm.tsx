"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ticketFormSchema, TicketFormValues } from "@/lib/validators/ticket.schema"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { EquipmentRow } from "@/lib/types/equipment"
import { generateSequentialCode } from "@/lib/business-logic/code-generator"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface TicketFormProps {
    equipmentList: Pick<EquipmentRow, 'id' | 'name' | 'code'>[]
    userId: string
    preselectedEquipmentId?: string
}

function EquipmentCombobox({ value, onChange, options, disabled = false }: {
    value: string;
    onChange: (val: string) => void;
    options: Pick<EquipmentRow, 'id' | 'name' | 'code'>[];
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
                        : "Sélectionnez un équipement s'il y a lieu"}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-[300px] md:w-[400px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Rechercher par code ou nom..." />
                    <CommandList className="bg-white max-h-[250px] overflow-y-auto">
                        <CommandEmpty>Aucun équipement trouvé.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="none"
                                onSelect={() => {
                                    onChange("");
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 flex-shrink-0 h-4 w-4",
                                        !value || value === "none" ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <span className="italic text-muted-foreground">Aucun équipement lié</span>
                            </CommandItem>
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

export function TicketForm({ equipmentList, userId, preselectedEquipmentId }: TicketFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const supabase = createClient()

    const form = useForm<TicketFormValues>({
        resolver: zodResolver(ticketFormSchema),
        defaultValues: {
            title: "",
            description: "",
            category: "Problème d'équipement",
            priority: "Moyenne",
            equipment_id: preselectedEquipmentId || "",
        },
    })

    const onSubmit = async (data: TicketFormValues) => {
        try {
            setIsSubmitting(true)

            // 1. Generate unique ticket code
            const code = await generateSequentialCode(supabase, 'TKT', 'helpdesk_tickets', 'code')

            // 2. Insert into database
            const { error } = await supabase
                .from('helpdesk_tickets')
                .insert({
                    code,
                    title: data.title,
                    description: data.description,
                    category: data.category,
                    priority: data.priority,
                    equipment_id: data.equipment_id || null,
                    submitted_by: userId,
                    status: 'OUVERT'
                })

            if (error) throw error

            toast.success("Ticket créé avec succès")
            router.push('/helpdesk')
            router.refresh()

        } catch (error) {
            console.error("Error creating ticket:", error)
            toast.error("Erreur lors de la création du ticket")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="max-w-3xl mx-auto shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6 rounded-t-xl">
                <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-xl text-slate-800">Nouveau ticket de support</CardTitle>
                </div>
                <CardDescription className="text-slate-500">
                    Veuillez décrire votre problème ou votre demande avec autant de détails que possible pour faciliter sa résolution.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Catégorie *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionnez une catégorie" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-white max-h-[250px] overflow-y-auto">
                                                    <SelectItem value="Problème d'équipement">Problème d'équipement</SelectItem>
                                                    <SelectItem value="Demande de maintenance">Demande de maintenance</SelectItem>
                                                    <SelectItem value="Problème de sécurité">Problème de sécurité</SelectItem>
                                                    <SelectItem value="Demande générale">Demande générale</SelectItem>
                                                    <SelectItem value="Demande d'accès">Demande d'accès</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Priorité *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionnez une priorité" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-white max-h-[250px] overflow-y-auto">
                                                    <SelectItem value="Basse">Basse (Non urgent)</SelectItem>
                                                    <SelectItem value="Moyenne">Moyenne (Standard)</SelectItem>
                                                    <SelectItem value="Haute">Haute (Impact significatif)</SelectItem>
                                                    <SelectItem value="Critique">Critique (Bloquant)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="equipment_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Équipement concerné (Optionnel)</FormLabel>
                                        <FormControl>
                                            <EquipmentCombobox
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                                options={equipmentList}
                                            />
                                        </FormControl>
                                        <FormDescription>Si ce ticket concerne un équipement spécifique, veuillez le sélectionner.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Titre (Sujet résumé) *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Panne du tour conventionnel..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description détaillée *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Décrivez les symptômes, les messages d'erreur et ce que vous faisiez au moment du problème..."
                                                className="min-h-[150px] resize-y"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                                Annuler
                            </Button>
                            <Button type="submit" className="bg-[#135bec] hover:bg-[#135bec]/90 text-white" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Soumission...
                                    </>
                                ) : (
                                    "Créer le ticket"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
