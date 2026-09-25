import { useEffect, type RefObject } from "react";

/** Observe in the element's own window so studio iframes reveal at their scroll position. */
export function useWeddingMotion(
  root: RefObject<HTMLElement | null>,
  enabled: boolean,
  sectionKey: string,
) {
  useEffect(() => {
    const element = root.current;
    const view = element?.ownerDocument.defaultView;
    if (!element || !view || !view.IntersectionObserver) return;
    const preference = view.matchMedia("(prefers-reduced-motion: reduce)");
    const targets = Array.from(
      element.querySelectorAll<HTMLElement>(
        ".site-section-wrap:not(.section-hero):not(.section-canvas)",
      ),
    );
    let observer: IntersectionObserver | undefined;
    const reset = () => {
      observer?.disconnect();
      targets.forEach((target) =>
        target.removeAttribute("data-wedding-reveal"),
      );
    };
    const start = () => {
      reset();
      if (!enabled || preference.matches) return;
      observer = new view.IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.setAttribute("data-wedding-reveal", "visible");
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0, rootMargin: "0px 0px -24px 0px" },
      );
      targets.forEach((target) => {
        if (target.getBoundingClientRect().top >= view.innerHeight) {
          target.setAttribute("data-wedding-reveal", "waiting");
          observer?.observe(target);
        }
      });
    };
    start();
    preference.addEventListener("change", start);
    return () => {
      reset();
      preference.removeEventListener("change", start);
    };
  }, [root, enabled, sectionKey]);
}
