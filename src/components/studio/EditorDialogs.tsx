import { useEffect, useRef } from "react";
import { ArrowRight, X } from "lucide-react";
import type { StudioDraft } from "@/lib/studio/catalog";
import { PreviewFrame, type PreviewDevice } from "./PreviewFrame";
import { DeviceToggle } from "./TemplateDiscovery";

export function ReviewDialog({
  draft,
  device,
  onDevice,
  onClose,
  onPublish,
  busy,
  published,
  error,
}: {
  draft: StudioDraft;
  device: PreviewDevice;
  onDevice: (v: PreviewDevice) => void;
  onClose: () => void;
  onPublish?: () => void;
  busy: boolean;
  published: boolean;
  error: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.showModal();
    return () => previous?.focus();
  }, []);
  return (
    <dialog
      ref={ref}
      className="studio-modal studio-shell"
      onCancel={onClose}
      aria-label="Review your wedding website"
    >
      <div className="studio-modal-content">
        <header className="studio-modal-header">
          <div>
            <h2>Your story, ready to share.</h2>
            <p>
              {onPublish
                ? "Take a last look on both screens before sharing it with your people."
                : "Your design is saved on this device. Sign in to connect it to your wedding."}
            </p>
          </div>
          <div className="studio-modal-header-actions">
            <DeviceToggle device={device} onChange={onDevice} />
            {onPublish ? (
              <button
                className="studio-button primary"
                disabled={busy}
                onClick={onPublish}
              >
                {busy
                  ? "Saving…"
                  : published
                    ? "Update live website"
                    : "Publish website"}
                <ArrowRight size={14} />
              </button>
            ) : (
              <a className="studio-button primary" href="/auth">
                Sign in to publish <ArrowRight size={14} />
              </a>
            )}
            <button
              className="studio-icon-button"
              aria-label="Back to editing"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </header>
        {error && (
          <p className="review-error" role="alert">
            {error}
          </p>
        )}
        <div className="studio-modal-previews">
          <PreviewFrame
            wedding={draft.wedding}
            design={draft.design}
            device={device}
          />
        </div>
      </div>
    </dialog>
  );
}
export function ConfirmLeave({
  onClose,
  onLeave,
}: {
  onClose: () => void;
  onLeave: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="editor-confirm studio-shell"
      onCancel={onClose}
      aria-label="Unsaved design"
    >
      <h2>Keep your lovely changes?</h2>
      <p>Your latest edits haven’t been saved to your wedding.</p>
      <button className="studio-button primary" onClick={onClose}>
        Keep editing
      </button>
      <button className="studio-button" onClick={onLeave}>
        Leave without saving
      </button>
    </dialog>
  );
}
