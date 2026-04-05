export type WorkOrderType =
    | 'PREVENTIF_SYSTEMATIQUE'
    | 'PREVENTIF_CONDITIONNEL'
    | 'CORRECTIF'
    | 'AUCUN_ENTRETIEN';

export type WorkOrderPriority = 'FAIBLE' | 'MOYENNE' | 'ELEVEE';

export type WorkOrderStatus =
    | 'NOUVEAU'
    | 'PLANIFIE'
    | 'EN_COURS'
    | 'BLOQUE'
    | 'TERMINE'
    | 'CLOTURE';

export interface WorkOrder {
    id: string;
    code: string;
    equipment_id: string;
    type: WorkOrderType;
    priority: WorkOrderPriority;
    status: WorkOrderStatus;
    title: string;
    description: string | null;
    problem_detected: string | null;
    root_cause: string | null;
    corrective_actions: string | null;
    assigned_to: string | null;
    created_by: string | null;
    planned_date: string | null;
    started_at: string | null;
    completed_at: string | null;
    closed_at: string | null;
    next_scheduled: string | null;
    duration_hours: number | null;
    estimated_cost: number | null;
    actual_cost: number | null;
    condition_before: string | null;
    condition_after: string | null;
    photo_ref: string | null;
    report_ref: string | null;
    observations: string | null;
    is_recurring: boolean;
    recurrence_interval_months: number | null;
    created_at: string;
    updated_at: string;
}

// Type with joined relations for display
export interface WorkOrderWithRelations extends WorkOrder {
    equipment: {
        id: string;
        name: string;
        code: string;
    } | null;
    assigned_user: {
        id: string;
        full_name: string;
        avatar_url: string | null;
    } | null;
    creator: {
        id: string;
        full_name: string;
    } | null;
}
