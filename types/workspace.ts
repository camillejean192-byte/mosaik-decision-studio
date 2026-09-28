export type NodeKind = "question" | "option" | "criterion" | "signal" | "risk";

export type DecisionNode = {
  id: string;
  kind: NodeKind;
  title: string;
  note: string;
  x: number;
  y: number;
  weight: number;
  confidence: number;
};

export type DecisionEdge = {
  id: string;
  from: string;
  to: string;
  impact: number;
};

export type Workspace = {
  id: string;
  title: string;
  question: string;
  nodes: DecisionNode[];
  edges: DecisionEdge[];
  updatedAt: string;
};

export type ScoreResult = {
  id: string;
  score: number;
  confidence: number;
  coverage: number;
};
