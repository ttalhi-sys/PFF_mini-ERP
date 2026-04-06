import { z } from "zod"

export const equipmentSchema = z.object({
    code: z
        .string()
        .min(1, "Le code est requis")
        .regex(/^EQP-\d{6}$/, "Le code doit être sous le format EQP-XXXXXX (ex: EQP-000001)"),
    name: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
    category_id: z.string().optional().or(z.literal("")),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    serial_number: z.string().optional(),
    quantity: z.coerce.number().min(1, "La quantité doit être au moins de 1").default(1),
    unit: z.enum(["UNITE", "KIT", "ENSEMBLE", "LOT", "POSTE"]).default("UNITE"),
    location_id: z.string().optional().or(z.literal("")),
    description: z.string().optional(),
    specifications: z.string().optional(), // Will be parsed to JSONB before saving
    condition: z.enum(["NEUF", "TRES_BON", "BON", "MOYEN", "MAUVAIS", "HORS_SERVICE"]).default("BON"),
    status: z.enum(["EN_SERVICE", "EN_STOCK", "RESERVE", "EN_MAINTENANCE", "PRETE", "HORS_SERVICE", "MIS_AU_REBUT", "A_VALIDER"]).default("EN_SERVICE"),
    acquisition_date: z.string().optional(), // Formatted date string
    acquisition_cost: z.coerce.number().min(0).optional(),
    estimated_value: z.coerce.number().min(0).optional(),
    funding_source: z.string().optional(),
    owner: z.string().default("ÉTS"),
    responsible_id: z.string().optional().or(z.literal("")),
    is_loanable: z.boolean().default(false),
    rate_per_day: z.coerce.number().min(0).optional(),
    rate_per_week: z.coerce.number().min(0).optional(),
    rate_per_month: z.coerce.number().min(0).optional(),
    loan_conditions: z.string().optional(),
    criticality: z.enum(["Critique", "Haute", "Moyenne", "Faible"]).default("Moyenne"),
    tags: z.array(z.string()).optional().default([]),
    qr_code_url: z.string().optional(),
    notes: z.string().optional(),
})

export type EquipmentFormValues = z.infer<typeof equipmentSchema>
