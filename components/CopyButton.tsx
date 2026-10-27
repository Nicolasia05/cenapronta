"use client";
import { useState } from "react";

export function CopyButton({ text, label = "Copiar", className = "" }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
        }
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
      className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
        done ? "border-volt bg-volt text-ink" : "border-line-2 text-soft hover:text-bone hover:border-mute"
      } ${className}`}
    >
      {done ? "Copiado ✓" : label}
    </button>
  );
}

export function PromptBlock({ title, hint, text }: { title: string; hint?: string; text: string }) {
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{title}</p>
          {hint && <p className="mt-1 text-xs text-mute">{hint}</p>}
        </div>
        <CopyButton text={text} />
      </div>
      <pre className="prompt-box">{text}</pre>
    </div>
  );
}
