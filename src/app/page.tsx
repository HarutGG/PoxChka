import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald/5 blur-[100px] pointer-events-none" />

      {/* Hero content */}
      <main
        className="relative z-10 flex flex-col items-center gap-8 text-center"
        style={{ animation: "fade-in 0.8s ease-out" }}
      >
        {/* Logo mark */}
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet to-emerald shadow-lg">
          <span className="text-3xl font-bold text-white tracking-tight">P</span>
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
          <button
            id="learn-more-btn"
            className="px-8 py-3 rounded-xl border border-border text-text-secondary font-medium text-base transition-all duration-300 hover:border-violet hover:text-text-primary cursor-pointer"
          >
            Learn More
          </button>
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
