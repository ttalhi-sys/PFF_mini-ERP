import { differenceInDays, isValid, parseISO } from 'date-fns';

interface RateProps {
    rate_per_day?: number | null;
    rate_per_week?: number | null;
    rate_per_month?: number | null;
}

export function calculateBilling(
    checkoutDate: string | Date,
    returnDate: string | Date,
    rates: RateProps,
    quantity: number = 1
): number {
    const start = typeof checkoutDate === 'string' ? parseISO(checkoutDate) : checkoutDate;
    const end = typeof returnDate === 'string' ? parseISO(returnDate) : returnDate;

    if (!isValid(start) || !isValid(end) || start > end) {
        return 0; // Invalid dates or negative duration
    }

    // Always include at least 1 day if checked out and returned on the same day realistically, but for strict diff we use Math.max(1, diff)
    const days = differenceInDays(end, start);
    // Let's assume minimum billing is 1 day. Sometimes if you checkout and return same day differenceInDays is 0.
    const durationDays = Math.max(1, days);

    // Default to 0 if rate is somehow null
    const dayRate = rates.rate_per_day || 0;
    const weekRate = rates.rate_per_week || (dayRate * 7); // Fallback mapping if week rate missing
    const monthRate = rates.rate_per_month || (weekRate * 4); // Fallback mapping if month rate missing

    let singleItemSubtotal = 0;

    if (durationDays <= 7) {
        // Less than or equal to a week: bill per day
        singleItemSubtotal = dayRate * durationDays;
    } else if (durationDays <= 30) {
        // Between a week and a month: bill per week (ceiling)
        const weeks = Math.ceil(durationDays / 7);
        singleItemSubtotal = weekRate * weeks;
    } else {
        // More than a month: bill per month (ceiling)
        const months = Math.ceil(durationDays / 30);
        singleItemSubtotal = monthRate * months;
    }

    return singleItemSubtotal * quantity;
}

export function calculateLoanTotal(
    checkoutDate: string,
    returnDate: string,
    items: Array<{ quantity: number, rate_per_day?: number | null, rate_per_week?: number | null, rate_per_month?: number | null }>
): number {
    return items.reduce((total, item) => {
        return total + calculateBilling(checkoutDate, returnDate, item, item.quantity);
    }, 0);
}
