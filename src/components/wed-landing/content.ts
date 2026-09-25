// Copy and structure for the Rovty Wed marketing homepage — transcribed
// directly from the "Rovty Wed Landing B" design canvas (claude.ai/design)
// so this page matches what was designed, not a paraphrase of it. Kept as
// data (rather than inline in each section component) so nothing drifts
// section-to-section.
import {
  Sparkles,
  MessageCircle,
  CalendarCheck,
  Grid2x2,
  CalendarClock,
  MapPin,
  type LucideIcon,
} from "lucide-react";

// Same WhatsApp number the rest of the product (Send.tsx, the design canvas
// itself) sends guests through — not a placeholder.
export const WHATSAPP_HREF = "https://wa.me/94783453456";

export const PAGE_SECTIONS = [
  { n: "01", label: "Build yours in the browser", href: "#build" },
  { n: "02", label: "What's included", href: "#included" },
  { n: "03", label: "How it works", href: "#how" },
  { n: "04", label: "Find your seat", href: "#seat" },
  { n: "05", label: "Your dashboard", href: "#dashboard" },
  { n: "06", label: "Pricing", href: "#pricing" },
  { n: "07", label: "Questions", href: "#faq" },
];

export const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Sparkles,
    title: "21 wedding themes",
    body: "Rose, Lotus, Olive, Nikkah, Chapel, Noir and more, each with its own hero layout and opening animation, not just a recolour of the same page.",
  },
  {
    icon: MessageCircle,
    title: "Personalised links, sent on WhatsApp",
    body: "Every guest gets their own link with their name on it. Pick who to invite and Rovty Wed opens WhatsApp pre-filled, one chat at a time.",
  },
  {
    icon: CalendarCheck,
    title: "RSVP right on the page",
    body: "Guests reply on the invitation itself: no app to install, no account to create.",
  },
  {
    icon: Grid2x2,
    title: "Seating, sorted",
    body: "Their link opens their invitation with their table already on it, so there's no code to look up. You lay out the whole floor plan and assign tables from your dashboard.",
  },
  {
    icon: CalendarClock,
    title: "Countdown & calendar",
    body: 'A live countdown to the big day, plus one-tap "Add to calendar" for Apple and Google.',
  },
  {
    icon: MapPin,
    title: "Everything in one link",
    body: "Venue details, Google Maps directions, your own photos, and background music, all on the one page you share.",
  },
];

export const STEPS = [
  {
    n: "01",
    title: "Choose a design",
    body: "Pick from 21 themes and add your names, date, venue and photos.",
  },
  {
    n: "02",
    title: "Add your guests",
    body: "Add your guest list, and Rovty Wed builds each guest their own personalised link.",
  },
  {
    n: "03",
    title: "Send on WhatsApp",
    body: "Select guests and send their personalised links straight from your dashboard.",
  },
  {
    n: "04",
    title: "Watch it come together",
    body: "RSVPs and seating fill in live in your admin as guests reply.",
  },
];

export interface WedPlan {
  name: string;
  badge?: string;
  description: string;
  priceNote: string;
  features: string[];
}

// Presentation copy only. Prices and hosting terms come from the central billing catalog.
export const PLANS: WedPlan[] = [
  {
    name: "Essential",
    description: "For couples who want a beautiful digital wedding invitation.",
    priceNote: "One-time · one wedding",
    features: [
      "All wedding templates",
      "Wedding website and custom invitation link",
      "Colors, typography and section customization",
      "Online RSVP and guest management",
      "Personalized invitations and WhatsApp sharing",
      "Photo galleries and multiple events",
      "Maps, countdown and mobile layouts",
      "Standard support",
    ],
  },
  {
    name: "Complete",
    badge: "Most popular",
    description:
      "Everything you need to invite, manage, and arrange your guests.",
    priceNote: "One-time · one wedding",
    features: [
      "Everything in Essential",
      "Seating planner and table assignments",
      "Find Your Seat for guests",
      "Shared wedding team access",
      "Admin and viewer team permissions",
      "Priority support",
    ],
  },
  {
    name: "Studio",
    description:
      "For couples who want a completely personalized wedding experience.",
    priceNote: "One-time · one wedding",
    features: [
      "Everything in Complete",
      "Custom canvases with text, photos and shapes",
      "Layers, alignment and responsive canvas layouts",
      "Bespoke design assistance from the Rovty team",
      "Custom domain setup with the Rovty team",
      "Dedicated support",
    ],
  },
];

export const FAQS = [
  {
    q: "Do our guests need to install anything?",
    a: "No. The invitation is a web page that opens in WhatsApp's browser, Safari or Chrome. Guests RSVP on the page itself, with no account and no app.",
  },
  {
    q: "How do the personalised links work?",
    a: "When you add a guest, Rovty Wed builds them their own link. Sending from your dashboard opens WhatsApp with that guest's link pre-filled, one chat at a time, and marks them as sent.",
  },
  {
    q: "Do guests have to look up their table?",
    a: "No. Their personalised link opens the invitation with their name and their table already on the page, along with who else is on that table and where it sits on the hall plan. You publish the seating only when you're ready.",
  },
  {
    q: "Is it really one payment?",
    a: "Yes. One-time, per wedding: Choose Essential, Complete or Studio. See current prices and hosting periods in the plans section.",
  },
  {
    q: "Can we use our own domain?",
    a: "Custom domains are part of the Studio plan. Every other plan gets a link on wed.rovty.com, for example wed.rovty.com/amara-kavin.",
  },
  {
    q: "What if details change after we've sent invitations?",
    a: "Edit them in your dashboard. The invitation link stays the same, so the page your guests already have updates itself, and guest notifications keep everyone informed of the change.",
  },
  {
    q: "Do you work with wedding planners?",
    a: "Yes. If you're arranging invitations for several weddings, message us on WhatsApp and we'll set you up per event.",
  },
];
