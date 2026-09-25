import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  /** translate distance in px */
  y?: number;
};

/**
 * Fades + lifts its children into view the first time they enter the viewport.
 * Falls back to visible if IntersectionObserver is unavailable.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  style,
  y = 18,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const el = ref.current;
    const view = el?.ownerDocument.defaultView;
    if (!el || !view?.IntersectionObserver) return;
    const preference = view.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || el.closest('[data-motion="none"]')) return;
    setShown(el.getBoundingClientRect().top < view.innerHeight);
    const io = new view.IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -24px 0px" },
    );
    io.observe(el);
    const show = () => {
      if (preference.matches) {
        setShown(true);
        io.disconnect();
      }
    };
    preference.addEventListener("change", show);
    return () => {
      io.disconnect();
      preference.removeEventListener("change", show);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`wedding-reveal ${className}`}
      data-shown={shown}
      style={
        {
          "--reveal-delay": `${delay}ms`,
          "--reveal-y": `${y}px`,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
