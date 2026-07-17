import type { Employee, LiveState } from "./types";
import {
  clearLocalLiveState,
  getLocalEmployees,
  isLocalMode,
  subscribeLocalLiveState,
  updateLocalLiveState,
} from "./local-store";
import { createBrowserClient } from "./supabase/client";

export { isLocalMode };

function stateTimestamp(state: LiveState): number {
  const raw = state.triggered_at || state.updated_at;
  const ms = Date.parse(raw);
  return Number.isFinite(ms) ? ms : 0;
}

/** Only forward newer states so a late fetch cannot overwrite a fresher realtime event. */
function createOrderedStateHandler(onState: (state: LiveState) => void) {
  let latestMs = -1;

  return (state: LiveState) => {
    const ms = stateTimestamp(state);
    if (ms < latestMs) return;
    latestMs = ms;
    onState(state);
  };
}

export async function fetchEmployees(): Promise<Employee[]> {
  if (isLocalMode()) return getLocalEmployees();

  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("employees")
    .select("id, code, name, years, title")
    .order("code");

  if (error) throw error;
  return (data as Employee[]) ?? [];
}

export async function presentEmployee(employee: Employee): Promise<void> {
  if (isLocalMode()) {
    await updateLocalLiveState(employee);
    return;
  }

  const now = new Date().toISOString();
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("live_state")
    .update({
      employee_id: employee.id,
      employee_name: employee.name,
      years: employee.years,
      title: employee.title,
      triggered_at: now,
      updated_at: now,
    })
    .eq("id", 1);

  if (error) throw error;
}

export async function clearLiveState(): Promise<void> {
  if (isLocalMode()) {
    await clearLocalLiveState();
    return;
  }

  const now = new Date().toISOString();
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("live_state")
    .update({
      employee_id: null,
      employee_name: null,
      years: null,
      title: null,
      triggered_at: now,
      updated_at: now,
    })
    .eq("id", 1);

  if (error) throw error;
}

export function subscribeLiveState(
  onState: (state: LiveState) => void,
  onConnected: (connected: boolean) => void
): () => void {
  if (isLocalMode()) {
    return subscribeLocalLiveState(onState, onConnected);
  }

  const supabase = createBrowserClient();
  const apply = createOrderedStateHandler(onState);
  let cancelled = false;

  supabase
    .from("live_state")
    .select("*")
    .eq("id", 1)
    .single()
    .then(({ data }) => {
      if (!cancelled && data) apply(data as LiveState);
    });

  const channel = supabase
    .channel(`live_state_display_${Math.random().toString(36).slice(2)}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "live_state" },
      (payload) => {
        if (!cancelled) apply(payload.new as LiveState);
      }
    )
    .subscribe((status) => {
      if (!cancelled) onConnected(status === "SUBSCRIBED");
    });

  return () => {
    cancelled = true;
    supabase.removeChannel(channel);
  };
}
