'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useSyncExternalStore,
} from 'react';
import {
    defaultLocale,
    type Locale,
} from '@/lib/i18n/messages';
import { resolveMessage } from '@/lib/i18n/resolve';

const STORAGE_KEY = 'poxchka-locale';
const LOCALE_CHANGE = 'poxchka-locale-change';

function readLocale(): Locale {
    if (typeof window === 'undefined') return defaultLocale;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'hy') return stored;
    return defaultLocale;
}

function subscribe(onChange: () => void) {
    const handler = () => onChange();
    window.addEventListener('storage', handler);
    window.addEventListener(LOCALE_CHANGE, handler);
    return () => {
        window.removeEventListener('storage', handler);
        window.removeEventListener(LOCALE_CHANGE, handler);
    };
}

interface LocaleContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (path: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function applyVars(template: string, vars?: Record<string, string | number>): string {
    if (!vars) return template;
    let out = template;
    for (const [key, value] of Object.entries(vars)) {
        out = out.replaceAll(`{${key}}`, String(value));
    }
    return out;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const locale = useSyncExternalStore(subscribe, readLocale, () => defaultLocale);

    const setLocale = useCallback((next: Locale) => {
        localStorage.setItem(STORAGE_KEY, next);
        window.dispatchEvent(new Event(LOCALE_CHANGE));
    }, []);

    useEffect(() => {
        document.documentElement.lang = locale === 'hy' ? 'hy' : 'en';
    }, [locale]);

    const t = useCallback(
        (path: string, vars?: Record<string, string | number>) => {
            return applyVars(resolveMessage(locale, path), vars);
        },
        [locale]
    );

    const value = useMemo(
        () => ({ locale, setLocale, t }),
        [locale, setLocale, t]
    );

    return (
        <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
    );
}

export function useLocale() {
    const ctx = useContext(LocaleContext);
    if (!ctx) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return ctx;
}
