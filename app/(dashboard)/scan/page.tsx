"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { QrCode, Search, AlertTriangle, ArrowRight, Camera, FileText, Wrench, HandIcon, AlertCircle } from "lucide-react"
import { EquipmentRow } from "@/lib/types/equipment"

export default function ScannerPage() {
    const [code, setCode] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [foundEquipment, setFoundEquipment] = useState<EquipmentRow | null>(null)
    const [searchPerformed, setSearchPerformed] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code.trim()) return

        const searchCode = code.trim().toUpperCase()
        setIsSearching(true)
        setSearchPerformed(false)

        try {
            const { data, error } = await supabase
                .from('equipment')
                .select('*')
                .eq('code', searchCode)
                .single()

            setSearchPerformed(true)

            if (error || !data) {
                setFoundEquipment(null)
            } else {
                setFoundEquipment(data as EquipmentRow)
            }
        } catch (err) {
            console.error("Erreur de recherche:", err)
            setFoundEquipment(null)
            toast.error("Erreur lors de la recherche de l'équipement")
        } finally {
            setIsSearching(false)
        }
    }

    const resetSearch = () => {
        setCode("")
        setFoundEquipment(null)
        setSearchPerformed(false)
    }

    return (
        <div className="p-8 max-w-2xl mx-auto mt-6">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-4">
                    <QrCode className="h-10 w-10 text-[#135bec]" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800">Scanner d'Équipement</h1>
                <p className="text-slate-500 mt-2">Recherchez un équipement pour accéder rapidement aux actions associées</p>
            </div>

            <Card className="shadow-sm border-slate-200 mb-6">
                <CardHeader className="bg-slate-50 border-b pb-4">
                    <CardTitle className="text-lg text-slate-800">Recherche manuelle</CardTitle>
                    <CardDescription>Saisissez le code d'inventaire (ex: EQP-2024-001)</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                            <Input
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="Code équipement..."
                                className="pl-10 h-12 text-lg font-mono uppercase bg-slate-50/50 focus:bg-white"
                                autoFocus
                            />
                        </div>
                        <Button type="submit" className="h-12 px-6 bg-[#135bec] hover:bg-[#135bec]/90 text-white font-medium" disabled={!code.trim() || isSearching}>
                            {isSearching ? 'Recherche...' : 'Rechercher'}
                            {!isSearching && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </form>

                    {searchPerformed && !foundEquipment && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-red-800">Aucun équipement trouvé</h4>
                                <p className="text-sm text-red-700 mt-1">Le code <strong>{code}</strong> ne correspond à aucun équipement enregistré. Vérifiez la saisie et réessayez.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {foundEquipment ? (
                <Card className="shadow-md border-slate-200 border-t-4 border-t-blue-500 animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl text-slate-800">{foundEquipment.name}</CardTitle>
                                <CardDescription className="font-mono mt-1 text-slate-500">{foundEquipment.code}</CardDescription>
                            </div>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${foundEquipment.status === 'En service' ? 'bg-green-50 text-green-700 border-green-200' :
                                    foundEquipment.status === 'En maintenance' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                        foundEquipment.status === 'Hors service' ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                {foundEquipment.status}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <h4 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Actions disponibles</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="h-14 justify-start px-4 text-left border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 font-medium text-slate-700"
                                onClick={() => router.push(`/equipment/${foundEquipment.id}`)}
                            >
                                <FileText className="h-5 w-5 mr-3 text-blue-500" />
                                <div>
                                    <div className="text-sm">Voir la fiche</div>
                                    <div className="text-[10px] text-slate-400 font-normal">Détails, notices, historique</div>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-14 justify-start px-4 text-left border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 font-medium text-slate-700"
                                onClick={() => router.push(`/helpdesk/new?equipment=${foundEquipment.id}`)}
                            >
                                <AlertTriangle className="h-5 w-5 mr-3 text-orange-500" />
                                <div>
                                    <div className="text-sm">Signaler un problème</div>
                                    <div className="text-[10px] text-slate-400 font-normal">Panne, dysfonctionnement</div>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-14 justify-start px-4 text-left border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 font-medium text-slate-700"
                                onClick={() => router.push(`/maintenance/new?equipment=${foundEquipment.id}`)}
                            >
                                <Wrench className="h-5 w-5 mr-3 text-purple-500" />
                                <div>
                                    <div className="text-sm">Demander maintenance</div>
                                    <div className="text-[10px] text-slate-400 font-normal">Préventive ou curative</div>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                className={`h-14 justify-start px-4 text-left border-slate-200 font-medium ${foundEquipment.is_loanable
                                        ? 'hover:border-green-400 hover:bg-green-50/50 text-slate-700'
                                        : 'opacity-50 cursor-not-allowed'
                                    }`}
                                onClick={() => foundEquipment.is_loanable ? router.push(`/loans/new?equipment=${foundEquipment.id}`) : null}
                                disabled={!foundEquipment.is_loanable}
                            >
                                <HandIcon className={`h-5 w-5 mr-3 ${foundEquipment.is_loanable ? 'text-green-500' : 'text-slate-400'}`} />
                                <div>
                                    <div className="text-sm">Emprunter</div>
                                    <div className="text-[10px] text-slate-400 font-normal">
                                        {foundEquipment.is_loanable ? 'Créer un contrat de prêt' : 'Non prêtable'}
                                    </div>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50 border-t py-3">
                        <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-700" onClick={resetSearch}>
                            Nouvelle recherche
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none">
                    <CardContent className="flex flex-col items-center justify-center p-10 text-center">
                        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                            <Camera className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="font-semibold text-slate-700 text-lg">Fonctionnalité de scan caméra</h3>
                        <p className="text-sm text-slate-500 mt-2 max-w-sm mb-6">
                            L'intégration native avec la caméra de l'appareil (via PWA ou mobile) sera disponible prochainement dans une future mise à jour.
                        </p>
                        <Button variant="outline" className="bg-white" disabled>
                            Caméra indisponible
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
