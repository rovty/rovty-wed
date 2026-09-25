import { lazy, Suspense, useState } from "react";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WEDDING_TEMPLATES } from "@/lib/wedding";
import { SIGNATURE_TEMPLATES } from "@/lib/wedding-signature";
import type { Wedding } from "./types";
import { AButton } from "./ui";
import { DetailsForm } from "./DetailsForm";
import { Templates } from "./Templates";
const DesignStudio = lazy(() => import("./DesignStudio"));

// "Design" = how the invitation looks (template) and is reached (publish
// state + public link) + what it says (Details). The redesign's mock
// treats Details and Templates as two full screens; here the publish/link
// controls that used to open the old "Details" tab live at the top of this
// one, since there's no dedicated screen for them in the mock and this is
// the closest fit.
export function DesignSection({
  wedding,
  onChange,
  inviteUrl,
}: {
  wedding: Wedding;
  onChange: (w: Wedding) => void;
  inviteUrl: string;
}) {
  const [pickingTemplate, setPickingTemplate] = useState(false);
  const [editing, setEditing] = useState(false);

  if (editing)
    return (
      <div className="admin-design-overlay">
        <Suspense
          fallback={
            <div className="studio-shell studio-loading">
              Opening your studio…
            </div>
          }
        >
          <DesignStudio
            wedding={wedding}
            onChange={onChange}
            onBack={() => setEditing(false)}
          />
        </Suspense>
      </div>
    );

  if (pickingTemplate) {
    return (
      <Templates
        wedding={wedding}
        onChange={onChange}
        onBack={() => setPickingTemplate(false)}
        inviteUrl={inviteUrl}
      />
    );
  }

  const currentTemplate =
    WEDDING_TEMPLATES.find((t) => t.id === wedding.template) ??
    SIGNATURE_TEMPLATES.find((t) => t.id === wedding.template);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
      <PublishCard
        wedding={wedding}
        onChange={onChange}
        inviteUrl={inviteUrl}
      />

      <div className="admin-studio-entry">
        <div>
          <p>YOUR WEDDING, YOUR WAY</p>
          <h2>Make it beautifully yours.</h2>
          <span>
            Colors, photographs, words and every little detail. See it all come
            together in your live design studio.
          </span>
        </div>
        <button onClick={() => setEditing(true)}>
          Open design studio <Pencil size={15} />
        </button>
      </div>

      <button
        onClick={() => setPickingTemplate(true)}
        className="mt-4 flex items-center justify-between border-2 border-[var(--admin-ink)] bg-[var(--admin-surface)] px-4 py-3.5 text-left"
      >
        <span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--admin-faint)]">
            Design
          </span>
          <span className="mt-1 block text-sm font-bold">
            {currentTemplate?.label ?? wedding.template}
          </span>
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--admin-accent-active)]">
          Change
        </span>
      </button>

      <div className="mt-5">
        <DetailsForm wedding={wedding} onChange={onChange} />
      </div>
    </div>
  );
}

function PublishCard({
  wedding,
  onChange,
  inviteUrl,
}: {
  wedding: Wedding;
  onChange: (w: Wedding) => void;
  inviteUrl: string;
}) {
  const [busy, setBusy] = useState(false);

  const togglePublish = async () => {
    setBusy(true);
    const { data, error } = await supabase
      .from("weddings")
      .update({
        published: !wedding.published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", wedding.id)
      .select("*")
      .single();
    setBusy(false);
    if (error) {
      alert(error.message);
      return;
    }
    onChange(data);
  };

  return (
    <div className="border-2 border-[var(--admin-ink)] bg-[var(--admin-surface)] p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--admin-faint)]">
          Publish
        </span>
        <div className="flex items-center gap-2">
          {wedding.published && (
            <a
              href={inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--admin-accent-active)]"
            >
              View site
            </a>
          )}
          <AButton
            onClick={togglePublish}
            disabled={busy}
            className="h-9 text-[11px]"
          >
            {wedding.published ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            {wedding.published ? "Published" : "Unpublished"}
          </AButton>
        </div>
      </div>

      <p className="mt-2.5 break-all font-mono text-xs text-[var(--admin-muted)]">
        wed.rovty.com/{wedding.slug}
      </p>
      <p className="mt-1 text-xs text-[var(--admin-muted)]">
        Username locked · Request corrections under Couple below.
      </p>
    </div>
  );
}
