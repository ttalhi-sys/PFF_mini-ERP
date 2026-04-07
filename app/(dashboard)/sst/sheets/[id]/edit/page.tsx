"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { EquipmentRow } from "@/lib/types/equipment"
import { SheetFormValues } from "@/lib/validators/sheet.schema"
import { SSTSheetForm } from "@/components/sst/SSTSheetForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function EditSSTSheetPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const supabase = createClient()
    const [equipments, setEquipments] = useState<EquipmentRow[]>([])
    const [initialData, setInitialData] = useState<SheetFormValues | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            // Load equipments for combobox
            const { data: eqData } = await supabase
                .from('equipment')
                .select('id, code, name')
                .order('name')
            
            if (eqData) setEquipments(eqData as any[])

            // Load sheet data
            const { data: sheet, error } = await supabase
                .from('sst_sheets')
                .select('*')
                .eq('id', params.id)
                .single()

            if (error || !sheet) {
                console.error("Error loading sheet:", error)
                toast.error("Impossible de charger la fiche")
                router.push('/sst/sheets')
                return
            }

            setInitialData({
                equipment_id: sheet.equipment_id,
                danger_category: sheet.danger_category || "",
                main_risks: sheet.main_risks || "",
                prevention_measures: sheet.prevention_measures || "",
                required_ppe: sheet.required_ppe || "",
                warnings: sheet.warnings || "",
                prohibited_actions: sheet.prohibited_actions || "",
                lockout_procedure: sheet.lockout_procedure || "",
                sop_reference: sheet.sop_reference || "",
            })
            setIsLoading(false)
        }
        loadData()
    }, [params.id, supabase, router])

    const handleSubmit = async (values: SheetFormValues) => {
        try {
            setIsSubmitting(true)
            
            const { data: userData } = await supabase.auth.getUser()

            const { error } = await supabase
                .from('sst_sheets')
                .update({
                    equipment_id: values.equipment_id,
                    danger_category: values.danger_category || null,
                    main_risks: values.main_risks || null,
                    prevention_measures: values.prevention_measures || null,
                    required_ppe: values.required_ppe || null,
                    warnings: values.warnings || null,
                    prohibited_actions: values.prohibited_actions || null,
                    lockout_procedure: values.lockout_procedure || null,
                    sop_reference: values.sop_reference || null,
                    last_reviewed: new Date().toISOString(),
                    reviewed_by: userData?.user?.id || null,
                })
                .eq('id', params.id)

            if (error) throw error

            toast.success("Fiche modifiée avec succès")
            router.push(`/sst/sheets/${params.id}`)
            router.refresh()

        } catch (error) {
            console.error("Error updating sheet:", error)
            toast.error("Erreur lors de la modification")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading || !initialData) {
        return <div className="p-8 text-center text-gray-500">Chargement des données...</div>
    }

    return (
        <div className="flex-1 space-y-6 container mx-auto py-8">
            <div className="mb-6">
                <Link href={`/sst/sheets/${params.id}`} className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Retour à la fiche
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Modifier la fiche de sécurité</h1>
                <p className="text-gray-500 mt-1">
                    Mettez à jour les risques et mesures de prévention.
                </p>
            </div>

            <SSTSheetForm
                equipments={equipments}
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={() => router.push(`/sst/sheets/${params.id}`)}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}
