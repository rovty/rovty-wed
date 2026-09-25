import type { ComponentType } from "react";
import type { PublicWedding } from "@/lib/wedding";
import type { SignatureTemplateId } from "@/lib/wedding-signature";
import { MaisonTemplate } from "./MaisonTemplate";
import { MonoTemplate } from "./MonoTemplate";
import { PichchaTemplate } from "./PichchaTemplate";
import { RougeTemplate } from "./RougeTemplate";
import { SaltSandTemplate } from "./SaltSandTemplate";
import { RanPoruwaTemplate } from "./RanPoruwaTemplate";
import { EvergreenTemplate } from "./EvergreenTemplate";
import { FernTemplate } from "./FernTemplate";
import { JasmineMoonTemplate } from "./JasmineMoonTemplate";
import { KolamTemplate } from "./KolamTemplate";
import { LotusNightTemplate } from "./LotusNightTemplate";
import { LotusPondTemplate } from "./LotusPondTemplate";
import { NocturneTemplate } from "./NocturneTemplate";
import { RoseBlushTemplate } from "./RoseBlushTemplate";
import { SunsetCoastTemplate } from "./SunsetCoastTemplate";
import { WildflowerTemplate } from "./WildflowerTemplate";

// The 16 designs in wedding-signature.ts, each a fully self-contained page
// (own opener animation, own hero, own content structure) rather than a
// palette built on the shared hero/section primitives every other template
// in this app uses — see that file's header comment for why. WeddingSite.tsx
// and routes/$slug.index.tsx both dispatch here before touching any of the
// legacy/Studio machinery, which knows nothing about these ids.
//
// Each component still renders the SAME functional building blocks as every
// other template — <InlineRsvp>, <Countdown>, <SeatingCta>, <MusicPlayer> —
// themed via its own `.theme-<id>` block in styles.css (the exact contract
// every legacy .theme-* block fulfills: .tpl-card, .tpl-btn, .tpl-choice,
// .font-display/.font-script/.font-kicker, etc). Only the bespoke layout
// around them — opener, hero, the parts that make each design distinct — is
// unique to each file.
const SIGNATURE_COMPONENTS: Record<
  SignatureTemplateId,
  ComponentType<{ wedding: PublicWedding }>
> = {
  maison: MaisonTemplate,
  mono: MonoTemplate,
  pichcha: PichchaTemplate,
  rouge: RougeTemplate,
  "salt-sand": SaltSandTemplate,
  "ran-poruwa": RanPoruwaTemplate,
  evergreen: EvergreenTemplate,
  fern: FernTemplate,
  "jasmine-moon": JasmineMoonTemplate,
  kolam: KolamTemplate,
  "lotus-night": LotusNightTemplate,
  "lotus-pond": LotusPondTemplate,
  nocturne: NocturneTemplate,
  "rose-blush": RoseBlushTemplate,
  "sunset-coast": SunsetCoastTemplate,
  wildflower: WildflowerTemplate,
};

export function SignatureWeddingSite({ wedding }: { wedding: PublicWedding }) {
  const Component =
    SIGNATURE_COMPONENTS[wedding.template as SignatureTemplateId];
  return <Component wedding={wedding} />;
}
