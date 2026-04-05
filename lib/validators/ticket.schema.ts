import * as z from "zod"

export const ticketFormSchema = z.object({
    title: z.string().min(5, { message: "Le titre doit comporter au moins 5 caractères." }),
    description: z.string().min(10, { message: "La description doit comporter au moins 10 caractères." }),
    category: z.enum([
        "Problème d'équipement",
        "Demande de maintenance",
        "Problème de sécurité",
        "Demande générale",
        "Demande d'accès"
    ]),
    priority: z.enum(["Basse", "Moyenne", "Haute", "Critique"]),
    equipment_id: z.string().uuid().optional().nullable(),
})

export type TicketFormValues = z.infer<typeof ticketFormSchema>
