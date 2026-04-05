import { EquipmentRow } from "./equipment"
import { Database } from "./database"
export type Profile = Database['public']['Tables']['profiles']['Row']

export type TicketCategory =
    | "Problème d'équipement"
    | "Demande de maintenance"
    | "Problème de sécurité"
    | "Demande générale"
    | "Demande d'accès"

export type TicketPriority = "Basse" | "Moyenne" | "Haute" | "Critique"
export type TicketStatus = 'OUVERT' | 'ASSIGNE' | 'EN_COURS' | 'RESOLU' | 'CLOTURE'

export interface HelpdeskTicket {
    id: string
    code: string
    title: string
    description: string
    category: TicketCategory
    priority: TicketPriority | null
    status: TicketStatus
    submitted_by: string
    assigned_to: string | null
    equipment_id: string | null
    created_at: string
    updated_at: string
    resolved_at: string | null
    closed_at: string | null
    converted_to_type: 'work_order' | 'sst_incident' | null
    converted_to_id: string | null

    // Joined relationships
    submitter?: Profile
    assignee?: Profile
    equipment?: EquipmentRow
}
