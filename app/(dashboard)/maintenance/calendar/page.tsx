import React from 'react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function MaintenanceCalendarPage({
    searchParams,
}: {
    searchParams: { date?: string };
}) {
    const supabase = createClient();

    const currentDate = searchParams.date ? new Date(searchParams.date) : new Date();
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    const daysInMonth = eachDayOfInterval({
        start: monthStart,
        end: monthEnd,
    });

    // Fetch work orders for the current month view
    // Note: Only fetching those with a planned_date
    const { data: workOrders } = await supabase
        .from('work_orders')
        .select('id, code, title, planned_date, status')
        .not('planned_date', 'is', null)
        .gte('planned_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('planned_date', format(monthEnd, 'yyyy-MM-dd'));

    const getOrdersForDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return (workOrders || []).filter(wo => {
            // Extract just the date part if it contains time
            const plannedDate = wo.planned_date ? wo.planned_date.split('T')[0] : '';
            return plannedDate === dateStr;
        });
    };

    // Status mapping to colors
    const statusColors: Record<string, string> = {
        new: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
        planned: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
        in_progress: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
        blocked: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
        completed: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
        closed: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
    };

    // Helper for navigation
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

    return (
        <div className="p-6 h-[calc(100vh-64px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Calendrier de maintenance</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-1 rounded-md flex">
                        <Link
                            href="/maintenance?view=table"
                            className="px-3 py-1.5 text-sm font-medium text-gray-500 rounded-sm hover:text-gray-900 transition-colors"
                        >
                            Tableau
                        </Link>
                        <Link
                            href="/maintenance?view=kanban"
                            className="px-3 py-1.5 text-sm font-medium text-gray-500 rounded-sm hover:text-gray-900 transition-colors"
                        >
                            Kanban
                        </Link>
                        <Link
                            href="/maintenance/calendar"
                            className="px-3 py-1.5 text-sm font-medium rounded-sm transition-colors bg-white text-gray-900 shadow-sm"
                        >
                            Calendrier
                        </Link>
                    </div>

                    <Link
                        href="/maintenance/new"
                        className="inline-flex items-center justify-center bg-blue-600 text-white font-medium text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Nouvel ordre
                    </Link>
                </div>
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-t-lg border border-gray-200 border-b-0 shrink-0">
                <h2 className="text-xl font-semibold text-gray-800 capitalize">
                    {format(currentDate, 'MMMM yyyy', { locale: fr })}
                </h2>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/maintenance/calendar?date=${format(prevMonth, 'yyyy-MM-dd')}`}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <Link
                        href={`/maintenance/calendar?date=${format(new Date(), 'yyyy-MM-dd')}`}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 mx-2"
                    >
                        Aujourd&apos;hui
                    </Link>
                    <Link
                        href={`/maintenance/calendar?date=${format(nextMonth, 'yyyy-MM-dd')}`}
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-b-lg overflow-hidden flex flex-col">
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 shrink-0">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                        <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Body */}
                <div className="flex-1 grid grid-cols-7 grid-rows-5 or auto-rows-[minmax(120px,1fr)] bg-gray-200 gap-[1px]">
                    {/* Pad beginning of month if it doesn't start on Monday */}
                    {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
                        <div key={`empty-start-${i}`} className="bg-gray-50/50 p-2 min-h-[120px]" />
                    ))}

                    {daysInMonth.map((day) => {
                        const dateOrders = getOrdersForDate(day);
                        const isCurrentMonth = isSameMonth(day, currentDate);

                        return (
                            <div
                                key={day.toString()}
                                className={`bg-white p-2 flex flex-col ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'} min-h-[120px] transition-colors hover:bg-gray-50/30`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-blue-600 text-white' : ''}`}>
                                        {format(day, 'd')}
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-1.5 hide-scrollbar">
                                    {dateOrders.map(wo => (
                                        <Link
                                            key={wo.id}
                                            href={`/maintenance/${wo.id}`}
                                            title={`${wo.code} - ${wo.title}`}
                                            className={`block px-2 py-1 text-xs truncate rounded border shadow-sm transition-all focus:ring-2 focus:ring-blue-500 outline-none ${statusColors[wo.status] || statusColors.new}`}
                                        >
                                            <span className="font-semibold mr-1">{wo.code}</span>
                                            {wo.title}
                                        </Link>
                                    ))}

                                    {/* Ghost element to allow scrolling fully down if many items */}
                                    <div className="h-1"></div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Pad end of month */}
                    {Array.from({ length: (7 - ((monthStart.getDay() + 6) % 7 + daysInMonth.length) % 7) % 7 }).map((_, i) => (
                        <div key={`empty-end-${i}`} className="bg-gray-50/50 p-2 min-h-[120px]" />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Global CSS to hide scrollbar for calendar pills area
// Add this in global.css or equivalent if not exist
/*
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
*/
