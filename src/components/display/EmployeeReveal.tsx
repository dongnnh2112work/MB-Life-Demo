"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  cloneDefaultDisplayLayout,
  clamp,
  DISPLAY_ELEMENT_LABELS,
  loadDisplayLayout,
  saveDisplayLayout,
  type DisplayElementId,
  type DisplayElementLayout,
  type DisplayLayout,
} from "@/lib/display-layout";
import type { Honorific } from "@/lib/types";

type Props = {
  name: string;
  days: number;
  title: Honorific;
  wish: string;
  visible: boolean;
  onEditModeChange?: (editing: boolean) => void;
};

type Interaction = {
  mode: "drag" | "resize";
  id: DisplayElementId;
  pointerId: number;
  startX: number;
  startY: number;
  initial: DisplayElementLayout;
};

const LONG_PREVIEW_NAME = "NGUYỄN HOÀNG MINH ANH PHƯƠNG";
const SHORT_PREVIEW_NAME = "AN";
const DEFAULT_PREVIEW_WISH =
  "luôn vững bước, lan tỏa giá trị và cùng MB Life tiến bước rực rỡ, vạn dặm thăng hoa.";

export default function EmployeeReveal({
  name,
  days,
  title,
  wish,
  visible,
  onEditModeChange,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [layout, setLayout] = useState<DisplayLayout>(
    cloneDefaultDisplayLayout
  );
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<DisplayElementId>("name");
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [dirty, setDirty] = useState(false);
  const [holdingKey, setHoldingKey] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [notice, setNotice] = useState("");
  const [previewName, setPreviewName] = useState(
    name || "NGUYỄN THÙY LINH"
  );
  const [previewDays, setPreviewDays] = useState(days || 2);
  const [previewTitle, setPreviewTitle] = useState<Honorific>(title || "Chị");
  const [previewWish, setPreviewWish] = useState(wish || DEFAULT_PREVIEW_WISH);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setLayout(loadDisplayLayout());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const changeEditMode = useCallback(
    (next: boolean) => {
      setEditMode(next);
      setInteraction(null);
      setHoldingKey(false);
      onEditModeChange?.(next);

      if (next) {
        setPanelCollapsed(false);
        setPreviewName(name || "NGUYỄN THÙY LINH");
        setPreviewDays(days || 2);
        setPreviewTitle(title || "Chị");
        setPreviewWish(wish || DEFAULT_PREVIEW_WISH);
      }
    },
    [days, name, onEditModeChange, title, wish]
  );

  useEffect(() => {
    const clearHold = () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
      setHoldingKey(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT";

      if (event.key === "Escape" && editMode) {
        changeEditMode(false);
        return;
      }

      if (isTyping || event.repeat || event.key.toLowerCase() !== "e") return;

      setHoldingKey(true);
      holdTimerRef.current = setTimeout(() => {
        changeEditMode(!editMode);
        holdTimerRef.current = null;
      }, 2000);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "e") clearHold();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clearHold);

    return () => {
      clearHold();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", clearHold);
    };
  }, [changeEditMode, editMode]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2200);
    return () => clearTimeout(timer);
  }, [notice]);

  const updateElement = useCallback(
    (id: DisplayElementId, next: DisplayElementLayout) => {
      setLayout((current) => ({ ...current, [id]: next }));
      setDirty(true);
    },
    []
  );

  const startInteraction = (
    mode: Interaction["mode"],
    id: DisplayElementId,
    event: ReactPointerEvent<HTMLElement>
  ) => {
    if (!editMode) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(id);
    setInteraction({
      mode,
      id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      initial: { ...layout[id] },
    });
  };

  const moveInteraction = (event: ReactPointerEvent<HTMLElement>) => {
    if (!interaction || event.pointerId !== interaction.pointerId) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dx = ((event.clientX - interaction.startX) / rect.width) * 100;
    const dy = ((event.clientY - interaction.startY) / rect.height) * 100;
    const initial = interaction.initial;

    if (interaction.mode === "drag") {
      updateElement(interaction.id, {
        ...initial,
        // Position is intentionally independent from the frame size. This lets
        // wide LED strips move freely across the whole master canvas.
        x: initial.x + dx,
        y: initial.y + dy,
      });
      return;
    }

    const minWidth = interaction.id === "divider" ? 4 : 8;
    const minHeight = interaction.id === "divider" ? 1 : 3;
    const width = clamp(initial.width + dx, minWidth, 200);
    const height = clamp(initial.height + dy, minHeight, 100);
    const scale = Math.min(width / initial.width, height / initial.height);

    updateElement(interaction.id, {
      ...initial,
      width,
      height,
      fontSize:
        interaction.id === "divider"
          ? 0
          : clamp(initial.fontSize * scale, 0.5, 12),
    });
  };

  const endInteraction = (event: ReactPointerEvent<HTMLElement>) => {
    if (!interaction || event.pointerId !== interaction.pointerId) return;
    setInteraction(null);
  };

  const handleSave = () => {
    saveDisplayLayout(layout);
    setDirty(false);
    setNotice("Đã lưu layout trên máy này");
  };

  const handleReset = () => {
    const defaults = cloneDefaultDisplayLayout();
    setLayout(defaults);
    saveDisplayLayout(defaults);
    setDirty(false);
    setSelectedId("name");
    setNotice("Đã khôi phục layout mặc định");
  };

  const shownName = editMode ? previewName : name;
  const shownDays = editMode ? previewDays : days;
  const shownTitle = editMode ? previewTitle : title;
  const shownWish = editMode ? previewWish : wish;
  const showContent = visible || editMode;

  const renderElement = (
    id: DisplayElementId,
    content: ReactNode,
    contentClassName = ""
  ) => {
    const item = layout[id];
    const selected = editMode && selectedId === id;

    return (
      <div
        key={id}
        className={`absolute flex touch-none items-center justify-center text-center ${
          editMode
            ? `pointer-events-auto cursor-move border ${
                selected
                  ? "border-[#f3cd62] bg-[#f3cd62]/10"
                  : "border-white/35 bg-white/[0.035]"
              }`
            : "pointer-events-none border border-transparent"
        }`}
        style={{
          left: `${item.x}%`,
          top: `${item.y}%`,
          width: `${item.width}%`,
          height: `${item.height}%`,
          fontSize: `${item.fontSize}vw`,
        }}
        onPointerDown={(event) => startInteraction("drag", id, event)}
        onPointerMove={moveInteraction}
        onPointerUp={endInteraction}
        onPointerCancel={endInteraction}
      >
        <div className={`w-full ${contentClassName}`}>{content}</div>

        {editMode && (
          <>
            <span className="absolute -top-6 left-0 whitespace-nowrap rounded bg-black/85 px-2 py-1 font-sans text-[10px] leading-none tracking-normal text-white">
              {DISPLAY_ELEMENT_LABELS[id]} · x {item.x.toFixed(1)} · y{" "}
              {item.y.toFixed(1)} · w {item.width.toFixed(1)} · h{" "}
              {item.height.toFixed(1)}
            </span>
            <button
              type="button"
              aria-label={`Resize ${DISPLAY_ELEMENT_LABELS[id]}`}
              className="absolute -bottom-2 -right-2 h-5 w-5 cursor-nwse-resize rounded-sm border border-black/40 bg-[#f3cd62] shadow-lg"
              onPointerDown={(event) => startInteraction("resize", id, event)}
              onPointerMove={moveInteraction}
              onPointerUp={endInteraction}
              onPointerCancel={endInteraction}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        ref={stageRef}
        className={`absolute inset-0 z-10 overflow-hidden ${
          editMode ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <AnimatePresence mode="wait">
          {showContent && (
            <motion.div
              key={editMode ? "layout-preview" : `${title}-${name}-${days}-${wish}`}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: editMode ? 0.15 : 0.5 }}
            >
              {renderElement(
                "thanks",
                <>Cảm ơn {shownTitle}</>,
                "font-light tracking-wide text-white/80"
              )}

              {renderElement(
                "name",
                shownName,
                "display-name uppercase leading-tight tracking-wide text-white"
              )}

              {renderElement(
                "tenure",
                <>
                  vì{" "}
                  <span className="text-[2.1em] font-bold leading-none text-[#f5d77a]">
                    {shownDays}
                  </span>{" "}
                  ngày không ngừng tiến bước cùng MB Life.
                </>,
                "font-medium uppercase tracking-[0.12em] text-[#e8c96a]"
              )}

              {renderElement(
                "wish",
                <>{shownWish}</>,
                "font-light leading-relaxed text-white/70"
              )}

              {renderElement(
                "divider",
                <span className="mx-auto block h-px w-full bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        className={`absolute right-4 top-4 z-50 rounded-full border px-3 py-2 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md transition ${
          editMode
            ? "border-[#f3cd62]/60 bg-[#f3cd62]/15 text-[#f3cd62]"
            : "border-white/10 bg-black/20 text-white/25 hover:border-white/25 hover:text-white/60"
        }`}
        title="Double-click hoặc giữ phím E trong 2 giây"
        onDoubleClick={() => changeEditMode(!editMode)}
      >
        {holdingKey ? "Giữ E…" : editMode ? "Editing" : "Setup"}
      </button>

      {editMode && panelCollapsed && (
        <button
          type="button"
          onClick={() => setPanelCollapsed(false)}
          className="absolute left-4 top-4 z-50 rounded-xl border border-[#e8c96a]/40 bg-[#07101f]/90 px-4 py-2.5 font-sans text-xs font-medium text-[#e8c96a] shadow-xl backdrop-blur-xl transition hover:bg-[#101c31]"
        >
          Mở công cụ layout
        </button>
      )}

      {editMode && !panelCollapsed && (
        <aside className="absolute left-4 top-4 z-50 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-white/15 bg-[#07101f]/95 p-4 font-sans text-white shadow-2xl backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e8c96a]">
                Setup layout
              </p>
              <p className="mt-1 text-xs text-white/45">
                Kéo khung để di chuyển · kéo góc vàng để resize
              </p>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setPanelCollapsed(true)}
                className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Thu gọn
              </button>
              <button
                type="button"
                onClick={() => changeEditMode(false)}
                className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Đóng
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-[70px_1fr] gap-2">
            <select
              aria-label="Danh xưng preview"
              value={previewTitle}
              onChange={(event) =>
                setPreviewTitle(event.target.value as Honorific)
              }
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm outline-none focus:border-[#e8c96a]/60"
            >
              <option className="bg-[#07101f]">Anh</option>
              <option className="bg-[#07101f]">Chị</option>
            </select>
            <input
              aria-label="Tên preview"
              value={previewName}
              onChange={(event) => setPreviewName(event.target.value)}
              className="min-w-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[#e8c96a]/60"
              placeholder="Tên test"
            />
            <label className="flex items-center text-xs text-white/45">
              Số ngày
            </label>
            <input
              aria-label="Số ngày preview"
              type="number"
              min={0}
              value={previewDays}
              onChange={(event) =>
                setPreviewDays(Number(event.target.value) || 0)
              }
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[#e8c96a]/60"
            />
            <label className="flex items-center text-xs text-white/45">
              Câu chúc
            </label>
            <textarea
              aria-label="Câu chúc preview"
              value={previewWish}
              onChange={(event) => setPreviewWish(event.target.value)}
              rows={2}
              className="resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[#e8c96a]/60"
            />
          </div>

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setPreviewName(LONG_PREVIEW_NAME)}
              className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              Test tên dài
            </button>
            <button
              type="button"
              onClick={() => setPreviewName(SHORT_PREVIEW_NAME)}
              className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              Test tên ngắn
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-white/50">Đang chọn</span>
              <strong className="text-xs font-medium text-[#f3cd62]">
                {DISPLAY_ELEMENT_LABELS[selectedId]}
              </strong>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1.5 text-center text-[10px]">
              {(["x", "y", "width", "height"] as const).map((key) => (
                <div key={key} className="rounded-md bg-white/5 px-1 py-1.5">
                  <span className="block uppercase text-white/35">
                    {key === "width"
                      ? "W"
                      : key === "height"
                        ? "H"
                        : key}
                  </span>
                  <span className="mt-0.5 block text-white/80">
                    {layout[selectedId][key].toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-white/15 px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/10 hover:text-white"
            >
              Reset mặc định
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-[#d9b84f] px-3 py-2.5 text-sm font-semibold text-[#08101d] transition hover:bg-[#edcf68]"
            >
              {dirty ? "Save Layout *" : "Save Layout"}
            </button>
          </div>

          <p className="mt-3 text-[10px] leading-relaxed text-white/30">
            Tọa độ dùng đơn vị %. Layout chỉ lưu trên trình duyệt của máy LED
            này. Nhấn Esc để thoát.
          </p>
        </aside>
      )}

      {notice && (
        <motion.div
          className="absolute bottom-8 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-white/15 bg-black/80 px-5 py-2.5 font-sans text-xs text-white shadow-xl backdrop-blur"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {notice}
        </motion.div>
      )}
    </>
  );
}
