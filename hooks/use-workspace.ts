"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { seedWorkspace } from "@/data/seed";
import type { Workspace } from "@/types/workspace";

const STORAGE_KEY = "mosaik-workspace-v1";

export function useWorkspace() {
  const [workspace, setWorkspaceState] = useState<Workspace>(seedWorkspace);
  const [hydrated, setHydrated] = useState(false);
  const history = useRef<Workspace[]>([]);
  const future = useRef<Workspace[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setWorkspaceState(JSON.parse(stored) as Workspace);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    const timer = window.setTimeout(() => setHydrated(true), 480);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  }, [workspace, hydrated]);

  const setWorkspace = useCallback((updater: Workspace | ((current: Workspace) => Workspace), remember = true) => {
    setWorkspaceState((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      if (remember) {
        history.current = [...history.current.slice(-29), current];
        future.current = [];
      }
      return { ...next, updatedAt: "Maintenant" };
    });
  }, []);

  const undo = useCallback(() => {
    const previous = history.current.pop();
    if (!previous) return false;
    setWorkspaceState((current) => {
      future.current.push(current);
      return previous;
    });
    return true;
  }, []);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return false;
    setWorkspaceState((current) => {
      history.current.push(current);
      return next;
    });
    return true;
  }, []);

  const reset = useCallback(() => {
    history.current.push(workspace);
    future.current = [];
    setWorkspaceState({ ...seedWorkspace, updatedAt: "Maintenant" });
  }, [workspace]);

  return { workspace, setWorkspace, hydrated, undo, redo, reset };
}
