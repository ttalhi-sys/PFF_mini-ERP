export type NotificationType =
    | 'maintenance_overdue'
    | 'loan_overdue'
    | 'loan_reminder'
    | 'incident_new'
    | 'ticket_assigned'
    | 'system_update';

export interface NotificationRow {
    id: string;
    profile_id: string;
    title: string;
    message: string;
    type: NotificationType;
    linked_entity_type?: string | null;
    linked_entity_id?: string | null;
    is_read: boolean;
    created_at: string;
}

export type NotificationInsert = Omit<NotificationRow, 'id' | 'created_at'>;
export type NotificationUpdate = Partial<NotificationInsert>;
