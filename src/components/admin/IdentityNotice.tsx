import { LockKeyhole, MessageCircle } from "lucide-react";
import { SITE_ORIGIN } from "@/lib/platform";
import {
  identitySupportUrl,
  type WeddingIdentity,
} from "@/lib/wedding-identity";

export function IdentityNotice({ wedding }: { wedding: WeddingIdentity }) {
  return (
    <div className="my-3 border-l-2 border-current pl-3 text-xs leading-relaxed">
      <p className="flex items-center gap-1.5 font-semibold">
        <LockKeyhole size={13} aria-hidden="true" /> Couple details are locked
      </p>
      <p className="mt-1 opacity-70">
        Your names and username belong to this wedding. Made a mistake? The
        Rovty team can help.
      </p>
      <a
        href={identitySupportUrl(SITE_ORIGIN, wedding)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4"
      >
        <MessageCircle size={14} aria-hidden="true" /> Request a change
        <span className="sr-only"> (opens a new support chat tab)</span>
      </a>
      <p className="opacity-70">
        Opens a new chat with your request already written and sent.
      </p>
    </div>
  );
}
