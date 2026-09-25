import type { CSSProperties } from "react";
import type { WeddingTemplate } from "@/lib/wedding";
import forest from "@/assets/theme-forest.webp";
import rose from "@/assets/petal.webp";
import lotus from "@/assets/lotus-bloom-sm.webp";
import olive from "@/assets/theme-olive.webp";
import cherry from "@/assets/theme-cherry-blossom.webp";
import orchid from "@/assets/theme-orchid.webp";
import jasmine from "@/assets/theme-jasmine.webp";
import palm from "@/assets/theme-palm.webp";
import butterfly from "@/assets/theme-butterfly.webp";
import moon from "@/assets/theme-moon-stars.webp";
import dove from "@/assets/theme-dove.webp";
import rings from "@/assets/theme-rings.webp";
import feather from "@/assets/theme-feather.webp";
import eucalyptus from "@/assets/theme-eucalyptus.webp";
import sunflower from "@/assets/theme-sunflower.webp";
import wheat from "@/assets/theme-wheat.webp";
import candlelight from "@/assets/theme-candlelight.webp";
import lamp from "@/assets/theme-oil-lamp.webp";
import peacock from "@/assets/theme-peacock.webp";
import ocean from "@/assets/theme-ocean.webp";
import tree from "@/assets/theme-tree-of-love.webp";

export const artwork: Partial<Record<WeddingTemplate, string>> = {
  forest,
  classic: rose,
  lotus,
  olive,
  "cherry-blossom": cherry,
  orchid,
  jasmine,
  palm,
  butterfly,
  "moon-stars": moon,
  dove,
  rings,
  feather,
  eucalyptus,
  sunflower,
  wheat,
  candlelight,
  "oil-lamp": lamp,
  peacock,
  ocean,
  "tree-of-love": tree,
};

export function themeArtworkStyle(template: WeddingTemplate): CSSProperties {
  return {
    "--theme-image": artwork[template] ? `url("${artwork[template]}")` : "none",
  } as CSSProperties;
}
