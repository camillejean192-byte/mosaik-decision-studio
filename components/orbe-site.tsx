"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown, ArrowUpRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clipboard,
  Download, Flower2, Leaf, Menu, MoveRight, Ruler, Scissors, Sprout, Sun, Trees, X,
} from "lucide-react";

type Season = "printemps" | "été" | "automne" | "hiver";
type ProjectKind = "Tous" | "Urbain" | "Campagne";
type Project = {
  title: string;
  place: string;
  kind: ProjectKind;
  image: string;
  alt: string;
  note: string;
  challenge: string;
  palette: string;
  interventions: string[];
};

const projects: Project[] = [
  {
    title: "Le patio des fougères",
    place: "Lyon 06 · 48 m²",
    kind: "Urbain" as ProjectKind,
    image: "/images/patio-urbain.webp",
    alt: "Petit jardin urbain luxuriant avec terrasse en pierre et fougères",
    note: "Transformer un vis-à-vis en refuge frais, sans assombrir le séjour.",
    challenge: "Faire oublier les murs proches et gagner de la fraîcheur sans retirer la lumière naturelle du rez-de-chaussée.",
    palette: "Fougères persistantes · Hydrangeas paniculés · Hakonechloa · Pierre calcaire",
    interventions: ["Sol désimperméabilisé sur 31 m²", "Strates végétales du couvre-sol à la cépée", "Arrosage goutte-à-goutte invisible"],
  },
  {
    title: "La prairie habitée",
    place: "Beaujolais · 1 800 m²",
    kind: "Campagne" as ProjectKind,
    image: "/images/prairie-naturaliste.webp",
    alt: "Jardin naturaliste de campagne avec vivaces et chemin sinueux",
    note: "Dessiner moins, laisser vivre davantage — et retrouver les pollinisateurs.",
    challenge: "Relier la maison au verger en créant une promenade fleurie capable de traverser les étés secs du Beaujolais.",
    palette: "Stipa · Achillées · Sauges · Echinacées · Grave locale",
    interventions: ["Prairie structurée en trois séquences", "Chemin perméable en courbe douce", "Fauche tardive et refuge hivernal"],
  },
  {
    title: "Lisière comestible",
    place: "Monts d’Or · 620 m²",
    kind: "Campagne" as ProjectKind,
    image: "/images/jardin-hero.webp",
    alt: "Jardin contemporain mature dans la lumière du matin",
    note: "Un jardin nourricier qui reste graphique en toute saison.",
    challenge: "Installer une trame comestible généreuse tout en conservant des vues nettes et une vraie présence en hiver.",
    palette: "Amélanchiers · Groseilliers · Aromatiques · Graminées · Calcaire clair",
    interventions: ["Lisière fruitière sur 42 mètres", "Récupération des eaux de toiture", "Jardin sec autour de la terrasse"],
  },
];

const seasons: Record<Season, { index: string; title: string; copy: string; palette: string[]; action: string }> = {
  printemps: { index: "01", title: "Le jardin s’élance.", copy: "On structure, on plante et on accompagne les premières poussées sans brusquer le sol.", palette: ["#d5ff68", "#8bbf78", "#f0ddc4"], action: "Plantations · Taille douce · Sol vivant" },
  été: { index: "02", title: "L’ombre devient un matériau.", copy: "On protège l’humidité, on observe les expositions et on crée des îlots de fraîcheur durables.", palette: ["#ffd45e", "#4f8d60", "#d36d48"], action: "Paillage · Arrosage raisonné · Floraisons" },
  automne: { index: "03", title: "La matière retourne au sol.", copy: "Le jardin prépare déjà son prochain cycle. Feuilles, tailles et compost deviennent des ressources.", palette: ["#d66b3f", "#8f5b3e", "#c7a356"], action: "Divisions · Bulbes · Compostage" },
  hiver: { index: "04", title: "La structure se révèle.", copy: "Quand le feuillage s’efface, les lignes, les écorces et les persistants racontent le projet.", palette: ["#b8ced0", "#526b61", "#ece8da"], action: "Conception · Taille · Lecture du terrain" },
};

const steps = [
  ["01", "Lire le lieu", "Soleil, eau, vues, usages, histoire du sol : on commence par regarder longtemps."],
  ["02", "Tracer l’essentiel", "Un plan clair, une palette juste et des choix chiffrés avant le premier coup de bêche."],
  ["03", "Faire avec soin", "Terrassement mesuré, matériaux durables et plantations au bon rythme saisonnier."],
  ["04", "Laisser grandir", "Un carnet d’entretien et des rendez-vous ciblés pour accompagner le jardin, pas le contraindre."],
];

export function OrbeSite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [season, setSeason] = useState<Season>("printemps");
  const [filter, setFilter] = useState<ProjectKind>("Tous");
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible"));
    }, { threshold: 0.15 });
    document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && (setPlannerOpen(false), setActiveProject(null), setMenuOpen(false));
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = plannerOpen || activeProject ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [plannerOpen, activeProject]);

  const notify = useCallback((message: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  const visibleProjects = useMemo(() => projects.filter((project) => filter === "Tous" || project.kind === filter), [filter]);

  return (
    <main className="orbe-site">
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <a href="#accueil" className="orbe-logo" aria-label="ORBE, retour à l’accueil"><LogoMark /><span>ORBE</span><small>JARDINS VIVANTS</small></a>
        <nav className={menuOpen ? "is-open" : ""} aria-label="Navigation principale">
          <a href="#approche" onClick={() => setMenuOpen(false)}>Approche</a>
          <a href="#realisations" onClick={() => setMenuOpen(false)}>Réalisations</a>
          <a href="#saisons" onClick={() => setMenuOpen(false)}>Les saisons</a>
          <button type="button" onClick={() => { setPlannerOpen(true); setMenuOpen(false); }}>Préparer mon projet <ArrowUpRight size={15} /></button>
        </nav>
        <button type="button" className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <section id="accueil" className="garden-hero">
        <Image src="/images/jardin-hero.webp" alt="Jardin contemporain mature dans la lumière douce du matin" fill priority sizes="100vw" className="hero-image" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow"><span /> CONCEPTION · CRÉATION · SOIN</p>
          <h1><span>Des jardins</span><em>qui vieillissent bien.</em></h1>
          <p className="hero-intro">Nous dessinons des lieux vivants, beaux dès le premier jour et plus riches à chaque saison.</p>
          <div className="hero-actions">
            <button type="button" className="light-cta" onClick={() => setPlannerOpen(true)}>Imaginer mon jardin <MoveRight size={17} /></button>
            <a href="#realisations">Voir nos jardins <ArrowDown size={15} /></a>
          </div>
        </div>
        <div className="hero-meta"><span>LYON · BEAUJOLAIS · MONTS D’OR</span><span>46°N — PAYSAGES TEMPÉRÉS</span></div>
        <div className="hero-orbit" aria-hidden="true"><span>PRENDRE LE TEMPS · PLANTER JUSTE · </span></div>
      </section>

      <section className="manifesto" id="approche">
        <div className="section-number">01 — NOTRE REGARD</div>
        <div className="manifesto-copy" data-reveal>
          <p>Un beau jardin n’est pas un décor figé.</p>
          <h2>Il accueille la pluie, nourrit le vivant, offre de l’ombre et change sans jamais perdre sa ligne.</h2>
        </div>
        <div className="manifesto-aside" data-reveal><Leaf size={24} /><p>Moins d’artifice.<br />Plus de sol, d’usage<br />et de saisons.</p></div>
      </section>

      <section className="services-section">
        <div className="services-intro" data-reveal><span>NOS SAVOIR-FAIRE</span><h2>Du premier trait<br />au premier printemps.</h2></div>
        <div className="service-list">
          <article data-reveal><span>01</span><div><Sprout /><h3>Conception paysagère</h3><p>Diagnostic, esquisses, palette végétale, matériaux et plan de plantation.</p></div><ArrowUpRight /></article>
          <article data-reveal><span>02</span><div><Ruler /><h3>Création & transformation</h3><p>Terrasses, circulations, sols, plantations et gestion douce de l’eau.</p></div><ArrowUpRight /></article>
          <article data-reveal><span>03</span><div><Scissors /><h3>Soin saisonnier</h3><p>Taille raisonnée, enrichissement du sol et accompagnement du vivant.</p></div><ArrowUpRight /></article>
        </div>
      </section>

      <section className="projects-section" id="realisations">
        <header data-reveal><div><span className="section-number">02 — JARDINS RÉCENTS</span><h2>Chaque terrain<br />a déjà une histoire.</h2></div><div className="project-filters" role="group" aria-label="Filtrer les réalisations">{(["Tous", "Urbain", "Campagne"] as ProjectKind[]).map((item) => <button type="button" className={filter === item ? "active" : ""} aria-pressed={filter === item} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div></header>
        <div className="project-grid">
          {visibleProjects.map((project, index) => <article className={`project-card project-${index + 1}`} key={project.title} data-reveal>
            <div className="project-image"><Image src={project.image} alt={project.alt} fill sizes="(max-width: 760px) 94vw, 48vw" /><span>{project.kind}</span><button type="button" aria-label={`Découvrir ${project.title}`} onClick={() => setActiveProject(project)}><ArrowUpRight /></button></div>
            <div className="project-info"><div><h3>{project.title}</h3><p>{project.place}</p></div><p>{project.note}</p></div>
          </article>)}
        </div>
      </section>

      <section className={`seasons-section season-${season}`} id="saisons">
        <div className="season-copy" data-reveal><span className="section-number">03 — LE TEMPS COMME ALLIÉ</span><p>UN JARDIN N’EST JAMAIS TERMINÉ.</p><h2>{seasons[season].title}</h2><p className="season-description">{seasons[season].copy}</p><div className="season-palette">{seasons[season].palette.map((color) => <i key={color} style={{ background: color }} />)}<span>{seasons[season].action}</span></div></div>
        <div className="season-dial" data-reveal>
          <div className="dial-center"><Flower2 /><strong>{seasons[season].index}</strong><span>{season}</span></div>
          {(Object.keys(seasons) as Season[]).map((item, index) => <button type="button" key={item} className={season === item ? "active" : ""} aria-pressed={season === item} onClick={() => setSeason(item)} style={{ "--i": index } as React.CSSProperties}>{item}</button>)}
        </div>
      </section>

      <section className="process-section">
        <header data-reveal><span className="section-number">04 — NOTRE MÉTHODE</span><h2>Bien faire commence<br />par bien comprendre.</h2></header>
        <div className="process-list">{steps.map(([number, title, copy]) => <article key={number} data-reveal><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>

      <section className="planner-banner" data-reveal>
        <div><span>VOTRE TERRAIN · VOS USAGES · VOTRE RYTHME</span><h2>Et si votre jardin<br />commençait ici ?</h2></div>
        <button type="button" onClick={() => setPlannerOpen(true)}><span>Préparer mon projet</span><ArrowUpRight /></button>
        <Trees className="banner-tree" aria-hidden="true" />
      </section>

      <footer>
        <a href="#accueil" className="footer-brand"><LogoMark /><strong>ORBE</strong></a>
        <div><span>ATELIER DE PAYSAGE</span><p>Lyon · Beaujolais · Monts d’Or<br />Sur rendez-vous</p></div>
        <div><span>EXPLORER</span><a href="#approche">Notre approche</a><a href="#realisations">Réalisations</a><a href="#saisons">Les saisons</a></div>
        <div><span>COMMENCER</span><button type="button" onClick={() => setPlannerOpen(true)}>Préparer mon projet</button><small>© 2026 ORBE Jardins</small></div>
      </footer>

      {plannerOpen && <ProjectPlanner onClose={() => setPlannerOpen(false)} onNotify={notify} />}
      {activeProject && <ProjectStory project={activeProject} onClose={() => setActiveProject(null)} />}
      {toast && <div className="garden-toast" role="status" aria-live="polite"><Check size={16} />{toast}</div>}
    </main>
  );
}

function LogoMark() {
  return <svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" /><path d="M10 27c8-1 14-6 18-16 2 9 0 18-7 22-5 3-9 0-11-6Z" /><path d="M14 32c3-7 8-12 15-17" /></svg>;
}

function ProjectStory({ project, onClose }: { project: Project; onClose: () => void }) {
  return <div className="story-backdrop" role="presentation" onMouseDown={onClose}>
    <article className="project-story" role="dialog" aria-modal="true" aria-label={`Étude de jardin : ${project.title}`} onMouseDown={(event) => event.stopPropagation()}>
      <button type="button" className="story-close" onClick={onClose} aria-label="Fermer l’étude" autoFocus><X /></button>
      <div className="story-image"><Image src={project.image} alt={project.alt} fill sizes="(max-width: 760px) 100vw, 50vw" /></div>
      <div className="story-content">
        <span>{project.kind} · {project.place}</span>
        <h2>{project.title}</h2>
        <p className="story-lead">{project.note}</p>
        <div className="story-detail"><small>LE DÉFI</small><p>{project.challenge}</p></div>
        <div className="story-detail"><small>PALETTE</small><p>{project.palette}</p></div>
        <ul>{project.interventions.map((item) => <li key={item}><Check size={14} />{item}</li>)}</ul>
      </div>
    </article>
  </div>;
}

function ProjectPlanner({ onClose, onNotify }: { onClose: () => void; onNotify: (message: string) => void }) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState("Transformer l’existant");
  const [area, setArea] = useState(180);
  const [priorities, setPriorities] = useState<string[]>(["Plus de végétal"]);
  const [timing, setTiming] = useState("Dans 3 à 6 mois");
  const [draftReady, setDraftReady] = useState(false);
  const options = ["Plus de végétal", "Moins d’entretien", "Créer de l’ombre", "Accueillir la biodiversité", "Recevoir dehors", "Cultiver et récolter"];

  useEffect(() => {
    const saved = window.localStorage.getItem("orbe-project-draft");
    if (saved) {
      try {
        const draft = JSON.parse(saved) as Record<string, unknown>;
        if (typeof draft.type === "string") setType(draft.type);
        if (typeof draft.area === "number" && Number.isFinite(draft.area)) setArea(Math.min(1500, Math.max(20, draft.area)));
        if (Array.isArray(draft.priorities) && draft.priorities.every((item) => typeof item === "string")) setPriorities(draft.priorities);
        if (typeof draft.timing === "string") setTiming(draft.timing);
      } catch { /* ignore invalid draft */ }
    }
    setDraftReady(true);
  }, []);
  useEffect(() => {
    if (draftReady) {
      try { window.localStorage.setItem("orbe-project-draft", JSON.stringify({ type, area, priorities, timing })); } catch { /* storage can be disabled */ }
    }
  }, [draftReady, type, area, priorities, timing]);

  const brief = `PROJET ORBE\n\nNature : ${type}\nSurface : environ ${area} m²\nPriorités : ${priorities.join(", ")}\nHorizon : ${timing}\n\nPremière lecture : ${area < 80 ? "un petit espace où chaque mètre doit cumuler plusieurs usages" : area < 500 ? "un jardin familial à structurer autour des usages et des saisons" : "un paysage à organiser par séquences, vues et continuités écologiques"}.`;

  function togglePriority(item: string) {
    setPriorities((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  }

  async function copyBrief() {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await Promise.race([
          navigator.clipboard.writeText(brief),
          new Promise((_, reject) => window.setTimeout(() => reject(new Error("clipboard-timeout")), 800)),
        ]);
        copied = true;
      }
    } catch { /* use the local fallback below */ }
    if (!copied) {
      const field = document.createElement("textarea");
      field.value = brief;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      copied = document.execCommand("copy");
      field.remove();
    }
    onNotify(copied ? "Brief copié — prêt à être partagé" : "La copie automatique est indisponible sur ce navigateur");
  }

  function downloadBrief() {
    const blob = new Blob([brief], { type: "text/plain;charset=utf-8" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "mon-projet-orbe.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
    onNotify("Brief téléchargé");
  }

  return <div className="planner-backdrop" role="presentation" onMouseDown={onClose}><section className="project-planner" role="dialog" aria-modal="true" aria-label="Préparer mon projet" onMouseDown={(event) => event.stopPropagation()}>
    <header><div><LogoMark /><span>PRÉPARER MON PROJET</span></div><button type="button" onClick={onClose} aria-label="Fermer" autoFocus><X /></button></header>
    <div className="planner-progress"><i style={{ width: `${((step + 1) / 4) * 100}%` }} /><span>0{step + 1} / 04</span></div>
    <div className="planner-body">
      {step === 0 && <div className="planner-step"><span>COMMENÇONS PAR LE TERRAIN</span><h2>Que voulez-vous<br />faire évoluer ?</h2><div className="choice-grid">{["Créer un jardin", "Transformer l’existant", "Aménager une terrasse", "Repenser les abords"].map((item) => <button type="button" className={type === item ? "selected" : ""} aria-pressed={type === item} onClick={() => setType(item)} key={item}><i />{item}</button>)}</div></div>}
      {step === 1 && <div className="planner-step"><span>DONNER UNE ÉCHELLE</span><h2>Quelle surface<br />allons-nous imaginer ?</h2><div className="area-readout"><strong>{area}</strong><span>m² environ</span></div><input type="range" min="20" max="1500" step="10" value={area} onChange={(event) => setArea(Number(event.target.value))} aria-label="Surface du jardin" /><div className="range-ends"><span>20 m²</span><span>1 500 m²</span></div></div>}
      {step === 2 && <div className="planner-step"><span>CE QUI COMPTE POUR VOUS</span><h2>Qu’attendez-vous<br />de votre jardin ?</h2><div className="tag-grid">{options.map((item) => <button type="button" className={priorities.includes(item) ? "selected" : ""} aria-pressed={priorities.includes(item)} onClick={() => togglePriority(item)} key={item}>{priorities.includes(item) && <Check size={14} />}{item}</button>)}</div></div>}
      {step === 3 && <div className="planner-step result-step"><span>VOTRE PREMIÈRE FEUILLE DE ROUTE</span><h2>Le projet peut<br />prendre racine.</h2><div className="brief-card"><div><Sprout /><span>{type}</span></div><p>{area < 80 ? "Petit espace, grande précision." : area < 500 ? "Un jardin à vivre au quotidien." : "Un paysage à révéler par séquences."}</p><dl><div><dt>Surface</dt><dd>≈ {area} m²</dd></div><div><dt>Priorités</dt><dd>{priorities.length || "À préciser"}</dd></div><div><dt>Horizon</dt><dd>{timing}</dd></div></dl></div><div className="timing-select"><CalendarDays size={16} /><select value={timing} onChange={(event) => setTiming(event.target.value)} aria-label="Horizon du projet"><option>Dès que possible</option><option>Dans 3 à 6 mois</option><option>Cette année</option><option>Je prends de l’avance</option></select></div></div>}
    </div>
    <footer><button type="button" className="planner-back" onClick={() => step ? setStep(step - 1) : onClose()}><ChevronLeft />{step ? "Retour" : "Quitter"}</button>{step < 3 ? <button type="button" className="planner-next" onClick={() => setStep(step + 1)}>Continuer <ChevronRight /></button> : <div className="brief-actions"><button type="button" onClick={copyBrief}><Clipboard /> Copier</button><button type="button" onClick={downloadBrief}><Download /> Télécharger</button></div>}</footer>
  </section></div>;
}
