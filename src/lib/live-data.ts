import type { Employee, LiveState } from "./types";
import {
  getLocalEmployees,
  isLocalMode,
  subscribeLocalLiveState,
  updateLocalLiveState,
} from "./local-store";
import { createBrowserClient } from "./supabase/client";

export { isLocalMode };

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

  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("live_state")
    .update({
      employee_id: employee.id,
      employee_name: employee.name,
      years: employee.years,
      title: employee.title,
      triggered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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

  supabase
    .from("live_state")
    .select("*")
    .eq("id", 1)
    .single()
    .then(({ data }) => {
      if (data) onState(data as LiveState);
    });

  const channel = supabase
    .channel("live_state_display")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "live_state" },
      (payload) => onState(payload.new as LiveState)
    )
    .subscribe((status) => {
      onConnected(status === "SUBSCRIBED");
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
