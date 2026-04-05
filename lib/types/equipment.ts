import { Database } from "./database"

// Base table types
export type EquipmentRow = Database["public"]["Tables"]["equipment"]["Row"]
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"]
export type LocationRow = Database["public"]["Tables"]["locations"]["Row"]
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]

// Display types with joined data
export interface EquipmentWithJoins extends EquipmentRow {
    categories?: Pick<CategoryRow, "id" | "name"> | null
    locations?: Pick<LocationRow, "id" | "name"> | null
    profiles?: Pick<ProfileRow, "id" | "full_name"> | null // responsible
}

export type EquipmentStatus = 'EN_SERVICE' | 'EN_STOCK' | 'RESERVE' | 'EN_MAINTENANCE' | 'PRETE' | 'HORS_SERVICE' | 'MIS_AU_REBUT' | 'A_VALIDER';
export type EquipmentCondition = 'NEUF' | 'TRES_BON' | 'BON' | 'MOYEN' | 'MAUVAIS' | 'HORS_SERVICE';
export type EquipmentUnit = 'UNITE' | 'KIT' | 'ENSEMBLE' | 'LOT' | 'POSTE';
export type EquipmentCriticality = 'FAIBLE' | 'MOYENNE' | 'ELEVEE';
