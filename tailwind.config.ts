import type { Config } from "tailwindcss";

/**
 * PoxChka — Tailwind CSS Configuration
 *
 * NOTE: This project uses Tailwind CSS v4, which defines theme tokens
 * via the @theme directive in `src/app/globals.css`. This file serves
 * as a supplementary reference and for any plugin configuration.
 *
 * The primary design tokens live in globals.css under `@theme inline { ... }`.
 */
const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                /* ── Core palette ── */
                background: "#121212",
                surface: "#1E1E1E",
                "surface-hover": "#2A2A2A",
                border: "#2E2E2E",

                /* ── Text ── */
                "text-primary": "#F5F5F5",
                "text-secondary": "#A0A0A0",

                /* ── Electric Violet ── */
                violet: {
                    DEFAULT: "#8B5CF6",
                    light: "#A78BFA",
                    dark: "#7C3AED",
                    glow: "rgba(139, 92, 246, 0.25)",
                },

                /* ── Emerald Green ── */
                emerald: {
                    DEFAULT: "#10B981",
                    light: "#34D399",
                    dark: "#059669",
                    glow: "rgba(16, 185, 129, 0.25)",
                },

                /* ── Semantic ── */
                danger: { DEFAULT: "#EF4444", light: "#FCA5A5" },
                warning: { DEFAULT: "#F59E0B", light: "#FCD34D" },
                info: { DEFAULT: "#3B82F6", light: "#93C5FD" },
            },
            fontFamily: {
                sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
                mono: ['"Fira Code"', "ui-monospace", "monospace"],
            },
            borderRadius: {
                sm: "0.375rem",
                md: "0.5rem",
                lg: "0.75rem",
                xl: "1rem",
                "2xl": "1.5rem",
            },
            keyframes: {
                "fade-in": {
                    from: { opacity: "0", transform: "translateY(8px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "pulse-glow": {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.25)" },
                    "50%": {
                        boxShadow:
                            "0 0 40px rgba(139, 92, 246, 0.25), 0 0 60px rgba(16, 185, 129, 0.25)",
                    },
                },
            },
            animation: {
                "fade-in": "fade-in 0.8s ease-out",
                "pulse-glow": "pulse-glow 3s ease-in-out infinite",
            },
        },
    },
    plugins: [],
};

export default config;
