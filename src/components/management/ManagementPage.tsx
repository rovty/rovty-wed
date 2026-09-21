import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DASHBOARD_ORIGIN, WED_SIGN_IN_URL } from "@/lib/platform";
import { management } from "@/lib/management/client";
import {
  ManagementError,
  type Access,
  type Directory,
  type Detail,
  type Guest,
  type GuestPage,
  type Metrics,
  weddingGroups,
  guestFields,
  tableFields,
} from "@/lib/management/schema";
import { EditDialog, type Edit } from "./EditDialog";

const queryOptions = {
  retry: false,
  staleTime: 15000,
  gcTime: 0,
  refetchOnWindowFocus: false,
} as const;
function date(value: string | null | undefined, time = false) {
  return value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        ...(time ? { timeStyle: "short" as const } : {}),
      })
    : "Not available";
}
function useDebounced(value: string) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), 250);
    return () => clearTimeout(t);
  }, [value]);
  return v;
}
function Loading() {
  return (
    <div
      className="manage-loading"
      role="status"
      aria-label="Loading management"
    >
      <div />
      <div />
      <div />
      <span>Loading…</span>
    </div>
  );
}
function Failure({
  error,
  retry,
  denied,
}: {
  error: Error;
  retry: () => void;
  denied?: () => void;
}) {
  const unauthorized =
    error instanceof ManagementError && [401, 403].includes(error.status);
  useEffect(() => {
    if (unauthorized) denied?.();
  }, [unauthorized, denied]);
  return (
    <div className="manage-empty">
      <h2>
        {unauthorized ? "Team access required" : "Couldn't load this view"}
      </h2>
      <p role="alert">{error.message}</p>
      {unauthorized ? (
        <a className="manage-button primary" href={WED_SIGN_IN_URL}>
          Sign in with Rovty
        </a>
      ) : (
        <button className="manage-button" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
function Pagination({
  page,
  total,
  size,
  change,
}: {
  page: number;
  total: number;
  size: number;
  change: (page: number) => void;
}) {
  return (
    <div className="manage-pagination">
      <span>
        {total
          ? `${page * size + 1}–${Math.min((page + 1) * size, total)} of ${total}`
          : "0 results"}
      </span>
      <div>
        <button
          aria-label="Previous page"
          className="manage-icon"
          disabled={page === 0}
          onClick={() => change(page - 1)}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          aria-label="Next page"
          className="manage-icon"
          disabled={(page + 1) * size >= total}
          onClick={() => change(page + 1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
function Status({ live }: { live: boolean }) {
  return (
    <span className={`manage-status ${live ? "live" : ""}`}>
      <i />
      {live ? "Published" : "Draft"}
    </span>
  );
}
function Stats({ items }: { items: [string, number][] }) {
  return (
    <dl className="manage-stats">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value.toLocaleString()}</dd>
        </div>
      ))}
    </dl>
  );
}
function Facts({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className="manage-facts">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value === "" || value == null ? "Not set" : value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ManagementPage() {
  const { wedding } = useSearch({ from: "/admin_/manage" });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [denial, setDenial] = useState<Error | null>(null);
  const access = useQuery({
    queryKey: ["management", "access"],
    queryFn: ({ signal }) => management<Access>("access", {}, false, signal),
    ...queryOptions,
    refetchInterval: 60000,
    enabled: !denial,
  });
  const denied = useCallback(() => {
    setDenial(
      new ManagementError(
        "Your management access changed. Sign in with an approved Rovty team account.",
        403,
      ),
    );
    void qc.cancelQueries({ queryKey: ["management"] });
    qc.removeQueries({ queryKey: ["management"] });
  }, [qc]);
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") denied();
    });
    const pageShow = (e: PageTransitionEvent) => {
      if (e.persisted) void qc.invalidateQueries({ queryKey: ["management"] });
    };
    window.addEventListener("pageshow", pageShow);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener("pageshow", pageShow);
      void qc.cancelQueries({ queryKey: ["management"] });
      qc.removeQueries({ queryKey: ["management"] });
    };
  }, [denied, qc]);
  const choose = (id?: string) =>
    void navigate({ to: "/admin/manage", search: id ? { wedding: id } : {} });
  return (
    <div className="manage-shell">
      <header className="manage-topbar">
        <a
          href={DASHBOARD_ORIGIN}
          className="manage-brand"
          aria-label="Rovty apps"
        >
          rovty<span>WED</span>
        </a>
        <div className="manage-toplinks">
          <span>
            <ShieldCheck size={15} /> Team management
          </span>
          <a href={DASHBOARD_ORIGIN}>
            Your apps <ArrowUpRight size={16} />
          </a>
        </div>
      </header>
      <main className="manage-main">
        {denial || access.error ? (
          <Failure
            error={denial ?? access.error!}
            retry={() => {
              setDenial(null);
              void access.refetch();
            }}
          />
        ) : !access.data ? (
          <Loading />
        ) : (
          <>
            <div className="manage-account">
              <ShieldCheck size={14} />
              <span>{access.data.email}</span>
              <span>
                {access.data.role === "viewer"
                  ? "Read-only access"
                  : "Administrator"}
              </span>
            </div>
            {wedding ? (
              <WeddingDetail
                key={wedding}
                id={wedding}
                canEdit={access.data.role === "admin"}
                back={() => choose()}
                denied={denied}
              />
            ) : (
              <WeddingDirectory open={choose} denied={denied} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
function WeddingDirectory({
  open,
  denied,
}: {
  open: (id: string) => void;
  denied: () => void;
}) {
  const [query, setQuery] = useState("");
  const search = useDebounced(query);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const list = useQuery({
    queryKey: ["management", "list", search, filter, page],
    queryFn: ({ signal }) =>
      management<Directory>(
        "list",
        { query: search, filter, page },
        false,
        signal,
      ),
    ...queryOptions,
  });
  return (
    <>
      <div className="manage-heading">
        <div>
          <span className="manage-eyebrow">Rovty Wed / Operations</span>
          <h1>Wedding management</h1>
          <p>Find a wedding, check its progress, and help with the details.</p>
        </div>
        <button
          className="manage-button"
          onClick={() => void list.refetch()}
          disabled={list.isFetching}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      {list.data && !list.error && (
        <Stats
          items={[
            ["Total weddings", list.data.summary.total],
            ["Published", list.data.summary.published],
            ["Drafts", list.data.summary.draft],
            ["Upcoming", list.data.summary.upcoming],
          ]}
        />
      )}
      <section className="manage-directory" aria-label="Wedding directory">
        <div className="manage-toolbar">
          <label className="manage-search">
            <Search size={18} />
            <input
              aria-label="Search weddings"
              placeholder="Search couple, username, owner or venue"
              value={query}
              maxLength={100}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
            />
          </label>
          <label className="manage-filter">
            <span>Show</span>
            <select
              aria-label="Filter weddings"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(0);
              }}
            >
              {["all", "published", "draft", "upcoming", "past"].map((f) => (
                <option value={f} key={f}>
                  {f === "all"
                    ? "All weddings"
                    : f[0].toUpperCase() + f.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {list.error ? (
          <Failure
            error={list.error}
            retry={() => void list.refetch()}
            denied={denied}
          />
        ) : !list.data ? (
          <Loading />
        ) : (
          <>
            <div className="manage-directory-head">
              <span>Wedding / Owner</span>
              <span>Date / Venue</span>
              <span>Responses / Guests</span>
              <span>Website</span>
              <span />
            </div>
            {!list.data.items.length && (
              <div className="manage-empty">
                <h2>
                  {search || filter !== "all"
                    ? "No matching weddings"
                    : "Your first celebration is ahead"}
                </h2>
                <p>
                  {search || filter !== "all"
                    ? "Try a different search or show all weddings."
                    : "Weddings will appear here when couples create them."}
                </p>
              </div>
            )}
            {list.data.items.map((w) => (
              <button
                key={w.id}
                className="manage-wedding-row"
                onClick={() => open(w.id)}
                aria-label={`Manage ${w.bride} & ${w.groom}`}
              >
                <div>
                  <strong>
                    {w.bride} & {w.groom}
                  </strong>
                  <span>/{w.slug}</span>
                  <small>{w.owner_email || "Owner unavailable"}</small>
                </div>
                <div>
                  <b>{date(w.event_date)}</b>
                  <span>{w.venue || "Venue to be added"}</span>
                </div>
                <div>
                  <b>
                    {w.metrics.attending + w.metrics.declined} /{" "}
                    {w.metrics.guests} responses
                  </b>
                  <span>{w.metrics.confirmedSeats} confirmed seats</span>
                </div>
                <div>
                  <Status live={w.published} />
                  <span className="manage-template">{w.template}</span>
                </div>
                <ArrowUpRight size={20} />
              </button>
            ))}
            <Pagination
              page={page}
              total={list.data.total}
              size={25}
              change={setPage}
            />
          </>
        )}
      </section>
    </>
  );
}
const tabs = [
  "Overview",
  "Wedding details",
  "Guests",
  "Team",
  "Seating",
  "History",
] as const;
function WeddingDetail({
  id,
  canEdit,
  back,
  denied,
}: {
  id: string;
  canEdit: boolean;
  back: () => void;
  denied: () => void;
}) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const [edit, setEdit] = useState<Edit | null>(null);
  const [notice, setNotice] = useState("");
  const qc = useQueryClient();
  const detail = useQuery({
    queryKey: ["management", "detail", id],
    queryFn: ({ signal }) =>
      management<Detail>("detail", { weddingId: id }, false, signal),
    ...queryOptions,
  });
  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["management"] });
  };
  const changed = async () => {
    setNotice("Changes saved. The edit has been added to history.");
    await refresh();
  };
  if (detail.error)
    return (
      <>
        <button className="manage-back" onClick={back}>
          <ArrowLeft size={16} /> All weddings
        </button>
        <Failure
          error={detail.error}
          retry={() => void detail.refetch()}
          denied={denied}
        />
      </>
    );
  if (!detail.data) return <Loading />;
  const d = detail.data,
    w = d.wedding,
    m = d.metrics;
  const startEdit = (value: Edit) => {
    setNotice("");
    setEdit(value);
  };
  const editWedding = () =>
    startEdit({
      title: "Edit wedding",
      action: "wedding",
      params: { weddingId: id, version: w.updated_at },
      initial: w,
      groups: weddingGroups,
    });
  return (
    <>
      <button className="manage-back" onClick={back}>
        <ArrowLeft size={16} /> All weddings
      </button>
      <div className="manage-heading detail">
        <div>
          <span className="manage-eyebrow">Wedding / {w.slug}</span>
          <h1>
            {w.bride} <span>&</span> {w.groom}
          </h1>
          <p>
            {date(w.event_date)} <span aria-hidden="true">·</span>{" "}
            {w.venue || "Venue to be added"}
          </p>
        </div>
        <div className="manage-actions">
          <Status live={w.published} />
          {w.published && (
            <a
              className="manage-button"
              href={`/${encodeURIComponent(w.slug)}`}
              target="_blank"
              rel="noreferrer"
            >
              Open website <ArrowUpRight size={16} />
            </a>
          )}
          <button
            aria-label="Refresh wedding"
            className="manage-icon"
            onClick={() => void refresh()}
            disabled={detail.isFetching}
          >
            <RefreshCw size={17} />
          </button>
        </div>
      </div>
      {notice && (
        <p className="manage-notice" role="status">
          {notice}
        </p>
      )}
      <nav className="manage-tabs" aria-label="Wedding management views">
        {tabs.map((t) => (
          <button
            key={t}
            aria-current={tab === t ? "page" : undefined}
            onClick={() => setTab(t)}
          >
            {t}
            {t === "Guests" && <span>{m.guests}</span>}
          </button>
        ))}
      </nav>
      {tab === "Overview" && (
        <>
          <Stats
            items={[
              ["Guest parties", m.guests],
              ["Confirmed seats", m.confirmedSeats],
              ["Awaiting reply", m.pending],
              ["Seated parties", m.assigned],
            ]}
          />
          <div className="manage-overview">
            <section>
              <div className="manage-section-head">
                <h2>At a glance</h2>
                {canEdit && (
                  <button className="manage-text-button" onClick={editWedding}>
                    Edit wedding <ArrowUpRight size={15} />
                  </button>
                )}
              </div>
              <Facts
                items={[
                  ["Owner", d.owner?.email],
                  ["Wedding date", date(w.event_date, true)],
                  [
                    "Reception",
                    w.reception_date ? date(w.reception_date, true) : "Not set",
                  ],
                  [
                    "Location",
                    [w.venue, w.hall, w.address].filter(Boolean).join(", "),
                  ],
                  ["Template", w.template],
                  [
                    "Design",
                    w.design ? "Custom studio design" : "Original invitation",
                  ],
                  ["Created", date(w.created_at, true)],
                  ["Last updated", date(w.updated_at, true)],
                  ["Owner last sign-in", date(d.owner?.last_sign_in_at, true)],
                  ["Wedding reference", <code>{w.id}</code>],
                ]}
              />
            </section>
            <aside>
              <section className="manage-response">
                <span className="manage-eyebrow">Guest responses</span>
                <p className="manage-big-number">
                  {m.guests
                    ? Math.round(((m.attending + m.declined) / m.guests) * 100)
                    : 0}
                  <small>%</small>
                </p>
                <progress
                  aria-label="Guest response rate"
                  value={m.attending + m.declined}
                  max={m.guests || 1}
                />
                <Facts
                  items={[
                    ["Attending parties", m.attending],
                    ["Declined parties", m.declined],
                    ["Invitations sent", `${m.invited} of ${m.guests}`],
                    ["Invited seats", m.seats],
                    ["Active table capacity", m.capacity],
                    [
                      "Seating page",
                      d.seating?.published ? "Published" : "Draft",
                    ],
                  ]}
                />
              </section>
              <section className="manage-support-note">
                <ShieldCheck size={20} />
                <h3>Careful changes. Clear history.</h3>
                <p>
                  Every team edit records your account and the reason. Couple
                  names and usernames stay locked in the couple's editor.
                </p>
              </section>
            </aside>
          </div>
        </>
      )}
      {tab === "Wedding details" && (
        <section className="manage-panel">
          <div className="manage-section-head">
            <div>
              <h2>Wedding details</h2>
              <p>
                Times are shown in{" "}
                {Intl.DateTimeFormat().resolvedOptions().timeZone}.
              </p>
            </div>
            {canEdit && (
              <button className="manage-button primary" onClick={editWedding}>
                Edit details
              </button>
            )}
          </div>
          {weddingGroups.map((group) => (
            <section className="manage-detail-group" key={group.title}>
              <h3>{group.title}</h3>
              <Facts
                items={group.fields.map((f) => {
                  const value = w[f.key as keyof typeof w];
                  return [
                    f.label,
                    f.type === "date" ? (
                      value ? (
                        date(String(value), true)
                      ) : (
                        "Not set"
                      )
                    ) : typeof value === "boolean" ? (
                      value ? (
                        "Yes"
                      ) : (
                        "No"
                      )
                    ) : f.type === "url" &&
                      typeof value === "string" &&
                      value.startsWith("https://") ? (
                      <a href={value} target="_blank" rel="noreferrer">
                        {value}
                        <ArrowUpRight size={13} />
                      </a>
                    ) : value == null ? (
                      "Not set"
                    ) : (
                      String(value)
                    ),
                  ] as [string, React.ReactNode];
                })}
              />
            </section>
          ))}
        </section>
      )}
      {tab === "Guests" && (
        <Guests id={id} canEdit={canEdit} edit={startEdit} denied={denied} />
      )}
      {tab === "Team" && (
        <section className="manage-panel">
          <div className="manage-section-head">
            <div>
              <h2>People with access</h2>
              <p>Wedding team roles do not grant Rovty management access.</p>
            </div>
            {canEdit && (
              <button
                className="manage-button primary"
                onClick={() =>
                  startEdit({
                    title: "Add team member",
                    action: "member",
                    params: { weddingId: id },
                    initial: { email: "", role: "view" },
                    groups: [
                      {
                        title: "Existing Rovty Wed account",
                        description:
                          "The person must already have signed in to Rovty Wed and have access to the product. This adds access to this wedding without sending an invitation.",
                        fields: [
                          {
                            key: "email",
                            label: "Account email",
                            required: true,
                            max: 254,
                          },
                          {
                            key: "role",
                            label: "Wedding access",
                            options: [
                              { value: "view", label: "View only" },
                              { value: "admin", label: "Can edit" },
                            ],
                          },
                        ],
                      },
                    ],
                  })
                }
              >
                Add member
              </button>
            )}
          </div>
          <div className="manage-person">
            <div>
              <strong>{d.owner?.email || "Owner unavailable"}</strong>
              <span>Owner · Full wedding access</span>
            </div>
            <span className="manage-status">Owner</span>
          </div>
          {d.team.map((member) => (
            <div className="manage-person" key={member.id}>
              <div>
                <strong>{member.email}</strong>
                <span>
                  {member.role === "admin" ? "Can edit" : "View only"} · Added{" "}
                  {date(member.created_at)}
                </span>
              </div>
              {canEdit && (
                <button
                  className="manage-button"
                  onClick={() =>
                    startEdit({
                      title: "Manage team access",
                      action: "member",
                      params: {
                        weddingId: id,
                        memberId: member.id,
                        expectedRole: member.role,
                      },
                      initial: { role: member.role },
                      groups: [
                        {
                          title: member.email,
                          description:
                            "Removing a member ends their access to this wedding. The owner's access cannot be removed here.",
                          fields: [
                            {
                              key: "role",
                              label: "Wedding access",
                              options: [
                                { value: "view", label: "View only" },
                                { value: "admin", label: "Can edit" },
                                { value: "remove", label: "Remove access" },
                              ],
                            },
                          ],
                        },
                      ],
                    })
                  }
                >
                  Manage access
                </button>
              )}
            </div>
          ))}
          {!d.team.length && (
            <p className="manage-hint">No additional team members.</p>
          )}
        </section>
      )}
      {tab === "Seating" && (
        <section className="manage-panel">
          <div className="manage-section-head">
            <div>
              <h2>Seating plan</h2>
              <p>
                {m.assigned} of {m.guests} parties assigned · {m.tables} active
                tables · {m.capacity} seats
              </p>
            </div>
            {canEdit && (
              <button
                className="manage-button"
                onClick={() =>
                  startEdit({
                    title: "Seating publication",
                    action: "seating",
                    params: {
                      weddingId: id,
                      version: d.seating?.updated_at ?? null,
                    },
                    initial: { published: !d.seating?.published },
                    groups: [
                      {
                        title: "Guest seating page",
                        description:
                          "The wedding website must also be published for guests to see the seating page.",
                        fields: [
                          {
                            key: "published",
                            label: "Seating page published",
                            type: "checkbox",
                          },
                        ],
                      },
                    ],
                  })
                }
              >
                {d.seating?.published ? "Unpublish seating" : "Publish seating"}
              </button>
            )}
          </div>
          <Status live={d.seating?.published ?? false} />
          {!d.tables.length && (
            <div className="manage-empty">
              <h3>No seating tables yet</h3>
              <p>The couple can create a plan from their seating editor.</p>
            </div>
          )}
          {d.tables.map((table) => (
            <div className="manage-person" key={table.id}>
              <div>
                <strong>
                  Table {table.table_number}
                  {table.table_name ? ` · ${table.table_name}` : ""}
                </strong>
                <span>
                  {table.capacity} seats ·{" "}
                  {table.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              {canEdit && (
                <button
                  className="manage-button"
                  onClick={() =>
                    startEdit({
                      title: `Edit table ${table.table_number}`,
                      action: "table",
                      params: {
                        weddingId: id,
                        tableId: table.id,
                        version: table.updated_at,
                      },
                      initial: table,
                      groups: [{ title: "Table details", fields: tableFields }],
                    })
                  }
                >
                  Edit table
                </button>
              )}
            </div>
          ))}
        </section>
      )}
      {tab === "History" && (
        <section className="manage-panel">
          <div className="manage-section-head">
            <div>
              <h2>Management history</h2>
              <p>
                The latest 30 Rovty team edits. Couple edits are not included.
              </p>
            </div>
          </div>
          {!d.audit.length && (
            <div className="manage-empty">
              <h3>No team edits yet</h3>
              <p>
                Changes made here will appear with the account, time and reason.
              </p>
            </div>
          )}
          {d.audit.map((entry) => (
            <article key={entry.id} className="manage-audit">
              <div>
                <span className="manage-eyebrow">{entry.action}</span>
                <time>{date(entry.created_at, true)}</time>
              </div>
              <h3>{entry.reason}</h3>
              <p>{entry.actor_email}</p>
              <details>
                <summary>See changed values</summary>
                <dl className="manage-changes">
                  {[
                    ...new Set([
                      ...Object.keys(entry.before_data ?? {}),
                      ...Object.keys(entry.after_data ?? {}),
                    ]),
                  ]
                    .filter(
                      (key) =>
                        ![
                          "updated_at",
                          "created_at",
                          "id",
                          "wedding_id",
                        ].includes(key) &&
                        JSON.stringify(entry.before_data?.[key]) !==
                          JSON.stringify(entry.after_data?.[key]),
                    )
                    .map((key) => (
                      <div key={key}>
                        <dt>{key.replaceAll("_", " ")}</dt>
                        <dd>
                          <del>
                            {String(entry.before_data?.[key] ?? "Not set")}
                          </del>
                          <span>→</span>
                          <ins>
                            {String(entry.after_data?.[key] ?? "Removed")}
                          </ins>
                        </dd>
                      </div>
                    ))}
                </dl>
              </details>
            </article>
          ))}
        </section>
      )}
      {edit && (
        <EditDialog
          edit={edit}
          close={() => setEdit(null)}
          saved={changed}
          denied={denied}
        />
      )}
    </>
  );
}
function Guests({
  id,
  canEdit,
  edit,
  denied,
}: {
  id: string;
  canEdit: boolean;
  edit: (edit: Edit) => void;
  denied: () => void;
}) {
  const [query, setQuery] = useState("");
  const search = useDebounced(query);
  const [page, setPage] = useState(0);
  const guests = useQuery({
    queryKey: ["management", "guests", id, search, page],
    queryFn: ({ signal }) =>
      management<GuestPage>(
        "guests",
        { weddingId: id, query: search, page },
        false,
        signal,
      ),
    ...queryOptions,
  });
  const modify = (g: Guest) =>
    edit({
      title: "Edit guest",
      action: "guest",
      params: {
        weddingId: id,
        guestId: g.id,
        expected: {
          name: g.name,
          phone: g.phone,
          title: g.title,
          seats: g.seats,
        },
      },
      initial: g,
      groups: [
        {
          title: "Guest details",
          description: "The guest's invitation code and RSVP stay unchanged.",
          fields: guestFields,
        },
      ],
    });
  return (
    <section className="manage-panel">
      <div className="manage-section-head">
        <div>
          <h2>Guests & RSVPs</h2>
          <p>Read responses, check seating and correct guest details.</p>
        </div>
        <label className="manage-search">
          <Search size={17} />
          <input
            aria-label="Search guests"
            placeholder="Name, phone or invitation code"
            maxLength={100}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
        </label>
      </div>
      {guests.error ? (
        <Failure
          error={guests.error}
          retry={() => void guests.refetch()}
          denied={denied}
        />
      ) : !guests.data ? (
        <Loading />
      ) : (
        <>
          {!guests.data.items.length && (
            <div className="manage-empty">
              <h3>{search ? "No matching guests" : "No guests added yet"}</h3>
            </div>
          )}
          {guests.data.items.map((g) => (
            <article className="manage-guest" key={g.id}>
              <div>
                <h3>{[g.title, g.name].filter(Boolean).join(" ")}</h3>
                <p>
                  {g.phone || "No phone"} · Party of {g.seats}
                </p>
                <code>{g.code}</code>
              </div>
              <div>
                <strong
                  className={g.attending === true ? "manage-positive" : ""}
                >
                  {g.attending === null
                    ? "Awaiting reply"
                    : g.attending
                      ? "Attending"
                      : "Declined"}
                </strong>
                <p>
                  {g.replied_at
                    ? `Replied ${date(g.replied_at, true)}`
                    : g.invited_at
                      ? `Invited ${date(g.invited_at)}`
                      : "Invitation not marked sent"}
                </p>
                {g.rsvp_message && <blockquote>{g.rsvp_message}</blockquote>}
              </div>
              <div>
                <strong>
                  {g.table_number == null
                    ? "Not seated"
                    : `Table ${g.table_number}`}
                </strong>
                <p>{g.table_name}</p>
              </div>
              {canEdit && (
                <button className="manage-button" onClick={() => modify(g)}>
                  Edit guest
                </button>
              )}
            </article>
          ))}
          <Pagination
            page={page}
            total={guests.data.total}
            size={50}
            change={setPage}
          />
        </>
      )}
    </section>
  );
}
