import * as z from "zod"

export const sheetFormSchema = z.object({
  equipment_id: z.string().min(1, "L'équipement est requis"),
  danger_category: z.string().optional(),
  main_risks: z.string().optional(),
  prevention_measures: z.string().optional(),
  required_ppe: z.string().optional(),
  warnings: z.string().optional(),
  prohibited_actions: z.string().optional(),
  lockout_procedure: z.string().optional(),
  sop_reference: z.string().optional(),
})

export type SheetFormValues = z.infer<typeof sheetFormSchema>
