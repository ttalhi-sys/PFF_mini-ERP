'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { format, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { WorkOrderWithRelations } from '@/lib/types/maintenance';
import { StatusBadge, TypeBadge, PriorityBadge } from './Badges';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Filter, MoreHorizontal, FileText, Clock } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WorkOrderTableProps {
    data: WorkOrderWithRelations[];
}

export default function WorkOrderTable({ data }: WorkOrderTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    // Other filter states would go here (status, type, priority, technician)

    // Basic search filter
    const filteredData = data.filter(wo => {
        const searchMatch =
            wo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (wo.equipment?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        return searchMatch;
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Filters Bar */}
            <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par code, équipement, titre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="flex gap-2">
                    {/* Dropdown placeholders for filters - actual implementation would use Select component */}
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-gray-50 hover:bg-gray-100">
                        <Filter className="h-4 w-4" />
                        Tous les statuts
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-gray-50 hover:bg-gray-100">
                        Toutes les priorités
                    </button>
                </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 font-medium">Code</th>
                            <th className="px-6 py-3 font-medium">Équipement</th>
                            <th className="px-6 py-3 font-medium">Type</th>
                            <th className="px-6 py-3 font-medium">Priorité</th>
                            <th className="px-6 py-3 font-medium">Statut</th>
                            <th className="px-6 py-3 font-medium">Technicien</th>
                            <th className="px-6 py-3 font-medium">Date planifiée</th>
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                    <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                    <p>Aucun ordre de travail ne correspond à vos critères.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((wo) => {
                                const isOverdue = wo.planned_date &&
                                    (wo.status === 'NOUVEAU' || wo.status === 'PLANIFIE') &&
                                    isPast(new Date(wo.planned_date)) &&
                                    !isToday(new Date(wo.planned_date));

                                return (
                                    <tr key={wo.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link href={`/maintenance/${wo.id}`} className="font-mono text-blue-600 hover:underline font-medium">
                                                {wo.code}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{wo.equipment?.name || 'Équipement...'}</span>
                                                <span className="text-xs text-gray-500 font-mono">{wo.equipment?.code || ''}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <TypeBadge type={wo.type} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <PriorityBadge priority={wo.priority} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={wo.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            {wo.assigned_user ? (
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={wo.assigned_user.avatar_url || ''} />
                                                        <AvatarFallback className="text-[10px] bg-blue-100 text-blue-800">
                                                            {wo.assigned_user.full_name.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm text-gray-700">{wo.assigned_user.full_name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic text-sm">Non assigné</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {wo.planned_date ? (
                                                <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>
                                                        {format(new Date(wo.planned_date), 'dd MMM yyyy', { locale: fr })}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <Link href={`/maintenance/${wo.id}`} className="w-full">
                                                        <DropdownMenuItem>Voir les détails</DropdownMenuItem>
                                                    </Link>
                                                    <Link href={`/maintenance/${wo.id}`} className="w-full">
                                                        <DropdownMenuItem>Modifier l&apos;ordre</DropdownMenuItem>
                                                    </Link>
                                                    {wo.status === 'EN_COURS' && (
                                                        <Link href={`/maintenance/${wo.id}`} className="w-full">
                                                            <DropdownMenuItem className="text-green-600 font-medium">Marquer terminé</DropdownMenuItem>
                                                        </Link>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Affichage de <span className="font-medium">{filteredData.length}</span> ordres de travail
                </p>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50" disabled>Précédent</button>
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm bg-blue-50 text-blue-600">1</button>
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50" disabled>Suivant</button>
                </div>
            </div>
        </div>
    );
}
