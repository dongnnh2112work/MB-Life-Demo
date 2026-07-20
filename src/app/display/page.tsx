"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { subscribeLiveState } from "@/lib/live-data";
import type { LiveState } from "@/lib/types";
import EmployeeReveal from "@/components/display/EmployeeReveal";
import "@/components/ipad/ipad-layout.css";

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

// Proportions are anchored to the same 1920×1080 artboard as the iPad screens
// so the LED wall reads as the same design system.
const DISPLAY_VARS = {
  "--ipad-logo-w": "13vw",
  "--ipad-logo-top": "4.5vh",
  "--ipad-logo-right": "3vw",
} as CSSProperties;

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
    <main
      className="ipad-screen relative h-dvh w-full overflow-hidden bg-[#050818]"
      style={DISPLAY_VARS}
    >
      <Image
        src="/ipad/Background.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      <div className="pointer-events-none absolute inset-0 bg-[#050818]/15" />

      {hasEmployee && (
        <div className="pointer-events-none absolute inset-0 z-[8] bg-[radial-gradient(ellipse_48%_42%_at_50%_52%,rgba(5,8,24,0.55),transparent_72%)]" />
      )}

      <header
        className="absolute z-30"
        style={{ top: "var(--ipad-logo-top)", right: "var(--ipad-logo-right)" }}
      >
        <Image
          src="/ipad/Logo.png"
          alt="MB Life"
          width={786}
          height={258}
          className="h-auto w-[var(--ipad-logo-w)]"
          priority
        />
      </header>

      {/* Tagline — large & centered while idle (welcome), small on top when a
          member is on stage (compact), mirroring the iPad hero → compact flow. */}
      <div
        className="pointer-events-none absolute inset-x-0 z-[5] flex justify-center transition-all duration-700 ease-out"
        style={{
          top: hasEmployee ? "6vh" : "50%",
          transform: hasEmployee ? "none" : "translateY(-50%)",
        }}
      >
        <Image
          src="/ipad/Tagline.png"
          alt="Tiến bước rực rỡ — Vạn dặm thăng hoa"
          width={1444}
          height={928}
          priority
          className="h-auto object-contain transition-all duration-700 ease-out"
          style={{
            width: hasEmployee
              ? "clamp(200px, 16vw, 320px)"
              : "min(96vw, 1840px)",
            maxHeight: hasEmployee ? undefined : "72vh",
          }}
        />
      </div>

      {!hasEmployee && !editingLayout && (
        <div className="absolute inset-x-0 bottom-[5vh] z-10 flex flex-col items-center text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-white/35">
            MB Life
          </p>
          <h2 className="mt-2 text-lg font-normal text-white/45 md:text-2xl">
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
        className={`absolute bottom-4 right-4 z-30 flex items-center gap-2 text-xs text-white/30 ${
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
