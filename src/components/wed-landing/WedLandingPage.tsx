// Rovty Wed's marketing homepage — implements the "Rovty Wed Home" redesign
// (glassmorphism over an ambient colour wash, Geist type, a live picker of
// the 16 signature templates with a real phone preview) rather than the
// earlier flat "Modernist" shell. See AmbientBackground.tsx and
// LivePreviewPhone.tsx for the two pieces that make that possible.
//
// BuildSection, SeatSection, DashboardSection and the standalone CtaBanner
// aren't part of this redesign's information architecture (folded into
// Hero's live picker and FaqSection's embedded WhatsApp CTA) — their files
// are left in place, just unused here, rather than deleted sight unseen.
import { AmbientBackground } from "./AmbientBackground";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { FeaturesSection } from "./FeaturesSection";
import { PricingSection } from "./PricingSection";
import { FaqSection } from "./FaqSection";
import { Footer } from "./Footer";

export function WedLandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f6f1ee] font-['Geist',-apple-system,'Helvetica_Neue',sans-serif] text-wl-ink">
      <AmbientBackground />
      <Header />
      <Hero />
      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      <Footer />
    </div>
  );
}
