"use client"

import { AppDocument } from "@/lib/types/documents"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, FileImage, FileCode, File, Download, ExternalLink, Calendar, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DocumentGridProps {
    documents: AppDocument[]
}

export function DocumentGrid({ documents }: DocumentGridProps) {
    if (documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 mt-8 border-2 border-dashed rounded-xl bg-slate-50 border-slate-200">
                <File className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-medium text-slate-800 mb-2">Aucun document trouvé</h3>
                <p className="text-slate-500 text-center max-w-md">
                    Il n'y a actuellement aucun document dans la bibliothèque correspondant à ces critères.
                </p>
            </div>
        )
    }

    const getFileIcon = (fileType: string) => {
        if (fileType.toLowerCase().includes("pdf") || fileType === "Facture" || fileType === "Manuel") {
            return <FileText className="h-10 w-10 text-red-500" />
        }
        if (fileType === "Photo" || fileType.toLowerCase().includes("image")) {
            return <FileImage className="h-10 w-10 text-green-500" />
        }
        return <File className="h-10 w-10 text-blue-500" />
    }

    const formatBytes = (bytes: number | null) => {
        if (!bytes) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {documents.map((doc) => (
                <Card key={doc.id} className="group hover:shadow-md transition-shadow relative overflow-hidden flex flex-col">
                    <CardHeader className="p-4 bg-slate-50 border-b flex flex-row items-center justify-between space-y-0">
                        <div className="bg-white p-2 border rounded-lg shadow-sm">
                            {getFileIcon(doc.file_type)}
                        </div>
                        <Badge variant="outline" className="bg-white">
                            {doc.file_type}
                        </Badge>
                    </CardHeader>

                    <CardContent className="p-4 flex-1">
                        <h3 className="font-semibold text-slate-800 line-clamp-2 leading-tight mb-2" title={doc.name}>
                            {doc.name}
                        </h3>

                        {doc.description && (
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                                {doc.description}
                            </p>
                        )}

                        <div className="mt-4 space-y-2 text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                                <HardDrive className="h-3.5 w-3.5" />
                                <span>{formatBytes(doc.file_size)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{new Date(doc.created_at).toLocaleDateString('fr-FR')}</span>
                            </div>

                            {doc.linked_entity_type && doc.linked_entity_type !== "Général" && (
                                <div className="mt-3 pt-3 border-t">
                                    <span className="font-medium text-slate-700">Lié à:</span> {doc.linked_entity_type}
                                </div>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="p-4 border-t bg-slate-50/50 flex justify-between gap-2 mt-auto">
                        <Button
                            variant="default"
                            size="sm"
                            className="w-full bg-[#135bec] hover:bg-[#135bec]/90"
                            onClick={() => window.open(doc.file_url, '_blank')}
                        >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ouvrir
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="px-3"
                            onClick={() => {
                                // Fallback download strategy
                                const a = document.createElement('a');
                                a.href = doc.file_url;
                                a.download = doc.name;
                                a.click();
                            }}
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
