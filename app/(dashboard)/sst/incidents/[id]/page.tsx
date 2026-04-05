"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SSTIncident } from "@/lib/types/sst"
import { IncidentDetail } from "@/components/sst/IncidentDetail"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function IncidentDetailPage() {
    const params = useParams()
    const router = useRouter()
    const supabase = createClient()
    const [incident, setIncident] = useState<SSTIncident | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        fetchIncident()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id])

    const fetchIncident = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('sst_incidents')
            .select(`
                *,
                equipment:equipment_id(id, code, name),
                creator:created_by(id, full_name),
                responsible:responsible_id(id, full_name, email)
            `)
            .eq('id', params.id as string)
            .single()

        if (error) {
            console.error("Error fetching incident:", error)
        } else {
            setIncident(data as unknown as SSTIncident)
        }
        setIsLoading(false)
    }

    const handleStatusChange = async (newStatus: string) => {
        if (!incident) return

        try {
            setIsUpdating(true)

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updates: Record<string, any> = { status: newStatus }
            if (newStatus === 'closed') {
                updates.closed_at = new Date().toISOString()
            }

            const { error } = await supabase
                .from('sst_incidents')
                .update(updates)
                .eq('id', incident.id)

            if (error) throw error

            toast.success("Statut mis à jour", {
                description: `Le dossier est maintenant: ${newStatus}`,
            })

            await fetchIncident()
            router.refresh()

        } catch (error) {
            console.error("Error updating status:", error)
            toast.error("Erreur de mise à jour", {
                description: "Le statut n'a pas pu être modifié."
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const handleGenerateWO = async () => {
        if (!incident) return

        try {
            setIsUpdating(true)
            // Redirect to WO creation pre-filled with this incident's info
            // Since we don't have a direct query parameter passing in WO new form right now,
            // standard approach would be generating it here via RPC or navigating to a specific route.
            // For now, we will just navigate to maintenance/new with some query args.
            if (incident.equipment_id) {
                router.push(`/maintenance/new?equipment_id=${incident.equipment_id}&ref_incident=${incident.code}`)
            } else {
                router.push(`/maintenance/new?ref_incident=${incident.code}`)
            }
            // Ideally, the WO generation would happen fully server-side right here.

        } catch (error) {
            console.error("Error navigating to WO:", error)
        } finally {
            setIsUpdating(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex justify-center items-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!incident) {
        return (
            <div className="flex-1 space-y-6 container mx-auto py-8 text-center mt-20">
                <ShieldAlert className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Incident introuvable</h2>
                <p className="text-gray-500 mb-6">Ce dossier n&apos;existe pas ou a été supprimé.</p>
                <Button onClick={() => router.push('/sst/incidents')} variant="outline">
                    Retour aux incidents
                </Button>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-6 container mx-auto py-8">
            <div className="mb-4">
                <Link href="/sst/incidents" className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Retour aux incidents
                </Link>
            </div>

            <IncidentDetail
                incident={incident}
                onStatusChange={handleStatusChange}
                onGenerateWO={handleGenerateWO}
                isUpdating={isUpdating}
            />
        </div>
    )
}

