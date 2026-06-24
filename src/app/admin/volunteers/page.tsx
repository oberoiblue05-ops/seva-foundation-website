"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { WhatsApp } from "@/lib/whatsapp-templates";
import { Download, Search, X } from "lucide-react";

interface Volunteer {
  id:        string;
  name:      string;
  email:     string;
  phone:     string;
  message:   string;
  createdAt: string;
  status:    "pending" | "approved" | "rejected";
  hoursLogged: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending:  "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function VolunteerManagerPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [selected,   setSelected]   = useState<Volunteer | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "volunteers"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setVolunteers(snap.docs.map((d) => ({ id: d.id, hoursLogged: 0, status: "pending", ...d.data() } as Volunteer)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = volunteers.filter((v) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return v.name?.toLowerCase().includes(s) || v.email?.toLowerCase().includes(s) || v.phone?.includes(s);
  });

  const updateField = async (id: string, field: string, value: unknown) => {
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, "volunteers", id), { [field]: value });
      if (field === "status") toast.success(`Status updated to ${value}.`);
    } catch { toast.error("Update failed."); }
    finally { setUpdatingId(null); }
  };

  const handleExportCSV = () => {
    setExportBusy(true);
    try {
      const header = ["Name", "Email", "Phone", "Message", "Date", "Status", "Hours Logged"];
      const rows = filtered.map((v) => [
        v.name, v.email, v.phone, v.message, v.createdAt ? fmtDate(v.createdAt) : "", v.status, String(v.hoursLogged ?? 0),
      ].map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`));
      const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `volunteers-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      toast.success(`Exported ${filtered.length} records.`);
    } catch { toast.error("Export failed."); }
    finally { setExportBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>
        <button onClick={handleExportCSV} disabled={exportBusy || filtered.length === 0}
          className="flex items-center gap-2 bg-[#1B5E37] text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[#0d3320] disabled:opacity-50">
          {exportBusy ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Download size={15} />}
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1B5E37]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="h-8 w-8 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {volunteers.length === 0 ? "No volunteer registrations yet." : "No results match your search."}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs border-b border-gray-100 bg-gray-50">
                  {["Name","Email","Phone","Date","Status","Hours","Message"].map((h) => (
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
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{v.name}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{v.email}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{v.phone}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{v.createdAt ? fmtDate(v.createdAt) : "—"}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={v.status}
                        disabled={updatingId === v.id}
                        onChange={(e) => updateField(v.id, "status", e.target.value)}
                        className={`text-xs font-medium rounded-full px-2 py-1 border-0 outline-none cursor-pointer ${STATUS_COLORS[v.status]}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="number"
                        min={0}
                        value={v.hoursLogged}
                        disabled={updatingId === v.id}
                        onChange={(e) => updateField(v.id, "hoursLogged", Number(e.target.value))}
                        className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#1B5E37] text-center"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-400 max-w-[180px] truncate text-xs">{v.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Volunteer Profile</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#1B5E37] flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {selected.name?.[0]?.toUpperCase() ?? "V"}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-lg">{selected.name}</p>
                  <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[selected.status]}`}>
                    {selected.status}
                  </span>
                </div>
              </div>

              {[
                ["Email",         selected.email],
                ["Phone",         selected.phone],
                ["Registered",    selected.createdAt ? fmtDate(selected.createdAt) : "—"],
                ["Hours Logged",  `${selected.hoursLogged ?? 0} hours`],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="text-sm text-gray-400 w-28 shrink-0">{label}</span>
                  <span className="text-sm font-medium text-gray-700">{value}</span>
                </div>
              ))}

              {selected.message && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Message</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{selected.message}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <a
                  href={WhatsApp.volunteerInquiry(selected.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#25D366] text-white rounded-xl py-2.5 text-sm font-medium text-center hover:bg-[#1ebe5a] transition-colors"
                >
                  📲 WhatsApp
                </a>
                <button onClick={() => setSelected(null)}
                  className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">
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
