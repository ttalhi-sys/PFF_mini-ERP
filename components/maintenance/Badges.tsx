import React from 'react';
import { WorkOrderStatus, WorkOrderType, WorkOrderPriority } from '@/lib/types/maintenance';

interface StatusBadgeProps {
    status: WorkOrderStatus;
    className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const styles: Record<WorkOrderStatus, string> = {
        NOUVEAU: 'bg-gray-100 text-gray-800',
        PLANIFIE: 'bg-blue-100 text-blue-800',
        EN_COURS: 'bg-orange-100 text-orange-800',
        BLOQUE: 'bg-red-100 text-red-800',
        TERMINE: 'bg-green-100 text-green-800',
        CLOTURE: 'bg-gray-800 text-white', // Or dark gray
    };

    const labels: Record<WorkOrderStatus, string> = {
        NOUVEAU: 'Nouveau',
        PLANIFIE: 'Planifié',
        EN_COURS: 'En cours',
        BLOQUE: 'Bloqué',
        TERMINE: 'Terminé',
        CLOTURE: 'Clôturé',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${styles[status]} ${className}`}>
            {labels[status]}
        </span>
    );
}

export function TypeBadge({ type, className = '' }: { type: WorkOrderType; className?: string }) {
    const styles: Record<WorkOrderType, string> = {
        PREVENTIF_SYSTEMATIQUE: 'bg-blue-50 text-blue-700 border border-blue-200',
        PREVENTIF_CONDITIONNEL: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        CORRECTIF: 'bg-red-50 text-red-700 border border-red-200',
        AUCUN_ENTRETIEN: 'bg-gray-50 text-gray-700 border border-gray-200',
    };

    const labels: Record<WorkOrderType, string> = {
        PREVENTIF_SYSTEMATIQUE: 'Préventif systématique',
        PREVENTIF_CONDITIONNEL: 'Préventif conditionnel',
        CORRECTIF: 'Corrective',
        AUCUN_ENTRETIEN: 'Aucun entretien',
    };

    return (
        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${styles[type]} ${className}`}>
            {labels[type]}
        </span>
    );
}

export function PriorityBadge({ priority, className = '' }: { priority: WorkOrderPriority; className?: string }) {
    const styles: Record<WorkOrderPriority, { bg: string, dot: string }> = {
        ELEVEE: { bg: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
        MOYENNE: { bg: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-500' },
        FAIBLE: { bg: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
    };

    const labels: Record<string, string> = {
        ELEVEE: 'Élevée',
        MOYENNE: 'Moyenne',
        FAIBLE: 'Faible',
    };

    const style = styles[priority];

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${style.bg} ${className}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.dot}`}></span>
            {labels[priority] || priority}
        </span>
    );
}
