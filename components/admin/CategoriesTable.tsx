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

export interface CategoryWithCount {
    id: string
    name: string
    description: string | null
    icon: string | null
    created_at: string
    equipment_count: number
}

export function CategoriesTable({ initialCategories }: { initialCategories: CategoryWithCount[] }) {
    const router = useRouter()
    const supabase = createClient()
    const [categories, setCategories] = useState<CategoryWithCount[]>(initialCategories)

    // UI State
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState({ name: "", description: "" })

    const resetForm = () => {
        setFormData({ name: "", description: "" })
        setIsAdding(false)
        setEditingId(null)
    }

    const startEditing = (category: CategoryWithCount) => {
        setFormData({ name: category.name, description: category.description || "" })
        setEditingId(category.id)
        setIsAdding(false)
    }

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error("Le nom de la catégorie est requis")
            return
        }

        setIsSubmitting(true)
        try {
            if (editingId) {
                // Update
                const { error } = await supabase
                    .from('categories')
                    .update({
                        name: formData.name.trim(),
                        description: formData.description.trim() || null
                    })
                    .eq('id', editingId)

                if (error) throw error

                setCategories(prev => prev.map(c =>
                    c.id === editingId
                        ? { ...c, name: formData.name.trim(), description: formData.description.trim() || null }
                        : c
                ))
                toast.success("Catégorie mise à jour")
            } else {
                // Insert
                const { data, error } = await supabase
                    .from('categories')
                    .insert({
                        name: formData.name.trim(),
                        description: formData.description.trim() || null
                    })
                    .select()
                    .single()

                if (error) throw error

                if (data) {
                    setCategories([...categories, { ...data, equipment_count: 0 } as CategoryWithCount])
                    toast.success("Catégorie créée")
                }
            }
            resetForm()
            router.refresh() // Refresh server components just in case
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors de l'enregistrement")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string, equipmentCount: number) => {
        if (equipmentCount > 0) {
            toast.error("Impossible de supprimer une catégorie contenant des équipements")
            return
        }

        if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) return

        setIsSubmitting(true)
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id)

            if (error) throw error

            setCategories(prev => prev.filter(c => c.id !== id))
            toast.success("Catégorie supprimée")
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
                    <h1 className="text-3xl font-bold text-slate-800">Catégories d'Équipements</h1>
                    <p className="text-slate-500 mt-1">Gérez les définitions de classification (exclut les sous-catégories temporelles)</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setIsAdding(true) }}
                    disabled={isAdding || editingId !== null}
                    className="bg-[#135bec] hover:bg-[#135bec]/90 shrink-0"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle catégorie
                </Button>
            </div>

            <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="font-semibold text-slate-700 w-[250px]">Nom de la Catégorie</TableHead>
                            <TableHead className="font-semibold text-slate-700">Description</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-center w-[120px]">Équipements</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right w-[120px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isAdding && (
                            <TableRow className="bg-blue-50/30">
                                <TableCell>
                                    <Input
                                        autoFocus
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Nom..."
                                        className="h-8"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Description (optionnelle)..."
                                        className="h-8"
                                    />
                                </TableCell>
                                <TableCell className="text-center text-slate-400">-</TableCell>
                                <TableCell className="text-right">
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

                        {categories.map((category) => (
                            <TableRow key={category.id} className="hover:bg-slate-50/50">
                                <TableCell className="font-medium text-slate-800">
                                    {editingId === category.id ? (
                                        <Input
                                            autoFocus
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="h-8"
                                        />
                                    ) : category.name}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                    {editingId === category.id ? (
                                        <Input
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="h-8"
                                            placeholder="Description optionnelle..."
                                        />
                                    ) : category.description || <span className="text-slate-400 italic">Aucune description</span>}
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full ${category.equipment_count > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {category.equipment_count}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    {editingId === category.id ? (
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
                                                onClick={() => startEditing(category)}
                                                disabled={isAdding || editingId !== null}
                                                className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(category.id, category.equipment_count)}
                                                disabled={isAdding || editingId !== null || category.equipment_count > 0}
                                                className={`h-8 w-8 ${category.equipment_count > 0 ? 'text-slate-300' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
                                                title={category.equipment_count > 0 ? "Impossible de supprimer: contient des équipements" : "Supprimer"}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {categories.length === 0 && !isAdding && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                                    Aucune catégorie trouvée. Créez-en une.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
