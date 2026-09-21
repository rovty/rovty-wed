import type { PublicWedding } from "@/lib/wedding";
import { familyLine, formatLongDate } from "@/lib/wedding";
import type { DesignSection } from "@/lib/studio/design";
import couplePhoto from "@/assets/studio-couple.webp";
import { studioImageSources } from "@/lib/studio/images";
import roses from "@/assets/roses-corner.webp";
import lotus from "@/assets/lotus-vine-sm.webp";
import { TemplateOrnament } from "./TemplateOrnament";

export function TemplateHero({
  wedding: w,
  section,
  rsvp = true,
  miniature = false,
}: {
  wedding: PublicWedding;
  section?: DesignSection;
  rsvp?: boolean;
  miniature?: boolean;
}) {
  const id = w.template;
  const names = (
    <>
      <span>{w.bride}</span>
      <em>&</em>
      <span>{w.groom}</span>
    </>
  );
  const date = formatLongDate(w.date);
  const photoSource = section?.image || w.couplePhotoUrl || couplePhoto;
  const photo = (
    <img
      className="site-hero-photo"
      src={photoSource}
      srcSet={studioImageSources(photoSource)}
      sizes={
        miniature
          ? "360px"
          : id === "shoreline"
            ? "100vw"
            : "(max-width:650px) 100vw, 60vw"
      }
      alt={`${w.bride} and ${w.groom}`}
      width="1200"
      height="1500"
      loading={miniature ? "lazy" : "eager"}
      fetchPriority={miniature ? "low" : "high"}
      decoding="async"
    />
  );
  const eyebrow = (
    <p className="site-eyebrow">
      {section?.title && section.title !== "Welcome"
        ? section.title
        : familyLine(w)}
    </p>
  );
  const detail = (
    <div className="site-hero-detail">
      <span>{date}</span>
      <span>{w.venue || "Our wedding celebration"}</span>
    </div>
  );
  const action = rsvp ? (
    miniature ? (
      <span className="site-button">
        Join our celebration <span aria-hidden="true">↗</span>
      </span>
    ) : (
      <a className="site-button" href="#rsvp">
        Join our celebration <span aria-hidden="true">↗</span>
      </a>
    )
  ) : null;
  const nav = (
    <div className="site-masthead">
      <span>
        {w.bride.charAt(0)} & {w.groom.charAt(0)}
      </span>
      <span>Our wedding</span>
      <span>{w.date.getFullYear()}</span>
    </div>
  );
  const copy = (
    <div className="site-hero-copy">
      {eyebrow}
      <h1>{names}</h1>
      {detail}
      {action}
    </div>
  );
  const note = section?.body && (
    <p className="site-hero-note">{section.body}</p>
  );
  return (
    <header className={`site-hero hero-${id}`}>
      {nav}
      {id === "editorial" ? (
        <>
          <div className="editorial-title">
            <p className="site-eyebrow">A new chapter begins</p>
            <h1>{names}</h1>
          </div>
          <div className="editorial-photo">
            {photo}
            <span className="site-photo-caption">THE BEGINNING OF ALWAYS</span>
          </div>
          <div className="editorial-aside">
            <span className="editorial-edition">
              THE WEDDING ISSUE / {w.date.getFullYear()}
            </span>
            {eyebrow}
            {detail}
            {action}
          </div>
        </>
      ) : id === "noir" ? (
        <>
          <div className="noir-photo">{photo}</div>
          <div className="noir-type">
            {eyebrow}
            <h1>{names}</h1>
            <p className="site-script">An evening, a lifetime.</p>
            {detail}
            {action}
            <span className="noir-signature">ONE NIGHT. OUR FOREVER.</span>
          </div>
        </>
      ) : id === "quiet" ? (
        <>
          <div className="quiet-wordmark">
            <span>WE’RE</span>
            <span>GETTING</span>
            <span>
              MARRIED<span className="quiet-dot">.</span>
            </span>
          </div>
          <div className="quiet-bottom">
            <h1>{names}</h1>
            {detail}
            <div className="quiet-photo">{photo}</div>
          </div>
          {action}
        </>
      ) : id === "film" ? (
        <>
          <div className="film-photo">
            {photo}
            <span className="film-counter">01 / FOREVER</span>
            <span className="film-edge" aria-hidden="true">
              35 MM · A LOVE STORY IN THE MAKING
            </span>
          </div>
          <div className="film-caption">
            <p className="site-eyebrow">A film by fate</p>
            <h1>{names}</h1>
            {detail}
            {action}
          </div>
        </>
      ) : id === "shoreline" ? (
        <>
          <div className="shoreline-photo">{photo}</div>
          <div className="shoreline-copy">
            <TemplateOrnament kind="sun" />
            <p className="site-script">Meet us by the sea</p>
            <h1>{names}</h1>
            {detail}
            {action}
          </div>
          <div className="shoreline-wave" aria-hidden="true">
            ∿ ∿ ∿
          </div>
        </>
      ) : id === "bloom" ? (
        <>
          <div className="bloom-message">
            <p className="site-script">
              a little love,
              <br />a whole lifetime.
            </p>
            <h1>{names}</h1>
            {detail}
            {action}
          </div>
          <div className="bloom-photo">{photo}</div>
          <TemplateOrnament kind="flower" />
        </>
      ) : id === "garden" ? (
        <>
          <div className="garden-heading">
            {eyebrow}
            <h1>{names}</h1>
          </div>
          <div className="garden-photo">{photo}</div>
          <div className="garden-side">
            <span className="site-script">Let love grow.</span>
            {detail}
            {action}
          </div>
          <TemplateOrnament kind="branch" />
        </>
      ) : id === "thali" ? (
        <>
          <div className="thali-border" aria-hidden="true">
            ✦ · ✦ · ✦ · ✦ · ✦ · ✦ · ✦ · ✦ · ✦
          </div>
          <div className="thali-copy">
            <TemplateOrnament kind="flower" />
            {eyebrow}
            <p className="site-script">With joy in our hearts</p>
            <h1>{names}</h1>
            {detail}
            {action}
          </div>
          <div className="thali-photo">{photo}</div>
        </>
      ) : id === "chapel" ? (
        <>
          <div className="chapel-photo">{photo}</div>
          <div className="chapel-copy">
            <TemplateOrnament kind="arch" />
            {copy}
          </div>
        </>
      ) : id === "nikkah" ? (
        <>
          <div className="nikkah-arch">
            <span className="site-symbol" aria-hidden="true">
              ☾
            </span>
            {copy}
            <span className="site-script">A beautiful promise</span>
          </div>
          <div className="nikkah-photo">{photo}</div>
        </>
      ) : id === "deco" ? (
        <>
          <div className="deco-frame">
            <TemplateOrnament kind="fan" />
            <p className="site-eyebrow">The pleasure of your company</p>
            <h1>{names}</h1>
            <div className="deco-diamond" aria-hidden="true">
              ◇
            </div>
            {detail}
            {action}
          </div>
        </>
      ) : id === "poruwa" ? (
        <>
          <div className="poruwa-frame">
            <TemplateOrnament kind="sun" />
            {copy}
            <p className="site-script">With the blessings of our families</p>
          </div>
          <div className="poruwa-side">{photo}</div>
        </>
      ) : id === "lotus" ? (
        <>
          <img className="lotus-canopy" src={lotus} alt="" loading="lazy" />
          <div className="lotus-seal">
            {w.bride.charAt(0)}
            <i>&</i>
            {w.groom.charAt(0)}
          </div>
          {copy}
          <div className="lotus-foot" aria-hidden="true">
            ❧
          </div>
        </>
      ) : (
        <>
          <img className="classic-roses" src={roses} alt="" loading="lazy" />
          <div className="classic-oval">{photo}</div>
          {copy}
          <span className="classic-signature site-script">
            Our forever starts here
          </span>
        </>
      )}
      {note}
    </header>
  );
}
