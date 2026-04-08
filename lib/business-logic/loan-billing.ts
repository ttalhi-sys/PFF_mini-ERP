import { differenceInDays, isValid, parseISO } from 'date-fns';

export type BillingMode = 'day' | 'week' | 'month';

interface RateProps {
    rate_per_day?: number | null;
    rate_per_week?: number | null;
    rate_per_month?: number | null;
}

/**
 * Calculate the number of billing periods based on the billing mode and duration in days.
 */
export function calculatePeriods(durationDays: number, mode: BillingMode): number {
    switch (mode) {
        case 'day':
            return durationDays;
        case 'week':
            return Math.ceil(durationDays / 7);
        case 'month':
            return Math.ceil(durationDays / 30);
    }
}

/**
 * Get the applicable rate for a given billing mode from the equipment rates.
 */
export function getRateForMode(rates: RateProps, mode: BillingMode): number {
    switch (mode) {
        case 'day':
            return rates.rate_per_day || 0;
        case 'week':
            return rates.rate_per_week || (rates.rate_per_day ? rates.rate_per_day * 7 : 0);
        case 'month':
            return rates.rate_per_month || (rates.rate_per_day ? rates.rate_per_day * 30 : 0);
    }
}

/**
 * Calculate billing for a single item:
 *   rate (for the selected mode) × number of periods × quantity
 */
export function calculateBilling(
    checkoutDate: string | Date,
    returnDate: string | Date,
    rates: RateProps,
    quantity: number = 1,
    billingMode: BillingMode = 'day'
): number {
    const start = typeof checkoutDate === 'string' ? parseISO(checkoutDate) : checkoutDate;
    const end = typeof returnDate === 'string' ? parseISO(returnDate) : returnDate;

    if (!isValid(start) || !isValid(end) || start > end) {
        return 0;
    }

    const days = differenceInDays(end, start);
    const durationDays = Math.max(1, days); // Minimum 1 day

    const rate = getRateForMode(rates, billingMode);
    const periods = calculatePeriods(durationDays, billingMode);

    return rate * periods * quantity;
}

/**
 * Calculate the total for all loan items, using the user-selected billing mode.
 */
export function calculateLoanTotal(
    checkoutDate: string,
    returnDate: string,
    items: Array<{ quantity: number, rate_per_day?: number | null, rate_per_week?: number | null, rate_per_month?: number | null }>,
    billingMode: BillingMode = 'day'
): number {
    return items.reduce((total, item) => {
        return total + calculateBilling(checkoutDate, returnDate, item, item.quantity, billingMode);
    }, 0);
}
