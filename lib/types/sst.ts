import { Database } from './database';
import { EquipmentRow } from './equipment';

type Profiles = Database['public']['Tables']['profiles']['Row'];

export type IncidentType = 'INCIDENT' | 'QUASI_INCIDENT' | 'OBSERVATION';
export type IncidentSeverity = 'FAIBLE' | 'MOYENNE' | 'ELEVEE';
export type IncidentStatus = 'SIGNALE' | 'INVESTIGATION' | 'ACTION_REQUISE' | 'RESOLU' | 'CLOTURE';

export interface SSTIncident {
    id: string;
    code: string;
    equipment_id?: string | null;
    incident_type: IncidentType;
    severity: IncidentSeverity;
    incident_date: string;
    location?: string | null;
    description: string;
    immediate_measures?: string | null;
    probable_cause?: string | null;
    corrective_actions?: string | null;
    responsible_id?: string | null;
    deadline?: string | null;
    status: IncidentStatus;
    closed_at?: string | null;
    generated_work_order_id?: string | null;
    evidence_urls?: string[] | null;
    created_at: string;
    updated_at: string;
    created_by?: string | null;

    // Joins
    equipment?: Pick<EquipmentRow, 'id' | 'name' | 'code'> | null;
    responsible?: Pick<Profiles, 'id' | 'full_name' | 'email'> | null;
    creator?: Pick<Profiles, 'id' | 'full_name'> | null;
}

export type DangerCategory = 'Mécanique/Pneumatique' | 'Ergonomique' | 'Électrique/Optique' | 'Électrique faible' | string;

export interface SSTSheet {
    id: string;
    equipment_id: string;
    danger_category?: DangerCategory | null;
    main_risks?: string | null;
    prevention_measures?: string | null;
    required_ppe?: string | null;
    warnings?: string | null;
    prohibited_actions?: string | null;
    lockout_procedure?: string | null;
    sop_reference?: string | null;
    last_reviewed?: string | null;
    reviewed_by?: string | null;
    created_at: string;
    updated_at: string;

    // Joins
    equipment?: EquipmentRow;
    reviewer?: Pick<Profiles, 'id' | 'full_name'> | null;
}
