"use client"

import { SSTIncident } from "@/lib/types/sst"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import {
    AlertTriangle,
    FileText,
    Calendar,
    MapPin,
    Camera,
    CheckCircle,
    ClipboardList,
    ShieldAlert
} from "lucide-react"

interface IncidentDetailProps {
    incident: SSTIncident
    onStatusChange: (newStatus: string) => Promise<void>
    onGenerateWO: () => Promise<void>
    isUpdating?: boolean
}

export function IncidentDetail({ incident, onStatusChange, onGenerateWO, isUpdating = false }: IncidentDetailProps) {

    // Status config
    const getStatusConfig = (status: string) => {
        const config: Record<string, { label: string, color: string }> = {
            SIGNALE: { label: "Signalé", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
            INVESTIGATION: { label: "En investigation", color: "bg-blue-100 text-blue-800 border-blue-200" },
            ACTION_REQUISE: { label: "Action requise", color: "bg-orange-100 text-orange-800 border-orange-200" },
            RESOLU: { label: "Résolu", color: "bg-green-100 text-green-800 border-green-200" },
            CLOTURE: { label: "Clôturé", color: "bg-gray-100 text-gray-800 border-gray-200" }
        }
        return config[status] || config.reported
    }

    // Type config
    const getTypeConfig = (type: string) => {
        const config: Record<string, { label: string, color: string, icon: any }> = {
            INCIDENT: { label: "Incident", color: "text-red-600 bg-red-50", icon: ShieldAlert },
            QUASI_INCIDENT: { label: "Quasi-incident", color: "text-orange-600 bg-orange-50", icon: AlertTriangle },
            OBSERVATION: { label: "Observation", color: "text-blue-600 bg-blue-50", icon: Eye }
        }
        return config[type] || { label: type, color: "text-gray-600 bg-gray-50", icon: AlertTriangle }
    }

    // Severity config
    const getSeverityConfig = (severity: string) => {
        const config: Record<string, string> = {
            'ELEVEE': "bg-red-600 text-white",
            'MOYENNE': "bg-orange-500 text-white",
            'FAIBLE': "bg-yellow-500 text-white",
        }
        return config[severity] || "bg-gray-500 text-white"
    }

    const severityLabels: Record<string, string> = {
        'ELEVEE': 'Élevée',
        'MOYENNE': 'Moyenne',
        'FAIBLE': 'Faible'
    };

    const statConf = getStatusConfig(incident.status)
    const typeConf = getTypeConfig(incident.incident_type)
    const TypeIcon = typeConf.icon

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${typeConf.color}`}>
                        <TypeIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">{incident.code}</h1>
                            <Badge variant="outline" className={`${statConf.color}`}>
                                {statConf.label}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {format(new Date(incident.incident_date), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                            </span>
                            {incident.location && (
                                <span className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {incident.location}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {/* Workflow Buttons based on status */}
                    {incident.status === 'SIGNALE' && (
                        <Button onClick={() => onStatusChange('INVESTIGATION')} disabled={isUpdating} className="w-full sm:w-auto mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700">
                            Lancer l'investigation
                        </Button>
                    )}

                    {incident.status === 'INVESTIGATION' && (
                        <Button onClick={() => onStatusChange('ACTION_REQUISE')} disabled={isUpdating} className="w-full sm:w-auto mt-4 sm:mt-0 bg-orange-600 hover:bg-orange-700">
                            Requérir une action
                        </Button>
                    )}

                    {incident.status === 'ACTION_REQUISE' && (
                        <>
                            <Button onClick={() => onStatusChange('RESOLU')} disabled={isUpdating} className="w-full sm:w-auto mt-4 sm:mt-0 bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Marquer comme Résolu
                            </Button>
                            {!incident.generated_work_order_id && (
                                <Button onClick={onGenerateWO} disabled={isUpdating} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 w-full md:w-auto">
                                    <ClipboardList className="w-4 h-4 mr-2" />
                                    Générer un OT
                                </Button>
                            )}
                        </>
                    )}

                    {incident.status === 'RESOLU' && (
                        <Button onClick={() => onStatusChange('CLOTURE')} disabled={isUpdating} variant="outline" className="w-full sm:w-auto mt-4 sm:mt-0 bg-white hover:bg-gray-50 border-gray-200">
                            Clôturer le dossier
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column (Main Details) 2/3 */}
                <div className="md:col-span-2 space-y-6">

                    {/* Description Card */}
                    <Card className="shadow-sm border-gray-100">
                        <CardHeader className="pb-3 border-b border-gray-50 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center text-gray-800">
                                <FileText className="w-5 h-5 mr-2 text-gray-400" />
                                Description de l'événement
                            </CardTitle>
                            <Badge className={`rounded-md font-medium px-2.5 py-0.5 border-transparent ${getSeverityConfig(incident.severity)}`}>
                                {severityLabels[incident.severity] || incident.severity}
                            </Badge>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-6">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Ce qui s'est passé</h4>
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {incident.description}
                                </p>
                            </div>

                            {incident.immediate_measures && (
                                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                                    <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                                        <AlertTriangle className="w-4 h-4 mr-1 text-blue-600" />
                                        Mesures immédiates prises
                                    </h4>
                                    <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                                        {incident.immediate_measures}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Investigation Data (if investigating or later) */}
                    {['INVESTIGATION', 'ACTION_REQUISE', 'RESOLU', 'CLOTURE'].includes(incident.status) && (
                        <Card className="shadow-sm border-gray-100">
                            <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50">
                                <CardTitle className="text-lg flex items-center text-gray-800">
                                    <Search className="w-5 h-5 mr-2 text-gray-400" />
                                    Données d'investigation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Cause probable</h4>
                                    {incident.probable_cause ? (
                                        <p className="text-gray-700 whitespace-pre-wrap">{incident.probable_cause}</p>
                                    ) : (
                                        <p className="text-gray-400 italic text-sm">Non documentée par l'enquêteur.</p>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Actions correctives recommandées</h4>
                                    {incident.corrective_actions ? (
                                        <p className="text-gray-700 whitespace-pre-wrap">{incident.corrective_actions}</p>
                                    ) : (
                                        <p className="text-gray-400 italic text-sm">Aucune action corrective recommandée pour le moment.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                </div>

                {/* Right Column (Meta & Evidence) 1/3 */}
                <div className="space-y-6">

                    {/* Meta Info */}
                    <Card className="shadow-sm border-gray-100">
                        <CardHeader className="pb-3 border-b border-gray-50">
                            <CardTitle className="text-base">Détails</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4 text-sm">
                            <div>
                                <span className="text-gray-500 block mb-1">Équipement impliqué</span>
                                {incident.equipment ? (
                                    <Link href={`/equipment/${incident.equipment.id}`} className="font-medium text-blue-600 hover:underline">
                                        {incident.equipment.code} - {incident.equipment.name}
                                    </Link>
                                ) : (
                                    <span className="text-gray-800">Aucun équipement lié</span>
                                )}
                            </div>

                            <div>
                                <span className="text-gray-500 block mb-1">Déclaré par</span>
                                <span className="text-gray-800 font-medium">{incident.creator?.full_name || 'Système'}</span>
                            </div>

                            <div>
                                <span className="text-gray-500 block mb-1">Responsable assigné</span>
                                <span className="text-gray-800">{incident.responsible?.full_name || 'Non assigné'}</span>
                            </div>

                            {incident.generated_work_order_id && (
                                <div className="pt-3 border-t border-gray-100">
                                    <span className="text-gray-500 block mb-1 flex items-center">
                                        <ClipboardList className="w-3 h-3 mr-1" /> OT Généré
                                    </span>
                                    <Link href={`/maintenance/${incident.generated_work_order_id}`} className="font-medium text-blue-600 hover:underline">
                                        Voir l'ordre de travail →
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Evidence / Files */}
                    <Card className="shadow-sm border-gray-100">
                        <CardHeader className="pb-3 border-b border-gray-50">
                            <CardTitle className="text-base flex items-center">
                                <Camera className="w-4 h-4 mr-2 text-gray-400" />
                                Preuves & Fichiers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {incident.evidence_urls && incident.evidence_urls.length > 0 ? (
                                <ul className="space-y-2">
                                    {incident.evidence_urls.map((url, idx) => (
                                        <li key={idx} className="flex items-center text-sm text-blue-600 hover:underline cursor-pointer">
                                            <FileText className="w-4 h-4 mr-2 text-gray-400" />
                                            Preuve_{idx + 1}.jpg
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-6 text-gray-400">
                                    <Camera className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm italic">Aucun fichier joint</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    )
}
// Import Eye here to fix the typeConf icon logic since NextJS might complain if not imported from lucide-react, 
// wait, Eye is not imported correctly if Search was meant for something else. Actually, I will make sure Eye is imported.
import { Eye, Search } from "lucide-react"
