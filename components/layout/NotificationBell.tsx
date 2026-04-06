"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Loader2, AlertTriangle, AlertCircle, Clock, CheckCircle2, Info } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { NotificationRow, NotificationType } from "@/lib/types/notifications"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export function NotificationBell({ userId }: { userId: string }) {
    const router = useRouter()
    const supabase = createClient()
    const [notifications, setNotifications] = useState<NotificationRow[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10)

            if (error) throw error

            if (data) {
                setNotifications(data as NotificationRow[])
                setUnreadCount(data.filter(n => !n.is_read).length)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()

        // Set up real-time subscription for new notifications
        const channel = supabase
            .channel('notifications_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                () => {
                    fetchNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, supabase])

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
            if (unreadIds.length === 0) return

            // Optimistic update
            setNotifications(notifications.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)

            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .in('id', unreadIds)

            if (error) throw error
        } catch (error) {
            console.error('Error marking as read:', error)
            // Revert on error
            fetchNotifications()
        }
    }

    const handleNotificationClick = async (notification: NotificationRow) => {
        // Mark this one as read
        if (!notification.is_read) {
            setNotifications(notifications.map(n =>
                n.id === notification.id ? { ...n, is_read: true } : n
            ))
            setUnreadCount(prev => Math.max(0, prev - 1))

            supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notification.id)
                .then() // Fire and forget
        }

        // Navigate based on type
        if (notification.linked_entity_type && notification.linked_entity_id) {
            switch (notification.linked_entity_type) {
                case 'equipment':
                    router.push(`/equipment/${notification.linked_entity_id}`)
                    break
                case 'work_orders':
                    router.push(`/maintenance/${notification.linked_entity_id}`)
                    break
                case 'loans':
                    router.push(`/loans/${notification.linked_entity_id}`)
                    break
                case 'sst_incidents':
                    router.push(`/sst/incidents/${notification.linked_entity_id}`)
                    break
                case 'helpdesk_tickets':
                    router.push(`/helpdesk/${notification.linked_entity_id}`)
                    break
                default:
                    // Fallback
                    break
            }
        }
    }

    const getIconForType = (type: NotificationType) => {
        switch (type) {
            case 'maintenance_overdue':
                return <AlertTriangle className="h-4 w-4 text-orange-500" />
            case 'loan_overdue':
                return <AlertCircle className="h-4 w-4 text-red-500" />
            case 'loan_reminder':
                return <Clock className="h-4 w-4 text-blue-500" />
            case 'incident_new':
                return <AlertTriangle className="h-4 w-4 text-red-600" />
            case 'ticket_assigned':
                return <CheckCircle2 className="h-4 w-4 text-blue-600" />
            default:
                return <Info className="h-4 w-4 text-slate-500" />
        }
    }

    return (
        <DropdownMenu>
            {/* @ts-expect-error Radix UI asChild type mismatch */}
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative focus-visible:ring-0">
                    <Bell className="h-5 w-5 text-slate-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] p-0 rounded-xl shadow-lg border-slate-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                    <DropdownMenuLabel className="p-0 font-semibold text-slate-800">
                        Notifications
                    </DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault()
                                markAllAsRead()
                            }}
                            className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                        >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Tout marquer comme lu
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <Loader2 className="h-6 w-6 animate-spin mb-2" />
                            <span className="text-sm">Chargement...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                <Bell className="h-5 w-5 text-slate-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-800">Aucune notification</p>
                            <p className="text-xs text-slate-500 mt-1">Vous êtes à jour dans vos suivis.</p>
                        </div>
                    ) : (
                        <div className="py-1">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={`flex items-start gap-3 p-4 cursor-pointer focus:bg-slate-50 transition-colors ${!notification.is_read ? 'bg-blue-50/40' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className={`mt-0.5 rounded-full p-1.5 ${!notification.is_read ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                                        {getIconForType(notification.type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className={`text-sm ${!notification.is_read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-slate-500 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-slate-400 pt-1">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                                        </p>
                                    </div>
                                    {!notification.is_read && (
                                        <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-600 shrink-0" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                    <Button variant="ghost" className="w-full text-xs text-slate-600 justify-center h-8">
                        Afficher toutes les notifications
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
