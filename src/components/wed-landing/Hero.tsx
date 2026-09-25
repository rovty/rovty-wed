import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { TemplateMiniature } from "@/components/studio/TemplateDiscovery";
import { getTemplate } from "@/lib/studio/catalog";
import { WHATSAPP_HREF } from "./content";

export function Hero() {
  return (
    <section id="b-top" className="studio-shell marketing-studio-hero">
      <div className="marketing-studio-copy">
        <p className="studio-eyebrow">
          Your forever deserves a beautiful beginning
        </p>
        <h1>
          A little website.
          <br />
          <em>A whole lot of love.</em>
        </h1>
        <p>
          A wedding invitation that feels like you. Beautifully designed,
          effortlessly personal, with every detail your guests need in one
          lovely place.
        </p>
        <div className="marketing-studio-actions">
          <a href="/templates" className="studio-button primary">
            Find your design <ArrowRight size={15} />
          </a>
          <a href="#build" className="studio-text-button">
            Try it with your names <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="marketing-studio-benefits">
          <span>
            <Check size={12} /> 21 distinctive themes
          </span>
          <span>
            <Check size={12} /> Made for every screen
          </span>
        </div>
        <a
          className="marketing-studio-contact"
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noreferrer"
        >
          A little help getting started? Talk to us ↗
        </a>
      </div>
      <div className="marketing-studio-art">
        <a
          href="/templates"
          className="marketing-featured-template"
          aria-label="Explore Rose wedding design"
        >
          <TemplateMiniature template={getTemplate("classic")} />
        </a>
        <a
          href="/templates"
          className="marketing-overlaid-template"
          aria-label="Explore Lotus wedding design"
        >
          <TemplateMiniature template={getTemplate("lotus")} />
        </a>
        <span className="marketing-art-caption">
          A starting point. Endlessly yours.
        </span>
      </div>
    </section>
  );
}
