import { useRef } from "react";
import WeddingEditor from "@/components/studio/WeddingEditor";
import {
  createDesign,
  switchTemplate,
  type StudioDraft,
} from "@/lib/studio/catalog";
import { normalizeDesign } from "@/lib/studio/design";
import { toPublicWedding, type WeddingTemplate } from "@/lib/wedding";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { Wedding } from "./types";

export default function DesignStudio({
  wedding,
  onChange,
  onBack,
  template,
}: {
  wedding: Wedding;
  onChange: (wedding: Wedding) => void;
  onBack: () => void;
  template?: WeddingTemplate;
}) {
  const current = useRef(wedding);
  const original: StudioDraft = {
    wedding: toPublicWedding(wedding),
    design:
      normalizeDesign(wedding.design) ||
      createDesign(template || toPublicWedding(wedding).template),
  };
  const initial = useRef<StudioDraft>(
    template ? switchTemplate(original, template) : original,
  );
  const save = async (draft: StudioDraft, publish: boolean) => {
    const w = draft.wedding;
    const validated = normalizeDesign(draft.design);
    if (!validated)
      throw new Error(
        "This design couldn’t be saved. Your changes are still here.",
      );
    const { data, error } = await supabase
      .from("weddings")
      .update({
        template: w.template,
        design: validated as unknown as Json,
        bride: w.bride.trim(),
        groom: w.groom.trim(),
        bride_parents_names: w.brideParentsNames,
        groom_parents_names: w.groomParentsNames,
        event_date: w.date.toISOString(),
        event_end: w.endDate?.toISOString() || null,
        reception_date: w.receptionDate?.toISOString() || null,
        reception_end: w.receptionEnd?.toISOString() || null,
        description: w.description,
        venue: w.venue,
        hall: w.hall,
        address: w.address,
        couple_photo_url: w.couplePhotoUrl,
        venue_photo_url: w.venuePhotoUrl,
        maps_url: w.mapsUrl,
        ...(publish ? { published: true } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", wedding.id)
      .eq("updated_at", current.current.updated_at)
      .select("*")
      .maybeSingle();
    if (error)
      throw new Error(
        error.code === "PGRST204"
          ? "The design studio needs its database update. Your edits are safe in this tab; please contact Rovty support."
          : error.message,
      );
    if (!data)
      throw new Error(
        "This wedding was updated in another tab. Keep your edits here and reopen the editor to load the latest version before saving.",
      );
    current.current = data;
    onChange(data);
  };
  return (
    <WeddingEditor
      initialDraft={initial.current}
      weddingId={wedding.id}
      onBack={onBack}
      onSave={save}
      published={wedding.published}
      initiallyUnsaved={
        !wedding.design || Boolean(template && template !== wedding.template)
      }
    />
  );
}
