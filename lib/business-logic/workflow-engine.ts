import { WorkOrderStatus } from '@/lib/types/maintenance';

// Define allowed transitions
const transitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
    NOUVEAU: ['PLANIFIE', 'EN_COURS'], // Can go directly to in_progress or be planned
    PLANIFIE: ['EN_COURS', 'BLOQUE'], // From planned, can start or be blocked
    EN_COURS: ['TERMINE', 'BLOQUE'], // While working, can finish or get blocked
    BLOQUE: ['EN_COURS', 'CLOTURE'], // Blocked can resume or be abandoned (closed)
    TERMINE: ['CLOTURE'], // Completed must be formally closed
    CLOTURE: [], // Terminal state
};

export const getAvailableTransitions = (currentStatus: WorkOrderStatus): WorkOrderStatus[] => {
    return transitions[currentStatus] || [];
};

export const validateTransition = (currentStatus: WorkOrderStatus, newStatus: WorkOrderStatus): boolean => {
    return transitions[currentStatus]?.includes(newStatus) || false;
};

// Define side effects (e.g., fields to update) for specific transitions
export const getTransitionUpdates = (newStatus: WorkOrderStatus, conditionAfter?: string) => {
    const updates: Record<string, string | null> = { status: newStatus };
    const now = new Date().toISOString();

    switch (newStatus) {
        case 'EN_COURS':
            updates.started_at = now;
            break;
        case 'TERMINE':
            updates.completed_at = now;
            if (conditionAfter) {
                updates.condition_after = conditionAfter;
            }
            break;
        case 'CLOTURE':
            updates.closed_at = now;
            break;
    }

    return updates;
};

// UI Helpers
export const STATUS_LABELS: Record<WorkOrderStatus, string> = {
    NOUVEAU: 'Nouveau',
    PLANIFIE: 'Planifié',
    EN_COURS: 'En cours',
    BLOQUE: 'Bloqué',
    TERMINE: 'Terminé',
    CLOTURE: 'Clôturé',
};

export const getStatusLabel = (status: WorkOrderStatus): string => {
    return STATUS_LABELS[status] || status;
};

export const ACTION_LABELS: Record<WorkOrderStatus, string> = {
    NOUVEAU: 'Créer',
    PLANIFIE: 'Planifier',
    EN_COURS: 'Démarrer',
    BLOQUE: 'Bloquer',
    TERMINE: 'Terminer',
    CLOTURE: 'Clôturer',
};

export const getActionLabel = (nextStatus: WorkOrderStatus): string => {
    return ACTION_LABELS[nextStatus] || 'Transition';
};
