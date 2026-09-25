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
    title: "Designs that open",
    body: "Each design has its own layout and opening animation, not a recolour of one page.",
  },
  {
    icon: MessageCircle,
    title: "Sent on WhatsApp",
    body: "Every guest gets a link with their name on it, pre-filled in WhatsApp, one chat at a time.",
  },
  {
    icon: CalendarCheck,
    title: "RSVP on the page",
    body: "Guests reply on the invitation itself. Replies land in your dashboard live.",
  },
  {
    icon: Grid2x2,
    title: "Seating, sorted",
    body: "Their table is already on their invitation. You plan the floor from your dashboard.",
  },
  {
    icon: CalendarClock,
    title: "Countdown & calendar",
    body: 'A live countdown, plus one-tap "Add to calendar" for Apple and Google.',
  },
  {
    icon: MapPin,
    title: "Venue, photos, music",
    body: "Google Maps directions, your own photos and background music, all on one page.",
  },
];

export const STEPS = [
  {
    n: "01",
    title: "Choose a design",
    body: "Add names, date, venue and photos.",
  },
  {
    n: "02",
    title: "Add your guests",
    body: "Each one gets a personal link.",
  },
  {
    n: "03",
    title: "Send on WhatsApp",
    body: "Straight from your dashboard.",
  },
  {
    n: "04",
    title: "Watch it come together",
    body: "RSVPs and seating fill in live.",
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
    description: "A beautiful digital invitation, RSVPs and guest list.",
    priceNote: "One-time · one wedding",
    features: [
      "All designs and your own invitation link",
      "Colors, typography and sections",
      "RSVP, guest list and WhatsApp sharing",
      "Galleries, multiple events, maps, countdown",
    ],
  },
  {
    name: "Complete",
    badge: "Most popular",
    description: "Everything to invite, manage and seat your guests.",
    priceNote: "One-time · one wedding",
    features: [
      "Everything in Essential",
      "Seating planner and Find Your Seat",
      "Shared team with admin and viewer roles",
      "Priority support",
    ],
  },
  {
    name: "Studio",
    description: "A completely personalized wedding experience.",
    priceNote: "One-time · one wedding",
    features: [
      "Everything in Complete",
      "Custom canvases, layers and layouts",
      "Design help and custom domain from our team",
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
    a: "No. Their link opens the invitation with their name and table already on it, along with who else is at that table. You publish the seating only when you're ready.",
  },
  {
    q: "Is it really one payment?",
    a: "Yes. One-time, per wedding: choose Essential, Complete or Studio. Current prices and hosting periods are shown with each plan.",
  },
  {
    q: "Can we use our own domain?",
    a: "Custom domains are part of Studio. Every other plan gets a link on wed.rovty.com, for example wed.rovty.com/amara-kavin.",
  },
  {
    q: "What if details change after we've sent it?",
    a: "Edit them in your dashboard. The link stays the same, so the page your guests already have updates itself.",
  },
  {
    q: "Do you work with wedding planners?",
    a: "Yes. If you're arranging invitations for several weddings, message us on WhatsApp and we'll set you up per event.",
  },
];
