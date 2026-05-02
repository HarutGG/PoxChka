import Link from "next/link";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggleButton />
      </div>
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald/5 blur-[100px] pointer-events-none" />

      {/* Hero content */}
      <main
        className="relative z-10 flex flex-col items-center gap-8 text-center"
        style={{ animation: "fade-in 0.8s ease-out" }}
      >
        {/* Logo mark */}
        <div className="flex items-center justify-center w-28 h-28 rounded-3xl overflow-hidden shadow-lg border-2 border-border/30 bg-surface">
          <img src="/logo.png" alt="PoxChka Logo" className="w-full h-full object-cover" />
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-text-primary">
          Pox
          <span className="bg-gradient-to-r from-violet to-emerald bg-clip-text text-transparent">
            Chka
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-md text-lg text-text-secondary leading-relaxed">
          Your premium finance companion. Track spending, monitor budgets, and
          grow your wealth — all in one beautiful interface.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <Link
            href="/login"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet to-violet-light text-white font-semibold text-base shadow-lg shadow-violet-glow transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-violet-glow cursor-pointer"
          >
            Get Started
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {["Expense Tracking", "Budget Goals", "Analytics", "Multi-Currency"].map(
            (feature) => (
              <span
                key={feature}
                className="px-4 py-1.5 text-sm font-medium rounded-full bg-surface text-text-secondary border border-border transition-colors hover:border-violet/50 hover:text-violet-light"
              >
                {feature}
              </span>
            )
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 text-sm text-text-secondary/60">
        Built with precision. Designed for clarity.
      </footer>
    </div>
  );
}
