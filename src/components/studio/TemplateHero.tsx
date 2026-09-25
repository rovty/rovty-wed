import { themeExperience } from "@/lib/theme-experiences";
import { weddingTheme } from "@/lib/wedding-themes";
import {
  WeddingAtmosphere,
  ThemeEmblem,
} from "@/components/wedding/WeddingAtmosphere";
import { ArrowUpRight } from "lucide-react";
import type { PublicWedding } from "@/lib/wedding";
import { familyLine, formatLongDate, formatTime } from "@/lib/wedding";
import type { DesignSection } from "@/lib/studio/design";
import couplePhoto from "@/assets/studio-couple.webp";
import { studioImageSources } from "@/lib/studio/images";

export type InvitationNavigation = {
  id: string;
  label: string;
  visibility?: "both" | "desktop" | "mobile";
};

/** Shared guest information, with a distinct photographic composition per design. */
export function TemplateHero({
  wedding: w,
  section,
  rsvp = true,
  rsvpVisibility = "both",
  miniature = false,
  navigation = [],
}: {
  wedding: PublicWedding;
  section?: DesignSection;
  rsvp?: boolean;
  rsvpVisibility?: "both" | "desktop" | "mobile";
  miniature?: boolean;
  navigation?: InvitationNavigation[];
}) {
  const theme = weddingTheme(w.template);
  const experience = themeExperience(w.template);
  const photoSource = section?.image || w.couplePhotoUrl || couplePhoto;
  const venueLink = navigation.find((item) => item.id === "section-venue");
  const action = rsvp ? (
    miniature ? (
      <span
        className={`site-button invitation-rsvp nav-visible-${rsvpVisibility}`}
      >
        Join our celebration <ArrowUpRight size={16} aria-hidden="true" />
      </span>
    ) : (
      <a
        className={`site-button invitation-rsvp nav-visible-${rsvpVisibility}`}
        href="#rsvp"
      >
        Join our celebration <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    )
  ) : null;
  return (
    <header
      className={`site-hero invitation-hero hero-${w.template} ${theme ? `themed-invitation scene-${theme.scene} layout-${experience?.layout || theme.scene}` : ""}`}
      data-miniature={miniature || undefined}
    >
      {theme && <WeddingAtmosphere template={w.template} />}
      <div className="invitation-masthead">
        <span className="invitation-monogram">
          {w.bride.charAt(0)} <i>&</i> {w.groom.charAt(0)}
        </span>
        {!miniature && navigation.length > 0 ? (
          <nav className="invitation-nav" aria-label="Wedding details">
            {navigation.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-visible-${item.visibility || "both"}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        ) : (
          <span className="invitation-edition">
            Our wedding · {w.date.getFullYear()}
          </span>
        )}
      </div>
      <div className="invitation-title">
        {experience && <p className="theme-dedication">{experience.eyebrow}</p>}
        {theme?.scene === "floral" && <ThemeEmblem template={w.template} />}
        <p className="site-eyebrow">
          {section?.title && section.title !== "Welcome"
            ? section.title
            : familyLine(w)}
        </p>
        <h1>
          <span>{w.bride}</span>
          <em>&</em>
          <span>{w.groom}</span>
        </h1>
        <p className="invitation-intro">
          {section?.body || "We would love you to be part of our wedding day."}
        </p>
      </div>
      {!theme && (
        <figure className="invitation-portrait">
          <img
            className="site-hero-photo"
            src={photoSource}
            srcSet={studioImageSources(photoSource)}
            sizes={miniature ? "360px" : "(max-width:650px) 100vw, 65vw"}
            alt={`${w.bride} and ${w.groom}`}
            width="1200"
            height="1500"
            loading={miniature ? "lazy" : "eager"}
            fetchPriority={miniature ? "low" : "high"}
            decoding="async"
          />
        </figure>
      )}
      <div className="invitation-details">
        <dl className="invitation-facts">
          <div>
            <dt>When</dt>
            <dd>
              <time dateTime={w.date.toISOString()}>
                {formatLongDate(w.date)}
              </time>
              <span>{formatTime(w.date)}</span>
            </dd>
          </div>
          <div>
            <dt>Where</dt>
            <dd>
              {w.venue || "Our wedding celebration"}
              {w.hall && <span>{w.hall}</span>}
            </dd>
          </div>
        </dl>
        <div className="invitation-actions">
          {action}
          {!miniature && venueLink && (
            <a
              href="#section-venue"
              className={`invitation-venue-link nav-visible-${venueLink.visibility || "both"}`}
            >
              Venue details <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
