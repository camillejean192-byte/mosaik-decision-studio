import type { Workspace } from "@/types/workspace";

export const seedWorkspace: Workspace = {
  id: "studio-next",
  title: "Studio 2027",
  question: "Quelle forme donner à notre prochain espace de travail ?",
  updatedAt: "Maintenant",
  nodes: [
    { id: "q", kind: "question", title: "Notre prochain studio", note: "Décider avant la fin du trimestre", x: 370, y: 255, weight: 1, confidence: 92 },
    { id: "o1", kind: "option", title: "Atelier en ville", note: "Dense, vivant, très accessible", x: 90, y: 105, weight: 0.8, confidence: 78 },
    { id: "o2", kind: "option", title: "Maison-laboratoire", note: "Calme, modulable, plus isolée", x: 665, y: 80, weight: 0.7, confidence: 69 },
    { id: "o3", kind: "option", title: "Réseau nomade", note: "Plusieurs lieux, aucune base fixe", x: 655, y: 420, weight: 0.65, confidence: 61 },
    { id: "c1", kind: "criterion", title: "Énergie collective", note: "Croisements spontanés et rythme partagé", x: 85, y: 380, weight: 0.95, confidence: 88 },
    { id: "c2", kind: "criterion", title: "Liberté d’usage", note: "Transformer le lieu selon le projet", x: 360, y: 510, weight: 0.82, confidence: 73 },
    { id: "s1", kind: "signal", title: "70% viennent à vélo", note: "Signal observé sur les 6 derniers mois", x: 355, y: 40, weight: 0.55, confidence: 84 },
    { id: "r1", kind: "risk", title: "Coût irréversible", note: "Bail long et travaux spécifiques", x: 910, y: 265, weight: 0.86, confidence: 75 },
  ],
  edges: [
    { id: "e1", from: "o1", to: "c1", impact: 0.92 },
    { id: "e2", from: "o1", to: "s1", impact: 0.72 },
    { id: "e3", from: "o2", to: "c2", impact: 0.88 },
    { id: "e4", from: "o2", to: "r1", impact: -0.66 },
    { id: "e5", from: "o3", to: "c2", impact: 0.62 },
    { id: "e6", from: "o3", to: "c1", impact: -0.42 },
    { id: "e7", from: "q", to: "o1", impact: 0.5 },
    { id: "e8", from: "q", to: "o2", impact: 0.5 },
    { id: "e9", from: "q", to: "o3", impact: 0.5 },
  ],
};

export const alternateProjects = [
  { id: "pricing", title: "Refonte tarifaire", status: "3 hypothèses", accent: "#ff725c" },
  { id: "launch", title: "Lancement Europe", status: "À clarifier", accent: "#8c7cff" },
  { id: "hiring", title: "Équipe produit", status: "Archivé", accent: "#65d6a7" },
];
