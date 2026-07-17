export type Honorific = "Anh" | "Chị";

export type Employee = {
  id: string;
  code: string;
  name: string;
  years: number;
  title: Honorific;
};

export type LiveState = {
  id: number;
  employee_id: string | null;
  employee_name: string | null;
  years: number | null;
  title: Honorific | null;
  triggered_at: string | null;
  updated_at: string;
};
