import { Star } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

export function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-slate-800/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Logo size="sm" />
          <div className="flex flex-col items-center md:items-end gap-3">
            <a
              href="https://github.com/alok722/moneylens-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-yellow-400 transition-colors group"
            >
              <Star className="w-3.5 h-3.5 group-hover:fill-yellow-400 transition-all" />
              Star on GitHub
            </a>
            <p className="text-slate-500 text-sm">
              © 2025 MoneyLens.ai. All rights reserved.
            </p>
            <p className="text-slate-500 text-sm">
              Vibe coded with ❤️ by{" "}
              <a
                href="https://github.com/alok722"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 transition-colors underline"
              >
                Alok Raj
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
