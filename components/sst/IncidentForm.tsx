"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { incidentFormSchema, IncidentFormValues } from "@/lib/validators/incident.schema"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { EquipmentRow } from "@/lib/types/equipment"
import { UploadCloud, AlertCircle, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface IncidentFormProps {
    equipments: EquipmentRow[]
    onSubmit: (data: IncidentFormValues) => Promise<void>
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
                        : "Tous les équipements (Aucun)"}
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
                                value="aucun"
                                onSelect={() => {
                                    onChange("");
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 flex-shrink-0 h-4 w-4",
                                        !value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                Aucun équipement lié
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

export function IncidentForm({ equipments, onSubmit, onCancel, isSubmitting = false }: IncidentFormProps) {
    const defaultDate = new Date()
    defaultDate.setMinutes(defaultDate.getMinutes() - defaultDate.getTimezoneOffset())
    const defaultDateString = defaultDate.toISOString().slice(0, 16)

    const form = useForm<IncidentFormValues>({
        resolver: zodResolver(incidentFormSchema),
        defaultValues: {
            equipment_id: "",
            incident_type: "INCIDENT",
            severity: "MOYENNE",
            incident_date: defaultDateString,
            location: "",
            description: "",
            immediate_measures: "",
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                        1. Informations générales
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="incident_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type d'événement *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez le type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white max-h-[250px] overflow-y-auto">
                                            <SelectItem value="INCIDENT">Incident</SelectItem>
                                            <SelectItem value="QUASI_INCIDENT">Quasi-incident (Near Miss)</SelectItem>
                                            <SelectItem value="OBSERVATION">Observation / Danger</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="severity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sévérité *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez la sévérité" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white max-h-[250px] overflow-y-auto">
                                            <SelectItem value="ELEVEE">
                                                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-orange-500 mr-2" /> Élevée</div>
                                            </SelectItem>
                                            <SelectItem value="MOYENNE">
                                                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" /> Moyenne</div>
                                            </SelectItem>
                                            <SelectItem value="FAIBLE">
                                                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-gray-500 mr-2" /> Faible</div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="incident_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date et heure *</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="equipment_id"
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>Équipement impliqué (Optionnel)</FormLabel>
                                    <FormControl>
                                        <EquipmentCombobox
                                            value={field.value}
                                            onChange={field.onChange}
                                            options={equipments}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Lieu exact (Optionnel)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Local, poste de travail..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">2. Description des faits</h3>

                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description détaillée *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Que s'est-il passé précisément ?"
                                            className="min-h-32"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Décrivez les événements de manière objective (minimum 10 caractères).
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="immediate_measures"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mesures immédiates prises (Optionnel)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Quelles actions ont été prises immédiatement après l'incident ?"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">3. Preuves et fichiers joints</h3>

                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                        <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="text-sm font-medium text-gray-700">Cliquez ou glissez des fichiers ici</p>
                        <p className="text-xs text-gray-500 mt-1">Photos, rapports de police, témoignages (JPG, PNG, PDF)</p>
                        <div className="mt-4 text-xs italic text-gray-400">
                            (Fonctionnalité d'upload en attente d'intégration bucket)
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 justify-end pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        Annuler
                    </Button>
                    <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={isSubmitting}>
                        {isSubmitting ? "Enregistrement..." : "Soumettre l'incident"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
