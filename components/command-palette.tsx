"use client";

import { useEffect, useRef, useState } from "react";
import { Command, CornerDownLeft, Search } from "lucide-react";

export type PaletteAction = { id: string; label: string; hint: string; keywords?: string; run: () => void };

export function CommandPalette({ open, actions, onClose }: { open: boolean; actions: PaletteAction[]; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      window.setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  if (!open) return null;
  const results = actions.filter((action) => `${action.label} ${action.keywords ?? ""}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="modal-backdrop" onMouseDown={onClose} role="presentation">
      <section className="command-palette" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Palette de commandes">
        <div className="command-search"><Search size={19} /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Chercher une commande…" onKeyDown={(event) => {
          if (event.key === "Enter" && results[0]) { results[0].run(); onClose(); }
        }} /><kbd>esc</kbd></div>
        <div className="command-list">
          <p><Command size={13} /> Actions</p>
          {results.map((action, index) => (
            <button type="button" key={action.id} className={index === 0 ? "is-first" : ""} onClick={() => { action.run(); onClose(); }}>
              <span>{action.label}<small>{action.hint}</small></span>
              {index === 0 && <CornerDownLeft size={14} />}
            </button>
          ))}
          {results.length === 0 && <div className="command-empty">Aucun raccourci ne correspond.</div>}
        </div>
      </section>
    </div>
  );
}
