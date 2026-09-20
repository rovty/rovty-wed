import couple from "@/assets/studio-couple.webp";
import coupleSmall from "@/assets/studio-couple-480.webp";
import coupleMedium from "@/assets/studio-couple-960.webp";
import garden from "@/assets/studio-garden.webp";
import gardenSmall from "@/assets/studio-garden-480.webp";
import celebration from "@/assets/studio-celebration.webp";
import celebrationSmall from "@/assets/studio-celebration-480.webp";
import celebrationMedium from "@/assets/studio-celebration-960.webp";
const sources: Record<string, string> = {
  [couple]: `${coupleSmall} 480w, ${coupleMedium} 960w, ${couple} 1400w`,
  [garden]: `${gardenSmall} 480w, ${garden} 960w`,
  [celebration]: `${celebrationSmall} 480w, ${celebrationMedium} 960w, ${celebration} 1440w`,
};
export function studioImageSources(src: string): string | undefined {
  return sources[src];
}
