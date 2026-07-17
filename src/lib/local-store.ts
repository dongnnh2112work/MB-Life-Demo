import { LOCAL_EMPLOYEES } from "@/data/local-employees";
import type { Employee, LiveState } from "./types";

const IDLE_STATE: LiveState = {
  id: 1,
  employee_id: null,
  employee_name: null,
  years: null,
  title: null,
  triggered_at: null,
  updated_at: new Date().toISOString(),
};

const POLL_MS = 500;

export function isLocalMode(): boolean {
  if (process.env.NEXT_PUBLIC_USE_LOCAL_DATA === "true") return true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  return (
    !url ||
    !key ||
    url.includes("your-project") ||
    key === "your-anon-key"
  );
}

export function getLocalEmployees(): Employee[] {
  return LOCAL_EMPLOYEES;
}

export async function updateLocalLiveState(employee: Employee): Promise<void> {
  const res = await fetch("/api/live-state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      employee_id: employee.id,
      employee_name: employee.name,
      years: employee.years,
      title: employee.title,
      triggered_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to update live state");
  }
}

export function subscribeLocalLiveState(
  onState: (state: LiveState) => void,
  onConnected: (connected: boolean) => void
): () => void {
  let cancelled = false;
  let lastUpdatedAt = "";

  const poll = async () => {
    try {
      const res = await fetch("/api/live-state", { cache: "no-store" });
      if (!res.ok) throw new Error("poll failed");

      const state = (await res.json()) as LiveState;
      onConnected(true);

      if (state.updated_at !== lastUpdatedAt) {
        lastUpdatedAt = state.updated_at;
        onState(state);
      }
    } catch {
      onConnected(false);
      if (!lastUpdatedAt) onState(IDLE_STATE);
    }
  };

  void poll();
  const timer = window.setInterval(() => {
    if (!cancelled) void poll();
  }, POLL_MS);

  return () => {
    cancelled = true;
    window.clearInterval(timer);
    onConnected(false);
  };
}
