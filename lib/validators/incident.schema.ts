import * as z from "zod";

export const incidentFormSchema = z.object({
    equipment_id: z.string().uuid("Identifiant d'équipement invalide").optional().or(z.literal('')),
    incident_type: z.enum(['INCIDENT', 'QUASI_INCIDENT', 'OBSERVATION']),
    severity: z.enum(['ELEVEE', 'MOYENNE', 'FAIBLE']),
    incident_date: z.string(), // we'll use string format for the form datetime-local value
    location: z.string().optional(),
    description: z.string().min(10, {
        message: "La description doit contenir au moins 10 caractères",
    }),
    immediate_measures: z.string().optional(),
});

export type IncidentFormValues = z.infer<typeof incidentFormSchema>;
