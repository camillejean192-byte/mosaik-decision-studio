"use client";

import { useMemo, useRef } from "react";
import { AlertTriangle, Compass, Crosshair, Flag, Lightbulb, Link2, Sparkles } from "lucide-react";
import type { DecisionEdge, DecisionNode } from "@/types/workspace";
import { nodeLabel } from "@/lib/scoring";

const icons = {
  question: Compass,
  option: Flag,
  criterion: Crosshair,
  signal: Lightbulb,
  risk: AlertTriangle,
};

type Props = {
  nodes: DecisionNode[];
  edges: DecisionEdge[];
  selectedId: string | null;
  connectionSource: string | null;
  pulse: boolean;
  xray: boolean;
  filter: string;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number, remember: boolean) => void;
  onConnect: (id: string) => void;
  onAdd: () => void;
};

export function DecisionCanvas({ nodes, edges, selectedId, connectionSource, pulse, xray, filter, onSelect, onMove, onConnect, onAdd }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null);
  const map = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const visibleIds = useMemo(() => new Set(nodes.filter((node) => filter === "all" || node.kind === filter).map((node) => node.id)), [nodes, filter]);

  function beginDrag(event: React.PointerEvent, node: DecisionNode) {
    if (event.button !== 0 || connectionSource) return;
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { id: node.id, dx: event.clientX - bounds.left - node.x, dy: event.clientY - bounds.top - node.y, moved: false };
  }

  function moveDrag(event: React.PointerEvent) {
    const drag = dragRef.current;
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!drag || !bounds) return;
    const x = Math.max(12, Math.min(908, event.clientX - bounds.left - drag.dx));
    const y = Math.max(12, Math.min(522, event.clientY - bounds.top - drag.dy));
    onMove(drag.id, x, y, !drag.moved);
    drag.moved = true;
  }

  function endDrag(event: React.PointerEvent, id: string) {
    const moved = dragRef.current?.moved;
    dragRef.current = null;
    if (!moved) {
      if (connectionSource) onConnect(id);
      else onSelect(id);
    }
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  return (
    <div className={`canvas-shell ${pulse ? "is-pulsing" : ""} ${xray ? "is-xray" : ""}`}>
      <div className="canvas-scroll" tabIndex={0} aria-label="Carte de décision interactive">
        <div className="decision-canvas" ref={canvasRef}>
          <div className="canvas-grid" />
          <svg className="connections" viewBox="0 0 1080 650" aria-hidden="true">
            <defs>
              <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            {edges.map((edge) => {
              const from = map.get(edge.from);
              const to = map.get(edge.to);
              if (!from || !to || !visibleIds.has(from.id) || !visibleIds.has(to.id)) return null;
              const x1 = from.x + 78;
              const y1 = from.y + 43;
              const x2 = to.x + 78;
              const y2 = to.y + 43;
              const mid = (x1 + x2) / 2;
              return (
                <path
                  key={edge.id}
                  d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
                  className={edge.impact < 0 ? "edge negative" : "edge positive"}
                  style={{ opacity: 0.22 + Math.abs(edge.impact) * 0.58, animationDelay: `${Number(edge.id.replace(/\D/g, "") || 0) * 80}ms` }}
                />
              );
            })}
          </svg>

          {nodes.map((node) => {
            const Icon = icons[node.kind];
            const isVisible = visibleIds.has(node.id);
            return (
              <button
                key={node.id}
                type="button"
                className={`map-node kind-${node.kind} ${selectedId === node.id ? "is-selected" : ""} ${connectionSource === node.id ? "is-connecting" : ""} ${!isVisible ? "is-dimmed" : ""}`}
                style={{ transform: `translate3d(${node.x}px, ${node.y}px, 0)`, "--certainty": `${node.confidence}%` } as React.CSSProperties}
                onPointerDown={(event) => beginDrag(event, node)}
                onPointerMove={moveDrag}
                onPointerUp={(event) => endDrag(event, node.id)}
                aria-label={`${nodeLabel(node.kind)} : ${node.title}`}
              >
                <span className="node-cap"><Icon size={13} strokeWidth={2.2} />{nodeLabel(node.kind)}</span>
                <strong>{node.title}</strong>
                <span className="node-confidence"><i style={{ width: `${node.confidence}%` }} />{node.confidence}%</span>
              </button>
            );
          })}

          {nodes.length === 0 && (
            <div className="canvas-empty">
              <span><Sparkles size={22} /></span>
              <h2>Un espace pour penser</h2>
              <p>Posez une première pièce. La carte fera émerger les liens au fil de votre réflexion.</p>
              <button type="button" className="primary-button" onClick={onAdd}>Créer la première option</button>
            </div>
          )}

          {connectionSource && (
            <div className="connect-hint"><Link2 size={14} /> Choisissez la pièce à relier · Échap pour annuler</div>
          )}
          <div className="canvas-coordinates">∞ ESPACE DE TRAVAIL · {nodes.length} PIÈCES</div>
        </div>
      </div>
    </div>
  );
}
