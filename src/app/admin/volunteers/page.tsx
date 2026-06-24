"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { generateVolunteerCert } from "@/lib/generate-volunteer-cert";
import { Download, Search, X, Award, Clock, Users, CheckCircle, AlertCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "pending" | "approved" | "active" | "completed" | "rejected";

interface Volunteer {
  id:             string;
  name:           string;
  email:          string;
  phone:          string;
  city?:          string;
  volunteerType?: string;
  skills?:        string;
  availableDays?: string[];
  hoursPerMonth?: string;
  motivation?:    string;
  emergencyName?: string;
  emergencyPhone?: string;
  message?:       string;
  createdAt:      string;
  status:         Status;
  hoursLogged:    number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700",
  approved:  "bg-blue-100 text-blue-700",
  active:    "bg-green-100 text-green-700",
  completed: "bg-purple-100 text-purple-700",
  rejected:  "bg-red-100 text-red-700",
};

const STATUS_NEXT: Record<Status, Status | null> = {
  pending:   "approved",
  approved:  "active",
  active:    "completed",
  completed: null,
  rejected:  null,
};

const TABS: { key: Status | "all"; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "pending",   label: "Pending" },
  { key: "approved",  label: "Approved" },
  { key: "active",    label: "Active" },
  { key: "completed", label: "Completed" },
];

const TYPE_LABELS: Record<string, string> = {
  "on-site":   "On-Site",
  "events":    "Events & Camp",
  "remote":    "Remote Skills",
  "all-three": "All Three",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return s; }
}

function thisMonthCount(vols: Volunteer[]) {
  const now = new Date();
  return vols.filter((v) => {
    try {
      const d = new Date(v.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    } catch { return false; }
  }).length;
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function VolunteerManagerPage() {
  const [volunteers,  setVolunteers]  = useState<Volunteer[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [activeTab,   setActiveTab]   = useState<Status | "all">("all");
  const [selected,    setSelected]    = useState<Volunteer | null>(null);
  const [updatingId,  setUpdatingId]  = useState<string | null>(null);
  const [exportBusy,  setExportBusy]  = useState(false);
  const [certBusy,    setCertBusy]    = useState(false);
  const [localHours,  setLocalHours]  = useState<Record<string, number>>({});

  useEffect(() => {
    const q = query(collection(db, "volunteers"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setVolunteers(
        snap.docs.map((d) => ({ id: d.id, hoursLogged: 0, status: "pending", ...d.data() } as Volunteer))
      );
      setLoading(false);
    });
  }, []);

  // Filtered by tab + search
  const tabFiltered = volunteers.filter((v) =>
    activeTab === "all" ? true : v.status === activeTab
  );
  const filtered = tabFiltered.filter((v) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      v.name?.toLowerCase().includes(s) ||
      v.email?.toLowerCase().includes(s) ||
      v.phone?.includes(s) ||
      v.city?.toLowerCase().includes(s)
    );
  });

  // Stats
  const totalHours   = volunteers.reduce((acc, v) => acc + (v.hoursLogged ?? 0), 0);
  const pendingCount = volunteers.filter((v) => v.status === "pending").length;
  const approvedCount = volunteers.filter((v) => v.status === "approved").length;

  const updateField = async (id: string, field: string, value: unknown) => {
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, "volunteers", id), { [field]: value });
      if (field === "status") toast.success(`Status updated to ${value}.`);
      if (field === "hoursLogged") toast.success("Hours updated.");
      // update selected modal if open
      setSelected((prev) => prev?.id === id ? { ...prev, [field]: value } as Volunteer : prev);
    } catch { toast.error("Update failed."); }
    finally { setUpdatingId(null); }
  };

  const handleAdvanceStatus = (v: Volunteer) => {
    const next = STATUS_NEXT[v.status];
    if (next) updateField(v.id, "status", next);
  };

  const handleHoursBlur = (v: Volunteer) => {
    const val = localHours[v.id] ?? v.hoursLogged;
    if (val !== v.hoursLogged) updateField(v.id, "hoursLogged", val);
  };

  const handleExportCSV = () => {
    setExportBusy(true);
    try {
      const header = ["Name","Email","Phone","City","Type","Skills","Days","Hrs/Month","Status","Hours Logged","Motivation","Applied"];
      const rows = filtered.map((v) => [
        v.name, v.email, v.phone, v.city ?? "", v.volunteerType ?? "", v.skills ?? "",
        (v.availableDays ?? []).join("|"), v.hoursPerMonth ?? "", v.status,
        String(v.hoursLogged ?? 0), v.motivation ?? "", v.createdAt ? fmtDate(v.createdAt) : "",
      ].map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`));
      const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const a = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
        download: `volunteers-${new Date().toISOString().slice(0, 10)}.csv`,
      });
      a.click();
      toast.success(`Exported ${filtered.length} records.`);
    } catch { toast.error("Export failed."); }
    finally { setExportBusy(false); }
  };

  const handleGenerateCert = async (v: Volunteer) => {
    setCertBusy(true);
    try {
      await generateVolunteerCert({
        name:          v.name,
        volunteerType: v.volunteerType,
        hoursLogged:   v.hoursLogged ?? 0,
        city:          v.city,
        createdAt:     v.createdAt,
      });
      toast.success("Certificate downloaded.");
    } catch { toast.error("Certificate generation failed."); }
    finally { setCertBusy(false); }
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>
        <button
          onClick={handleExportCSV}
          disabled={exportBusy || filtered.length === 0}
          className="flex items-center gap-2 bg-[#1B5E37] text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[#0d3320] disabled:opacity-50"
        >
          {exportBusy
            ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Download size={15} />}
          Export CSV
        </button>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { icon: Users,       label: "Total",      value: volunteers.length,  color: "text-gray-700" },
          { icon: AlertCircle, label: "Pending",    value: pendingCount,       color: "text-yellow-600" },
          { icon: CheckCircle, label: "Approved",   value: approvedCount,      color: "text-blue-600" },
          { icon: Users,       label: "This Month", value: thisMonthCount(volunteers), color: "text-[#1B5E37]" },
          { icon: Clock,       label: "Total Hours", value: totalHours,        color: "text-purple-600" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
            <Icon size={16} className={color} />
            <div>
              <p className={`text-lg font-bold leading-none ${color}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs + Search ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
          {TABS.map((tab) => {
            const count = tab.key === "all"
              ? volunteers.length
              : volunteers.filter((v) => v.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-white text-[#1B5E37] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1B5E37]"
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="h-8 w-8 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {volunteers.length === 0 ? "No volunteer registrations yet." : "No results for this filter."}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs border-b border-gray-100 bg-gray-50">
                  {["Name","City","Type","Applied","Status","Hours","Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => setSelected(v)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 whitespace-nowrap">{v.name}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[140px]">{v.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{v.city ?? "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {v.volunteerType ? (TYPE_LABELS[v.volunteerType] ?? v.volunteerType) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                      {v.createdAt ? fmtDate(v.createdAt) : "—"}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={v.status}
                        disabled={updatingId === v.id}
                        onChange={(e) => updateField(v.id, "status", e.target.value)}
                        className={`text-xs font-medium rounded-full px-2 py-1 border-0 outline-none cursor-pointer ${STATUS_COLORS[v.status] ?? ""}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="number"
                        min={0}
                        value={localHours[v.id] ?? v.hoursLogged}
                        disabled={updatingId === v.id}
                        onChange={(e) => setLocalHours((p) => ({ ...p, [v.id]: Number(e.target.value) }))}
                        onBlur={() => handleHoursBlur(v)}
                        className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#1B5E37] text-center"
                      />
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelected(v)}
                        className="text-xs text-[#1B5E37] hover:underline font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Profile Modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Volunteer Profile</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#1B5E37] flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {selected.name?.[0]?.toUpperCase() ?? "V"}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">{selected.name}</p>
                  <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[selected.status] ?? ""}`}>
                    {selected.status}
                  </span>
                  {selected.city && (
                    <span className="ml-2 text-xs text-gray-400">{selected.city}</span>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Email",    selected.email],
                  ["Phone",    `+91 ${selected.phone}`],
                  ["Applied",  selected.createdAt ? fmtDate(selected.createdAt) : "—"],
                  ["Type",     selected.volunteerType ? (TYPE_LABELS[selected.volunteerType] ?? selected.volunteerType) : "—"],
                  ["Hrs/Month", selected.hoursPerMonth ?? "—"],
                  ["Days",     (selected.availableDays ?? []).join(", ") || "—"],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <p className="text-gray-400 text-xs mb-0.5">{label as string}</p>
                    <p className="font-medium text-gray-700 text-xs">{value as string}</p>
                  </div>
                ))}
              </div>

              {/* Skills */}
              {selected.skills && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Skills / Profession</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{selected.skills}</p>
                </div>
              )}

              {/* Motivation */}
              {selected.motivation && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Motivation</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{selected.motivation}</p>
                </div>
              )}

              {/* Emergency contact */}
              {(selected.emergencyName || selected.emergencyPhone) && (
                <div className="bg-amber-50 rounded-xl p-3 text-sm">
                  <p className="text-xs text-amber-600 font-semibold mb-1">Emergency Contact</p>
                  <p className="text-gray-700">{selected.emergencyName}</p>
                  {selected.emergencyPhone && (
                    <p className="text-gray-500 text-xs">+91 {selected.emergencyPhone}</p>
                  )}
                </div>
              )}

              {/* Hours Logged + status changer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Hours Logged</p>
                  <input
                    type="number"
                    min={0}
                    defaultValue={selected.hoursLogged ?? 0}
                    onBlur={(e) => updateField(selected.id, "hoursLogged", Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1B5E37] text-center"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Status</p>
                  <select
                    value={selected.status}
                    onChange={(e) => updateField(selected.id, "status", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1B5E37]"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Advance status button */}
              {STATUS_NEXT[selected.status] && (
                <button
                  onClick={() => handleAdvanceStatus(selected)}
                  disabled={updatingId === selected.id}
                  className="w-full bg-[#1B5E37] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#0d3320] disabled:opacity-50"
                >
                  Advance to {STATUS_NEXT[selected.status]?.charAt(0).toUpperCase()}{STATUS_NEXT[selected.status]?.slice(1)}
                </button>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <a
                  href={`https://wa.me/91${selected.phone}?text=${encodeURIComponent(`Hi ${selected.name}! This is from Seva Group Foundation regarding your volunteer application.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#1ebe5a] transition-colors"
                >
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
                <button
                  onClick={() => handleGenerateCert(selected)}
                  disabled={certBusy || (selected.hoursLogged ?? 0) === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1B5E37] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#0d3320] disabled:opacity-50 disabled:cursor-not-allowed"
                  title={(selected.hoursLogged ?? 0) === 0 ? "Log hours first" : "Generate certificate"}
                >
                  {certBusy
                    ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Award size={14} />}
                  Certificate
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
