import { useEffect, useState } from "react";
import { isHexColor } from "@/lib/studio/design";

export function PanelHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="editor-panel-heading">
      <p className="studio-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="editor-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function HexInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <input
      aria-label={label}
      value={text}
      maxLength={7}
      onChange={(e) => {
        setText(e.target.value);
        if (isHexColor(e.target.value)) onChange(e.target.value);
      }}
      onBlur={() => setText(value)}
    />
  );
}
