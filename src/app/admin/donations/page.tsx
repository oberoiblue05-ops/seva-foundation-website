"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { generateReceipt, type DonationForReceipt } from "@/lib/generate-receipt";
import { Download, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Donation {
  id:                 string;
  name:               string;
  email:              string;
  phone:              string;
  pan?:               string;
  campaign:           string;
  amount:             number;
  razorpayPaymentId?: string;
  razorpayOrderId:    string;
  status:             string;
  timestamp:          string;
  isPublic?:          boolean;
}

const PAGE_SIZE = 20;

function StatusBadge({ s }: { s: string }) {
  const cls = s === "success" ? "bg-green-100 text-green-700" : s === "failed" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>{s}</span>;
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function DonationRecordsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [page,      setPage]      = useState(1);

  // Filters
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("all");
  const [dateFrom,      setDateFrom]      = useState("");
  const [dateTo,        setDateTo]        = useState("");
  const [campaignFilter,setCampaignFilter]= useState("");

  const [downloading,   setDownloading]   = useState<string | null>(null);
  const [exportBusy,    setExportBusy]    = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let q = query(collection(db, "donations"), orderBy("timestamp", "desc"));
        if (statusFilter !== "all") {
          q = query(collection(db, "donations"), where("status", "==", statusFilter), orderBy("timestamp", "desc"));
        }
        const snap = await getDocs(q);
        setDonations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Donation)));
      } catch (err) {
        console.warn("[admin/donations]", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [statusFilter]);

  const filtered = useMemo(() => {
    let data = donations;
    if (search) {
      const s = search.toLowerCase();
      data = data.filter((d) =>
        d.name?.toLowerCase().includes(s) ||
        d.email?.toLowerCase().includes(s) ||
        d.phone?.includes(s) ||
        d.razorpayPaymentId?.includes(s)
      );
    }
    if (campaignFilter) {
      data = data.filter((d) => d.campaign?.toLowerCase().includes(campaignFilter.toLowerCase()));
    }
    if (dateFrom) {
      data = data.filter((d) => d.timestamp >= new Date(dateFrom).toISOString());
    }
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59);
      data = data.filter((d) => d.timestamp <= end.toISOString());
    }
    return data;
  }, [donations, search, campaignFilter, dateFrom, dateTo]);

  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const handleDownloadReceipt = async (d: Donation) => {
    if (d.status !== "success") { toast.error("Receipt only for successful donations."); return; }
    setDownloading(d.id);
    try {
      await generateReceipt(d as DonationForReceipt);
    } catch { toast.error("Could not generate receipt."); }
    finally { setDownloading(null); }
  };

  const handleExportCSV = async () => {
    setExportBusy(true);
    try {
      const header = ["Date", "Donor Name", "Email", "Phone", "PAN", "Campaign", "Amount (Rs.)", "Payment ID", "Status"];
      const rows = filtered.map((d) => [
        d.timestamp ? fmtDate(d.timestamp) : "",
        d.name  ?? "", d.email ?? "", d.phone ?? "", d.pan ?? "",
        d.campaign ?? "", String(d.amount ?? ""),
        d.razorpayPaymentId ?? d.razorpayOrderId ?? "", d.status ?? "",
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`));

      const csv  = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${filtered.length} rows.`);
    } catch { toast.error("Export failed."); }
    finally { setExportBusy(false); }
  };

  const totalAmount = filtered.filter((d) => d.status === "success").reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
        <button
          onClick={handleExportCSV}
          disabled={exportBusy || filtered.length === 0}
          className="flex items-center gap-2 bg-[#1B5E37] text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[#0d3320] disabled:opacity-50"
        >
          {exportBusy ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Download size={15} />}
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, phone…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1B5E37]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1B5E37]"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <input
            type="text"
            placeholder="Filter by campaign…"
            value={campaignFilter}
            onChange={(e) => { setCampaignFilter(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#1B5E37]"
          />
          <div className="flex gap-2">
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1B5E37]" />
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1B5E37]" />
          </div>
        </div>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
          <span className="text-[#1B5E37] font-medium">Total collected: Rs. {totalAmount.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="h-8 w-8 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No donations match filters.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs border-b border-gray-100 bg-gray-50">
                  {["Date","Donor","Email","Phone","PAN","Campaign","Amount","Payment ID","Status","Receipt"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((d) => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{d.timestamp ? fmtDate(d.timestamp) : "—"}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{d.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">{d.email || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{d.phone || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{d.pan || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">{d.campaign || "General"}</td>
                    <td className="px-4 py-3 font-medium text-[#1B5E37] whitespace-nowrap">Rs. {(d.amount || 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs max-w-[100px] truncate">{d.razorpayPaymentId || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge s={d.status} /></td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDownloadReceipt(d)}
                        disabled={d.status !== "success" || downloading === d.id}
                        title={d.status !== "success" ? "Only available for successful payments" : "Download receipt"}
                        className="text-xs text-[#1B5E37] hover:underline disabled:text-gray-300 disabled:no-underline flex items-center gap-1"
                      >
                        {downloading === d.id
                          ? <span className="h-3 w-3 border border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
                          : <Download size={12} />}
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded-lg hover:bg-gray-100">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-600 font-medium">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded-lg hover:bg-gray-100">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
