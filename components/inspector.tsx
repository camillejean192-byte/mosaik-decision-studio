"use client";

import { AlertTriangle, Link2, Trash2, X } from "lucide-react";
import type { DecisionNode, NodeKind } from "@/types/workspace";
import { nodeLabel } from "@/lib/scoring";

type Props = {
  node: DecisionNode | null;
  mobileOpen: boolean;
  onClose: () => void;
  onChange: (patch: Partial<DecisionNode>) => void;
  onDelete: () => void;
  onStartConnect: () => void;
};

export function Inspector({ node, mobileOpen, onClose, onChange, onDelete, onStartConnect }: Props) {
  return (
    <aside className={`inspector ${mobileOpen ? "mobile-open" : ""}`} aria-label="Inspecteur">
      <div className="inspector-head">
        <span>Inspecteur</span>
        <button type="button" className="icon-button mobile-only" onClick={onClose} aria-label="Fermer l’inspecteur"><X size={17} /></button>
      </div>
      {node ? (
        <div className="inspector-content">
          <div className={`inspector-kind kind-${node.kind}`}><i />{nodeLabel(node.kind)}</div>
          <label>Titre<input value={node.title} onChange={(event) => onChange({ title: event.target.value })} /></label>
          <label>Note<textarea rows={4} value={node.note} onChange={(event) => onChange({ note: event.target.value })} placeholder="Ce que cette pièce apporte à la décision…" /></label>
          <label className="range-label"><span>Importance <b>{Math.round(node.weight * 100)}%</b></span><input type="range" min="10" max="100" value={node.weight * 100} onChange={(event) => onChange({ weight: Number(event.target.value) / 100 })} /></label>
          <label className="range-label"><span>Confiance <b>{node.confidence}%</b></span><input type="range" min="5" max="100" value={node.confidence} onChange={(event) => onChange({ confidence: Number(event.target.value) })} /></label>
          <div className="inspector-divider" />
          <button type="button" className="inspector-action" onClick={onStartConnect}><Link2 size={16} /> Relier à une autre pièce</button>
          <button type="button" className="inspector-action danger" onClick={onDelete}><Trash2 size={16} /> Supprimer cette pièce</button>
          <div className="inspector-tip"><AlertTriangle size={15} /><p>Les niveaux de confiance faibles réduisent la robustesse du scénario, même si son score reste élevé.</p></div>
        </div>
      ) : (
        <div className="inspector-placeholder"><div className="orbital"><i /><i /><i /></div><h3>Sélectionnez une pièce</h3><p>Modifiez son rôle, son poids ou reliez-la au reste de la carte.</p></div>
      )}
    </aside>
  );
}
