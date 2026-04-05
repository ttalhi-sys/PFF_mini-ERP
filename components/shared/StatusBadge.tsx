import { cn } from "@/lib/utils"

export type BadgeStatus =
    | "available" | "Disponible"
    | "borrowed" | "Emprunté"
    | "in_maintenance" | "En maintenance"
    | "out_of_service" | "Hors service"
    | "overdue" | "En retard"
    | "new" | "Nouveau"
    | "planned" | "Planifié"
    | "in_progress" | "En cours"
    | "completed" | "Terminé"
    | "closed" | "Clôturé"
    | "reserved" | "Réservé"
    | "active" | "Actif"
    | "returned" | "Retourné"
    | "cancelled" | "Annulé"
    | "EN_SERVICE" | "EN_STOCK" | "RESERVE" | "EN_MAINTENANCE" | "PRETE" | "HORS_SERVICE" | "MIS_AU_REBUT" | "A_VALIDER"

interface StatusBadgeProps {
    status: BadgeStatus | string
    className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    // Normalize status for simpler mapping
    const normalizedStatus = status.toLowerCase().trim()

    let styleClass = "bg-[#E5E7EB] text-[#374151]" // Default: Gray

    switch (normalizedStatus) {
        // Green background #DCFCE7, text #166534
        case "available":
        case "disponible":
        case "completed":
        case "terminé":
        case "returned":
        case "retourné":
        case "en_service":
            styleClass = "bg-[#DCFCE7] text-[#166534]"
            break

        // Blue background #DBEAFE, text #1E40AF
        case "borrowed":
        case "emprunté":
        case "planned":
        case "planifié":
        case "active":
        case "actif":
        case "prete":
            styleClass = "bg-[#DBEAFE] text-[#1E40AF]"
            break

        // Orange background #FEF3C7, text #92400E
        case "in_maintenance":
        case "en maintenance":
        case "in_progress":
        case "en cours":
        case "en_maintenance":
            styleClass = "bg-[#FEF3C7] text-[#92400E]"
            break

        // Red background #FEE2E2, text #991B1B
        case "out_of_service":
        case "hors service":
        case "overdue":
        case "en retard":
        case "hors_service":
            styleClass = "bg-[#FEE2E2] text-[#991B1B]"
            break

        // Yellow background #FEF9C3, text #854D0E
        case "a_valider":
            styleClass = "bg-[#FEF9C3] text-[#854D0E]"
            break

        // Dark Gray background #F3F4F6, text #111827
        case "mis_au_rebut":
            styleClass = "bg-[#E5E7EB] text-[#111827]"
            break

        // Gray background #E5E7EB, text #374151
        case "en_stock":
        case "reserve":
        case "new":
        case "nouveau":
        case "closed":
        case "clôturé":
        case "reserved":
        case "réservé":
        case "cancelled":
        case "annulé":
        default:
            styleClass = "bg-[#E5E7EB] text-[#374151]"
            break
    }

    // Format display text if it's an internal known key
    const displayMap: Record<string, string> = {
        available: "Disponible",
        borrowed: "Emprunté",
        in_maintenance: "En maintenance",
        out_of_service: "Hors service",
        overdue: "En retard",
        new: "Nouveau",
        planned: "Planifié",
        in_progress: "En cours",
        completed: "Terminé",
        closed: "Clôturé",
        reserved: "Réservé",
        active: "Actif",
        returned: "Retourné",
        cancelled: "Annulé",
        en_service: "En service",
        en_stock: "En stock",
        reserve: "Réservé",
        prete: "Prêté",
        hors_service: "Hors service",
        mis_au_rebut: "Mis au rebut",
        a_valider: "À valider"
    }

    const displayText = displayMap[normalizedStatus] || status

    return (
        <span className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
            styleClass,
            className
        )}>
            {displayText}
        </span>
    )
}
