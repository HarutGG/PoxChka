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
    } catch (e) {
        // Fallback if locale is not supported
        return formatAMD(amount);
    }
}
