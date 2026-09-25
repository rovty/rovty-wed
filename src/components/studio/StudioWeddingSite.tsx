import { themeArtworkStyle } from "@/lib/studio/theme-art";
import { templateClasses, type SupportedTemplate } from "@/lib/wedding-themes";
import {
  WeddingParticles,
  ThemeEmblem,
  ThemeCredit,
} from "@/components/wedding/WeddingAtmosphere";
import { memo, useRef, useState, type CSSProperties } from "react";
import { useWeddingMotion } from "@/components/wedding/useWeddingMotion";
import { ArrowUpRight, Check, Heart, MapPin } from "lucide-react";
import { Countdown } from "@/components/Countdown";
import { InlineRsvp } from "@/components/InlineRsvp";
import { SeatingCta } from "@/components/WeddingSite";
import { InvitationOpener } from "@/components/InvitationOpener";
import { MusicPlayer } from "@/components/MusicPlayer";
import {
  formatLongDate,
  formatTime,
  googleCalendarUrl,
  TEMPLATE_META,
  type PublicWedding,
} from "@/lib/wedding";
import {
  designVariables,
  safeUrl,
  type DesignConfig,
  type DesignSection,
} from "@/lib/studio/design";
import { getTemplate } from "@/lib/studio/catalog";
import { TemplateHero, type InvitationNavigation } from "./TemplateHero";
import couplePhoto from "@/assets/studio-couple.webp";
import venuePhoto from "@/assets/studio-garden.webp";
import { studioImageSources } from "@/lib/studio/images";
import { CustomCanvas, type CanvasEditing } from "./CustomCanvas";
import { emptyCanvas } from "@/lib/studio/canvas";

export function StudioWeddingSite({
  wedding: w,
  design,
  preview = false,
  onSectionSelect,
  selectedSection,
  canvasEditing,
}: {
  wedding: PublicWedding;
  design: DesignConfig;
  preview?: boolean;
  onSectionSelect?: (id: string) => void;
  selectedSection?: string | null;
  canvasEditing?: CanvasEditing;
}) {
  const template = getTemplate(w.template);
  const sections = design.sections.filter((s) => s.enabled);
  const navigation: InvitationNavigation[] = sections.flatMap((s) => {
    const labels: Record<string, string> = {
      schedule: "The day",
      venue: "Venue",
      gallery: "Gallery",
    };
    const label = labels[s.type];
    return label
      ? [{ id: `section-${s.type}`, label, visibility: s.layout?.visibility }]
      : [];
  });
  const root = useRef<HTMLElement>(null);
  useWeddingMotion(
    root,
    design.motion !== "none" && !onSectionSelect,
    sections.map((s) => s.id).join(","),
  );
  return (
    <main
      ref={root}
      className={`wedding-design wedding-stationery collection-design ${templateClasses(w.template)} experience-${w.template} composition-${template.composition}`}
      data-motion={design.motion}
      style={{
        ...themeArtworkStyle(w.template),
        ...designVariables(design, template.palette, template.fonts),
      }}
    >
      <WeddingParticles template={w.template} />
      {!preview && (
        <>
          <MusicPlayer src={w.musicUrl} />
          <InvitationOpener wedding={{ ...w, design }} />
        </>
      )}
      {sections.map((s, index) => (
        <div
          key={s.id}
          id={
            s.type === "rsvp"
              ? "rsvp"
              : `section-${s.type === "canvas" ? s.id : s.type}`
          }
          data-section-id={s.id}
          className={`site-section-wrap section-${s.type} section-style-${s.style} space-${s.spacing} ${s.layout ? `section-align-${s.layout.alignment} section-width-${s.layout.width} section-visible-${s.layout.visibility}` : ""} ${onSectionSelect && selectedSection === s.id ? "site-section-selected" : ""}`}
          style={
            {
              ...(s.background
                ? {
                    background: s.background,
                    "--section-background": s.background,
                  }
                : {}),
              ...(s.layout?.photoPosition
                ? {
                    "--photo-position": `${s.layout.photoPosition.x}% ${s.layout.photoPosition.y}%`,
                  }
                : {}),
            } as CSSProperties
          }
          data-custom-background={s.background ? true : undefined}
        >
          {onSectionSelect && (
            <button
              className="site-edit-section"
              onClick={() => onSectionSelect(s.id)}
            >
              Edit {s.type.replaceAll("-", " ")}
            </button>
          )}
          {s.type === "canvas" ? (
            <CustomCanvas
              canvas={s.canvas || emptyCanvas()}
              label={s.title || "Custom design"}
              editing={
                canvasEditing && selectedSection === s.id
                  ? canvasEditing
                  : undefined
              }
            />
          ) : (
            <WeddingSection
              section={s}
              wedding={w}
              preview={preview}
              index={index}
              rsvp={sections.some((x) => x.type === "rsvp")}
              rsvpVisibility={
                sections.find((x) => x.type === "rsvp")?.layout?.visibility
              }
              navigation={navigation}
            />
          )}
        </div>
      ))}
      <ThemeCredit template={w.template} />
    </main>
  );
}

function SectionHeading({
  section: s,
  eyebrow,
}: {
  section: DesignSection;
  eyebrow?: string;
}) {
  return (
    <div className="site-section-heading">
      {eyebrow && <p className="site-eyebrow">{eyebrow}</p>}
      <h2>{s.title}</h2>
      {s.body && <p className="site-prose">{s.body}</p>}
    </div>
  );
}
const WeddingSection = memo(function WeddingSection({
  section: s,
  wedding: w,
  preview,
  index,
  rsvp,
  rsvpVisibility,
  navigation,
}: {
  section: DesignSection;
  wedding: PublicWedding;
  preview: boolean;
  index: number;
  rsvp: boolean;
  rsvpVisibility?: "both" | "desktop" | "mobile";
  navigation: InvitationNavigation[];
}) {
  const image = (src: string, alt: string, className = "") => (
    <img
      src={safeUrl(src, true) || couplePhoto}
      srcSet={studioImageSources(src)}
      sizes="(max-width:650px) 100vw, 55vw"
      alt={alt}
      loading="lazy"
      decoding="async"
      width="1000"
      height="1200"
      className={className}
    />
  );
  const directions =
    safeUrl(s.link || w.mapsUrl) ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(w.address || w.venue || "")}`;
  switch (s.type) {
    case "hero":
      return (
        <TemplateHero
          wedding={w}
          section={s}
          rsvp={rsvp}
          rsvpVisibility={rsvpVisibility}
          navigation={navigation}
        />
      );
    case "countdown":
      return (
        <section className="site-section site-countdown">
          <p className="site-eyebrow">
            {s.title === "Countdown" ? "Counting down to forever" : s.title}
          </p>
          <Countdown target={w.date} />
          {s.body && <p>{s.body}</p>}
        </section>
      );
    case "date":
      return (
        <section className="site-section site-date">
          <p className="site-eyebrow">{s.title}</p>
          <h2>{formatLongDate(w.date)}</h2>
          <p>
            {s.body ||
              `${formatTime(w.date)} · ${w.venue || "Our celebration"}`}
          </p>
        </section>
      );
    case "story":
    case "introduction":
      return (
        <section className="site-section site-story">
          <div className="site-story-image">
            {image(
              s.image || w.couplePhotoUrl || couplePhoto,
              `${w.bride} and ${w.groom}`,
            )}
            <span className="site-photo-caption">
              {w.bride} & {w.groom} · Our story
            </span>
          </div>
          <div className="site-story-copy">
            <span className="site-section-number">0{index}</span>
            <p className="site-eyebrow">The best kind of beginning</p>
            <h2>{s.title}</h2>
            <p className="site-prose">{s.body || w.description}</p>
            <p className="site-script">And so, the adventure continues.</p>
          </div>
        </section>
      );
    case "schedule": {
      const events = s.items.length
        ? s.items
        : [
            {
              id: "ceremony",
              title: "The ceremony",
              text: w.hall || "A moment to make it forever",
              time: formatTime(w.date),
              image: "",
              url: "",
            },
            ...(w.receptionDate
              ? [
                  {
                    id: "reception",
                    title: "Dinner & dancing",
                    text: "Good food, great company, and a little magic",
                    time: formatTime(w.receptionDate),
                    image: "",
                    url: "",
                  },
                ]
              : []),
          ];
      return (
        <section className="site-section site-schedule">
          <SectionHeading section={s} eyebrow="A day to remember" />
          <div className="site-timeline">
            {events.map((event, i) => (
              <article key={event.id}>
                <span className="site-event-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <time>{event.time}</time>
                <div>
                  <h3>{event.title}</h3>
                  <p>{event.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      );
    }
    case "venue":
      return (
        <section className="site-section site-venue">
          <div className="site-venue-image">
            {image(
              s.image || w.venuePhotoUrl || venuePhoto,
              w.venue || "Wedding venue",
            )}
          </div>
          <div className="site-venue-copy">
            <p className="site-eyebrow">{s.title}</p>
            <h2>{w.venue || "A special place"}</h2>
            <p className="site-script">{w.hall}</p>
            <p className="site-prose">{s.body || w.address}</p>
            <a
              className="site-text-link"
              href={directions}
              target="_blank"
              rel="noreferrer"
            >
              Find your way <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
      );
    case "gallery": {
      const photos = s.items.length
        ? s.items
        : [
            {
              id: "couple",
              image: w.couplePhotoUrl || couplePhoto,
              title: `${w.bride} & ${w.groom}`,
              text: "Us, always.",
            },
            {
              id: "place",
              image: w.venuePhotoUrl || venuePhoto,
              title: "Our celebration",
              text: "A place for memories.",
            },
          ];
      return (
        <section className="site-section site-gallery">
          <SectionHeading section={s} eyebrow="The little moments" />
          <div className="site-gallery-grid">
            {photos.map((photo, i) => (
              <figure key={photo.id}>
                {image(photo.image, photo.title)}
                <figcaption>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {photo.text || photo.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      );
    }
    case "rsvp":
      return (
        <section className="site-section site-rsvp">
          <div className="site-rsvp-intro">
            <ThemeEmblem template={w.template} />
            <span className="site-script">A seat with your name on it.</span>
            <SectionHeading section={s} />
            <p className="site-prose">We would love to celebrate with you.</p>
          </div>
          <div className="site-rsvp-form">
            {preview ? (
              <PreviewRsvp />
            ) : (
              <InlineRsvp
                slug={w.slug}
                coupleNames={`${w.bride} & ${w.groom}`}
              />
            )}
          </div>
        </section>
      );
    case "seating":
      return preview ? (
        <section className="site-section site-seating">
          <p className="site-eyebrow">On the day</p>
          <h2>{s.title}</h2>
          <p>Your personal invitation will show your assigned table here.</p>
        </section>
      ) : (
        <SeatingCta
          wedding={w}
          motif={TEMPLATE_META[w.template as SupportedTemplate].motif}
        />
      );
    case "calendar":
      return (
        <section className="site-section site-calendar">
          <SectionHeading section={s} />
          <p>{formatLongDate(w.date)}</p>
          <div className="site-link-row">
            {preview ? (
              <span>
                Calendar downloads are available on your published invitation.
              </span>
            ) : (
              <>
                <a
                  className="site-text-link"
                  href={googleCalendarUrl(w)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Google Calendar <ArrowUpRight size={16} />
                </a>
                <a className="site-text-link" href={`/${w.slug}/calendar.ics`}>
                  Apple / Outlook <ArrowUpRight size={16} />
                </a>
              </>
            )}
          </div>
        </section>
      );
    case "map":
      return (
        <section className="site-section site-map">
          <MapPin size={28} />
          <SectionHeading section={s} />
          <p>{w.address || w.venue}</p>
          <a
            className="site-button"
            href={directions}
            target="_blank"
            rel="noreferrer"
          >
            Open directions <ArrowUpRight size={16} />
          </a>
        </section>
      );
    case "video":
      return (
        <section className="site-section site-video">
          <SectionHeading section={s} />
          {s.image ? (
            <video
              src={safeUrl(s.image, true)}
              controls
              playsInline
              preload="none"
              poster={w.couplePhotoUrl || undefined}
            />
          ) : (
            <p className="site-prose">Our wedding film will be here.</p>
          )}
        </section>
      );
    case "family":
      return (
        <section className="site-section site-family">
          <SectionHeading section={s} eyebrow="With love and gratitude" />
          <div className="site-family-names">
            <p>{w.brideParentsNames || "The bride’s family"}</p>
            <span className="site-script">&</span>
            <p>{w.groomParentsNames || "The groom’s family"}</p>
          </div>
        </section>
      );
    case "guestbook":
      return (
        <section className="site-section site-note">
          <Heart size={24} />
          <SectionHeading section={s} />
          <p>
            We’ll treasure your wishes. Leave us a personal note with your RSVP.
          </p>
          {rsvp && (
            <a className="site-text-link" href="#rsvp">
              Write with your response <ArrowUpRight size={16} />
            </a>
          )}
        </section>
      );
    case "footer":
      return (
        <footer className="site-section site-footer">
          <ThemeEmblem template={w.template} />
          <p className="site-eyebrow">
            {s.title === "Closing note" ? "The beginning of always" : s.title}
          </p>
          <h2>
            {w.bride} <em>&</em> {w.groom}
          </h2>
          <p>{s.body || "Thank you for being part of our story."}</p>
          <span>{formatLongDate(w.date)}</span>
          <a href="https://wed.rovty.com" className="site-credit">
            Made with love · Rovty Wed
          </a>
        </footer>
      );
    default:
      return (
        <section className={`site-section site-information info-${s.type}`}>
          <SectionHeading section={s} />
          {s.image && image(s.image, s.title)}
          {s.items.map((item) => (
            <article key={item.id}>
              {item.image && image(item.image, item.title)}
              <h3>{item.title}</h3>
              <p className="site-prose">{item.text}</p>
              {safeUrl(item.url) && (
                <a
                  className="site-text-link"
                  href={safeUrl(item.url)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View details <ArrowUpRight size={16} />
                </a>
              )}
            </article>
          ))}
          {safeUrl(s.link) && (
            <a
              className="site-button"
              href={safeUrl(s.link)}
              target="_blank"
              rel="noreferrer"
            >
              {s.type === "registry"
                ? "Visit our registry"
                : s.type === "contact"
                  ? "Get in touch"
                  : "Find out more"}
              <ArrowUpRight size={16} />
            </a>
          )}
        </section>
      );
  }
});

function PreviewRsvp() {
  const [sent, setSent] = useState(false);
  return sent ? (
    <div className="site-rsvp-thanks" role="status">
      <Check size={28} />
      <h3>We can’t wait to see you.</h3>
      <p>This is a preview. No response was sent.</p>
      <button className="site-text-link" onClick={() => setSent(false)}>
        Try again
      </button>
    </div>
  ) : (
    <form
      className="site-preview-rsvp"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <p className="site-eyebrow">Try the guest experience</p>
      <label>
        Your name
        <input required placeholder="Full name" autoComplete="off" />
      </label>
      <fieldset>
        <legend>Will you be joining us?</legend>
        <label>
          <input type="radio" name="attending" value="yes" required /> Joyfully
          accepts
        </label>
        <label>
          <input type="radio" name="attending" value="no" required />{" "}
          Regretfully declines
        </label>
      </fieldset>
      <label>
        A note for the couple
        <textarea placeholder="A little love, a favorite memory…" rows={2} />
      </label>
      <button className="site-button" type="submit">
        Send response <ArrowUpRight size={16} />
      </button>
      <small>Preview only · Your guests use a personal invitation.</small>
    </form>
  );
}
