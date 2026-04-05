"use client"

import { SSTSheet } from "@/lib/types/sst"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Hand, Ear, Footprints } from "lucide-react"
import Link from "next/link"

interface SSTSheetCardProps {
    sheet: SSTSheet
}

export function SSTSheetCard({ sheet }: SSTSheetCardProps) {
    // Determine top border color based on danger category
    let borderColor = "border-gray-200"
    let badgeColor = "bg-gray-100 text-gray-800"

    switch (sheet.danger_category) {
        case "Mécanique/Pneumatique":
            borderColor = "border-t-red-500"
            badgeColor = "bg-red-100 text-red-800"
            break
        case "Ergonomique":
            borderColor = "border-t-orange-500"
            badgeColor = "bg-orange-100 text-orange-800"
            break
        case "Électrique/Optique":
            borderColor = "border-t-yellow-500"
            badgeColor = "bg-yellow-100 text-yellow-800"
            break
        case "Électrique faible":
            borderColor = "border-t-blue-500"
            badgeColor = "bg-blue-100 text-blue-800"
            break
        default:
            // fallback color
            borderColor = "border-t-gray-500"
            badgeColor = "bg-gray-100 text-gray-800"
            break
    }

    // Parse main risks (assume line breaks or commas)
    const mainRisks = sheet.main_risks?.split(/[\n,]/).filter(r => r.trim().length > 0).slice(0, 3) || []

    return (
        <Card className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-t-4 border-l border-r border-b ${borderColor}`}>
            <CardContent className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-gray-900 line-clamp-1" title={sheet.equipment?.name || "Équipement inconnu"}>
                            {sheet.equipment?.name || "Équipement inconnu"}
                        </h3>
                        <p className="font-mono text-sm text-gray-500 mt-1">{sheet.equipment?.code || "N/A"}</p>
                    </div>
                </div>

                <div className="mb-4">
                    <Badge variant="outline" className={`border-none ${badgeColor} hover:${badgeColor}`}>
                        {sheet.danger_category || "Non catégorisé"}
                    </Badge>
                </div>

                <div className="flex-grow">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 tracking-wider">Risques principaux</h4>
                    {mainRisks.length > 0 ? (
                        <ul className="text-sm text-gray-700 space-y-1">
                            {mainRisks.map((risk, idx) => (
                                <li key={idx} className="line-clamp-1 flex items-start">
                                    <span className="mr-2 text-gray-400">•</span>
                                    <span title={risk.trim()}>{risk.trim()}</span>
                                </li>
                            ))}
                            {sheet.main_risks && sheet.main_risks.split(/[\n,]/).length > 3 && (
                                <li className="text-xs text-gray-400 italic mt-1">... et autres</li>
                            )}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400 italic">Aucun risque spécifié</p>
                    )}
                </div>

                {sheet.required_ppe && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-3 text-gray-500">
                            {sheet.required_ppe.toLowerCase().includes('lunettes') && <Eye size={18} aria-label="Lunettes de sécurité" />}
                            {sheet.required_ppe.toLowerCase().includes('gants') && <Hand size={18} aria-label="Gants de protection" />}
                            {sheet.required_ppe.toLowerCase().includes('auditive') && <Ear size={18} aria-label="Protection auditive" />}
                            {sheet.required_ppe.toLowerCase().includes('chaussures') && <Footprints size={18} aria-label="Chaussures de sécurité" />}
                        </div>
                    </div>
                )}

                <div className="mt-5 pt-2">
                    <Link
                        href={`/sst/sheets/${sheet.equipment_id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors"
                    >
                        Voir la fiche complète <span className="ml-1">→</span>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
