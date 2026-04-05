'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

import { workOrderSchema, WorkOrderFormValues } from '@/lib/validators/work-order.schema';
import { createClient } from '@/lib/supabase/client';

interface WorkOrderFormProps {
    equipmentList: { id: string; name: string; code: string }[];
    technicians: { id: string; full_name: string }[];
    initialEquipmentId?: string;
    generatedCode: string;
}

export default function WorkOrderForm({
    equipmentList,
    technicians,
    initialEquipmentId,
    generatedCode
}: WorkOrderFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<WorkOrderFormValues>({
        // @ts-expect-error: RHF deep partial typing with Zod
        resolver: zodResolver(workOrderSchema),
        defaultValues: {
            equipment_id: initialEquipmentId || '',
            type: 'PREVENTIF_SYSTEMATIQUE',
            priority: 'MOYENNE',
            title: '',
            is_recurring: false,
        },
    });

    const isRecurring = watch('is_recurring');

    const onSubmit = async (formValues: unknown) => {
        const data = formValues as WorkOrderFormValues;
        setIsSubmitting(true);
        setError(null);

        try {
            // Get current user id
            const { data: { session } } = await supabase.auth.getSession();

            const payload = {
                ...data,
                code: generatedCode,
                status: 'new', // Default status for new WOs
                created_by: session?.user.id || null,
                priority: data.priority || 'MOYENNE',
                // Convert optional numeric fields, set to null if empty string
                duration_hours: data.duration_hours || null,
                estimated_cost: data.estimated_cost || null,
                assigned_to: data.assigned_to || null,
                planned_date: data.planned_date || null,
                recurrence_interval_months: data.is_recurring ? data.recurrence_interval_months : null,
            };

            const { data: woData, error: insertError } = await supabase
                .from('work_orders')
                .insert(payload)
                .select('id')
                .single();

            if (insertError) throw insertError;

            // Navigate to detail page
            router.push(`/maintenance/${woData.id}`);
            router.refresh(); // Refresh data

        } catch (err: unknown) {
            console.error("Error creating work order:", err);
            setError((err as Error).message || "Une erreur est survenue lors de la création.");
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
                    {error}
                </div>
            )}

            {/* 1. Informations générales */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                        1. Informations générales
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="code" className="text-sm font-medium text-gray-700 block">
                                Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="code"
                                type="text"
                                value={generatedCode}
                                disabled
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-500 font-mono"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="equipment_id" className="text-sm font-medium text-gray-700 block">
                                Équipement <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="equipment_id"
                                {...register('equipment_id')}
                                className={`w-full px-3 py-2 border rounded-md text-sm ${errors.equipment_id ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                            >
                                <option value="">Sélectionner un équipement</option>
                                {equipmentList.map(eq => (
                                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.code})</option>
                                ))}
                            </select>
                            {errors.equipment_id && <p className="text-xs text-red-600">{errors.equipment_id.message}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label htmlFor="title" className="text-sm font-medium text-gray-700 block">
                                Titre de l&apos;intervention <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                {...register('title')}
                                placeholder="Ex: Remplacement du filtre HEPA"
                                className={`w-full px-3 py-2 border rounded-md text-sm ${errors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                            />
                            {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="type" className="text-sm font-medium text-gray-700 block">
                                Type de maintenance <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="type"
                                {...register('type')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="PREVENTIF_SYSTEMATIQUE">Préventif (Systématique)</option>
                                <option value="PREVENTIF_CONDITIONNEL">Préventif (Conditionnel)</option>
                                <option value="CORRECTIF">Correctif (Panne)</option>
                                <option value="AUCUN_ENTRETIEN">Aucun entretien</option>
                            </select>
                            {errors.type && <p className="text-xs text-red-600">{errors.type.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="priority" className="text-sm font-medium text-gray-700 block">
                                Priorité
                            </label>
                            <select
                                id="priority"
                                {...register('priority')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="ELEVEE">Élevée</option>
                                <option value="MOYENNE">Moyenne</option>
                                <option value="FAIBLE">Faible</option>
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label htmlFor="description" className="text-sm font-medium text-gray-700 block">
                                Description des travaux à effectuer
                            </label>
                            <textarea
                                id="description"
                                {...register('description')}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Détaillez les étapes de l'intervention..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="assigned_to" className="text-sm font-medium text-gray-700 block">
                                Assigner à (Technicien)
                            </label>
                            <select
                                id="assigned_to"
                                {...register('assigned_to')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Non assigné / À déterminer</option>
                                {technicians.map(tech => (
                                    <option key={tech.id} value={tech.id}>{tech.full_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Planification */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                        2. Planification et ressources
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="planned_date" className="text-sm font-medium text-gray-700 block">
                                Date planifiée
                            </label>
                            <input
                                id="planned_date"
                                type="date"
                                {...register('planned_date')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="duration_hours" className="text-sm font-medium text-gray-700 block">
                                    Durée (heures)
                                </label>
                                <input
                                    id="duration_hours"
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    {...register('duration_hours')}
                                    className={`w-full px-3 py-2 border rounded-md text-sm ${errors.duration_hours ? 'border-red-300' : 'border-gray-300 focus:ring-blue-500'}`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="estimated_cost" className="text-sm font-medium text-gray-700 block">
                                    Coût estimé ($)
                                </label>
                                <input
                                    id="estimated_cost"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register('estimated_cost')}
                                    className={`w-full px-3 py-2 border rounded-md text-sm ${errors.estimated_cost ? 'border-red-300' : 'border-gray-300 focus:ring-blue-500'}`}
                                />
                            </div>
                        </div>

                        {/* Recurrence Toggle */}
                        <div className="md:col-span-2 mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <input
                                    id="is_recurring"
                                    type="checkbox"
                                    {...register('is_recurring')}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="is_recurring" className="text-sm font-medium text-gray-900">
                                    Ceci est une intervention récurrente (Plan de maintenance)
                                </label>
                            </div>

                            {isRecurring && (
                                <div className="mt-4 pl-7 space-y-2 max-w-sm">
                                    <label htmlFor="recurrence_interval_months" className="text-sm font-medium text-gray-700 block">
                                        Intervalle de récurrence (en mois) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="recurrence_interval_months"
                                            type="number"
                                            min="1"
                                            {...register('recurrence_interval_months')}
                                            className={`w-full px-3 py-2 border rounded-md text-sm ${errors.recurrence_interval_months ? 'border-red-300' : 'border-gray-300 focus:ring-blue-500'}`}
                                        />
                                        <span className="text-sm text-gray-500">mois</span>
                                    </div>
                                    {errors.recurrence_interval_months && (
                                        <p className="text-xs text-red-600">{errors.recurrence_interval_months.message}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 3. État de l'équipement */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                        3. État de l&apos;équipement avant intervention
                    </h2>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="condition_before" className="text-sm font-medium text-gray-700 block">
                                Condition actuelle (Optionnel)
                            </label>
                            <select
                                id="condition_before"
                                {...register('condition_before')}
                                className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Sélectionner l&apos;état...</option>
                                <option value="NEUF">Neuf</option>
                                <option value="TRES_BON">Très bon</option>
                                <option value="BON">Bon</option>
                                <option value="MOYEN">Moyen</option>
                                <option value="MAUVAIS">Mauvais</option>
                                <option value="HORS_SERVICE">Hors service</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="observations" className="text-sm font-medium text-gray-700 block">
                                Observations initiales ou symptômes
                            </label>
                            <textarea
                                id="observations"
                                {...register('observations')}
                                rows={3}
                                placeholder="Ex: Le moteur surchauffe après 30 minutes d'utilisation..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Créer l&apos;ordre de travail
                </button>
            </div>
        </form>
    );
}
