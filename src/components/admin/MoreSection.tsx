import { LogOut } from "lucide-react";
import type { Wedding } from "./types";
import { AButton } from "./ui";
import { Team } from "./Team";

export function MoreSection({
  wedding,
  onSignOut,
}: {
  wedding: Wedding;
  onSignOut: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="border-b-2 border-[var(--admin-ink)] px-5 pb-3.5 pt-3.5">
        <h2 className="text-[28px] font-extrabold leading-none tracking-tight">
          Team
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-[var(--admin-muted)]">
          Everyone signs in with their own email. Admins can edit; viewers can
          only look.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pt-4">
        <Team wedding={wedding} />
      </div>
      <div className="border-t-2 border-[var(--admin-ink)] px-5 py-3.5">
        <AButton onClick={onSignOut} className="h-12 w-full">
          <LogOut className="h-4 w-4" /> Sign out
        </AButton>
      </div>
    </div>
  );
}
