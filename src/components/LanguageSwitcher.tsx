'use client';

import { useLocale } from '@/contexts/LocaleContext';
import type { Locale } from '@/lib/i18n/messages';
import { localeLabels } from '@/lib/i18n/messages';

const locales: Locale[] = ['en', 'hy'];

interface LanguageSwitcherProps {
    className?: string;
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
    const { locale, setLocale, t } = useLocale();

    return (
        <div
            className={`flex items-center gap-1.5 ${className}`}
            title={t('common.language')}
        >
            <div className="flex rounded-lg border border-border bg-background/80 p-0.5">
                {locales.map((code) => (
                    <button
                        key={code}
                        type="button"
                        onClick={() => setLocale(code)}
                        className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                            locale === code
                                ? 'bg-violet/15 text-violet-light shadow-sm'
                                : 'text-text-secondary hover:text-text-primary'
                        }`}
                        aria-pressed={locale === code}
                        aria-label={localeLabels[code]}
                    >
                        {code === 'en' ? 'EN' : 'Հայ'}
                    </button>
                ))}
            </div>
        </div>
    );
}
