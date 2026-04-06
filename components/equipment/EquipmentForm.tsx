"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { equipmentSchema, EquipmentFormValues } from "@/lib/validators/equipment.schema"
import { CategoryRow, LocationRow, EquipmentRow } from "@/lib/types/equipment"

export function EquipmentForm({
    initialData,
    categories,
    locations,
}: {
    initialData?: EquipmentRow | null
    categories: Pick<CategoryRow, "id" | "name">[]
    locations: Pick<LocationRow, "id" | "name">[]
}) {
    const router = useRouter()
    const supabase = createClient()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const isEditMode = !!initialData

    const form = useForm({
        resolver: zodResolver(equipmentSchema),
        defaultValues: {
            code: initialData?.code || "",
            name: initialData?.name || "",
            category_id: initialData?.category_id || "",
            manufacturer: initialData?.manufacturer || "",
            model: initialData?.model || "",
            serial_number: initialData?.serial_number || "",
            quantity: initialData?.quantity || 1,
            unit: (initialData?.unit as "UNITE" | "KIT" | "ENSEMBLE" | "LOT" | "POSTE") || "UNITE",
            location_id: initialData?.location_id || undefined,
            description: initialData?.description || "",
            specifications: initialData?.specifications ? JSON.stringify(initialData.specifications) : "",
            condition: (initialData?.condition as "NEUF" | "TRES_BON" | "BON" | "MOYEN" | "MAUVAIS" | "HORS_SERVICE") || "BON",
            status: (initialData?.status as "EN_SERVICE" | "EN_STOCK" | "RESERVE" | "EN_MAINTENANCE" | "PRETE" | "HORS_SERVICE" | "MIS_AU_REBUT" | "A_VALIDER") || "EN_SERVICE",
            acquisition_date: initialData?.acquisition_date || undefined,
            acquisition_cost: initialData?.acquisition_cost || undefined,
            estimated_value: initialData?.estimated_value || undefined,
            funding_source: initialData?.funding_source || "",
            owner: initialData?.owner || "ÉTS",
            is_loanable: initialData?.is_loanable || false,
            rate_per_day: initialData?.rate_per_day || undefined,
            rate_per_week: initialData?.rate_per_week || undefined,
            rate_per_month: initialData?.rate_per_month || undefined,
            loan_conditions: initialData?.loan_conditions || "",
            criticality: (initialData?.criticality as "FAIBLE" | "MOYENNE" | "ELEVEE") || "MOYENNE",
            tags: initialData?.tags || [],
            notes: initialData?.notes || "",
        },
    })

    const { register, handleSubmit, watch, formState: { errors } } = form
    const isLoanable = watch("is_loanable")

    const onSubmit = async (data: unknown) => {
        const values = data as EquipmentFormValues;
        setIsSubmitting(true)
        setErrorMsg(null)

        try {
            // Parse JSON
            let specsJson = null
            if (values.specifications) {
                try {
                    specsJson = JSON.parse(values.specifications)
                } catch {
                    // If not valid JSON, save as flat text
                    specsJson = { "Texte": values.specifications }
                }
            }

            const payload = {
                code: values.code,
                name: values.name,
                category_id: values.category_id && values.category_id !== '' ? values.category_id : null,
                manufacturer: values.manufacturer || null,
                model: values.model || null,
                serial_number: values.serial_number || null,
                quantity: values.quantity,
                unit: values.unit,
                location_id: values.location_id && values.location_id !== '' ? values.location_id : null,
                description: values.description || null,
                specifications: specsJson,
                condition: values.condition,
                status: values.status,
                acquisition_date: values.acquisition_date || null,
                acquisition_cost: values.acquisition_cost || null,
                estimated_value: values.estimated_value || null,
                funding_source: values.funding_source || null,
                owner: values.owner || null,
                is_loanable: values.is_loanable,
                rate_per_day: values.rate_per_day || null,
                rate_per_week: values.rate_per_week || null,
                rate_per_month: values.rate_per_month || null,
                loan_conditions: values.loan_conditions || null,
                notes: values.notes || null,
                ...(values.criticality ? { criticality: values.criticality } : {}),
                ...(values.tags && values.tags.length > 0 ? { tags: values.tags } : {}),
            }

            if (isEditMode) {
                const { error } = await supabase.from("equipment").update(payload).eq("id", initialData.id)
                if (error) {
                    console.error('UPDATE error:', error)
                    throw error
                }
                router.push(`/equipment/${initialData.id}`)
            } else {
                const { data, error } = await supabase.from("equipment").insert(payload).select("id").single()
                if (error) {
                    console.error('INSERT error:', error)
                    throw error
                }
                router.push(`/equipment/${data.id}`)
            }

            router.refresh()
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Une erreur est survenue")
            setIsSubmitting(false)
        }
    }

    // Common UI field wrapper
    const FieldWrapper = ({ label, error, children, required }: { label: string, error?: { message?: string }, children: React.ReactNode, required?: boolean }) => (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <span className="text-xs text-red-500 mt-1">{error.message}</span>}
        </div>
    )

    const inputClass = "w-full py-2 px-3 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 max-w-4xl mx-auto pb-12">

            {errorMsg && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    {errorMsg}
                </div>
            )}

            {/* 1. Identification */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">1. Identification</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldWrapper label="Code d'équipement" error={errors.code} required>
                        <input {...register("code")} placeholder="EQP-000001" className={inputClass} />
                    </FieldWrapper>

                    <FieldWrapper label="Nom de l'équipement" error={errors.name} required>
                        <input {...register("name")} placeholder="Nom" className={inputClass} />
                    </FieldWrapper>

                    <FieldWrapper label="Catégorie" error={errors.category_id}>
                        <select {...register("category_id")} className={inputClass}>
                            <option value="">Sélectionner une catégorie</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </FieldWrapper>

                    <div className="grid grid-cols-2 gap-4">
                        <FieldWrapper label="Quantité" error={errors.quantity}>
                            <input type="number" {...register("quantity")} className={inputClass} />
                        </FieldWrapper>
                        <FieldWrapper label="Unité" error={errors.unit}>
                            <select {...register("unit")} className={inputClass}>
                                <option value="UNITE">Unité</option>
                                <option value="KIT">Kit</option>
                                <option value="ENSEMBLE">Ensemble</option>
                                <option value="LOT">Lot</option>
                                <option value="POSTE">Poste</option>
                            </select>
                        </FieldWrapper>
                    </div>

                    <FieldWrapper label="Fabricant" error={errors.manufacturer}>
                        <input {...register("manufacturer")} className={inputClass} />
                    </FieldWrapper>

                    <FieldWrapper label="Modèle" error={errors.model}>
                        <input {...register("model")} className={inputClass} />
                    </FieldWrapper>

                    <FieldWrapper label="Numéro de série" error={errors.serial_number}>
                        <input {...register("serial_number")} className={inputClass} />
                    </FieldWrapper>
                </div>
            </div>

            {/* 2. Localisation et état */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">2. Localisation et état</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldWrapper label="Localisation" error={errors.location_id}>
                        <select {...register("location_id")} className={inputClass}>
                            <option value="">Sélectionner une localisation</option>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </FieldWrapper>

                    <FieldWrapper label="Propriétaire" error={errors.owner}>
                        <input {...register("owner")} className={inputClass} />
                    </FieldWrapper>

                    <FieldWrapper label="Condition de base" error={errors.condition}>
                        <select {...register("condition")} className={inputClass}>
                            <option value="NEUF">Neuf</option>
                            <option value="TRES_BON">Très bon</option>
                            <option value="BON">Bon</option>
                            <option value="MOYEN">Moyen</option>
                            <option value="MAUVAIS">Mauvais</option>
                            <option value="HORS_SERVICE">Hors service</option>
                        </select>
                    </FieldWrapper>

                    <FieldWrapper label="Statut" error={errors.status}>
                        <select {...register("status")} className={inputClass}>
                            <option value="EN_SERVICE">En service</option>
                            <option value="EN_STOCK">En stock</option>
                            <option value="RESERVE">Réservé</option>
                            <option value="EN_MAINTENANCE">En maintenance</option>
                            <option value="PRETE">Prêté</option>
                            <option value="HORS_SERVICE">Hors service</option>
                            <option value="MIS_AU_REBUT">Mis au rebut</option>
                            <option value="A_VALIDER">À valider</option>
                        </select>
                    </FieldWrapper>

                    <FieldWrapper label="Criticité" error={errors.criticality}>
                        <select {...register("criticality")} className={inputClass}>
                            <option value="ELEVEE">Élevée</option>
                            <option value="MOYENNE">Moyenne</option>
                            <option value="FAIBLE">Faible</option>
                        </select>
                    </FieldWrapper>
                </div>
            </div>

            {/* 3. Acquisition et valeur */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">3. Acquisition et valeur</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldWrapper label="Date d'acquisition" error={errors.acquisition_date}>
                        <input type="date" {...register("acquisition_date")} className={inputClass} />
                    </FieldWrapper>

                    <FieldWrapper label="Source de financement" error={errors.funding_source}>
                        <input {...register("funding_source")} className={inputClass} />
                    </FieldWrapper>

                    <FieldWrapper label="Coût d'acquisition ($)" error={errors.acquisition_cost}>
                        <input type="number" step="0.01" {...register("acquisition_cost")} className={inputClass} />
                    </FieldWrapper>

                    <FieldWrapper label="Valeur estimée ($)" error={errors.estimated_value}>
                        <input type="number" step="0.01" {...register("estimated_value")} className={inputClass} />
                    </FieldWrapper>
                </div>
            </div>

            {/* 4. Tarification */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                    4. Tarification et Emprunt
                    <label className="ml-4 flex items-center gap-2 text-sm font-normal cursor-pointer">
                        <input type="checkbox" {...register("is_loanable")} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
                        Équipement louable
                    </label>
                </h2>

                {isLoanable && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        <FieldWrapper label="Tarif par jour ($)" error={errors.rate_per_day}>
                            <input type="number" step="0.01" {...register("rate_per_day")} className={inputClass} />
                        </FieldWrapper>
                        <FieldWrapper label="Tarif par semaine ($)" error={errors.rate_per_week}>
                            <input type="number" step="0.01" {...register("rate_per_week")} className={inputClass} />
                        </FieldWrapper>
                        <FieldWrapper label="Tarif par mois ($)" error={errors.rate_per_month}>
                            <input type="number" step="0.01" {...register("rate_per_month")} className={inputClass} />
                        </FieldWrapper>
                        <div className="md:col-span-3">
                            <FieldWrapper label="Conditions d'emprunt" error={errors.loan_conditions}>
                                <textarea {...register("loan_conditions")} rows={2} className={`${inputClass} resize-none`} placeholder="Conditions spécifiques pour la location..." />
                            </FieldWrapper>
                        </div>
                    </div>
                )}
            </div>

            {/* 5. Description */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">5. Description et notes</h2>

                <div className="flex flex-col gap-6">
                    <FieldWrapper label="Description" error={errors.description}>
                        <textarea {...register("description")} rows={3} className={`${inputClass} resize-none`} />
                    </FieldWrapper>

                    <FieldWrapper label="Spécifications (JSON ou texte)" error={errors.specifications}>
                        <textarea {...register("specifications")} rows={3} className={`${inputClass} resize-none font-mono text-xs`} placeholder='{"Puissance": "1200W", "Poids": "2.4kg"}' />
                    </FieldWrapper>

                    <FieldWrapper label="Notes internes" error={errors.notes}>
                        <textarea {...register("notes")} rows={2} className={`${inputClass} resize-none`} />
                    </FieldWrapper>
                </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 sticky bottom-6 z-10 bg-gray-50/80 backdrop-blur-[2px] p-4 rounded-lg border border-gray-200 shadow-sm">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-[#1E40AF] text-white rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50"
                >
                    {isSubmitting ? "Enregistrement..." : (isEditMode ? "Mettre à jour" : "Enregistrer l'équipement")}
                </button>
            </div>
        </form>
    )
}
