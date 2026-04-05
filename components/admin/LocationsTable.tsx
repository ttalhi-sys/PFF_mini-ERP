"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Check, X, Loader2 } from "lucide-react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface LocationWithCount {
    id: string
    name: string
    description: string | null
    building: string | null
    floor: string | null
    zone: string | null
    room: string | null
    created_at: string
    equipment_count: number
}

export function LocationsTable({ initialLocations }: { initialLocations: LocationWithCount[] }) {
    const router = useRouter()
    const supabase = createClient()
    const [locations, setLocations] = useState<LocationWithCount[]>(initialLocations)

    // UI State
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        building: "",
        floor: "",
        zone: "",
        room: ""
    })

    const resetForm = () => {
        setFormData({ name: "", building: "", floor: "", zone: "", room: "" })
        setIsAdding(false)
        setEditingId(null)
    }

    const startEditing = (location: LocationWithCount) => {
        setFormData({
            name: location.name,
            building: location.building || "",
            floor: location.floor || "",
            zone: location.zone || "",
            room: location.room || ""
        })
        setEditingId(location.id)
        setIsAdding(false)
    }

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error("Le nom de la localisation est requis")
            return
        }

        setIsSubmitting(true)
        const payload = {
            name: formData.name.trim(),
            building: formData.building.trim() || null,
            floor: formData.floor.trim() || null,
            zone: formData.zone.trim() || null,
            room: formData.room.trim() || null
        }

        try {
            if (editingId) {
                // Update
                const { error } = await supabase
                    .from('locations')
                    .update(payload)
                    .eq('id', editingId)

                if (error) throw error

                setLocations(prev => prev.map(loc =>
                    loc.id === editingId ? { ...loc, ...payload } : loc
                ))
                toast.success("Localisation mise à jour")
            } else {
                // Insert
                const { data, error } = await supabase
                    .from('locations')
                    .insert(payload)
                    .select()
                    .single()

                if (error) throw error

                if (data) {
                    setLocations([...locations, { ...data, equipment_count: 0 } as LocationWithCount])
                    toast.success("Localisation ajoutée")
                }
            }
            resetForm()
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors de l'enregistrement")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string, equipmentCount: number) => {
        if (equipmentCount > 0) {
            toast.error("Impossible de supprimer une localisation contenant des équipements")
            return
        }

        if (!confirm("Êtes-vous sûr de vouloir supprimer cette localisation ?")) return

        setIsSubmitting(true)
        try {
            const { error } = await supabase
                .from('locations')
                .delete()
                .eq('id', id)

            if (error) throw error

            setLocations(prev => prev.filter(loc => loc.id !== id))
            toast.success("Localisation supprimée")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors de la suppression")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Lieux et Localisations</h1>
                    <p className="text-slate-500 mt-1">Gérez le référentiel des bâtiments, zones et salles du laboratoire</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setIsAdding(true) }}
                    disabled={isAdding || editingId !== null}
                    className="bg-[#135bec] hover:bg-[#135bec]/90 shrink-0"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle localisation
                </Button>
            </div>

            <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="font-semibold text-slate-700 w-[200px]">Nom usuel</TableHead>
                            <TableHead className="font-semibold text-slate-700">Bâtiment / Zone</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-center">Étage / Salle</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-center w-[120px]">Équipements</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right w-[120px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isAdding && (
                            <TableRow className="bg-blue-50/30 align-top">
                                <TableCell className="pt-4">
                                    <Input
                                        autoFocus
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Labo d'Essais A..."
                                        className="h-8"
                                    />
                                </TableCell>
                                <TableCell className="pt-4">
                                    <div className="flex gap-2">
                                        <Input
                                            value={formData.building}
                                            onChange={e => setFormData({ ...formData, building: e.target.value })}
                                            placeholder="Bâtiment..."
                                            className="h-8 w-1/2"
                                        />
                                        <Input
                                            value={formData.zone}
                                            onChange={e => setFormData({ ...formData, zone: e.target.value })}
                                            placeholder="Zone..."
                                            className="h-8 w-1/2"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="pt-4">
                                    <div className="flex gap-2">
                                        <Input
                                            value={formData.floor}
                                            onChange={e => setFormData({ ...formData, floor: e.target.value })}
                                            placeholder="Étage..."
                                            className="h-8 w-1/2"
                                        />
                                        <Input
                                            value={formData.room}
                                            onChange={e => setFormData({ ...formData, room: e.target.value })}
                                            placeholder="Salle..."
                                            className="h-8 w-1/2"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="pt-4 text-center text-slate-400">-</TableCell>
                                <TableCell className="pt-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" onClick={handleSave} disabled={isSubmitting || !formData.name.trim()} className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={resetForm} disabled={isSubmitting} className="h-8 w-8 text-slate-500 hover:bg-slate-100">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}

                        {locations.map((location) => (
                            <TableRow key={location.id} className="hover:bg-slate-50/50">
                                <TableCell className="font-medium text-slate-800">
                                    {editingId === location.id ? (
                                        <Input
                                            autoFocus
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="h-8"
                                        />
                                    ) : location.name}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                    {editingId === location.id ? (
                                        <div className="flex gap-2">
                                            <Input
                                                value={formData.building}
                                                onChange={e => setFormData({ ...formData, building: e.target.value })}
                                                placeholder="Bâtiment..."
                                                className="h-8 w-1/2"
                                            />
                                            <Input
                                                value={formData.zone}
                                                onChange={e => setFormData({ ...formData, zone: e.target.value })}
                                                placeholder="Zone..."
                                                className="h-8 w-1/2"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col">
                                            <span>{location.building || <span className="text-slate-400 italic">Bât. non spécifié</span>}</span>
                                            {location.zone && <span className="text-xs text-slate-400">Zone: {location.zone}</span>}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-center text-slate-600">
                                    {editingId === location.id ? (
                                        <div className="flex gap-2">
                                            <Input
                                                value={formData.floor}
                                                onChange={e => setFormData({ ...formData, floor: e.target.value })}
                                                placeholder="Étage..."
                                                className="h-8 w-1/2"
                                            />
                                            <Input
                                                value={formData.room}
                                                onChange={e => setFormData({ ...formData, room: e.target.value })}
                                                placeholder="Salle..."
                                                className="h-8 w-1/2"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <span>{location.room || <span className="text-slate-400 italic">-</span>}</span>
                                            {location.floor && <span className="text-xs text-slate-400">Étage {location.floor}</span>}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full ${location.equipment_count > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {location.equipment_count}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    {editingId === location.id ? (
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={handleSave} disabled={isSubmitting || !formData.name.trim()} className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={resetForm} disabled={isSubmitting} className="h-8 w-8 text-slate-500 hover:bg-slate-100">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => startEditing(location)}
                                                disabled={isAdding || editingId !== null}
                                                className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(location.id, location.equipment_count)}
                                                disabled={isAdding || editingId !== null || location.equipment_count > 0}
                                                className={`h-8 w-8 ${location.equipment_count > 0 ? 'text-slate-300' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
                                                title={location.equipment_count > 0 ? "Impossible de supprimer: contient des équipements" : "Supprimer"}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {locations.length === 0 && !isAdding && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                    Aucune localisation trouvée. Créez-en une.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
