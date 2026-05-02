import type { Locale } from '@/lib/i18n/messages';

/**
 * Formats a numeric value into the Armenian Dram (AMD) currency format.
 * Example: 5000 -> "5,000 ֏"
 * 
 * @param amount - The number to format
 * @returns A formatted string with the ֏ symbol
 */
export function formatAMD(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount) + ' ֏';
}

/**
 * Formats a numeric value into a more formal Armenian locale format if possible.
 * Uses 'hy-AM' locale.
 */
export function formatAMDLocalized(amount: number): string {
    try {
        return new Intl.NumberFormat('hy-AM', {
            style: 'currency',
            currency: 'AMD',
            minimumFractionDigits: 0,
        }).format(amount);
    } catch {
        return formatAMD(amount);
    }
}

/**
 * Currency display for UI language (AMD) — uses en-US or hy-AM numbering/symbol.
 */
export function formatAMDForUi(locale: Locale, amount: number): string {
    const intlLocale = locale === 'hy' ? 'hy-AM' : 'en-US';
    try {
        return new Intl.NumberFormat(intlLocale, {
            style: 'currency',
            currency: 'AMD',
            minimumFractionDigits: 0,
        }).format(amount);
    } catch {
        return formatAMD(amount);
    }
}
