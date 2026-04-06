'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    CalendarIcon,
    Clock,
    User,
    DollarSign,
    AlertTriangle,
    FileText,
    Activity,
    CheckCircle,
    PlayCircle,
    Ban,
    Upload,
    ChevronLeft
} from 'lucide-react';

import { WorkOrderWithRelations, WorkOrderStatus } from '@/lib/types/maintenance';
import {
    getAvailableTransitions,
    validateTransition,
    getTransitionUpdates,
    getActionLabel
} from '@/lib/business-logic/workflow-engine';
import { createClient } from '@/lib/supabase/client';
import { StatusBadge, TypeBadge, PriorityBadge } from './Badges';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface WorkOrderDetailProps {
    workOrder: WorkOrderWithRelations;
}

export default function WorkOrderDetail({ workOrder }: WorkOrderDetailProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Available next statuses
    const availableTransitions = getAvailableTransitions(workOrder.status);

    const handleTransition = async (newStatus: WorkOrderStatus) => {
        if (!validateTransition(workOrder.status, newStatus)) {
            setError(`Transition invalide de ${workOrder.status} à ${newStatus}`);
            return;
        }

        setIsUpdating(true);
        setError(null);

        try {
            // 1. Get field updates bound to this transition
            // For a real app, 'completed' might open a modal to ask for 'conditionAfter'
            // We will keep it simple here.
            const updates = getTransitionUpdates(newStatus, 'Corrigé / Opérationnel');

            // 2. Update DB
            const { error: dbError } = await supabase
                .from('work_orders')
                .update(updates)
                .eq('id', workOrder.id);

            if (dbError) throw dbError;

            // 3. (Optional) Log to audit_logs
            const { data: { session } } = await supabase.auth.getSession();
            await supabase.from('audit_logs').insert({
                action: 'status_transition',
                entity_type: 'work_order',
                entity_id: workOrder.id,
                user_id: session?.user.id,
                old_values: { status: workOrder.status },
                new_values: updates,
            });

            // Refresh page data
            router.refresh();

        } catch (err: unknown) {
            console.error('Transition error:', err);
            setError((err as Error).message || 'Erreur lors de la mise à jour du statut.');
        } finally {
            setIsUpdating(false);
        }
    };

    // Maps statuses to specific button designs
    const renderWorkflowButtons = () => {
        if (availableTransitions.length === 0) return null;

        return (
            <div className="flex flex-wrap items-center gap-2">
                {availableTransitions.map(status => {
                    let variant: 'default' | 'destructive' | 'outline' | 'secondary' = 'default';

                    if (status === 'TERMINE') variant = 'default'; // make green via class later
                    else if (status === 'BLOQUE') variant = 'destructive';
                    else if (status === 'CLOTURE') variant = 'secondary';
                    else if (status === 'EN_COURS') variant = 'default';

                    return (
                        <Button
                            key={status}
                            variant={variant}
                            disabled={isUpdating}
                            onClick={() => handleTransition(status)}
                            className={status === 'TERMINE' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                            {status === 'EN_COURS' && <PlayCircle className="w-4 h-4 mr-2" />}
                            {status === 'TERMINE' && <CheckCircle className="w-4 h-4 mr-2" />}
                            {status === 'BLOQUE' && <Ban className="w-4 h-4 mr-2" />}
                            {getActionLabel(status)}
                        </Button>
                    );
                })}
            </div>
        );
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: fr });
    };

    return (
        <div className="max-w-7xl">
            {/* Top Header */}
            <div className="mb-6">
                <Link href="/maintenance" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Retour aux ordres de travail
                </Link>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-lg font-bold text-blue-700">{workOrder.code}</span>
                            <StatusBadge status={workOrder.status} />
                            <TypeBadge type={workOrder.type} />
                            <PriorityBadge priority={workOrder.priority} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{workOrder.title}</h1>
                        <div className="flex items-center text-gray-600 text-sm gap-2">
                            <span className="font-medium">Équipement lié :</span>
                            {workOrder.equipment ? (
                                <Link href={`/equipment/${workOrder.equipment.id}`} className="text-blue-600 hover:underline flex items-center">
                                    {workOrder.equipment.name} <span className="text-xs ml-1 text-gray-400">({workOrder.equipment.code})</span>
                                </Link>
                            ) : (
                                <span className="italic text-gray-400">Aucun</span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 min-w-[200px]">
                        {renderWorkflowButtons()}
                        {error && <p className="text-red-600 text-xs text-right max-w-xs">{error}</p>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                            <CardTitle className="text-lg flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-gray-500" />
                                Détails de l&apos;intervention
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-8">
                                {/* Tech */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Technicien assigné</h4>
                                    {workOrder.assigned_user ? (
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={workOrder.assigned_user.avatar_url || ''} />
                                                <AvatarFallback className="bg-blue-100 text-blue-800">
                                                    {workOrder.assigned_user.full_name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{workOrder.assigned_user.full_name}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500 italic flex items-center">
                                            <User className="w-4 h-4 mr-2 text-gray-400" /> Non assigné
                                        </div>
                                    )}
                                </div>

                                {/* Timing */}
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Planification</h4>
                                        <p className="text-sm text-gray-900 flex items-center">
                                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                                            {workOrder.planned_date ? format(new Date(workOrder.planned_date), 'dd MMMM yyyy', { locale: fr }) : 'Non planifié'}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Exécution</h4>
                                        <div className="text-sm text-gray-900 grid grid-cols-[20px_1fr] gap-x-2 gap-y-1">
                                            <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p>Début: <span className="font-mono">{formatDate(workOrder.started_at)}</span></p>
                                                <p>Fin: <span className="font-mono">{formatDate(workOrder.completed_at)}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Durée et coûts</h4>
                                        <p className="text-sm text-gray-900 flex items-center">
                                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                            {workOrder.duration_hours ? `${workOrder.duration_hours} heures (estimées)` : '-'}
                                        </p>
                                        <p className="text-sm text-gray-900 flex items-center mt-1">
                                            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                                            {workOrder.estimated_cost ? `${workOrder.estimated_cost} $` : '-'}
                                        </p>
                                    </div>
                                </div>

                                {/* Condition */}
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">État de l&apos;équipement</h4>
                                        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-sm">
                                            <span className="text-gray-500">Avant:</span>
                                            <span className="font-medium">{workOrder.condition_before || '-'}</span>
                                            <span className="text-gray-500">Après:</span>
                                            <span className={workOrder.condition_after ? 'font-medium text-green-700' : 'font-medium text-gray-400'}>
                                                {workOrder.condition_after || '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description Block */}
                            <div className="border border-gray-100 rounded-md p-4 bg-gray-50/30">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Description des travaux</h4>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {workOrder.description || <span className="italic text-gray-400">Aucune description fournie.</span>}
                                </p>
                            </div>

                            {/* Additional Context (if filled) */}
                            {(workOrder.problem_detected || workOrder.root_cause || workOrder.corrective_actions || workOrder.observations) && (
                                <div className="mt-6 space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">Rapport technique</h4>

                                    {workOrder.observations && (
                                        <div>
                                            <h5 className="text-xs font-semibold text-gray-500 uppercase">Observations initiales</h5>
                                            <p className="text-sm text-gray-700 mt-1">{workOrder.observations}</p>
                                        </div>
                                    )}

                                    {workOrder.root_cause && (
                                        <div>
                                            <h5 className="text-xs font-semibold text-gray-500 uppercase">Cause racine identifiée</h5>
                                            <p className="text-sm text-gray-700 mt-1">{workOrder.root_cause}</p>
                                        </div>
                                    )}

                                    {workOrder.corrective_actions && (
                                        <div>
                                            <h5 className="text-xs font-semibold text-gray-500 uppercase">Actions correctives appliquées</h5>
                                            <p className="text-sm text-gray-700 mt-1">{workOrder.corrective_actions}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Stacked Widgets */}
                <div className="col-span-1 space-y-6">
                    {/* Timeline / History Placeholder */}
                    <Card>
                        <CardHeader className="border-b border-gray-100 pb-4">
                            <CardTitle className="text-base flex items-center">
                                <Activity className="w-4 h-4 mr-2 text-gray-500" />
                                Historique du workflow
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {/* Simplified mock timeline - in real app, fetch from audit_logs */}
                            <div className="relative border-l border-gray-200 ml-3 space-y-4">

                                {workOrder.completed_at && (
                                    <div className="relative pl-6">
                                        <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[6.5px] top-1.5 ring-4 ring-white"></div>
                                        <p className="text-sm font-medium text-gray-900">Terminé</p>
                                        <p className="text-xs text-gray-500">{formatDate(workOrder.completed_at)}</p>
                                    </div>
                                )}

                                {workOrder.started_at && (
                                    <div className="relative pl-6">
                                        <div className="absolute w-3 h-3 bg-orange-400 rounded-full -left-[6.5px] top-1.5 ring-4 ring-white"></div>
                                        <p className="text-sm font-medium text-gray-900">En cours</p>
                                        <p className="text-xs text-gray-500">{formatDate(workOrder.started_at)}</p>
                                    </div>
                                )}

                                <div className="relative pl-6">
                                    <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[6.5px] top-1.5 ring-4 ring-white"></div>
                                    <p className="text-sm font-medium text-gray-900">Créé</p>
                                    <p className="text-xs text-gray-500">{formatDate(workOrder.created_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents Placeholder */}
                    <Card>
                        <CardHeader className="border-b border-gray-100 pb-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-base flex items-center m-0">
                                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                                Documents liés
                            </CardTitle>
                            <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center font-medium">
                                <Upload className="w-3 h-3 mr-1" /> Ajouter
                            </button>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-center py-6 text-gray-500">
                                <FileText className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                                <p className="text-sm">Aucun document attaché.</p>
                                <p className="text-xs mt-1">Formats acceptés: PDF, JPG, PNG.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recurrence Widget if applicable */}
                    {workOrder.is_recurring && (
                        <Card className="border-blue-100 bg-blue-50/30">
                            <CardContent className="p-4 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-blue-900">Intervention récurrente</h4>
                                    <p className="text-xs text-blue-800 mt-1">
                                        Cet ordre de travail est planifié pour se répéter tous les <span className="font-bold">{workOrder.recurrence_interval_months} mois</span>.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
