import type { DecisionEdge, DecisionNode, ScoreResult } from "@/types/workspace";

export function scoreOptions(nodes: DecisionNode[], edges: DecisionEdge[]): ScoreResult[] {
  const options = nodes.filter((node) => node.kind === "option");
  const targets = new Map(nodes.map((node) => [node.id, node]));

  return options
    .map((option) => {
      const relations = edges.filter((edge) => edge.from === option.id && edge.to !== "q");
      const weighted = relations.reduce((total, relation) => {
        const target = targets.get(relation.to);
        if (!target) return total;
        const riskMultiplier = target.kind === "risk" ? 1.18 : 1;
        return total + relation.impact * target.weight * riskMultiplier;
      }, 0);
      const normalized = relations.length ? weighted / relations.length : 0;
      return {
        id: option.id,
        score: Math.round(Math.max(0, Math.min(100, 55 + normalized * 43))),
        confidence: option.confidence,
        coverage: Math.min(100, 38 + relations.length * 24),
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function nodeLabel(kind: DecisionNode["kind"]) {
  return {
    question: "Décision",
    option: "Option",
    criterion: "Critère",
    signal: "Signal",
    risk: "Risque",
  }[kind];
}
