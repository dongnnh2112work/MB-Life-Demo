import type { Employee } from "./types";

export function normalizeCode(value: string): string {
  return value.trim().replace(/\s+/g, "");
}

export function findEmployeeByCode(
  employees: Employee[],
  query: string
): Employee | null {
  const normalized = normalizeCode(query);
  if (!normalized) return null;

  const exact = employees.find((e) => e.code === normalized);
  if (exact) return exact;

  // Allow typing "1" / "01" to match "001"
  const padded = normalized.padStart(3, "0");
  if (padded !== normalized) {
    return employees.find((e) => e.code === padded) ?? null;
  }

  return null;
}

export function filterEmployeesByCode(
  employees: Employee[],
  query: string
): Employee[] {
  const normalized = normalizeCode(query);
  if (!normalized) return [];

  return employees
    .filter((e) => e.code.startsWith(normalized))
    .slice(0, 8);
}
