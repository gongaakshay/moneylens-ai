import { useApp } from "@/context/AppContext";
import { LandingNavbar } from "./Landing/LandingNavbar";
import { HeroSection } from "./Landing/HeroSection";
import { FeaturesSection } from "./Landing/FeaturesSection";
import { BenefitsSection } from "./Landing/BenefitsSection";
import { CTASection } from "./Landing/CTASection";
import { LandingFooter } from "./Landing/LandingFooter";

export function LandingPage() {
  const { user } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />

      <LandingNavbar user={user} />
      <HeroSection user={user} />
      <FeaturesSection />
      <BenefitsSection />
      <CTASection user={user} />
      <LandingFooter />
    </div>
  );
}
