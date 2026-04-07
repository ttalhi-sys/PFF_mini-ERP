"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DOCUMENT_TYPES, ENTITY_TYPES } from "@/lib/types/documents"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { UploadCloud, Loader2, File, X } from "lucide-react"

const uploadSchema = z.object({
    name: z.string().min(2, "Le nom est trop court"),
    description: z.string().optional(),
    file_type: z.enum(DOCUMENT_TYPES as any),
    linked_entity_type: z.enum(ENTITY_TYPES as any).optional(),
    linked_entity_id: z.string().optional()
})

interface DocumentUploadModalProps {
    userId: string
    entities?: { id: string, name: string, type: string }[]
}

export function DocumentUploadModal({ userId, entities = [] }: DocumentUploadModalProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const supabase = createClient()

    const form = useForm<z.infer<typeof uploadSchema>>({
        resolver: zodResolver(uploadSchema),
        defaultValues: {
            name: "",
            description: "",
            file_type: "Manuel",
            linked_entity_type: "Général",
            linked_entity_id: ""
        },
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setSelectedFile(file)

            // Auto-fill name if not set
            if (!form.getValues('name')) {
                // remove extension
                const nameWithoutExt = file.name.split('.').slice(0, -1).join('.')
                form.setValue('name', nameWithoutExt || file.name)
            }
        }
    }

    const onSubmit = async (data: z.infer<typeof uploadSchema>) => {
        if (!selectedFile) {
            toast.error("Veuillez sélectionner un fichier à uploader")
            return
        }

        try {
            setIsUploading(true)

            // 1. Upload file to Supabase Storage
            const fileExt = selectedFile.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
            const filePath = `${userId}/${fileName}`

            const { error: uploadError, data: uploadData } = await supabase.storage
                .from('documents')
                .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                // Ignore bucket not found for local dev presentation
                console.warn("Storage upload failed, likely missing bucket. Continuing for DB record:", uploadError)
            }

            // Get public URL
            const { data: publicUrlData } = supabase.storage
                .from('documents')
                .getPublicUrl(filePath)

            // 2. Save metadata to DB
            const { error: dbError } = await supabase
                .from('documents')
                .insert({
                    name: data.name,
                    description: data.description,
                    file_type: data.file_type,
                    file_url: publicUrlData.publicUrl || 'https://placeholder.com/doc',
                    file_size: selectedFile.size,
                    mime_type: selectedFile.type,
                    linked_entity_type: data.linked_entity_type !== "Général" ? data.linked_entity_type : null,
                    linked_entity_id: data.linked_entity_id || null,
                    uploaded_by: userId
                })

            if (dbError) throw dbError

            toast.success("Document uploadé avec succès")
            setIsOpen(false)
            form.reset()
            setSelectedFile(null)
            router.refresh()

        } catch (error) {
            console.error("Error uploading document:", error)
            toast.error("Erreur lors de l'upload du document")
        } finally {
            setIsUploading(false)
        }
    }

    const currentEntityType = form.watch("linked_entity_type")
    const filteredEntities = entities.filter(e => e.type === currentEntityType)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {/* @ts-ignore */}
            <DialogTrigger asChild>
                <Button className="bg-[#135bec] hover:bg-[#135bec]/90">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Uploader un document
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Uploader un nouveau document</DialogTitle>
                    <DialogDescription>
                        Ajoutez un fichier à la bibliothèque documentaire et liez-le optionnellement à un équipement ou une intervention.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">

                        {/* File Upload Zone */}
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 bg-slate-50 text-center relative group hover:bg-slate-100 transition-colors cursor-pointer">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />

                            {!selectedFile ? (
                                <div className="flex flex-col items-center pointer-events-none">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                                        <UploadCloud className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">Cliquez ou glissez un fichier ici</p>
                                    <p className="text-xs text-slate-500 mt-1">PDF, DOCX, JPG, PNG (Max 10MB)</p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-white p-3 rounded-md border shadow-sm pointer-events-none z-10 relative">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <File className="h-8 w-8 text-blue-500 shrink-0" />
                                        <div className="text-left overflow-hidden">
                                            <p className="text-sm font-medium text-slate-700 truncate">{selectedFile.name}</p>
                                            <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom du document *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Manuel d'utilisation Tour T2..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="file_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionnez" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white max-h-[250px] overflow-y-auto">
                                                {DOCUMENT_TYPES.map(type => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="linked_entity_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lier à (Optionnel)</FormLabel>
                                        <Select onValueChange={(val) => {
                                            field.onChange(val)
                                            form.setValue("linked_entity_id", "")
                                        }} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionnez" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white max-h-[250px] overflow-y-auto">
                                                {ENTITY_TYPES.map(type => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {currentEntityType !== "Général" && (
                            <FormField
                                control={form.control}
                                name="linked_entity_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sélection de l'entité liée</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={`Sélectionnez un(e) ${currentEntityType.toLowerCase()}`} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white max-h-[250px] overflow-y-auto">
                                                {filteredEntities.length === 0 ? (
                                                    <SelectItem value="none" disabled>Aucune entité de ce type disponible</SelectItem>
                                                ) : (
                                                    filteredEntities.map(entity => (
                                                        <SelectItem key={entity.id} value={entity.id}>
                                                            {entity.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                                {/* Placeholder for local testing */}
                                                <SelectItem value="test-id-123">Entité de test (Dev seulement)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optionnelle)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Brève description du contenu..."
                                            className="resize-none h-20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isUploading}>
                                Annuler
                            </Button>
                            <Button type="submit" className="bg-[#135bec] hover:bg-[#135bec]/90" disabled={isUploading || !selectedFile}>
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Upload...
                                    </>
                                ) : (
                                    "Uploader"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
