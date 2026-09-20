import { lazy, Suspense, useState } from "react";
import { TemplateDiscovery } from "@/components/studio/TemplateDiscovery";
import { createDesign } from "@/lib/studio/catalog";
import { toPublicWedding, type WeddingTemplate } from "@/lib/wedding";
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
  const publicWedding = toPublicWedding(wedding);
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
              publicWedding.design || createDesign(publicWedding.template),
          }}
          onChoose={setPicked}
          onBack={onBack}
        />
      )}
    </div>
  );
}
