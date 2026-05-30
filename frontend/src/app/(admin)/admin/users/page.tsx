"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck, MoreVertical, Ban, CheckCircle2 } from "lucide-react";

type Role = "student" | "mentor" | "employer" | "admin";
type Status = "active" | "pending" | "suspended";

type User = {
  id: string; name: string; email: string; role: Role; status: Status;
  country: string; joined: string; verified: boolean;
};

const mock: User[] = [
  { id: "u_001", name: "Ada Lovelace",   email: "ada@example.com",     role: "student",  status: "active",    country: "GH", joined: "2026-04-12", verified: true },
  { id: "u_002", name: "Tunde Adebayo",  email: "tunde@example.com",   role: "mentor",   status: "pending",   country: "NG", joined: "2026-05-01", verified: false },
  { id: "u_003", name: "Priya Sharma",   email: "priya@example.com",   role: "student",  status: "active",    country: "IN", joined: "2026-03-18", verified: true },
  { id: "u_004", name: "Kwame Boateng",  email: "kwame@example.com",   role: "mentor",   status: "active",    country: "GH", joined: "2025-12-02", verified: true },
  { id: "u_005", name: "scammer_x",      email: "fake@example.com",    role: "employer", status: "suspended", country: "??", joined: "2026-05-19", verified: false },
  { id: "u_006", name: "Ama Owusu",      email: "ama@example.com",     role: "mentor",   status: "active",    country: "GH", joined: "2025-08-09", verified: true },
  { id: "u_007", name: "Liu Wei",        email: "liuwei@example.com",  role: "student",  status: "active",    country: "CN", joined: "2026-04-30", verified: false },
  { id: "u_008", name: "Sarah Admin",    email: "sarah@globalpath.com", role: "admin", status: "active",    country: "—",  joined: "2025-01-01", verified: true },
];

export default function UsersPage() {
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  const filtered = useMemo(() => {
    return mock.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (q && !`${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, roleFilter, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-semibold text-ink-900">Users</h1>
          <p className="text-sm text-ink-600 mt-1">{filtered.length} of {mock.length} users</p>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input pl-9 text-sm" placeholder="Search name or email" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as Role | "all")} className="input text-sm max-w-[160px]">
          <option value="all">All roles</option>
          <option value="student">Student</option>
          <option value="mentor">Mentor</option>
          <option value="employer">Employer</option>
          <option value="admin">Admin</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Status | "all")} className="input text-sm max-w-[160px]">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-cream-100 border-b border-cream-200">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-ink-600">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Country</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-cream-100">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-clay-500 text-white flex items-center justify-center text-xs font-medium shrink-0">
                      {u.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900 flex items-center gap-1.5">
                        {u.name}
                        {u.verified && <ShieldCheck size={12} className="text-leaf-600" />}
                      </p>
                      <p className="text-xs text-ink-500 truncate">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3"><RoleChip role={u.role} /></td>
                <td className="px-5 py-3 text-sm text-ink-700">{u.country}</td>
                <td className="px-5 py-3"><StatusChip status={u.status} /></td>
                <td className="px-5 py-3 text-xs text-ink-500">{u.joined}</td>
                <td className="px-5 py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    {u.status !== "suspended" ? (
                      <button title="Suspend" className="p-1.5 rounded-md text-red-600 hover:bg-red-500/10 transition">
                        <Ban size={14} />
                      </button>
                    ) : (
                      <button title="Reinstate" className="p-1.5 rounded-md text-leaf-600 hover:bg-leaf-500/10 transition">
                        <CheckCircle2 size={14} />
                      </button>
                    )}
                    <button className="p-1.5 rounded-md text-ink-500 hover:bg-cream-200 transition">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-ink-500">No users match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoleChip({ role }: { role: Role }) {
  const map: Record<Role, string> = {
    student: "badge-clay", mentor: "badge-verified", employer: "!bg-amber-500/15 !text-amber-500", admin: "!bg-red-500/15 !text-red-600",
  };
  return <span className={`badge ${map[role]} capitalize`}>{role}</span>;
}

function StatusChip({ status }: { status: Status }) {
  if (status === "active")    return <span className="badge badge-verified">Active</span>;
  if (status === "pending")   return <span className="badge !bg-amber-500/15 !text-amber-500">Pending</span>;
  return <span className="badge !bg-red-500/15 !text-red-600">Suspended</span>;
}
