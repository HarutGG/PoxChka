import type { Locale } from './messages';
import { messages } from './messages';

/**
 * Resolve a dotted path like "dashboard.addTransaction" from the locale tree.
 */
export function resolveMessage(locale: Locale, path: string): string {
    const parts = path.split('.');
    let current: unknown = messages[locale];

    for (const part of parts) {
        if (current === null || typeof current !== 'object' || !(part in current)) {
            return path;
        }
        current = (current as Record<string, unknown>)[part];
    }

    return typeof current === 'string' ? current : path;
}
