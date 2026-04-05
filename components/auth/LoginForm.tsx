"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Loader2, Lock, Droplets } from "lucide-react"

const loginSchema = z.object({
    email: z.string().email({ message: "Veuillez entrer une adresse email valide" }),
    password: z.string().min(6, { message: "Le mot de passe doit comporter au moins 6 caractères" }),
})

export function LoginForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof loginSchema>) => {
        try {
            setIsLoading(true)

            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })

            if (error) {
                toast.error("Identifiants incorrects. Veuillez réessayer.")
                return
            }

            toast.success("Connexion réussie")
            router.push("/dashboard" /* we will just redirect to root which is dashboard if using our layout, or / as default */)
            // Just push to dashboard 
            // In our app structure, dashboard might be '/' or '/dashboard', since the sidebar links default to '/' let's navigate to '/'
            router.push("/")
            router.refresh()

        } catch (error) {
            toast.error("Une erreur inattendue s'est produite")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-[400px] shadow-lg border-slate-200">
            <CardHeader className="space-y-3 pb-6 text-center">
                <div className="w-16 h-16 bg-[#135bec]/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <Droplets className="w-8 h-8 text-[#135bec]" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-800">LabGFHA ERP</CardTitle>
                <CardDescription>
                    Connectez-vous pour accéder à votre espace
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Adresse Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="prenom.nom@uqtr.ca" autoComplete="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Mot de passe</FormLabel>
                                        <a href="#" className="text-xs text-[#135bec] hover:underline" tabIndex={-1}>
                                            Mot de passe oublié ?
                                        </a>
                                    </div>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full bg-[#135bec] hover:bg-[#135bec]/90 mt-6" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Lock className="mr-2 h-4 w-4" />
                            )}
                            Se connecter
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="justify-center border-t pt-6 pb-6 bg-slate-50">
                <p className="text-xs text-slate-500 text-center">
                    Accès réservé au personnel et aux étudiants autorisés du laboratoire GFHA de l'UQTR.
                </p>
            </CardFooter>
        </Card>
    )
}
