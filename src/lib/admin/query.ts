import { Prisma } from "@prisma/client";

/** Shared query parsing for the admin list endpoints (list + CSV export). */

export const EMPLOYEE_STATUSES = [
  "Active",
  "Probation",
  "Suspended",
  "Terminated",
] as const;

export const EMPLOYEE_SORT_FIELDS = [
  "empCode",
  "name",
  "department",
  "position",
  "status",
  "hireDate",
] as const;

export type EmployeeQuery = {
  q: string;
  status: string;
  department: string;
  sort: (typeof EMPLOYEE_SORT_FIELDS)[number];
  dir: "asc" | "desc";
  page: number;
  pageSize: number;
};

export function parseEmployeeQuery(sp: URLSearchParams): EmployeeQuery {
  const sortParam = sp.get("sort") ?? "empCode";
  const sort = (EMPLOYEE_SORT_FIELDS as readonly string[]).includes(sortParam)
    ? (sortParam as EmployeeQuery["sort"])
    : "empCode";
  return {
    q: (sp.get("q") ?? "").trim(),
    status: sp.get("status") ?? "all",
    department: sp.get("department") ?? "all",
    sort,
    dir: sp.get("dir") === "desc" ? "desc" : "asc",
    page: Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1),
    pageSize: Math.min(
      100,
      Math.max(5, parseInt(sp.get("pageSize") ?? "10", 10) || 10),
    ),
  };
}

export function employeeWhere({
  q,
  status,
  department,
}: Pick<EmployeeQuery, "q" | "status" | "department">): Prisma.EmployeeWhereInput {
  const where: Prisma.EmployeeWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { empCode: { contains: q } },
      { position: { contains: q } },
      { idNumber: { contains: q } },
      { manager: { contains: q } },
    ];
  }
  if (status !== "all") where.status = status;
  if (department !== "all") where.department = department;
  return where;
}
