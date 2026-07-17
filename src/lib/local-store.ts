import { LOCAL_EMPLOYEES } from "@/data/local-employees";
import type { Employee, LiveState } from "./types";

const LIVE_STATE_KEY = "mb-life-live-state";
const CHANNEL_NAME = "mb-life-live";

const IDLE_STATE: LiveState = {
  id: 1,
  employee_id: null,
  employee_name: null,
  years: null,
  title: null,
  triggered_at: null,
  updated_at: new Date().toISOString(),
};

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

function readLiveState(): LiveState {
  if (typeof window === "undefined") return IDLE_STATE;

  try {
    const raw = localStorage.getItem(LIVE_STATE_KEY);
    if (raw) return JSON.parse(raw) as LiveState;
  } catch {
    // ignore invalid cache
  }

  return IDLE_STATE;
}

function writeLiveState(state: LiveState): void {
  localStorage.setItem(LIVE_STATE_KEY, JSON.stringify(state));

  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: "live_state", state });
    channel.close();
  }
}

export async function updateLocalLiveState(employee: Employee): Promise<void> {
  writeLiveState({
    id: 1,
    employee_id: employee.id,
    employee_name: employee.name,
    years: employee.years,
    title: employee.title,
    triggered_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

export function subscribeLocalLiveState(
  onState: (state: LiveState) => void,
  onConnected: (connected: boolean) => void
): () => void {
  onState(readLiveState());
  onConnected(true);

  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (event) => {
    if (event.data?.type === "live_state") {
      onState(event.data.state as LiveState);
    }
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key === LIVE_STATE_KEY) onState(readLiveState());
  };
  window.addEventListener("storage", onStorage);

  return () => {
    channel.close();
    window.removeEventListener("storage", onStorage);
    onConnected(false);
  };
}
