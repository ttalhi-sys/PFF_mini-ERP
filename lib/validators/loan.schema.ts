import { z } from 'zod';

export const loanItemSchema = z.object({
    equipment_id: z.string().uuid({ message: "Un équipement valide est requis" }),
    quantity: z.coerce.number().min(1, { message: "La quantité doit être au moins 1" }),
    condition_before: z.string().min(1, { message: "L'état est requis" }),
    // Values used for UI logic, not strictly submitted as part of the items except maybe subtotal
    rate_per_day: z.number().nullable().optional(),
    rate_per_week: z.number().nullable().optional(),
    rate_per_month: z.number().nullable().optional(),
    subtotal: z.number().optional()
});

export const loanSchema = z.object({
    borrower_name: z.string().min(2, { message: "Le nom doit comporter au moins 2 caractères" }),
    borrower_email: z.string().email({ message: "Email invalide" }).optional().or(z.literal('')),
    borrower_phone: z.string().optional(),
    borrower_type: z.enum(['internal', 'external']),
    borrower_org: z.string().optional(),
    responsible_id: z.string().uuid().optional().or(z.literal('')),

    checkout_date: z.string().min(1, { message: "La date de sortie est requise" }),
    expected_return: z.string().min(1, { message: "La date de retour est requise" }),

    notes: z.string().optional(),

    items: z.array(loanItemSchema).min(1, { message: "Au moins un équipement est requis" })
}).refine(data => {
    // Validate that expected_return is after checkout_date
    const checkout = new Date(data.checkout_date);
    const expected = new Date(data.expected_return);
    return expected >= checkout;
}, {
    message: "La date de retour doit être ultérieure à la date de sortie",
    path: ["expected_return"] // Highlights the error on the expected_return field
});
