"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { filterEmployeesByCode, findEmployeeByCode } from "@/lib/employees";
import { clearLiveState, fetchEmployees, isLocalMode, presentEmployee } from "@/lib/live-data";
import type { Employee } from "@/lib/types";

type Status = "idle" | "loading" | "success" | "error";

export default function InputPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const presentingRef = useRef(false);

  useEffect(() => {
    fetchEmployees()
      .then((data) => setEmployees(data))
      .catch(() => {
        setMessage("Không tải được danh sách nhân viên. Kiểm tra Supabase.");
        setStatus("error");
      });
  }, []);

  const suggestions = useMemo(
    () => filterEmployeesByCode(employees, query),
    [employees, query]
  );

  const present = useCallback(async (employee: Employee) => {
    if (presentingRef.current) return;
    presentingRef.current = true;

    setStatus("loading");
    setMessage("");
    setShowSuggestions(false);

    try {
      await presentEmployee(employee);
    } catch {
      presentingRef.current = false;
      setStatus("error");
      setMessage("Gửi thất bại. Thử lại.");
      return;
    }

    setStatus("success");
    setMessage(`Đã hiển thị: ${employee.title} ${employee.name}`);
    setQuery("");
    setTimeout(() => {
      presentingRef.current = false;
      setStatus("idle");
      setMessage("");
      inputRef.current?.focus();
    }, 2500);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = findEmployeeByCode(employees, query);
    if (!match) {
      setStatus("error");
      setMessage("Không tìm thấy mã số nhân viên. Kiểm tra lại.");
      return;
    }
    present(match);
  };

  const handleSelect = (employee: Employee) => {
    setQuery(employee.code);
    present(employee);
  };

  const returnToIdle = useCallback(async () => {
    if (presentingRef.current) return;
    presentingRef.current = true;

    setStatus("loading");
    setMessage("");
    setShowSuggestions(false);

    try {
      await clearLiveState();
    } catch {
      presentingRef.current = false;
      setStatus("error");
      setMessage("Không thể trả về màn chờ. Thử lại.");
      return;
    }

    setStatus("success");
    setMessage("Đã trả về màn hình chờ");
    setQuery("");
    setTimeout(() => {
      presentingRef.current = false;
      setStatus("idle");
      setMessage("");
      inputRef.current?.focus();
    }, 2000);
  }, []);

  return (
    <main className="flex min-h-dvh flex-col bg-[#0c1220]">
      <header className="border-b border-white/10 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-[#c9a84c]">
          MB Life
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">
          Nhập mã số nhân viên
        </h1>
      </header>

      <div className="flex flex-1 flex-col justify-center px-6 py-8">
        <form onSubmit={handleSubmit} className="relative mx-auto w-full max-w-lg">
          <label htmlFor="code" className="mb-3 block text-sm text-white/60">
            Mã số nhân viên
          </label>
          <input
            ref={inputRef}
            id="code"
            type="text"
            inputMode="numeric"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setStatus("idle");
              setMessage("");
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Ví dụ: 001"
            autoComplete="off"
            autoCorrect="off"
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-5 text-xl tracking-widest text-white outline-none transition placeholder:text-white/30 focus:border-[#c9a84c]/60 focus:ring-2 focus:ring-[#c9a84c]/20"
          />

          {showSuggestions && suggestions.length > 0 && query.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#141c2e] shadow-2xl">
              {suggestions.map((emp) => (
                <li key={emp.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(emp)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-white transition hover:bg-white/5 active:bg-white/10"
                  >
                    <span className="flex flex-col gap-0.5">
                      <span className="text-lg font-medium tracking-wider text-[#e8c96a]">
                        {emp.code}
                      </span>
                      <span className="text-sm text-white/70">
                        {emp.title} {emp.name}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm text-white/40">
                      {emp.years} năm
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            type="submit"
            disabled={status === "loading" || !query.trim()}
            className="mt-6 w-full rounded-2xl bg-[#c9a84c] py-5 text-lg font-semibold text-[#0c1220] transition hover:bg-[#dbb95a] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? "Đang gửi..." : "Hiển thị lên màn hình"}
          </button>

          <button
            type="button"
            onClick={returnToIdle}
            disabled={status === "loading"}
            className="mt-3 w-full rounded-2xl border border-white/15 bg-transparent py-4 text-base font-medium text-white/80 transition hover:border-white/30 hover:bg-white/5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Trả về màn hình chờ
          </button>
        </form>

        {message && (
          <p
            className={`mx-auto mt-6 max-w-lg text-center text-base ${
              status === "error" ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      <footer className="px-6 py-4 text-center text-xs text-white/30">
        {isLocalMode()
          ? "Chế độ local · Nhập mã số để hiển thị"
          : "Nhập đúng mã số · Màn hình LED cập nhật tức thì"}
      </footer>
    </main>
  );
}
