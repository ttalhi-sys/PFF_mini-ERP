'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { WorkOrderWithRelations, WorkOrderStatus } from '@/lib/types/maintenance';
import { PriorityBadge } from './Badges';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface WorkOrderKanbanProps {
    data: WorkOrderWithRelations[];
}

export default function WorkOrderKanban({ data }: WorkOrderKanbanProps) {
    // Define columns based on statuses
    const columns: { id: WorkOrderStatus; title: string; color: string; border: string }[] = [
        { id: 'NOUVEAU', title: 'Nouveau', color: 'bg-gray-100', border: 'border-l-gray-400' },
        { id: 'PLANIFIE', title: 'Planifié', color: 'bg-blue-50', border: 'border-l-blue-500' },
        { id: 'EN_COURS', title: 'En cours', color: 'bg-orange-50', border: 'border-l-orange-500' },
        { id: 'BLOQUE', title: 'Bloqué', color: 'bg-red-50', border: 'border-l-red-500' },
        { id: 'TERMINE', title: 'Terminé', color: 'bg-green-50', border: 'border-l-green-500' },
        { id: 'CLOTURE', title: 'Clôturé', color: 'bg-slate-100', border: 'border-l-slate-700' },
    ];

    return (
        <div className="flex gap-4 overflow-x-auto pb-6 h-[calc(100vh-280px)] min-h-[500px]">
            {columns.map((column) => {
                // Filter work orders for this column
                const columnOrders = data.filter((wo) => wo.status === column.id);

                return (
                    <div key={column.id} className={`flex-shrink-0 w-[320px] flex flex-col rounded-lg border border-gray-200 bg-gray-50/50`}>
                        {/* Column Header */}
                        <div className={`p-3 shrink-0 rounded-t-lg border-b border-gray-200 flex justify-between items-center ${column.color}`}>
                            <h3 className="font-semibold text-gray-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis">{column.title}</h3>
                            <span className="bg-white text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full border border-gray-200">
                                {columnOrders.length}
                            </span>
                        </div>

                        {/* Column Cards Container */}
                        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-[100px]">
                            {columnOrders.map((wo) => {
                                return (
                                    <Link
                                        href={`/maintenance/${wo.id}`}
                                        key={wo.id}
                                        className={`block bg-white rounded-md p-3 shadow-sm hover:shadow-md transition-shadow border border-gray-200 border-l-4 ${column.border} cursor-pointer group`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-mono font-medium text-blue-600 group-hover:text-blue-800">
                                                {wo.code}
                                            </span>
                                            <PriorityBadge priority={wo.priority} />
                                        </div>

                                        <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                                            {wo.title}
                                        </h4>

                                        <p className="text-xs text-gray-500 mb-3 truncate">
                                            {wo.equipment?.name || 'Équipement non spécifié'}
                                        </p>

                                        <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
                                            {/* Avatar */}
                                            {wo.assigned_user ? (
                                                <div className="flex items-center gap-1.5" title={wo.assigned_user.full_name}>
                                                    <Avatar className="h-6 w-6 border border-gray-200">
                                                        <AvatarImage src={wo.assigned_user.avatar_url || ''} />
                                                        <AvatarFallback className="text-[10px] bg-gray-100 text-gray-600">
                                                            {wo.assigned_user.full_name.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-gray-400 italic">Non assigné</div>
                                            )}

                                            {/* Date */}
                                            {wo.planned_date && (
                                                <span className="text-[11px] text-gray-500 font-medium">
                                                    {format(new Date(wo.planned_date), 'dd MMM', { locale: fr })}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}

                            {columnOrders.length === 0 && (
                                <div className="h-24 border-2 border-dashed border-gray-200 rounded-md flex items-center justify-center text-sm text-gray-400">
                                    Aucun ordre
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
