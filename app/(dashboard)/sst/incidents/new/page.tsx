"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { EquipmentRow } from "@/lib/types/equipment"
import { IncidentFormValues } from "@/lib/validators/incident.schema"
import { IncidentForm } from "@/components/sst/IncidentForm"
import { generateSequentialCode } from "@/lib/business-logic/code-generator"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NewIncidentPage() {
    const router = useRouter()
    const supabase = createClient()
    const [equipments, setEquipments] = useState<EquipmentRow[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch available equipment to link to the incident
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

    const handleSubmit = async (values: IncidentFormValues, files: File[]) => {
        try {
            setIsSubmitting(true)

            // 1. Generate code INC-YYYY-XXX
            const code = await generateSequentialCode(supabase, 'INC', 'sst_incidents')

            // 2. Upload files if any
            const evidence_urls: string[] = []
            if (files && files.length > 0) {
                for (const file of files) {
                    const fileName = `${code}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('incident-evidence')
                        .upload(fileName, file)
                    
                    if (uploadError) {
                        console.error('Upload error:', uploadError)
                        toast.error(`Erreur d'upload pour le fichier ${file.name}`)
                    } else if (uploadData) {
                        // get public url
                        const { data: { publicUrl } } = supabase.storage
                            .from('incident-evidence')
                            .getPublicUrl(uploadData.path)
                        evidence_urls.push(publicUrl)
                    }
                }
            }

            // 3. Insert record
            const { error } = await supabase
                .from('sst_incidents')
                .insert([{
                    code,
                    equipment_id: values.equipment_id || null,
                    incident_type: values.incident_type,
                    severity: values.severity,
                    incident_date: new Date(values.incident_date).toISOString(),
                    location: values.location || null,
                    description: values.description,
                    immediate_measures: values.immediate_measures || null,
                    status: 'reported',
                    evidence_urls: evidence_urls.length > 0 ? evidence_urls : null,
                }])

            if (error) {
                console.error('INSERT error:', error)
                throw error
            }

            toast.success("Incident déclaré avec succès", {
                description: `Le dossier ${code} a été ouvert.`,
            })

            // 3. Redirect to incidents list
            router.push('/sst/incidents')
            router.refresh()

        } catch (error) {
            console.error("Error creating incident:", error)
            toast.error("Erreur lors de la déclaration", {
                description: "Veuillez vérifier vos données ou réessayer plus tard."
            })
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
                <Link href="/sst/incidents" className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Retour aux incidents
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Déclarer un incident / événement</h1>
                <p className="text-gray-500 mt-1">
                    Veuillez documenter les détails de l&apos;événement SST de la manière la plus précise possible.
                </p>
            </div>

            <IncidentForm
                equipments={equipments}
                onSubmit={handleSubmit}
                onCancel={() => router.push('/sst/incidents')}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}
