import { z } from 'zod';

export const workOrderSchema = z.object({
    equipment_id: z.string().uuid({ message: "Un équipement valide est requis" }),
    type: z.enum(['PREVENTIF_SYSTEMATIQUE', 'PREVENTIF_CONDITIONNEL', 'CORRECTIF', 'AUCUN_ENTRETIEN']),
    priority: z.enum(['ELEVEE', 'MOYENNE', 'FAIBLE']).optional(),
    title: z.string().min(3, { message: "Le titre doit comporter au moins 3 caractères" }),
    description: z.string().optional(),
    assigned_to: z.string().uuid().optional().or(z.literal('')),
    planned_date: z.string().optional().or(z.literal('')), // Could be ISO string
    duration_hours: z.coerce.number().min(0, { message: "La durée ne peut pas être négative" }).optional(),
    estimated_cost: z.coerce.number().min(0, { message: "Le coût ne peut pas être négatif" }).optional(),
    condition_before: z.string().optional(),
    observations: z.string().optional(),
    is_recurring: z.boolean().optional(),
    recurrence_interval_months: z.coerce.number().min(1, { message: "L'intervalle doit être d'au moins 1 mois" }).optional().or(z.literal('')),
});

export type WorkOrderFormValues = z.infer<typeof workOrderSchema>;
