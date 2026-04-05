import { Database } from "./database"
export type Profile = Database['public']['Tables']['profiles']['Row']

export interface AppDocument {
    id: string
    name: string
    description: string | null
    file_type: string
    file_url: string
    file_size: number | null
    mime_type: string | null
    linked_entity_type: string | null
    linked_entity_id: string | null
    version: string | null
    uploaded_by: string | null
    created_at: string

    // Joined relations
    uploader?: Profile
}

export const DOCUMENT_TYPES = [
    "Manuel",
    "Fiche de sécurité",
    "Rapport",
    "Photo",
    "Certificat",
    "Facture",
    "Procédure"
] as const;

export const ENTITY_TYPES = [
    "Équipement",
    "Maintenance",
    "Emprunt",
    "Incident",
    "Général"
] as const;
