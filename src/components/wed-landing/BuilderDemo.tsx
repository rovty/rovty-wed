import { useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  PreviewFrame,
  type PreviewDevice,
} from "@/components/studio/PreviewFrame";
import { DeviceToggle } from "@/components/studio/TemplateDiscovery";
import {
  DEMO_WEDDING,
  TEMPLATE_CATALOG,
  createDesign,
} from "@/lib/studio/catalog";
import type { WeddingTemplate } from "@/lib/wedding";

/** The same renderer as the editor and published studio designs. */
export function BuilderDemo() {
  const [wedding, setWedding] = useState(DEMO_WEDDING);
  const [device, setDevice] = useState<PreviewDevice>("mobile");
  return (
    <div className="studio-shell landing-live-builder">
      <div>
        <p className="studio-eyebrow">Your details. Instant magic.</p>
        <div className="editor-field-grid">
          <label className="editor-field">
            <span>Partner one</span>
            <input
              aria-label="Bride name"
              value={wedding.bride}
              onChange={(e) =>
                setWedding({ ...wedding, bride: e.target.value })
              }
            />
          </label>
          <label className="editor-field">
            <span>Partner two</span>
            <input
              aria-label="Groom name"
              value={wedding.groom}
              onChange={(e) =>
                setWedding({ ...wedding, groom: e.target.value })
              }
            />
          </label>
        </div>
        <label className="editor-field">
          <span>Wedding date</span>
          <input
            aria-label="Wedding date"
            type="date"
            value={wedding.date.toISOString().slice(0, 10)}
            onChange={(e) => {
              const date = new Date(`${e.target.value}T16:00:00+05:30`);
              if (Number.isFinite(date.getTime()))
                setWedding({ ...wedding, date });
            }}
          />
        </label>
        <label className="editor-field">
          <span>Venue</span>
          <input
            aria-label="Venue"
            value={wedding.venue || ""}
            onChange={(e) => setWedding({ ...wedding, venue: e.target.value })}
          />
        </label>
        <label className="editor-field">
          <span>Find your feeling</span>
          <select
            value={wedding.template}
            onChange={(e) =>
              setWedding({
                ...wedding,
                template: e.target.value as WeddingTemplate,
              })
            }
          >
            {TEMPLATE_CATALOG.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.collection})
              </option>
            ))}
          </select>
        </label>
        <p className="editor-help">
          Scroll the preview and try the RSVP. This sample isn’t saved or sent
          to anyone.
        </p>
        <a href="/templates" className="studio-button primary">
          Explore the full collection <ArrowRight size={14} />
        </a>
      </div>
      <div className="landing-builder-canvas">
        <DeviceToggle device={device} onChange={setDevice} />
        <PreviewFrame
          wedding={wedding}
          design={createDesign(wedding.template)}
          device={device}
        />
      </div>
    </div>
  );
}
