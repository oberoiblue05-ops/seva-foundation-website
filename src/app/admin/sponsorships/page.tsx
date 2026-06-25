"use client";

import { useState, useEffect } from "react";
import {
  collection, query, orderBy, onSnapshot,
  doc, updateDoc, deleteDoc, addDoc, serverTimestamp, arrayUnion,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, MessageSquare, Ban, Download, CheckCircle } from "lucide-react";
import { generateSponsorCert } from "@/lib/generate-receipt";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FirestoreChild {
  id:          string;
  name:        string;
  age:         number;
  category:    string;
  story:       string;
  photo?:      string;
  imageSeed?:  number;
  isSponsored: boolean;
  createdAt?:  string;
}

interface Sponsorship {
  id:            string;
  sponsorName:   string;
  email?:        string;
  phone?:        string;
  childId:       string;
  childName?:    string;
  amount:        number;
  startDate:     string;
  status:        string;
  isActive:      boolean;
  paymentHistory?: PaymentRecord[];
  razorpayPaymentId?: string;
}

interface PaymentRecord {
  date:      string;
  amount:    number;
  note?:     string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "orphan",          label: "Orphan" },
  { value: "semi-orphan",     label: "Semi-Orphan" },
  { value: "flood-affected",  label: "Flood Affected" },
  { value: "accident-family", label: "Accident Family" },
  { value: "cancer-family",   label: "Cancer Family" },
];

const INPUT = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1B5E37] transition-colors";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function monthsActive(startDate: string): number {
  const start = new Date(startDate);
  const now   = new Date();
  return Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));
}

function exportCSV(sponsorships: Sponsorship[], children: FirestoreChild[]) {
  const rows = [
    ["Sponsor Name", "Child Name", "Email", "Phone", "Start Date", "Months Active", "Status", "Total Contributed (Rs)"],
    ...sponsorships.map((s) => {
      const child = children.find((c) => c.id === s.childId);
      const months = monthsActive(s.startDate);
      return [
        s.sponsorName,
        child?.name ?? s.childName ?? "—",
        s.email ?? "—",
        s.phone ?? "—",
        fmtDate(s.startDate),
        String(months),
        s.isActive ? "Active" : "Inactive",
        String(months * s.amount),
      ];
    }),
  ];

  const csv  = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `sponsorships-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Child Form Modal ─────────────────────────────────────────────────────────

function ChildFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Partial<FirestoreChild>;
  onClose: () => void;
  onSave:  (data: Omit<FirestoreChild, "id">) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name:        initial?.name        ?? "",
    age:         String(initial?.age  ?? ""),
    category:    initial?.category    ?? "orphan",
    story:       initial?.story       ?? "",
    photo:       initial?.photo       ?? "",
    imageSeed:   String(initial?.imageSeed ?? Math.floor(Math.random() * 900) + 100),
    isSponsored: initial?.isSponsored ?? false,
  });
  const [saving,      setSaving]      = useState(false);
  const [showPicker,  setShowPicker]  = useState(false);

  const handleSave = async () => {
    if (!form.name.trim() || !form.age || !form.story.trim()) {
      toast.error("Name, age and story are required.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name:        form.name.trim(),
        age:         Number(form.age),
        category:    form.category,
        story:       form.story.trim(),
        photo:       form.photo || undefined,
        imageSeed:   Number(form.imageSeed),
        isSponsored: form.isSponsored,
      });
      onClose();
    } catch { toast.error("Could not save child."); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl my-4">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">{initial?.id ? "Edit Child" : "Add Child"}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Name *</label>
              <input type="text" className={INPUT} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="First name only" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Age *</label>
                <input type="number" className={INPUT} value={form.age} min={1} max={17} onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))} placeholder="e.g. 9" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Category *</label>
                <select className={INPUT} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Story * (2 lines)</label>
              <textarea className={INPUT} rows={3} value={form.story} onChange={(e) => setForm((p) => ({ ...p, story: e.target.value }))} placeholder="A short 2-line story about this child" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Photo</label>
              <div className="flex gap-2 items-center">
                {form.photo ? (
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                    <Image src={form.photo} alt="Child" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-300 text-xl">👦</div>
                )}
                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="flex-1 border border-dashed border-gray-300 rounded-xl py-2 text-sm text-gray-500 hover:border-[#1B5E37] hover:text-[#1B5E37] transition-colors"
                >
                  {form.photo ? "Change Photo" : "Pick from Media Library"}
                </button>
                {form.photo && (
                  <button onClick={() => setForm((p) => ({ ...p, photo: "" }))} className="text-red-400 hover:text-red-600">
                    <X size={16} />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Or fallback picsum seed:</p>
              <input type="number" className={`${INPUT} mt-1`} value={form.imageSeed} onChange={(e) => setForm((p) => ({ ...p, imageSeed: e.target.value }))} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isSponsored}
                onChange={(e) => setForm((p) => ({ ...p, isSponsored: e.target.checked }))}
                className="w-4 h-4 accent-[#1B5E37]"
              />
              <span className="text-sm text-gray-700">Mark as already sponsored</span>
            </label>
          </div>
          <div className="px-6 pb-5 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-[#1B5E37] text-white text-sm font-bold rounded-xl hover:bg-[#0d3320] disabled:opacity-50"
            >
              {saving ? "Saving…" : initial?.id ? "Update Child" : "Add Child"}
            </button>
          </div>
        </div>
      </div>

      {showPicker && (
        <MediaPickerModal
          onSelect={(item) => {
            setForm((p) => ({ ...p, photo: item.url }));
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}

// ─── Section A: Child Profile Manager ────────────────────────────────────────

function ChildProfileManager() {
  const [children, setChildren] = useState<FirestoreChild[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState<"add" | FirestoreChild | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "children"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setChildren(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreChild)));
      setLoading(false);
    });
  }, []);

  const handleAdd = async (data: Omit<FirestoreChild, "id">) => {
    await addDoc(collection(db, "children"), { ...data, createdAt: serverTimestamp() });
    toast.success("Child added.");
  };

  const handleEdit = async (child: FirestoreChild, data: Omit<FirestoreChild, "id">) => {
    await updateDoc(doc(db, "children", child.id), data as Record<string, unknown>);
    toast.success("Child updated.");
  };

  const handleDelete = async (child: FirestoreChild) => {
    if (!confirm(`Delete ${child.name}? This cannot be undone.`)) return;
    setDeleting(child.id);
    try {
      await deleteDoc(doc(db, "children", child.id));
      toast.success("Child removed.");
    } catch { toast.error("Delete failed."); }
    finally { setDeleting(null); }
  };

  const handleToggleSponsored = async (child: FirestoreChild) => {
    try {
      await updateDoc(doc(db, "children", child.id), { isSponsored: !child.isSponsored });
    } catch { toast.error("Update failed."); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-800">Child Profile Manager</h2>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 bg-[#1B5E37] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#0d3320]"
        >
          <Plus size={15} /> Add Child
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <span className="h-7 w-7 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : children.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">👦</p>
          <p className="text-sm">No children in Firestore yet. Click &quot;Add Child&quot; to start.</p>
          <p className="text-xs mt-1 text-gray-300">The /sponsor page will show static fallback data until children are added here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 font-medium">Child</th>
                <th className="px-4 py-3 font-medium">Age</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Story</th>
                <th className="px-4 py-3 font-medium text-center">Sponsored</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {children.map((child) => (
                <tr key={child.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={child.photo ?? `https://picsum.photos/seed/${child.imageSeed ?? 100}/36/36`}
                        alt={child.name}
                        width={36} height={36}
                        className="rounded-full object-cover shrink-0"
                      />
                      <span className="font-medium text-gray-800">{child.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{child.age}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-[#1B5E37]/10 text-[#1B5E37] text-xs font-medium px-2 py-0.5 rounded-full capitalize">
                      {CATEGORIES.find((c) => c.value === child.category)?.label ?? child.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate text-xs">{child.story}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleSponsored(child)}
                      className={`w-8 h-5 rounded-full transition-colors relative ${child.isSponsored ? "bg-[#1B5E37]" : "bg-gray-200"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${child.isSponsored ? "right-0.5" : "left-0.5"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setModal(child)}
                        className="p-1.5 text-gray-400 hover:text-[#1B5E37] hover:bg-[#1B5E37]/10 rounded-lg transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(child)}
                        disabled={deleting === child.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deleting === child.id ? <span className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin block" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal === "add" && (
        <ChildFormModal
          onClose={() => setModal(null)}
          onSave={handleAdd}
        />
      )}
      {modal && modal !== "add" && (
        <ChildFormModal
          initial={modal}
          onClose={() => setModal(null)}
          onSave={(data) => handleEdit(modal, data)}
        />
      )}
    </div>
  );
}

// ─── Section B: Active Sponsorships ───────────────────────────────────────────

function SponsorshipsTable({ children }: { children: FirestoreChild[] }) {
  const [sponsorships,  setSponsorships]  = useState<Sponsorship[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [downloading,   setDownloading]   = useState<string | null>(null);
  const [cancelling,    setCancelling]    = useState<string | null>(null);
  const [recording,     setRecording]     = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "sponsorships"), orderBy("startDate", "desc"));
    return onSnapshot(q, (snap) => {
      setSponsorships(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Sponsorship)));
      setLoading(false);
    });
  }, []);

  const handleCert = async (s: Sponsorship) => {
    const child = children.find((c) => c.id === s.childId);
    setDownloading(s.id);
    try {
      await generateSponsorCert({ id: s.id, sponsorName: s.sponsorName, childName: child?.name ?? s.childName, amount: s.amount, startDate: s.startDate });
      toast.success("Certificate downloaded.");
    } catch { toast.error("Could not generate certificate."); }
    finally { setDownloading(null); }
  };

  const handleCancel = async (s: Sponsorship) => {
    if (!confirm(`Cancel ${s.sponsorName}'s sponsorship?`)) return;
    setCancelling(s.id);
    try {
      await updateDoc(doc(db, "sponsorships", s.id), { status: "cancelled", isActive: false });
      if (s.childId) {
        await updateDoc(doc(db, "children", s.childId), { isSponsored: false });
      }
      toast.success("Sponsorship cancelled.");
    } catch { toast.error("Could not cancel."); }
    finally { setCancelling(null); }
  };

  const handleRecordPayment = async (s: Sponsorship) => {
    setRecording(s.id);
    try {
      const record: PaymentRecord = {
        date:   new Date().toISOString(),
        amount: s.amount,
        note:   "Manual payment record",
      };
      await updateDoc(doc(db, "sponsorships", s.id), {
        paymentHistory: arrayUnion(record),
      });
      toast.success("Payment recorded.");
    } catch { toast.error("Could not record payment."); }
    finally { setRecording(null); }
  };

  const handleWhatsApp = (s: Sponsorship) => {
    if (!s.phone) { toast.error("No phone number saved for this sponsor."); return; }
    const child   = children.find((c) => c.id === s.childId);
    const months  = monthsActive(s.startDate);
    const message = encodeURIComponent(
      `Namaste ${s.sponsorName}! 🙏\n\nThank you for sponsoring ${child?.name ?? "your child"} for ${months} month(s) with Seva Group Foundation.\n\nYour Rs.500/month is making a real difference in ${child?.name ?? "their"}'s life — covering meals, school fees, and care.\n\nThank you for your kindness! 💚\n— Seva Group Foundation`
    );
    window.open(`https://wa.me/91${s.phone.replace(/\D/g, "")}?text=${message}`, "_blank");
  };

  const active   = sponsorships.filter((s) => s.isActive).length;
  const inactive = sponsorships.length - active;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-gray-800">Active Sponsorships</h2>
          <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">{active} Active</span>
          {inactive > 0 && <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full">{inactive} Inactive</span>}
        </div>
        <button
          onClick={() => exportCSV(sponsorships, children)}
          className="flex items-center gap-2 text-sm border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:border-[#1B5E37] hover:text-[#1B5E37] transition-colors"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <span className="h-7 w-7 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sponsorships.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">❤️</p>
          <p className="text-sm">No sponsorships yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 font-medium">Sponsor</th>
                <th className="px-4 py-3 font-medium">Child</th>
                <th className="px-4 py-3 font-medium">Email / Phone</th>
                <th className="px-4 py-3 font-medium">Start Date</th>
                <th className="px-4 py-3 font-medium text-center">Months</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sponsorships.map((s) => {
                const child  = children.find((c) => c.id === s.childId);
                const months = monthsActive(s.startDate);
                return (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{s.sponsorName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Image
                          src={child?.photo ?? `https://picsum.photos/seed/${child?.imageSeed ?? 100}/28/28`}
                          alt={child?.name ?? "Child"}
                          width={28} height={28}
                          className="rounded-full object-cover shrink-0"
                        />
                        <div>
                          <p className="font-medium text-gray-700">{child?.name ?? s.childName ?? "—"}</p>
                          <p className="text-xs text-gray-400 capitalize">{child?.category ?? ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-600 text-xs">{s.email ?? "—"}</p>
                      <p className="text-gray-400 text-xs">{s.phone ? `+91 ${s.phone}` : "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{fmtDate(s.startDate)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-[#1B5E37]">{months}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        s.status === "active" || s.isActive
                          ? "bg-green-100 text-green-700"
                          : s.status === "cancelled"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {s.status === "active" || s.isActive ? <CheckCircle size={10} /> : null}
                        {s.status ?? (s.isActive ? "active" : "inactive")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Record Payment */}
                        <button
                          onClick={() => handleRecordPayment(s)}
                          disabled={recording === s.id || !s.isActive}
                          title="Record Payment"
                          className="text-xs text-[#1B5E37] border border-[#1B5E37]/30 rounded-lg px-2 py-1 hover:bg-[#1B5E37]/5 disabled:opacity-40 whitespace-nowrap"
                        >
                          {recording === s.id ? "…" : "💳 Record"}
                        </button>
                        {/* Download Cert */}
                        <button
                          onClick={() => handleCert(s)}
                          disabled={downloading === s.id}
                          title="Download Certificate"
                          className="text-xs text-blue-600 border border-blue-200 rounded-lg px-2 py-1 hover:bg-blue-50 disabled:opacity-40"
                        >
                          {downloading === s.id ? "…" : "📜 Cert"}
                        </button>
                        {/* Send WhatsApp */}
                        <button
                          onClick={() => handleWhatsApp(s)}
                          title="Send WhatsApp Update"
                          className="p-1.5 text-[#25D366] border border-[#25D366]/30 rounded-lg hover:bg-[#25D366]/10 transition-colors"
                        >
                          <MessageSquare size={13} />
                        </button>
                        {/* Cancel */}
                        {s.isActive && (
                          <button
                            onClick={() => handleCancel(s)}
                            disabled={cancelling === s.id}
                            title="Cancel Sponsorship"
                            className="p-1.5 text-red-400 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                          >
                            {cancelling === s.id ? <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin block" /> : <Ban size={13} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SponsorshipManagerPage() {
  const [children, setChildren] = useState<FirestoreChild[]>([]);

  useEffect(() => {
    const q = query(collection(db, "children"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setChildren(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreChild)));
    });
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Sponsorships</h1>

      {/* Section A */}
      <ChildProfileManager />

      {/* Section B */}
      <SponsorshipsTable children={children} />
    </div>
  );
}
