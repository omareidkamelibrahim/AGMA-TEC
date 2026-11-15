"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BadgeCheck,
  CalendarClock,
  CirclePause,
  Download,
  Eye,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Users,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PageHeader,
  StatCard,
  SortHeader,
  StatusBadge,
  TablePagination,
  TableSummary,
  ToolbarSearch,
  ToolbarPill,
  ToolbarPrimary,
  FiltersPill,
  RowActions,
  fmtDate,
  Checkbox,
} from "./ui";
import { ImportDialog } from "./import-dialog";

/* ---------------- types ---------------- */

export type Employee = {
  id: string;
  empCode: string;
  name: string;
  department: string;
  position: string;
  status: string;
  hireDate: string;
  manager: string | null;
  idNumber: string | null;
  idExpiry: string | null;
  email: string | null;
  phone: string | null;
};

type ListResponse = {
  rows: Employee[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

type Stats = {
  total: number;
  active: number;
  probation: number;
  suspended: number;
  expiringDocs: number;
  departments: { department: string }[];
};

const STATUSES = ["Active", "Probation", "Suspended", "Terminated"];

const IMPORT_TEMPLATE = `Name,Department,Position,Status,Hire Date,Manager,ID/Iqama,ID Expiry,Email,Phone
Khalid Al-Harbi,Production,Production Manager,Active,2019-03-10,Adel Gamal,1099000001,2026-08-12,khalid.alharbi@agma.com,+966501234567
Noura Al-Shehri,Human Resources,HR Manager,Active,2018-11-15,,,1099000003,2027-01-20,noura.alshehri@agma.com,+966507654321`;

const EMPTY_FORM = {
  name: "",
  department: "Production",
  position: "",
  status: "Active",
  hireDate: "",
  manager: "",
  idNumber: "",
  idExpiry: "",
  email: "",
  phone: "",
};

/* ---------------- component ---------------- */

export function EmployeesClient() {
  const qc = useQueryClient();

  /* photo-style row selection */
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggleRow = (id: string, on: boolean) =>
    setSelected((s) => {
      const n = new Set(s);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });

  const bulkIds = () => [...selected].join(",");

  const bulkUpdate = async (payload: Record<string, unknown>, okLabel: string) => {
    const res = await fetch("/api/admin/employees", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], ...payload }),
    });
    if (!res.ok) {
      toast.error("Bulk update failed.");
      return;
    }
    toast.success(okLabel);
    qc.invalidateQueries({ queryKey: ["employees"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
    setSelected(new Set());
  };

  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.size} selected employees? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/employees?ids=${bulkIds()}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Bulk delete failed.");
      return;
    }
    toast.success(`${selected.size} employees deleted.`);
    qc.invalidateQueries({ queryKey: ["employees"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
    setSelected(new Set());
  };

  // table state
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [department, setDepartment] = useState("all");
  const [sort, setSort] = useState("empCode");
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  // dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [viewing, setViewing] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // debounce search → query key
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const params = useMemo(() => {
    const sp = new URLSearchParams({
      status,
      department,
      sort,
      dir,
      page: String(page),
      pageSize: "10",
    });
    if (q) sp.set("q", q);
    return sp;
  }, [q, status, department, sort, dir, page]);

  const { data, isLoading, isFetching } = useQuery<ListResponse>({
    queryKey: ["employees", params.toString()],
    queryFn: async () => {
      const res = await fetch(`/api/admin/employees?${params}`);
      if (!res.ok) throw new Error("Failed to load employees");
      return res.json();
    },
    placeholderData: (prev) => prev, // keep table content while paging
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to load stats");
      return res.json();
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["employees"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const save = async () => {
    if (!form.name.trim() || !form.position.trim() || !form.hireDate) {
      toast.error("Name, position and hire date are required.");
      return;
    }
    setSaving(true);
    try {
      const url = editing
        ? `/api/admin/employees/${editing.id}`
        : "/api/admin/employees";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          manager: form.manager || null,
          idNumber: form.idNumber || null,
          idExpiry: form.idExpiry || null,
          email: form.email || null,
          phone: form.phone || null,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Request failed");
      toast.success(editing ? "Employee updated." : `Employee ${body.employee.empCode} added.`);
      setFormOpen(false);
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (emp: Employee) => {
    const res = await fetch(`/api/admin/employees/${emp.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete employee.");
      return;
    }
    toast.success(`${emp.name} removed.`);
    setDeleting(null);
    invalidate();
  };

  const onSort = (field: string) => {
    if (sort === field) {
      setDir(dir === "asc" ? "desc" : "asc");
    } else {
      setSort(field);
      setDir("asc");
    }
    setPage(1);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (e: Employee) => {
    setEditing(e);
    setForm({
      name: e.name,
      department: e.department,
      position: e.position,
      status: e.status,
      hireDate: e.hireDate.slice(0, 10),
      manager: e.manager ?? "",
      idNumber: e.idNumber ?? "",
      idExpiry: e.idExpiry ? e.idExpiry.slice(0, 10) : "",
      email: e.email ?? "",
      phone: e.phone ?? "",
    });
    setFormOpen(true);
  };

  const rows = data?.rows ?? [];
  const loadingRow = (
    <tr>
      <td colSpan={9} className="px-4 py-14 text-center text-sm text-muted-foreground">
        Loading employees…
      </td>
    </tr>
  );
  const emptyRow = (
    <tr>
      <td colSpan={9} className="px-4 py-14 text-center">
        <p className="text-sm font-medium text-foreground">No employees match your filters</p>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          Try a different search term, status or department.
        </p>
      </td>
    </tr>
  );

  return (
    <>
      <PageHeader
        title="Employees"
        description="Central workforce directory — search, filter, manage and export."
      />

      {/* stats row — mirrors the reference screen */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total" value={stats?.total ?? "—"} icon={Users} tone="brand" />
        <StatCard label="Active" value={stats?.active ?? "—"} icon={BadgeCheck} tone="success" />
        <StatCard label="Probation" value={stats?.probation ?? "—"} icon={Clock3} tone="warning" />
        <StatCard label="Suspended" value={stats?.suspended ?? "—"} icon={CirclePause} tone="danger" />
        <StatCard label="Docs Expiring" value={stats?.expiringDocs ?? "—"} icon={CalendarClock} tone="warning" />
      </div>

      {/* toolbar — search left, action pills right */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <ToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Search number or name…"
          label="Search employees"
        />
        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
          <ToolbarPill icon={Upload} onClick={() => setImportOpen(true)}>
            Import
          </ToolbarPill>
          <FiltersPill
            active={(status !== "all" ? 1 : 0) + (department !== "all" ? 1 : 0)}
            onClear={() => {
              setStatus("all");
              setDepartment("all");
              setPage(1);
            }}
          >
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Status</p>
              <Select
                value={status}
                onValueChange={(v) => { setStatus(v); setPage(1); }}
              >
                <SelectTrigger className="h-9 w-full border-border bg-ink-850" aria-label="Filter by status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Department</p>
              <Select
                value={department}
                onValueChange={(v) => { setDepartment(v); setPage(1); }}
              >
                <SelectTrigger className="h-9 w-full border-border bg-ink-850" aria-label="Filter by department">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {(stats?.departments ?? []).map((d) => (
                    <SelectItem key={d.department} value={d.department}>
                      {d.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FiltersPill>
          <ToolbarPill
            icon={Download}
            href={`/api/admin/employees/export?${params}`}
            download
          >
            Export
          </ToolbarPill>
          <ToolbarPrimary icon={Plus} onClick={openAdd}>
            New employee
          </ToolbarPrimary>
        </div>
      </div>

      {/* record summary + circular pager — above the table like the reference */}
      {data && (
        <TableSummary
          page={data.page}
          pageCount={data.pageCount}
          total={data.total}
          pageSize={data.pageSize}
          onPage={setPage}
          selected={selected.size}
          onClearSelection={() => setSelected(new Set())}
          actions={[
          { label: "Activate", onClick: () => bulkUpdate({ status: "Active" }, "Employees activated.") },
          { label: "Suspend", onClick: () => bulkUpdate({ status: "Suspended" }, "Employees suspended.") },
          { label: "Delete", danger: true, onClick: bulkDelete },
        ]}
        />
      )}

      {/* table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-ink-850/85">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-ink-900/40">
                                <th className="h-11 w-12 pl-5 pr-1 align-middle" aria-label="Select">
                  <Checkbox
                    checked={ rows.length > 0 && rows.every((x) => selected.has(x.id)) }
                    indeterminate={ selected.size > 0 && !rows.every((x) => selected.has(x.id)) }
                    onChange={(on) => setSelected(on ? new Set(rows.map((x) => x.id)) : new Set())}
                    label="Select all rows"
                  />
                </th>
                <SortHeader label="Code" field="empCode" sort={sort} dir={dir} onSort={onSort} />
                <SortHeader label="Name" field="name" sort={sort} dir={dir} onSort={onSort} />
                <SortHeader label="Department" field="department" sort={sort} dir={dir} onSort={onSort} />
                <SortHeader label="Position" field="position" sort={sort} dir={dir} onSort={onSort} />
                <SortHeader label="Status" field="status" sort={sort} dir={dir} onSort={onSort} />
                <SortHeader label="Hire Date" field="hireDate" sort={sort} dir={dir} onSort={onSort} />
                <th className="h-11 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Manager
                </th>
                <th className="h-11 w-14 px-4" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className={isFetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
              {isLoading ? (
                loadingRow
              ) : rows.length === 0 ? (
                emptyRow
              ) : (
                rows.map((e) => (
                  <tr key={e.id} className="border-b border-border/40 transition-colors last:border-0 hover:bg-brand-500/[0.04]">
                    <td className="pl-5 pr-1 align-middle" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={ selected.has(e.id) } onChange={(on) => toggleRow(e.id, on)} label={`Select ${e.name}`} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-muted-foreground">
                      {e.empCode}
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-semibold text-foreground">{e.name}</span>
                      <span className="block text-[11.5px] text-muted-foreground">{e.email ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-foreground/80">{e.department}</td>
                    <td className="px-4 py-3 text-foreground/80">{e.position}</td>
                    <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{fmtDate(e.hireDate)}</td>
                    <td className="px-4 py-3 text-foreground/80">{e.manager ?? "—"}</td>
                    <td className="px-4 py-3">
                      <RowActions label={`Actions for ${e.name}`}>
                        <DropdownMenuItem onClick={() => setViewing(e)} className="gap-2">
                          <Eye className="size-4" /> View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(e)} className="gap-2">
                          <Pencil className="size-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/60" />
                        <DropdownMenuItem
                          onClick={() => setDeleting(e)}
                          className="gap-2 text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="size-4" /> Delete
                        </DropdownMenuItem>
                      </RowActions>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data && (
          <TablePagination
            page={data.page}
            pageCount={data.pageCount}
            total={data.total}
            pageSize={data.pageSize}
            onPage={setPage}
          />
        )}
      </div>

      {/* CSV import */}
      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import employees"
        description="Upload a CSV with the same columns as the Export file. Rows with an existing ID/Iqama are skipped."
        resource="employees"
        template={IMPORT_TEMPLATE}
        onImported={invalidate}
      />

      {/* add / edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-ink-900 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {editing ? `Edit — ${editing.name}` : "New Employee"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? `Updating record ${editing.empCode}.`
                : "A sequential employee code is generated automatically."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-border bg-ink-850" placeholder="e.g. Khalid Al-Harbi" />
            </Field>
            <Field label="Department">
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                <SelectTrigger className="border-border bg-ink-850"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(stats?.departments ?? []).map((d) => (
                    <SelectItem key={d.department} value={d.department}>{d.department}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Position" required>
              <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="border-border bg-ink-850" placeholder="e.g. Machine Operator" />
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="border-border bg-ink-850"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Hire date" required>
              <Input type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} className="border-border bg-ink-850" />
            </Field>
            <Field label="Manager">
              <Input value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} className="border-border bg-ink-850" placeholder="e.g. Adel Gamal" />
            </Field>
            <Field label="ID / Iqama">
              <Input value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} className="border-border bg-ink-850" />
            </Field>
            <Field label="ID expiry">
              <Input type="date" value={form.idExpiry} onChange={(e) => setForm({ ...form, idExpiry: e.target.value })} className="border-border bg-ink-850" />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border-border bg-ink-850" placeholder="name@agma.com" />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border-border bg-ink-850" placeholder="+9665…" />
            </Field>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" className="border-border bg-transparent" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving} className="gap-2">
              {saving && <span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {editing ? "Save changes" : "Create employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* view dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="border-border bg-ink-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">{viewing?.name}</DialogTitle>
            <DialogDescription className="font-mono text-[12px]">{viewing?.empCode}</DialogDescription>
          </DialogHeader>
          {viewing && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Detail label="Status"><StatusBadge status={viewing.status} /></Detail>
              <Detail label="Department">{viewing.department}</Detail>
              <Detail label="Position">{viewing.position}</Detail>
              <Detail label="Hire date">{fmtDate(viewing.hireDate)}</Detail>
              <Detail label="Manager">{viewing.manager ?? "—"}</Detail>
              <Detail label="ID / Iqama">{viewing.idNumber ?? "—"}</Detail>
              <Detail label="ID expiry">{fmtDate(viewing.idExpiry)}</Detail>
              <Detail label="Phone">{viewing.phone ?? "—"}</Detail>
              <div className="col-span-2">
                <Detail label="Email">{viewing.email ?? "—"}</Detail>
              </div>
            </dl>
          )}
        </DialogContent>
      </Dialog>

      {/* delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="border-border bg-ink-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-foreground">
              Delete {deleting?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes employee {deleting?.empCode} from the directory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-transparent">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && remove(deleting)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[12px] font-medium text-muted-foreground">
        {label} {required && <span className="text-brand-accent-bright">*</span>}
      </Label>
      {children}
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-foreground/90">{children}</dd>
    </div>
  );
}
