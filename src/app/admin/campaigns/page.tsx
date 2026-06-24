"use client";

import { useState, useEffect } from "react";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc,
} from "firebase/firestore";
import toast from "react-hot-toast";
import Image from "next/image";
import { db } from "@/lib/firebase";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface Campaign {
  id:          string;
  title:       string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  deadline?:   string;
  coverImage:  string;
  isActive:    boolean;
  createdAt:   string;
}

interface CampaignForm {
  title:        string;
  description:  string;
  targetAmount: number;
  deadline:     string;
  coverImage:   string;
  isActive:     boolean;
}

const EMPTY: CampaignForm = {
  title: "", description: "", targetAmount: 100000, deadline: "", coverImage: "", isActive: true,
};

function fmtRs(n: number) {
  return "Rs. " + n.toLocaleString("en-IN");
}

function ProgressBar({ raised, target }: { raised: number; target: number }) {
  const pct = target > 0 ? Math.min((raised / target) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{fmtRs(raised)} raised</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#1B5E37] rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1">Goal: {fmtRs(target)}</p>
    </div>
  );
}

export default function CampaignManagerPage() {
  const [campaigns,   setCampaigns]   = useState<Campaign[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [showPicker,  setShowPicker]  = useState(false);
  const [form,        setForm]        = useState<CampaignForm>(EMPTY);
  const [editId,      setEditId]      = useState<string | null>(null);
  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "campaigns"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setCampaigns(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Campaign)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowModal(true); };
  const openEdit = (c: Campaign) => {
    setForm({ title: c.title, description: c.description, targetAmount: c.targetAmount, deadline: c.deadline ?? "", coverImage: c.coverImage, isActive: c.isActive });
    setEditId(c.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title required."); return; }
    if (form.targetAmount <= 0) { toast.error("Target amount must be positive."); return; }
    setSaving(true);
    try {
      const data = { ...form, updatedAt: new Date().toISOString() };
      if (editId) {
        await updateDoc(doc(db, "campaigns", editId), data);
        toast.success("Campaign updated.");
      } else {
        await addDoc(collection(db, "campaigns"), { ...data, raisedAmount: 0, createdAt: new Date().toISOString() });
        toast.success("Campaign created!");
      }
      setShowModal(false);
    } catch {
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (c: Campaign) => {
    await updateDoc(doc(db, "campaigns", c.id), { isActive: !c.isActive });
    toast.success(c.isActive ? "Campaign deactivated." : "Campaign activated.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "campaigns", id));
      toast.success("Deleted.");
    } catch { toast.error("Delete failed."); }
    finally { setDeleting(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#1B5E37] text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[#0d3320]">
          <Plus size={16} /> New Campaign
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🎯</p>
          <p>No campaigns yet. Create your first fundraising campaign.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c) => (
            <div key={c.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all
              ${c.isActive ? "border-gray-100" : "border-gray-100 opacity-60"}`}>
              {c.coverImage && (
                <div className="relative h-36 bg-gray-50">
                  <Image src={c.coverImage} alt={c.title} fill className="object-cover" sizes="350px" />
                  <span className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              )}
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-gray-800 leading-tight">{c.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{c.description}</p>
                <ProgressBar raised={c.raisedAmount || 0} target={c.targetAmount} />
                {c.deadline && (
                  <p className="text-xs text-gray-400">Deadline: {new Date(c.deadline).toLocaleDateString("en-IN")}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleToggle(c)} className={`flex items-center gap-1.5 flex-1 border rounded-xl py-2 text-xs font-medium transition-colors
                    ${c.isActive ? "border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500" : "border-green-200 text-green-600 hover:bg-green-50"}`}>
                    {c.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {c.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => openEdit(c)} className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deleting === c.id}
                    className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-800">{editId ? "Edit Campaign" : "New Campaign"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Target (Rs.)</label>
                  <input type="number" min={1} value={form.targetAmount}
                    onChange={(e) => setForm((f) => ({ ...f, targetAmount: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Deadline</label>
                  <input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]" />
                </div>
              </div>
              {/* Cover image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Image</label>
                {form.coverImage ? (
                  <div className="relative h-32 rounded-xl overflow-hidden">
                    <Image src={form.coverImage} alt="cover" fill className="object-cover" sizes="450px" />
                    <button onClick={() => setShowPicker(true)}
                      className="absolute bottom-2 right-2 bg-white border text-xs px-3 py-1 rounded-lg shadow hover:bg-gray-50">
                      Change
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowPicker(true)}
                    className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-[#1B5E37] text-sm transition-all">
                    + Select from Media Library
                  </button>
                )}
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="rounded text-[#1B5E37]" />
                <span className="text-sm text-gray-700">Active (shown on donations page)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-[#1B5E37] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#0d3320] disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Save Campaign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPicker && (
        <MediaPickerModal onSelect={(m: MediaItem) => setForm((f) => ({ ...f, coverImage: m.url }))} onClose={() => setShowPicker(false)} />
      )}
    </div>
  );
}
