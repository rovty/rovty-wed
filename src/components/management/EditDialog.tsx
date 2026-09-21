import { useEffect, useRef, useState } from "react";
import { useBlocker } from "@tanstack/react-router";
import { X } from "lucide-react";
import { management } from "@/lib/management/client";
import { ManagementError, type Field } from "@/lib/management/schema";
import { WEDDING_TEMPLATES } from "@/lib/wedding";

type EditField = Field & { options?: { value: string; label: string }[] };
export type Edit = {
  title: string;
  action: string;
  params: Record<string, unknown>;
  initial: Record<string, unknown>;
  groups: { title: string; description?: string; fields: EditField[] }[];
};
function display(field: EditField, value: unknown): string | boolean {
  if (field.type === "checkbox") return Boolean(value);
  if (field.type === "date" && value) {
    const d = new Date(String(value));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  return value == null ? "" : String(value);
}
export function EditDialog({
  edit,
  close,
  saved,
  denied,
}: {
  edit: Edit;
  close: () => void;
  saved: () => Promise<void>;
  denied: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const all = edit.groups.flatMap((g) => g.fields);
  const [original] = useState(() =>
    Object.fromEntries(
      all.map((f) => [f.key, display(f, edit.initial[f.key])]),
    ),
  );
  const [values, setValues] = useState(original);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ManagementError | null>(null);
  const dirty =
    reason.length > 0 || JSON.stringify(values) !== JSON.stringify(original);
  useBlocker({
    shouldBlockFn: () =>
      busy || (dirty && !window.confirm("Discard these unsaved changes?")),
    enableBeforeUnload: false,
  });
  const discard = () => {
    if (!busy && (!dirty || window.confirm("Discard these unsaved changes?")))
      close();
  };
  useEffect(() => {
    dialog.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const before = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [dirty]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const changes: Record<string, unknown> = {};
      for (const f of all) {
        if (
          values[f.key] === original[f.key] &&
          ["wedding", "guest", "table"].includes(edit.action)
        )
          continue;
        const value = values[f.key];
        changes[f.key] =
          f.type === "date"
            ? value
              ? new Date(String(value)).toISOString()
              : null
            : f.type === "number"
              ? Number(value)
              : f.type === "checkbox"
                ? value
                : String(value).trim() || null;
      }
      if (
        ["wedding", "guest", "table"].includes(edit.action) &&
        !Object.keys(changes).length
      )
        throw new ManagementError("Change a field before saving.");
      await management(
        edit.action,
        {
          ...edit.params,
          reason: reason.trim(),
          ...(["wedding", "guest", "table"].includes(edit.action)
            ? { changes }
            : changes),
        },
        true,
      );
      await saved();
      close();
    } catch (err) {
      const issue =
        err instanceof ManagementError
          ? err
          : new ManagementError(
              "Could not save. Check your connection and try again.",
              503,
            );
      if (issue.status === 401 || issue.status === 403) {
        denied();
        close();
      } else setError(issue);
    } finally {
      setBusy(false);
    }
  };
  return (
    <dialog
      className="manage-dialog"
      ref={dialog}
      onCancel={(e) => {
        e.preventDefault();
        discard();
      }}
      aria-labelledby="edit-title"
    >
      <form onSubmit={submit}>
        <header>
          <div>
            <span className="manage-eyebrow">Rovty team edit</span>
            <h2 id="edit-title">{edit.title}</h2>
          </div>
          <button
            type="button"
            className="manage-icon"
            aria-label="Close edit"
            onClick={discard}
            disabled={busy}
          >
            <X size={20} />
          </button>
        </header>
        <div className="manage-dialog-body">
          {edit.groups.map((group, i) => (
            <details
              key={group.title}
              open={i === 0 || edit.groups.length === 1}
            >
              <summary>{group.title}</summary>
              {group.description && (
                <p className="manage-hint">{group.description}</p>
              )}
              {group.fields.some((f) => f.type === "date") && (
                <p className="manage-hint">
                  Times use your device timezone:{" "}
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}.
                </p>
              )}
              <div className="manage-fields">
                {group.fields.map((f) => (
                  <label
                    key={f.key}
                    className={f.type === "textarea" ? "manage-wide" : ""}
                  >
                    <span>
                      {f.label}
                      {f.required && f.type !== "checkbox" ? " *" : ""}
                    </span>
                    {f.type === "textarea" ? (
                      <textarea
                        value={String(values[f.key])}
                        rows={3}
                        maxLength={f.max}
                        onChange={(e) =>
                          setValues({ ...values, [f.key]: e.target.value })
                        }
                        disabled={busy}
                      />
                    ) : f.options || f.type === "template" ? (
                      <select
                        value={String(values[f.key])}
                        onChange={(e) =>
                          setValues({ ...values, [f.key]: e.target.value })
                        }
                        disabled={busy}
                      >
                        {(
                          f.options ??
                          WEDDING_TEMPLATES.map((t) => ({
                            value: t.id,
                            label: t.label,
                          }))
                        ).map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={
                          f.type === "date"
                            ? "datetime-local"
                            : f.type === "checkbox"
                              ? "checkbox"
                              : f.type === "url"
                                ? "url"
                                : f.type === "number"
                                  ? "number"
                                  : "text"
                        }
                        value={
                          f.type === "checkbox"
                            ? undefined
                            : String(values[f.key])
                        }
                        checked={
                          f.type === "checkbox"
                            ? Boolean(values[f.key])
                            : undefined
                        }
                        required={f.type !== "checkbox" && f.required}
                        min={f.type === "number" ? 1 : undefined}
                        max={f.type === "number" ? f.max : undefined}
                        maxLength={f.max}
                        onChange={(e) =>
                          setValues({
                            ...values,
                            [f.key]:
                              f.type === "checkbox"
                                ? e.target.checked
                                : e.target.value,
                          })
                        }
                        disabled={busy}
                      />
                    )}
                  </label>
                ))}
              </div>
            </details>
          ))}
        </div>
        <footer>
          <label>
            <span>Reason for this change *</span>
            <textarea
              autoComplete="off"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="For example: corrected a typo at the couple's request."
              required
              minLength={5}
              maxLength={1000}
              rows={2}
              disabled={busy}
            />
          </label>
          {error && (
            <p role="alert" className="manage-error">
              {error.message}
              {error.status === 409 &&
                " Your inputs are still here. Close this edit, then refresh to load the latest record."}
            </p>
          )}
          <div className="manage-actions">
            <button
              type="button"
              className="manage-button"
              onClick={discard}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              className="manage-button primary"
              disabled={busy || reason.trim().length < 5}
            >
              {busy ? "Saving…" : "Save changes"}
            </button>
          </div>
        </footer>
      </form>
    </dialog>
  );
}
