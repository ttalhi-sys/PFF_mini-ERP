import { SSTSheet } from "@/lib/types/sst"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Eye, Hand, Ear, Footprints, XCircle, Printer } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface SSTSheetDetailProps {
    sheet: SSTSheet
}

export function SSTSheetDetail({ sheet }: SSTSheetDetailProps) {
    // Parsing text areas into lists
    const parseList = (text?: string | null) => {
        if (!text) return []
        return text.split(/[\n,]/).map(item => item.trim()).filter(item => item.length > 0)
    }

    const mainRisks = parseList(sheet.main_risks)
    const preventionMeasures = parseList(sheet.prevention_measures)
    const prohibitedActions = parseList(sheet.prohibited_actions)

    const isHighAlert = sheet.danger_category === "Mécanique/Pneumatique" || sheet.danger_category === "Électrique/Optique"

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{sheet.equipment?.name || "Équipement inconnu"}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <span className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">
                            {sheet.equipment?.code || "N/A"}
                        </span>
                        <Link href={`/equipment/${sheet.equipment_id}`} className="text-sm text-blue-600 hover:underline">
                            Voir la fiche équipement →
                        </Link>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isHighAlert && (
                        <Badge variant="destructive" className="text-sm py-1">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            DANGER ÉLEVÉ
                        </Badge>
                    )}
                    <Badge variant="outline" className="text-sm py-1 bg-gray-100 text-gray-800 border-none">
                        {sheet.danger_category || "Non catégorisé"}
                    </Badge>
                </div>
            </div>

            <div className="flex gap-2 justify-end mb-4">
                <Button variant="outline">
                    Modifier la fiche
                </Button>
                <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimer
                </Button>
            </div>

            <Card className="shadow-lg border-0 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-600 to-cyan-500 w-full" />
                <CardContent className="p-8 space-y-10">

                    {/* Section 1 - Risques principaux */}
                    <div className="border-l-4 border-red-500 pl-6 py-2 bg-red-50/30 rounded-r-lg">
                        <h2 className="text-xl font-bold flex items-center text-red-800 mb-4">
                            <AlertTriangle className="w-6 h-6 mr-2 text-red-500" />
                            Risques principaux
                        </h2>
                        {mainRisks.length > 0 ? (
                            <ul className="space-y-3">
                                {mainRisks.map((risk, idx) => (
                                    <li key={idx} className="flex items-start text-gray-800">
                                        <div className="mt-1 min-w-[20px] text-red-500 font-bold">•</div>
                                        <span>{risk}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">Aucun risque principal documenté.</p>
                        )}
                    </div>

                    {/* Section 2 - Mesures de prévention */}
                    <div className="border-l-4 border-green-500 pl-6 py-2 bg-green-50/30 rounded-r-lg">
                        <h2 className="text-xl font-bold flex items-center text-green-800 mb-4">
                            <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
                            Mesures de prévention
                        </h2>
                        {preventionMeasures.length > 0 ? (
                            <ul className="space-y-3">
                                {preventionMeasures.map((measure, idx) => (
                                    <li key={idx} className="flex items-start text-gray-800">
                                        <div className="mt-1 min-w-[20px] text-green-500 font-bold">•</div>
                                        <span>{measure}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">Aucune mesure de prévention documentée.</p>
                        )}
                    </div>

                    {/* Section 3 - EPI */}
                    <div className="border-l-4 border-blue-500 pl-6 py-2">
                        <h2 className="text-xl font-bold text-blue-800 mb-4">Équipements de protection individuelle (EPI) obligatoires</h2>
                        {sheet.required_ppe ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {sheet.required_ppe.toLowerCase().includes('lunettes') && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                                        <Eye className="w-8 h-8 text-blue-600 mb-2" />
                                        <span className="font-medium text-blue-900 text-sm">Lunettes</span>
                                    </div>
                                )}
                                {sheet.required_ppe.toLowerCase().includes('gants') && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                                        <Hand className="w-8 h-8 text-blue-600 mb-2" />
                                        <span className="font-medium text-blue-900 text-sm">Gants de protection</span>
                                    </div>
                                )}
                                {sheet.required_ppe.toLowerCase().includes('auditive') && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                                        <Ear className="w-8 h-8 text-blue-600 mb-2" />
                                        <span className="font-medium text-blue-900 text-sm">Protection auditive</span>
                                    </div>
                                )}
                                {sheet.required_ppe.toLowerCase().includes('chaussures') && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                                        <Footprints className="w-8 h-8 text-blue-600 mb-2" />
                                        <span className="font-medium text-blue-900 text-sm">Chaussures de sécurité</span>
                                    </div>
                                )}
                                {/* fallback if none matched above but text exists */}
                                {!sheet.required_ppe.toLowerCase().includes('lunettes') && !sheet.required_ppe.toLowerCase().includes('gants') && !sheet.required_ppe.toLowerCase().includes('auditive') && !sheet.required_ppe.toLowerCase().includes('chaussures') && (
                                    <div className="col-span-full">
                                        <p className="text-gray-700">{sheet.required_ppe}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">Aucun EPI spécifique requis.</p>
                        )}
                    </div>

                    {/* Section 4 - Avertissements */}
                    {sheet.warnings && (
                        <div className="border-l-4 border-orange-500 pl-6 py-4 bg-orange-50 rounded-r-lg">
                            <h2 className="text-xl font-bold flex items-center text-orange-800 mb-2">
                                <AlertTriangle className="w-6 h-6 mr-2 text-orange-500" />
                                Avertissements Spéciaux
                            </h2>
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                {sheet.warnings}
                            </p>
                        </div>
                    )}

                    {/* Section 5 - Actions Interdites */}
                    {prohibitedActions.length > 0 && (
                        <div className="border-l-4 border-red-600 pl-6 py-4 bg-red-100/50 rounded-r-lg">
                            <h2 className="text-xl font-bold flex items-center text-red-900 mb-4">
                                <XCircle className="w-6 h-6 mr-2 text-red-600" />
                                Actions Strictement Interdites
                            </h2>
                            <ul className="space-y-3">
                                {prohibitedActions.map((action, idx) => (
                                    <li key={idx} className="flex items-start text-red-900 font-medium">
                                        <div className="mt-1 min-w-[20px] font-bold">×</div>
                                        <span>{action}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Section 6 - Lockout Procedure / Cadenassage */}
                    {sheet.lockout_procedure && (
                        <div className="border-l-4 border-gray-400 pl-6 py-2">
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Procédure de cadenassage</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200">
                                {sheet.lockout_procedure}
                            </p>
                        </div>
                    )}

                </CardContent>

                <div className="bg-gray-50 p-6 border-t border-gray-200 mt-4 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
                    <div>
                        <span className="font-semibold">Dernière révision: </span>
                        {sheet.last_reviewed ? format(new Date(sheet.last_reviewed), "d MMMM yyyy", { locale: fr }) : "ND"}
                        {sheet.reviewer?.full_name && ` par ${sheet.reviewer.full_name}`}
                    </div>
                    <div>
                        <span className="font-semibold">Prochaine révision prévue: </span>
                        {sheet.last_reviewed ? format(new Date(new Date(sheet.last_reviewed).setFullYear(new Date(sheet.last_reviewed).getFullYear() + 1)), "MMMM yyyy", { locale: fr }) : "ND"}
                    </div>
                    {sheet.sop_reference && (
                        <div>
                            <span className="font-semibold">Réf. Procédure: </span>
                            <span className="font-mono text-gray-600">{sheet.sop_reference}</span>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}
