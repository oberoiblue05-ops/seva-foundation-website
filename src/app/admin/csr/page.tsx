"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { Download, Search, X, Building2, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CsrStatus = "new" | "contacted" | "proposal-sent" | "in-negotiation" | "won" | "lost";

interface CSRInquiry {
  id:          string;
  company:     string;
  contact:     string;
  designation?: string;
  email:       string;
  phone:       string;
  website?:    string;
  budget?:     string;
  programmes?: string[];
  tier?:       string;
  timeline?:   string;
  message?:    string;
  status:      CsrStatus;
  submittedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<CsrStatus, string> = {
  "new":            "bg-blue-100 text-blue-700",
  "contacted":      "bg-yellow-100 text-yellow-700",
  "proposal-sent":  "bg-purple-100 text-purple-700",
  "in-negotiation": "bg-orange-100 text-orange-700",
  "won":            "bg-green-100 text-green-700",
  "lost":           "bg-red-100 text-red-700",
};

const STATUS_OPTIONS: { value: CsrStatus; label: string }[] = [
  { value: "new",            label: "New" },
  { value: "contacted",      label: "Contacted" },
  { value: "proposal-sent",  label: "Proposal Sent" },
  { value: "in-negotiation", label: "In Negotiation" },
  { value: "won",            label: "Won" },
  { value: "lost",           label: "Lost" },
];

const STATUS_NEXT: Record<CsrStatus, CsrStatus | null> = {
  "new":            "contacted",
  "contacted":      "proposal-sent",
  "proposal-sent":  "in-negotiation",
  "in-negotiation": "won",
  "won":            null,
  "lost":           null,
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return s; }
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function CSRInquiriesPage() {
  const [inquiries,  setInquiries]  = useState<CSRInquiry[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState<CsrStatus | "all">("all");
  const [selected,   setSelected]   = useState<CSRInquiry | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "csrInquiries"), orderBy("submittedAt", "desc"));
    return onSnapshot(q, (snap) => {
      setInquiries(snap.docs.map((d) => ({
        id: d.id,
        status: "new",
        ...d.data(),
      } as CSRInquiry)));
      setLoading(false);
    });
  }, []);

  const filtered = inquiries
    .filter((i) => statusFilter === "all" || i.status === statusFilter)
    .filter((i) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        i.company?.toLowerCase().includes(s) ||
        i.contact?.toLowerCase().includes(s) ||
        i.email?.toLowerCase().includes(s)
      );
    });

  const updateStatus = async (id: string, status: CsrStatus) => {
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, "csrInquiries", id), { status });
      toast.success(`Status → ${STATUS_OPTIONS.find((s) => s.value === status)?.label}`);
      setSelected((prev) => prev?.id === id ? { ...prev, status } : prev);
    } catch { toast.error("Update failed."); }
    finally { setUpdatingId(null); }
  };

  const handleExportCSV = () => {
    setExportBusy(true);
    try {
      const header = ["Company","Contact","Designation","Email","Phone","Budget","Tier","Timeline","Status","Date","Message"];
      const rows = filtered.map((i) => [
        i.company, i.contact, i.designation ?? "", i.email, i.phone,
        i.budget ?? "", i.tier ?? "", i.timeline ?? "", i.status,
        i.submittedAt ? fmtDate(i.submittedAt) : "", i.message ?? "",
      ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`));
      const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const a = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
        download: `csr-inquiries-${new Date().toISOString().slice(0, 10)}.csv`,
      });
      a.click();
      toast.success(`Exported ${filtered.length} records.`);
    } catch { toast.error("Export failed."); }
    finally { setExportBusy(false); }
  };

  // Stats
  const newCount  = inquiries.filter((i) => i.status === "new").length;
  const wonCount  = inquiries.filter((i) => i.status === "won").length;
  const inProgress = inquiries.filter((i) => ["contacted","proposal-sent","in-negotiation"].includes(i.status)).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">CSR Inquiries</h1>
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Building2,   label: "Total",       value: inquiries.length, color: "text-gray-700" },
          { icon: AlertCircle, label: "New",          value: newCount,         color: "text-blue-600" },
          { icon: TrendingUp,  label: "In Progress",  value: inProgress,       color: "text-orange-600" },
          { icon: CheckCircle, label: "Won",          value: wonCount,         color: "text-green-600" },
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
          {[{ value: "all", label: "All" }, ...STATUS_OPTIONS].map((opt) => {
            const count = opt.value === "all"
              ? inquiries.length
              : inquiries.filter((i) => i.status === opt.value).length;
            return (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value as CsrStatus | "all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  statusFilter === opt.value
                    ? "bg-white text-[#1B5E37] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {opt.label} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search company, contact…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1B5E37]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="h-8 w-8 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14 text-gray-400">
              <Building2 size={32} className="mx-auto mb-3 opacity-30" />
              <p>{inquiries.length === 0 ? "No CSR inquiries yet." : "No results for this filter."}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs border-b border-gray-100 bg-gray-50">
                  {["Company","Contact","Budget","Tier","Status","Date","Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inq) => (
                  <tr
                    key={inq.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => setSelected(inq)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 whitespace-nowrap">{inq.company}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[140px]">{inq.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700 whitespace-nowrap">{inq.contact}</p>
                      {inq.designation && (
                        <p className="text-xs text-gray-400">{inq.designation}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{inq.budget ?? "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {inq.tier ? (
                        <span className="text-xs bg-[#1B5E37]/8 text-[#1B5E37] px-2 py-0.5 rounded-full font-medium">
                          {inq.tier}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={inq.status}
                        disabled={updatingId === inq.id}
                        onChange={(e) => updateStatus(inq.id, e.target.value as CsrStatus)}
                        className={`text-xs font-medium rounded-full px-2 py-1 border-0 outline-none cursor-pointer ${STATUS_COLORS[inq.status]}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                      {inq.submittedAt ? fmtDate(inq.submittedAt) : "—"}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/91${inq.phone}?text=${encodeURIComponent(
                            `Hi ${inq.contact}! This is from Seva Group Foundation regarding your CSR partnership inquiry for ${inq.company}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-[#25D366] text-white px-2.5 py-1 rounded-lg font-medium hover:bg-[#20BD5C] transition-colors whitespace-nowrap"
                        >
                          WhatsApp
                        </a>
                        {STATUS_NEXT[inq.status] && (
                          <button
                            onClick={() => updateStatus(inq.id, STATUS_NEXT[inq.status]!)}
                            disabled={updatingId === inq.id}
                            className="text-xs text-[#1B5E37] hover:underline font-medium whitespace-nowrap disabled:opacity-50"
                          >
                            → {STATUS_OPTIONS.find((s) => s.value === STATUS_NEXT[inq.status])?.label}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-800">{selected.company}</h3>
                <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[selected.status]}`}>
                  {STATUS_OPTIONS.find((s) => s.value === selected.status)?.label}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Contact",     selected.contact],
                  ["Designation", selected.designation ?? "—"],
                  ["Email",       selected.email],
                  ["Phone",       `+91 ${selected.phone}`],
                  ["Website",     selected.website ?? "—"],
                  ["Budget",      selected.budget ?? "—"],
                  ["Tier",        selected.tier ?? "—"],
                  ["Timeline",    selected.timeline ?? "—"],
                  ["Submitted",   selected.submittedAt ? fmtDate(selected.submittedAt) : "—"],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <p className="text-gray-400 text-xs mb-0.5">{label as string}</p>
                    <p className="font-medium text-gray-700 text-xs break-all">{value as string}</p>
                  </div>
                ))}
              </div>

              {/* Programmes */}
              {selected.programmes && selected.programmes.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Preferred Programmes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.programmes.map((p) => (
                      <span key={p} className="text-xs bg-[#1B5E37]/8 text-[#1B5E37] px-2.5 py-1 rounded-full font-medium">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Message */}
              {selected.message && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Message / Requirements</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">{selected.message}</p>
                </div>
              )}

              {/* Status change */}
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Update Pipeline Status</p>
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected.id, e.target.value as CsrStatus)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1B5E37]"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <a
                  href={`https://wa.me/91${selected.phone}?text=${encodeURIComponent(
                    `Hi ${selected.contact}! This is from Seva Group Foundation regarding your CSR partnership inquiry for ${selected.company}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#1ebe5a] transition-colors"
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Send WhatsApp
                </a>
                <a
                  href={`mailto:${selected.email}?subject=Re: CSR Partnership — Seva Group Foundation`}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1B5E37] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#0d3320] transition-colors"
                >
                  Reply via Email
                </a>
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
