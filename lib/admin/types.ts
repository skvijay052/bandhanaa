import type { AdminRole } from "./permissions";
export type AdminIdentity = {
  id: string;
  user_id: string;
  role: AdminRole;
  name: string;
  email: string;
};
export type Cell = string | number | boolean | null;
export type AdminRow = Record<string, Cell>;
export type AdminResult = {
  rows: AdminRow[];
  total: number;
  page: number;
  page_size: number;
  metrics?: Record<string, number>;
  trend?: { date: string; count: number }[];
  member?: AdminRow;
  detail?: AdminRow;
};
export type SearchParams = Record<string, string | string[] | undefined>;
export type ActionState = {
  ok: boolean;
  message: string;
  operationId?: string;
};
