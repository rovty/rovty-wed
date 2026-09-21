import { ChevronDown, Plus, Trash2 } from "lucide-react";
import {
  safeUrl,
  type DesignSection,
  type SectionType,
} from "@/lib/studio/design";
import { Field } from "./EditorFields";

export type UploadControl = (
  label: string,
  assign: (url: string) => void,
  video?: boolean,
) => React.ReactNode;
export function SectionFields({
  section: s,
  onChange,
  uploadControl,
}: {
  section: DesignSection;
  onChange: (patch: Partial<DesignSection>) => void;
  uploadControl: UploadControl;
}) {
  const itemTypes: SectionType[] = [
    "gallery",
    "schedule",
    "party",
    "accommodation",
    "registry",
  ];
  const layout = s.layout || {
    alignment: "original",
    width: "original",
    visibility: "both",
  };
  const changeLayout = (patch: Partial<NonNullable<DesignSection["layout"]>>) =>
    onChange({ layout: { ...layout, ...patch } });
  return (
    <div className="editor-section-fields">
      <Field label="Section title">
        <input
          value={s.title}
          maxLength={200}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </Field>
      <Field label="Your words">
        <textarea
          value={s.body}
          rows={4}
          maxLength={5000}
          onChange={(e) => onChange({ body: e.target.value })}
        />
      </Field>
      {[
        "hero",
        "story",
        "introduction",
        "venue",
        "video",
        "party",
        "accommodation",
        "dress-code",
        "registry",
        "contact",
      ].includes(s.type) && (
        <>
          {s.image &&
            (s.type === "video" ? (
              <video
                className="editor-venue-preview"
                src={s.image}
                controls
                preload="metadata"
              />
            ) : (
              <img
                className="editor-venue-preview"
                src={s.image}
                alt="Section image preview"
              />
            ))}
          {uploadControl(
            s.type === "video" ? "Upload wedding film" : "Choose section image",
            (url) => onChange({ image: url }),
            s.type === "video",
          )}
          {s.image && (
            <button
              className="studio-text-button"
              onClick={() => onChange({ image: "" })}
            >
              Remove media
            </button>
          )}
        </>
      )}
      {["venue", "map", "contact", "registry", "accommodation"].includes(
        s.type,
      ) && (
        <Field
          label={
            s.type === "contact" ? "Contact link (mailto: or https://)" : "Link"
          }
        >
          <input
            value={s.link}
            onChange={(e) => onChange({ link: e.target.value })}
            placeholder="https://…"
          />
          {s.link && !safeUrl(s.link) && (
            <small>
              Use a complete https:// link, mailto: or tel: address.
            </small>
          )}
        </Field>
      )}
      {itemTypes.includes(s.type) && (
        <>
          <div className="editor-divider" />
          <p className="editor-group-title">
            {s.type === "gallery" ? "Your photographs" : "Entries"}
          </p>
          {s.items.map((item, i) => (
            <div className="editor-item" key={item.id}>
              <div className="editor-item-heading">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <button
                  aria-label={`Remove entry ${i + 1}`}
                  onClick={() =>
                    onChange({
                      items: s.items.filter((_, index) => index !== i),
                    })
                  }
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {item.image && <img src={item.image} alt={item.title} />}
              <Field
                label={s.type === "gallery" ? "Photo description" : "Title"}
              >
                <input
                  value={item.title}
                  onChange={(e) =>
                    onChange({
                      items: s.items.map((x, j) =>
                        j === i ? { ...x, title: e.target.value } : x,
                      ),
                    })
                  }
                />
              </Field>
              <Field label={s.type === "gallery" ? "Caption" : "Details"}>
                <textarea
                  rows={2}
                  value={item.text}
                  onChange={(e) =>
                    onChange({
                      items: s.items.map((x, j) =>
                        j === i ? { ...x, text: e.target.value } : x,
                      ),
                    })
                  }
                />
              </Field>
              {s.type === "schedule" ? (
                <Field label="Time">
                  <input
                    value={item.time}
                    placeholder="4:00 PM"
                    onChange={(e) =>
                      onChange({
                        items: s.items.map((x, j) =>
                          j === i ? { ...x, time: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </Field>
              ) : (
                uploadControl("Choose image", (url) =>
                  onChange({
                    items: s.items.map((x, j) =>
                      j === i ? { ...x, image: url } : x,
                    ),
                  }),
                )
              )}
              {["registry", "accommodation"].includes(s.type) && (
                <Field label="Link">
                  <input
                    value={item.url}
                    onChange={(e) =>
                      onChange({
                        items: s.items.map((x, j) =>
                          j === i ? { ...x, url: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </Field>
              )}
            </div>
          ))}
          <button
            className="studio-button"
            disabled={s.items.length >= 24}
            onClick={() =>
              onChange({
                items: [
                  ...s.items,
                  {
                    id: crypto.randomUUID(),
                    title: "",
                    text: "",
                    image: "",
                    url: "",
                    time: "",
                  },
                ],
              })
            }
          >
            <Plus size={14} />
            {s.type === "gallery" ? "Add a photo" : "Add an entry"}
          </button>
        </>
      )}
      <details className="editor-details">
        <summary>
          Layout & spacing <ChevronDown size={14} />
        </summary>
        <Field label="Section style">
          <select
            value={s.style}
            onChange={(e) =>
              onChange({ style: e.target.value as DesignSection["style"] })
            }
          >
            <option value="default">Designer’s choice</option>
            <option value="feature">Soft color background</option>
            <option value="minimal">Simple & open</option>
          </select>
        </Field>
        <Field label="Breathing room">
          <select
            value={s.spacing}
            onChange={(e) =>
              onChange({ spacing: e.target.value as DesignSection["spacing"] })
            }
          >
            <option value="compact">A little closer</option>
            <option value="comfortable">Just right</option>
            <option value="airy">Room to breathe</option>
          </select>
        </Field>
        <Field label="Custom background">
          <input
            type="color"
            value={s.background || "#f8f7f2"}
            onChange={(e) => onChange({ background: e.target.value })}
          />
        </Field>
        <Field label="Text alignment">
          <select
            value={layout.alignment}
            onChange={(e) =>
              changeLayout({
                alignment: e.target.value as typeof layout.alignment,
              })
            }
          >
            <option value="original">Designer’s choice</option>
            <option value="left">Left aligned</option>
            <option value="center">Centered</option>
          </select>
        </Field>
        <Field label="Content width">
          <select
            value={layout.width}
            onChange={(e) =>
              changeLayout({ width: e.target.value as typeof layout.width })
            }
          >
            <option value="original">Designer’s choice</option>
            <option value="narrow">Narrow & intimate</option>
            <option value="wide">Wide & open</option>
          </select>
        </Field>
        <Field label="Show this section on">
          <select
            value={layout.visibility}
            onChange={(e) =>
              changeLayout({
                visibility: e.target.value as typeof layout.visibility,
              })
            }
          >
            <option value="both">All screens</option>
            <option value="desktop">Desktop & tablet</option>
            <option value="mobile">Phones only</option>
          </select>
        </Field>
        {["hero", "story", "introduction", "venue", "gallery"].includes(
          s.type,
        ) && (
          <>
            <Field label="Section photo horizontal position">
              <input
                type="range"
                min={0}
                max={100}
                value={layout.photoPosition?.x ?? 50}
                onChange={(e) =>
                  changeLayout({
                    photoPosition: {
                      x: +e.target.value,
                      y: layout.photoPosition?.y ?? 50,
                    },
                  })
                }
              />
            </Field>
            <Field label="Section photo vertical position">
              <input
                type="range"
                min={0}
                max={100}
                value={layout.photoPosition?.y ?? 50}
                onChange={(e) =>
                  changeLayout({
                    photoPosition: {
                      x: layout.photoPosition?.x ?? 50,
                      y: +e.target.value,
                    },
                  })
                }
              />
            </Field>
            {layout.photoPosition && (
              <button
                className="studio-text-button"
                onClick={() => changeLayout({ photoPosition: undefined })}
              >
                Use global photo position
              </button>
            )}
          </>
        )}
        {s.background && (
          <button
            className="studio-text-button"
            onClick={() => onChange({ background: "" })}
          >
            Use template background
          </button>
        )}
      </details>
    </div>
  );
}
