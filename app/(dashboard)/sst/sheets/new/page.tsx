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

export default function NewSSTSheetPage() {
    const router = useRouter()
    const supabase = createClient()
    const [equipments, setEquipments] = useState<EquipmentRow[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch available equipment
    useEffect(() => {
        async function loadData() {
            const { data, error } = await supabase
                .from('equipment')
                .select('id, code, name')
                .order('name')

            if (error) {
                console.error("Error loading equipment:", error)
            } else if (data) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setEquipments(data as any[])
            }
            setIsLoading(false)
        }
        loadData()
    }, [supabase])

    const handleSubmit = async (values: SheetFormValues) => {
        try {
            setIsSubmitting(true)
            
            const { data: userData } = await supabase.auth.getUser()

            const { error } = await supabase
                .from('sst_sheets')
                .insert([{
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
                }])

            if (error) throw error

            toast.success("Fiche créée avec succès")
            router.push('/sst/sheets')
            router.refresh()

        } catch (error) {
            console.error("Error creating sheet:", error)
            toast.error("Erreur lors de la création")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Chargement des données...</div>
    }

    return (
        <div className="flex-1 space-y-6 container mx-auto py-8">
            <div className="mb-6">
                <Link href="/sst/sheets" className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Retour aux fiches
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Nouvelle fiche de sécurité</h1>
                <p className="text-gray-500 mt-1">
                    Documentez les risques et mesures de prévention pour un équipement spécifique.
                </p>
            </div>

            <SSTSheetForm
                equipments={equipments}
                onSubmit={handleSubmit}
                onCancel={() => router.push('/sst/sheets')}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}
