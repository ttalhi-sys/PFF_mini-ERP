import { Database } from './database';

export type LoanRow = Database['public']['Tables']['loans']['Row'];
export type LoanInsert = Database['public']['Tables']['loans']['Insert'];
export type LoanUpdate = Database['public']['Tables']['loans']['Update'];

export type LoanItemRow = Database['public']['Tables']['loan_items']['Row'];
export type LoanItemInsert = Database['public']['Tables']['loan_items']['Insert'];
export type LoanItemUpdate = Database['public']['Tables']['loan_items']['Update'];

export type LoanStatus = 'RESERVE' | 'ACTIF' | 'EN_RETARD' | 'RETOURNE' | 'ANNULE';

// Extended types for joins
export type LoanItemWithEquipment = LoanItemRow & {
    equipment: {
        id: string;
        name: string;
        code: string;
        rate_per_day: number | null;
        rate_per_week: number | null;
        rate_per_month: number | null;
    } | null;
};

export type LoanWithDetails = LoanRow & {
    loan_items: LoanItemWithEquipment[];
    borrower?: {
        id: string;
        full_name: string;
    } | null;
    responsible?: {
        id: string;
        full_name: string;
    } | null;
    creator?: {
        id: string;
        full_name: string;
    } | null;
};

// Form values for the new loan form
export interface LoanItemFormValues {
    equipment_id: string;
    quantity: number;
    condition_before: string;
    // Hidden fields for real-time calculations
    rate_per_day: number | null;
    rate_per_week: number | null;
    rate_per_month: number | null;
    subtotal: number;
}

export interface LoanFormValues {
    borrower_name: string;
    borrower_email?: string;
    borrower_phone?: string;
    borrower_type: 'internal' | 'external';
    borrower_org?: string;
    responsible_id?: string;
    checkout_date: string;
    expected_return: string;
    notes?: string;
    items: LoanItemFormValues[];
}
