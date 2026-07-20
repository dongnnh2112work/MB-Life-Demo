"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { subscribeLiveState } from "@/lib/live-data";
import type { LiveState } from "@/lib/types";
import EmployeeReveal from "@/components/display/EmployeeReveal";

const Scene3D = dynamic(() => import("@/components/display/Scene3D"), {
  ssr: false,
});

const IDLE_STATE: LiveState = {
  id: 1,
  employee_id: null,
  employee_name: null,
  days: null,
  title: null,
  wish: null,
  triggered_at: null,
  updated_at: new Date().toISOString(),
};

export default function DisplayPage() {
  const [liveState, setLiveState] = useState<LiveState>(IDLE_STATE);
  const [connected, setConnected] = useState(false);
  const [editingLayout, setEditingLayout] = useState(false);

  const applyState = useCallback((row: LiveState) => {
    setLiveState(row);
  }, []);

  useEffect(() => {
    return subscribeLiveState(applyState, setConnected);
  }, [applyState]);

  const hasEmployee = Boolean(
    liveState.employee_name && liveState.days != null && liveState.title
  );

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#050a14]">
      <Scene3D active={hasEmployee} />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050a14_75%)]" />

      {!hasEmployee && !editingLayout && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
          <p className="text-sm uppercase tracking-[0.5em] text-white/30">
            MB Life
          </p>
          <h2 className="mt-4 text-2xl font-light text-white/50 md:text-4xl">
            Chờ thành viên lên sân khấu
          </h2>
        </div>
      )}

      <EmployeeReveal
        name={liveState.employee_name ?? ""}
        days={liveState.days ?? 0}
        title={liveState.title ?? "Chị"}
        wish={liveState.wish ?? ""}
        visible={hasEmployee}
        onEditModeChange={setEditingLayout}
      />

      <div
        className={`absolute bottom-4 right-4 z-20 flex items-center gap-2 text-xs text-white/30 ${
          editingLayout ? "hidden" : ""
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-red-400"}`}
        />
        {connected ? "Live" : "Đang kết nối..."}
      </div>
    </main>
  );
}
