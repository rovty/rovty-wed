import { lazy, Suspense, useState } from "react";
import { TemplateDiscovery } from "@/components/studio/TemplateDiscovery";
import { createDesign } from "@/lib/studio/catalog";
import { toPublicWedding, type WeddingTemplate } from "@/lib/wedding";
import { isSignatureTemplate } from "@/lib/wedding-signature";
import { supabase } from "@/integrations/supabase/client";
import type { Wedding } from "./types";
const DesignStudio = lazy(() => import("./DesignStudio"));

export function Templates({
  wedding,
  onChange,
  onBack,
}: {
  wedding: Wedding;
  onChange: (w: Wedding) => void;
  onBack: () => void;
  inviteUrl: string;
}) {
  const [picked, setPicked] = useState<WeddingTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const publicWedding = toPublicWedding(wedding);

  // Signature designs (wedding-signature.ts) are fixed, bespoke pages —
  // there's no Studio section data to customize, so choosing one saves the
  // template directly instead of opening the design studio (DesignStudio
  // below assumes every template is Studio-compatible and would throw).
  const choose = async (id: WeddingTemplate) => {
    if (!isSignatureTemplate(id)) {
      setPicked(id);
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("weddings")
      .update({
        template: id,
        design: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", wedding.id)
      .select("*")
      .single();
    setSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    onChange(data);
    onBack();
  };

  return (
    <div className="admin-design-overlay">
      {picked ? (
        <Suspense
          fallback={
            <div className="studio-shell studio-loading">
              Opening your studio…
            </div>
          }
        >
          <DesignStudio
            wedding={wedding}
            template={picked}
            onChange={onChange}
            onBack={onBack}
          />
        </Suspense>
      ) : (
        <TemplateDiscovery
          weddingDraft={{
            wedding: publicWedding,
            design:
              publicWedding.design ||
              (isSignatureTemplate(publicWedding.template)
                ? createDesign("classic")
                : createDesign(publicWedding.template)),
          }}
          onChoose={choose}
          onBack={saving ? undefined : onBack}
        />
      )}
    </div>
  );
}
