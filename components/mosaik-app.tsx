"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, Archive, ArrowDownToLine, Braces, ChevronDown, CircleHelp, Compass, Crosshair,
  Download, Eye, FileJson, Flag, Focus, Grid2X2, History, Layers3, Lightbulb, Link2, Menu,
  MoreHorizontal, Plus, Redo2, Search, Share2, Sparkles, Undo2, Upload, X, Zap,
} from "lucide-react";
import { DecisionCanvas } from "@/components/decision-canvas";
import { CommandPalette, type PaletteAction } from "@/components/command-palette";
import { Inspector } from "@/components/inspector";
import { useWorkspace } from "@/hooks/use-workspace";
import { scoreOptions } from "@/lib/scoring";
import type { DecisionNode, NodeKind, Workspace } from "@/types/workspace";

const kinds: { kind: NodeKind; label: string; icon: typeof Flag }[] = [
  { kind: "option", label: "Option", icon: Flag },
  { kind: "criterion", label: "Critère", icon: Crosshair },
  { kind: "signal", label: "Signal", icon: Lightbulb },
  { kind: "risk", label: "Risque", icon: Zap },
];

export function MosaikApp() {
  const { workspace, setWorkspace, hydrated, undo, redo } = useWorkspace();
  const [selectedId, setSelectedId] = useState<string | null>("o1");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [addMenu, setAddMenu] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const [pulse, setPulse] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [xray, setXray] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const logoClicks = useRef(0);

  const selected = workspace.nodes.find((node) => node.id === selectedId) ?? null;
  const scores = useMemo(() => scoreOptions(workspace.nodes, workspace.edges), [workspace]);
  const ranked = scores.map((score) => ({ ...score, node: workspace.nodes.find((node) => node.id === score.id)! })).filter((item) => item.node);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const addNode = useCallback((kind: NodeKind = "option") => {
    const count = workspace.nodes.filter((node) => node.kind === kind).length + 1;
    const id = `${kind}-${Date.now()}`;
    const titles: Record<NodeKind, string> = { question: "Nouvelle décision", option: `Option ${count}`, criterion: `Critère ${count}`, signal: `Signal ${count}`, risk: `Risque ${count}` };
    const node: DecisionNode = {
      id, kind, title: titles[kind], note: "", weight: 0.65, confidence: 60,
      x: 250 + ((workspace.nodes.length * 143) % 560), y: 130 + ((workspace.nodes.length * 97) % 330),
    };
    setWorkspace((current) => ({ ...current, nodes: [...current.nodes, node] }));
    setSelectedId(id);
    setInspectorOpen(true);
    setAddMenu(false);
    notify(`${titles[kind]} ajoutée à la carte`);
  }, [notify, setWorkspace, workspace.nodes]);

  const moveNode = useCallback((id: string, x: number, y: number, remember: boolean) => {
    setWorkspace((current) => ({ ...current, nodes: current.nodes.map((node) => node.id === id ? { ...node, x, y } : node) }), remember);
  }, [setWorkspace]);

  const updateSelected = useCallback((patch: Partial<DecisionNode>) => {
    if (!selectedId) return;
    setWorkspace((current) => ({ ...current, nodes: current.nodes.map((node) => node.id === selectedId ? { ...node, ...patch } : node) }));
  }, [selectedId, setWorkspace]);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setWorkspace((current) => ({ ...current, nodes: current.nodes.filter((node) => node.id !== selectedId), edges: current.edges.filter((edge) => edge.from !== selectedId && edge.to !== selectedId) }));
    setSelectedId(null);
    setInspectorOpen(false);
    notify("Pièce retirée — annulez avec Ctrl Z");
  }, [notify, selectedId, setWorkspace]);

  const connectNode = useCallback((targetId: string) => {
    if (!connectionSource) return;
    if (connectionSource === targetId) { setConnectionSource(null); return; }
    const exists = workspace.edges.some((edge) => edge.from === connectionSource && edge.to === targetId);
    if (!exists) {
      setWorkspace((current) => ({ ...current, edges: [...current.edges, { id: `edge-${Date.now()}`, from: connectionSource, to: targetId, impact: 0.65 }] }));
      notify("Relation créée");
    } else notify("Ces pièces sont déjà reliées");
    setConnectionSource(null);
  }, [connectionSource, notify, setWorkspace, workspace.edges]);

  const runPulse = useCallback(() => {
    setPulse(false);
    window.requestAnimationFrame(() => setPulse(true));
    window.setTimeout(() => setPulse(false), 2100);
    notify(ranked[0] ? `${ranked[0].node.title} résiste le mieux aux tensions actuelles` : "Ajoutez une option pour lancer une lecture");
  }, [notify, ranked]);

  const createBlank = useCallback(() => {
    setWorkspace({ id: `map-${Date.now()}`, title: "Carte sans titre", question: "Quelle décision voulez-vous éclairer ?", nodes: [], edges: [], updatedAt: "Maintenant" });
    setSelectedId(null);
    setPaletteOpen(false);
    notify("Nouvelle carte prête");
  }, [notify, setWorkspace]);

  const exportWorkspace = useCallback(() => {
    const blob = new Blob([JSON.stringify(workspace, null, 2)], { type: "application/json" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `${workspace.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.mosaik.json`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    notify("Carte exportée");
  }, [notify, workspace]);

  function importWorkspace(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as Workspace;
        if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) throw new Error("format");
        setWorkspace(data);
        setSelectedId(data.nodes[0]?.id ?? null);
        notify("Carte importée avec succès");
      } catch { notify("Ce fichier ne semble pas être une carte MOSAÏK"); }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  const shareWorkspace = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify("Lien copié — les données restent sur cet appareil");
    } catch { notify("Copie impossible dans ce navigateur"); }
  }, [notify]);

  const actions = useMemo<PaletteAction[]>(() => [
    { id: "pulse", label: "Lancer une lecture", hint: "Anime les relations et révèle l’option robuste", keywords: "analyse simulation", run: runPulse },
    { id: "add-option", label: "Ajouter une option", hint: "Crée une nouvelle possibilité", run: () => addNode("option") },
    { id: "add-criterion", label: "Ajouter un critère", hint: "Ajoute un angle d’évaluation", run: () => addNode("criterion") },
    { id: "compare", label: "Comparer les options", hint: "Ouvre la matrice de robustesse", run: () => setCompareOpen(true) },
    { id: "focus", label: focusMode ? "Quitter le mode focus" : "Activer le mode focus", hint: "Masque le bruit autour de la carte", run: () => setFocusMode((value) => !value) },
    { id: "export", label: "Exporter la carte", hint: "Télécharge une copie JSON", run: exportWorkspace },
    { id: "blank", label: "Créer un espace vierge", hint: "Repartir d’une carte vide", run: createBlank },
    { id: "shortcuts", label: "Voir les raccourcis", hint: "Affiche l’aide clavier", run: () => setShortcutsOpen(true) },
  ], [addNode, createBlank, exportWorkspace, focusMode, runPulse]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPaletteOpen(true); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") { event.preventDefault(); notify(event.shiftKey ? (redo() ? "Action rétablie" : "Rien à rétablir") : (undo() ? "Action annulée" : "Rien à annuler")); }
      if (event.key === "Escape") { setConnectionSource(null); setCompareOpen(false); setShortcutsOpen(false); }
      if (event.key === "?" && !event.metaKey && !event.ctrlKey) setShortcutsOpen(true);
      if ((event.key === "Delete" || event.key === "Backspace") && selectedId && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) deleteSelected();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteSelected, notify, redo, selectedId, undo]);

  if (!hydrated) return <LoadingStudio />;

  return (
    <main className={`app-shell ${focusMode ? "focus-mode" : ""}`}>
      <header className="topbar">
        <button type="button" className="mobile-menu-button" onClick={() => setMobileMenu((value) => !value)} aria-label="Ouvrir le menu"><Menu size={20} /></button>
        <button type="button" className="brand" onDoubleClick={() => { setXray((value) => !value); notify(!xray ? "Mode rayons X activé" : "Mode rayons X désactivé"); }} onClick={() => { logoClicks.current += 1; if (logoClicks.current === 5) { setXray(true); notify("Vous avez trouvé la couche invisible ✦"); logoClicks.current = 0; } }} aria-label="MOSAÏK — double-cliquez pour le mode rayons X">
          <span className="brand-mark"><i /><i /><i /></span><strong>MOSAÏK</strong><em>β</em>
        </button>
        <div className="document-title">
          <span className="sync-pulse" />
          <input aria-label="Nom de la carte" value={workspace.title} onChange={(event) => setWorkspace((current) => ({ ...current, title: event.target.value }))} />
          <span>Enregistré localement</span>
        </div>
        <div className="top-actions">
          <button type="button" className="command-trigger" onClick={() => setPaletteOpen(true)}><Search size={15} /> Rechercher <kbd>⌘ K</kbd></button>
          <button type="button" className="icon-button" onClick={() => notify(undo() ? "Action annulée" : "Rien à annuler")} aria-label="Annuler"><Undo2 size={17} /></button>
          <button type="button" className="icon-button" onClick={() => notify(redo() ? "Action rétablie" : "Rien à rétablir")} aria-label="Rétablir"><Redo2 size={17} /></button>
          <button type="button" className="share-button" onClick={shareWorkspace}><Share2 size={15} /> Partager</button>
          <button type="button" className="avatar" onClick={() => setShortcutsOpen(true)} aria-label="Aide et raccourcis">DA</button>
        </div>
      </header>

      <aside className={`sidebar ${mobileMenu ? "mobile-open" : ""}`}>
        <div className="sidebar-section">
          <div className="section-label">ESPACE</div>
          <button type="button" className="nav-item active"><Compass size={17} /> Cartographie <span>{workspace.nodes.length}</span></button>
          <button type="button" className="nav-item" onClick={() => setCompareOpen(true)}><Grid2X2 size={17} /> Comparaison <span>{scores.length}</span></button>
          <button type="button" className="nav-item" onClick={runPulse}><Activity size={17} /> Lecture du système</button>
        </div>
        <div className="sidebar-section grow">
          <div className="section-label">CALQUES</div>
          {[
            ["all", "Tout voir", Layers3], ["option", "Options", Flag], ["criterion", "Critères", Crosshair], ["signal", "Signaux", Lightbulb], ["risk", "Risques", Zap],
          ].map(([id, label, Icon]) => {
            const ItemIcon = Icon as typeof Layers3;
            return <button type="button" className={`nav-item ${filter === id ? "sub-active" : ""}`} key={id as string} onClick={() => { setFilter(id as string); setMobileMenu(false); }}><ItemIcon size={16} />{label as string}<span>{id === "all" ? workspace.nodes.length : workspace.nodes.filter((node) => node.kind === id).length}</span></button>;
          })}
        </div>
        <div className="local-card">
          <span><Archive size={15} /> Local-first</span>
          <p>Votre réflexion ne quitte jamais cet appareil.</p>
          <button type="button" onClick={exportWorkspace}><Download size={14} /> Sauvegarder une copie</button>
        </div>
        <button type="button" className="sidebar-help" onClick={() => setShortcutsOpen(true)}><CircleHelp size={16} /> Raccourcis et secrets <kbd>?</kbd></button>
      </aside>

      <section className="workspace">
        <div className="workspace-toolbar">
          <div className="question-block"><span>QUESTION ACTIVE</span><input aria-label="Question de décision" value={workspace.question} onChange={(event) => setWorkspace((current) => ({ ...current, question: event.target.value }))} /></div>
          <div className="toolbar-actions">
            <div className="add-wrap">
              <button type="button" className="primary-button" onClick={() => setAddMenu((value) => !value)}><Plus size={16} /> Ajouter <ChevronDown size={14} /></button>
              {addMenu && <div className="add-menu">{kinds.map(({ kind, label, icon: Icon }) => <button type="button" key={kind} onClick={() => addNode(kind)}><Icon size={16} /><span>{label}<small>{kind === "option" ? "Une voie possible" : kind === "criterion" ? "Ce qui compte" : kind === "signal" ? "Un fait observé" : "Une tension à surveiller"}</small></span></button>)}</div>}
            </div>
            <button type="button" className={`tool-button ${connectionSource ? "active" : ""}`} onClick={() => selectedId ? setConnectionSource(selectedId) : notify("Sélectionnez d’abord une pièce")}><Link2 size={16} /><span>Relier</span></button>
            <button type="button" className={`tool-button ${focusMode ? "active" : ""}`} onClick={() => setFocusMode((value) => !value)}><Focus size={16} /><span>Focus</span></button>
            <button type="button" className="icon-button" onClick={() => setPaletteOpen(true)} aria-label="Plus d’actions"><MoreHorizontal size={17} /></button>
          </div>
        </div>

        <DecisionCanvas nodes={workspace.nodes} edges={workspace.edges} selectedId={selectedId} connectionSource={connectionSource} pulse={pulse} xray={xray} filter={filter} onSelect={(id) => { setSelectedId(id); setInspectorOpen(true); }} onMove={moveNode} onConnect={connectNode} onAdd={() => addNode("option")} />

        <section className="insight-strip" aria-label="Lecture synthétique">
          <div className="insight-title"><span><Sparkles size={15} /></span><div><small>LECTURE ACTUELLE</small><strong>{ranked[0] ? `${ranked[0].node.title} prend l’avantage` : "La carte attend sa première option"}</strong></div></div>
          <div className="rank-bars">{ranked.slice(0, 3).map((item, index) => <div key={item.id}><span>{index + 1}</span><label>{item.node.title}<i><b style={{ width: `${item.score}%` }} /></i></label><strong>{item.score}</strong></div>)}</div>
          <button type="button" className="pulse-button" onClick={runPulse}><Activity size={16} /> Lire les tensions</button>
          <button type="button" className="compare-button" onClick={() => setCompareOpen(true)}>Comparer en détail</button>
        </section>
      </section>

      <Inspector node={selected} mobileOpen={inspectorOpen} onClose={() => setInspectorOpen(false)} onChange={updateSelected} onDelete={deleteSelected} onStartConnect={() => { if (selectedId) { setConnectionSource(selectedId); setInspectorOpen(false); } }} />

      <nav className="mobile-nav" aria-label="Navigation mobile">
        <button type="button" className="active" onClick={() => { setMobileMenu(false); setInspectorOpen(false); }}><Compass size={19} /><span>Carte</span></button>
        <button type="button" onClick={() => setCompareOpen(true)}><Grid2X2 size={19} /><span>Comparer</span></button>
        <button type="button" className="mobile-add" onClick={() => addNode("option")} aria-label="Ajouter une option"><Plus size={22} /></button>
        <button type="button" onClick={runPulse}><Activity size={19} /><span>Lecture</span></button>
        <button type="button" onClick={() => setInspectorOpen(true)}><Braces size={19} /><span>Détails</span></button>
      </nav>

      <CommandPalette open={paletteOpen} actions={actions} onClose={() => setPaletteOpen(false)} />
      {compareOpen && <CompareModal ranked={ranked} nodes={workspace.nodes} onClose={() => setCompareOpen(false)} onSelect={(id) => { setSelectedId(id); setCompareOpen(false); setInspectorOpen(true); }} />}
      {shortcutsOpen && <ShortcutsModal xray={xray} onToggleXray={() => setXray((value) => !value)} onClose={() => setShortcutsOpen(false)} />}
      {toast && <div className="toast"><span>✦</span>{toast}</div>}
      <input ref={fileInput} className="hidden-input" type="file" accept=".json" onChange={importWorkspace} />

      <div className="import-export-fab">
        <button type="button" onClick={() => fileInput.current?.click()} aria-label="Importer une carte"><Upload size={15} /></button>
        <button type="button" onClick={exportWorkspace} aria-label="Exporter la carte"><ArrowDownToLine size={15} /></button>
      </div>
    </main>
  );
}

function LoadingStudio() {
  return <main className="loading-studio"><div className="loading-brand"><span className="brand-mark"><i /><i /><i /></span><strong>MOSAÏK</strong></div><div className="loading-grid"><i /><i /><i /><i /><i /></div><p>Recomposition de votre espace…</p></main>;
}

type Ranked = ReturnType<typeof scoreOptions>[number] & { node: DecisionNode };

function CompareModal({ ranked, nodes, onClose, onSelect }: { ranked: Ranked[]; nodes: DecisionNode[]; onClose: () => void; onSelect: (id: string) => void }) {
  const criteria = nodes.filter((node) => node.kind === "criterion" || node.kind === "risk");
  return <div className="modal-backdrop compare-backdrop" onMouseDown={onClose}><section className="compare-modal" role="dialog" aria-modal="true" aria-label="Comparaison des options" onMouseDown={(event) => event.stopPropagation()}>
    <header><div><span>MATRICE DE ROBUSTESSE</span><h2>Ce qui tient quand le contexte bouge</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer"><X size={19} /></button></header>
    {ranked.length ? <div className="compare-content">
      <div className="winner-card"><span className="winner-index">01</span><div><small>OPTION LA PLUS ROBUSTE</small><h3>{ranked[0].node.title}</h3><p>Elle combine la meilleure couverture des critères avec un niveau de confiance exploitable.</p></div><div className="score-ring" style={{ "--score": `${ranked[0].score * 3.6}deg` } as React.CSSProperties}><strong>{ranked[0].score}</strong><small>/100</small></div></div>
      <div className="matrix" role="table"><div className="matrix-row matrix-head" role="row"><span>Option</span><span>Score</span><span>Confiance</span><span>Couverture</span><span /></div>{ranked.map((item, index) => <button type="button" className="matrix-row" role="row" key={item.id} onClick={() => onSelect(item.id)}><span><i>{index + 1}</i>{item.node.title}</span><span><b className="mini-bar"><em style={{ width: `${item.score}%` }} /></b>{item.score}</span><span>{item.confidence}%</span><span>{item.coverage}%</span><span>Ouvrir</span></button>)}</div>
      <div className="compare-notes"><div><Eye size={17} /><span><strong>{criteria.length} tensions lisibles</strong><small>Critères et risques pris en compte</small></span></div><div><History size={17} /><span><strong>Calcul transparent</strong><small>Poids × impact × confiance</small></span></div><div><FileJson size={17} /><span><strong>Sans boîte noire</strong><small>Toutes les données restent éditables</small></span></div></div>
    </div> : <div className="compare-empty"><Grid2X2 size={28} /><h3>Rien à comparer pour l’instant</h3><p>Ajoutez au moins une option pour construire la matrice.</p></div>}
  </section></div>;
}

function ShortcutsModal({ xray, onToggleXray, onClose }: { xray: boolean; onToggleXray: () => void; onClose: () => void }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="shortcuts-modal" role="dialog" aria-modal="true" aria-label="Raccourcis clavier" onMouseDown={(event) => event.stopPropagation()}><header><div><span>GESTES RAPIDES</span><h2>Gardez le fil de votre pensée.</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Fermer les raccourcis"><X size={18} /></button></header><div className="shortcut-list"><div><span>Palette de commandes</span><kbd>Ctrl</kbd><kbd>K</kbd></div><div><span>Annuler / rétablir</span><kbd>Ctrl</kbd><kbd>Z</kbd></div><div><span>Supprimer une pièce</span><kbd>⌫</kbd></div><div><span>Fermer / annuler un lien</span><kbd>Esc</kbd></div></div><button type="button" className={`secret-button ${xray ? "active" : ""}`} onClick={onToggleXray}><span><Eye size={17} /> Mode rayons X</span><small>Rend visibles les halos de confiance</small></button></section></div>;
}
