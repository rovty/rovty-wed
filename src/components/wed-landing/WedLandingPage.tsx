// Rovty Wed's marketing homepage — implements the "Rovty Wed Landing B"
// design canvas (claude.ai/design) section for section. This is what `/`
// renders instead of "whichever wedding happens to be published" (see
// routes/index.tsx's header comment for why that changed).
//
// Deliberately its own visual system ("Modernist": ink/paper, hard 2px
// borders, Archivo type, one warm-red accent — see the --wl-* / --wed*
// tokens in styles.css) rather than the rose-and-gold .theme-* invitation
// look: this is the product's own marketing shell, the same idea as
// .admin-portal's back-office shell but with the accent the design
// specifies. Every demo below (BuilderDemo, SeatingDemo, AdminDemo) is
// wired to the product's real template themes and copy — nothing here is
// aspirational.
import { Header } from "./Header";
import { Hero } from "./Hero";
import { BuildSection } from "./BuildSection";
import { FeaturesSection } from "./FeaturesSection";
import { HowSection } from "./HowSection";
import { SeatSection } from "./SeatSection";
import { DashboardSection } from "./DashboardSection";
import { PricingSection } from "./PricingSection";
import { FaqSection } from "./FaqSection";
import { CtaBanner } from "./CtaBanner";
import { Footer } from "./Footer";

export function WedLandingPage() {
  return (
    <div className="overflow-x-hidden bg-wl-paper font-archivo text-wl-ink">
      <Header />
      <Hero />
      <BuildSection />
      <FeaturesSection />
      <HowSection />
      <SeatSection />
      <DashboardSection />
      <PricingSection />
      <FaqSection />
      <CtaBanner />
      <Footer />
    </div>
  );
}
