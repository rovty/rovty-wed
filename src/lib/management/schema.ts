import type { Tables } from "../../integrations/supabase/types";

export type Wedding = Tables<"weddings">;
export type Access = { email: string; role: "admin" | "viewer" };
export type Metrics = {
  guests: number;
  seats: number;
  invited: number;
  attending: number;
  declined: number;
  pending: number;
  confirmedSeats: number;
  assigned: number;
  tables: number;
  capacity: number;
};
export type Directory = {
  summary: {
    total: number;
    published: number;
    draft: number;
    upcoming: number;
  };
  total: number;
  page: number;
  items: (Pick<
    Wedding,
    | "id"
    | "slug"
    | "bride"
    | "groom"
    | "event_date"
    | "venue"
    | "template"
    | "published"
    | "updated_at"
  > & { owner_email: string | null; metrics: Metrics })[];
};
export type Detail = {
  wedding: Wedding;
  metrics: Metrics;
  owner: {
    id: string;
    email: string;
    last_sign_in_at: string | null;
    created_at: string;
  } | null;
  team: Tables<"wedding_members">[];
  tables: Tables<"seating_tables">[];
  seating: Tables<"seating_config"> | null;
  audit: {
    id: string;
    actor_email: string;
    action: string;
    reason: string;
    created_at: string;
    before_data: Record<string, unknown> | null;
    after_data: Record<string, unknown> | null;
  }[];
};
export type Guest = Tables<"guests"> & {
  attending: boolean | null;
  rsvp_message: string | null;
  replied_at: string | null;
  table_number: number | null;
  table_name: string | null;
  table_id: string | null;
};
export type GuestPage = { total: number; page: number; items: Guest[] };
export type Field = {
  key: string;
  label: string;
  type?:
    "text" | "textarea" | "date" | "url" | "number" | "checkbox" | "template";
  required?: boolean;
  max?: number;
};
export const weddingGroups: {
  title: string;
  description?: string;
  fields: Field[];
}[] = [
  {
    title: "Couple & identity",
    description:
      "Correct these only after confirming the request with the couple. Changing the username changes their public link; existing links will stop working.",
    fields: [
      { key: "bride", label: "Partner one", required: true, max: 80 },
      { key: "groom", label: "Partner two", required: true, max: 80 },
      { key: "slug", label: "Wedding username", required: true, max: 63 },
      { key: "bride_parents_names", label: "Partner one's parents", max: 300 },
      { key: "groom_parents_names", label: "Partner two's parents", max: 300 },
    ],
  },
  {
    title: "Date & place",
    fields: [
      {
        key: "event_date",
        label: "Wedding date & time",
        type: "date",
        required: true,
      },
      { key: "event_end", label: "Wedding end", type: "date" },
      { key: "reception_date", label: "Reception date & time", type: "date" },
      { key: "reception_end", label: "Reception end", type: "date" },
      { key: "venue", label: "Venue", max: 300 },
      { key: "hall", label: "Hall", max: 300 },
      { key: "address", label: "Address", max: 1000 },
      { key: "maps_url", label: "Map link", type: "url", max: 2048 },
    ],
  },
  {
    title: "Invitation & publication",
    description:
      "Template changes keep the saved custom design. Use the couple's design studio for section layouts and styling.",
    fields: [
      {
        key: "published",
        label: "Wedding website published",
        type: "checkbox",
        required: true,
      },
      {
        key: "template",
        label: "Template",
        type: "template",
        required: true,
        max: 40,
      },
      {
        key: "description",
        label: "Welcome / story",
        type: "textarea",
        max: 10000,
      },
      {
        key: "invite_message_before",
        label: "Before invitation link",
        type: "textarea",
        max: 5000,
      },
      {
        key: "invite_message_after",
        label: "After invitation link",
        type: "textarea",
        max: 5000,
      },
      {
        key: "seating_message_before",
        label: "Before seating link",
        type: "textarea",
        max: 5000,
      },
      {
        key: "seating_message_after",
        label: "After seating link",
        type: "textarea",
        max: 5000,
      },
    ],
  },
  {
    title: "Photos & media",
    description:
      "Use HTTPS links to replace existing media. Custom gallery and section media remain in the saved design.",
    fields: [
      {
        key: "couple_photo_url",
        label: "Couple photo",
        type: "url",
        max: 2048,
      },
      { key: "venue_photo_url", label: "Venue photo", type: "url", max: 2048 },
      {
        key: "share_image_url",
        label: "Link preview image",
        type: "url",
        max: 2048,
      },
      { key: "music_url", label: "Music", type: "url", max: 2048 },
      { key: "floor_plan_url", label: "Floor plan", type: "url", max: 2048 },
    ],
  },
];
export const guestFields: Field[] = [
  { key: "name", label: "Guest name", required: true, max: 160 },
  { key: "title", label: "Title", max: 80 },
  { key: "phone", label: "Phone", max: 80 },
  {
    key: "seats",
    label: "Party size",
    type: "number",
    required: true,
    max: 100,
  },
];
export const tableFields: Field[] = [
  { key: "table_name", label: "Table name", max: 160 },
  {
    key: "capacity",
    label: "Capacity",
    type: "number",
    max: 500,
    required: true,
  },
  { key: "is_active", label: "Table active", type: "checkbox", required: true },
];

export class ManagementError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ManagementError("Invalid request.");
  return value as Record<string, unknown>;
}
function keys(value: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(value).some((key) => !allowed.includes(key)))
    throw new ManagementError("That field cannot be changed here.");
}
function string(
  value: unknown,
  label: string,
  max: number,
  min = 1,
): asserts value is string {
  if (
    typeof value !== "string" ||
    value.trim().length < min ||
    value.length > max ||
    value.includes("\0")
  )
    throw new ManagementError(`Check ${label.toLowerCase()}.`);
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isId(value: unknown): value is string {
  return typeof value === "string" && uuid.test(value);
}
function id(value: unknown) {
  if (!isId(value)) throw new ManagementError("Invalid record reference.");
}
function version(value: unknown, nullable = false) {
  if (nullable && value === null) return;
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(
      value,
    ) ||
    !Number.isFinite(Date.parse(value))
  )
    throw new ManagementError("Reload this record before saving.");
}
function fields(value: unknown, definitions: Field[]) {
  const data = record(value);
  if (!Object.keys(data).length)
    throw new ManagementError("No changes supplied.");
  keys(
    data,
    definitions.map((f) => f.key),
  );
  for (const [key, v] of Object.entries(data)) {
    const f = definitions.find((f) => f.key === key)!;
    if (v === null && !f.required) continue;
    if (f.type === "checkbox") {
      if (typeof v !== "boolean")
        throw new ManagementError(`Check ${f.label.toLowerCase()}.`);
    } else if (f.type === "number") {
      if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > f.max!)
        throw new ManagementError(`${f.label} must be between 1 and ${f.max}.`);
    } else if (f.type === "date") version(v);
    else {
      string(v, f.label, f.max ?? 1000, f.required ? 1 : 0);
      if (f.type === "url" && v) {
        try {
          const url = new URL(v);
          if (url.protocol !== "https:" || url.username || url.password)
            throw new Error();
        } catch {
          throw new ManagementError(`${f.label} must be a valid HTTPS link.`);
        }
      }
      if (
        key === "slug" &&
        (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(v) ||
          ["admin", "auth", "api", "templates", "sso"].includes(v))
      )
        throw new ManagementError("Choose a valid wedding username.");
    }
  }
}
export function validateRequest(
  action: string,
  value: unknown,
  write: boolean,
): Record<string, unknown> {
  const p = record(value);
  if (!write) {
    const allowed: Record<string, string[]> = {
      access: [],
      list: ["query", "filter", "page"],
      detail: ["weddingId"],
      guests: ["weddingId", "query", "page"],
    };
    if (!Object.hasOwn(allowed, action))
      throw new ManagementError("Unknown management action.");
    keys(p, allowed[action]);
    if (action === "detail" || action === "guests") id(p.weddingId);
    if (p.query !== undefined) string(p.query, "Search", 100, 0);
    if (
      p.filter !== undefined &&
      !["all", "published", "draft", "upcoming", "past"].includes(
        p.filter as string,
      )
    )
      throw new ManagementError("Invalid filter.");
    if (
      p.page !== undefined &&
      (typeof p.page !== "number" ||
        !Number.isInteger(p.page) ||
        p.page < 0 ||
        p.page > 100000)
    )
      throw new ManagementError("Invalid page.");
    return p;
  }
  const allowed: Record<string, string[]> = {
    wedding: ["version", "changes"],
    guest: ["guestId", "expected", "changes"],
    table: ["tableId", "version", "changes"],
    member: ["memberId", "email", "role", "expectedRole"],
    seating: ["version", "published"],
  };
  if (!Object.hasOwn(allowed, action))
    throw new ManagementError("Unknown management action.");
  keys(p, ["weddingId", "reason", ...allowed[action]]);
  id(p.weddingId);
  string(p.reason, "Reason (5 to 1000 characters)", 1000, 5);
  if (action === "wedding") {
    version(p.version);
    fields(
      p.changes,
      weddingGroups.flatMap((g) => g.fields),
    );
  }
  if (action === "guest") {
    id(p.guestId);
    fields(p.changes, guestFields);
    // Original values may predate current validation rules; only bound their shape.
    const expected = record(p.expected);
    keys(expected, ["name", "phone", "title", "seats"]);
    if (
      Object.keys(expected).length !== 4 ||
      typeof expected.name !== "string" ||
      typeof expected.seats !== "number" ||
      [expected.phone, expected.title].some(
        (v) => v !== null && typeof v !== "string",
      )
    )
      throw new ManagementError("Reload this guest before saving.");
  }
  if (action === "table") {
    id(p.tableId);
    version(p.version);
    fields(p.changes, tableFields);
  }
  if (action === "seating") {
    version(p.version, true);
    if (typeof p.published !== "boolean")
      throw new ManagementError("Choose a publication status.");
  }
  if (action === "member") {
    if (!["admin", "view", "remove"].includes(p.role as string))
      throw new ManagementError("Choose a valid team role.");
    if (p.memberId) {
      id(p.memberId);
      if (!["admin", "view"].includes(p.expectedRole as string))
        throw new ManagementError("Reload this team member before saving.");
    } else {
      string(p.email, "Email", 254);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email) || p.role === "remove")
        throw new ManagementError("Enter a valid account email.");
    }
  }
  return p;
}
