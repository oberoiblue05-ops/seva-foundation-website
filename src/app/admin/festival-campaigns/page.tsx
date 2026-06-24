"use client";

import { useState, useEffect } from "react";
import {
  collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface FestivalCampaign {
  id:          string;
  festival:    string;
  title:       string;
  description: string;
  startDate:   string;
  endDate:     string;
  targetAmount: number;
  isActive:    boolean;
  createdAt:   string;
}

const FESTIVALS = ["Diwali", "Eid", "Christmas", "Holi", "Navratri", "Raksha Bandhan", "Independence Day", "Republic Day", "New Year", "Other"];

export default function FestivalCampaignsPage() {
  const [campaigns, setCampaigns] = useState<FestivalCampaign[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [form, setForm] = useState({ festival: "Diwali", title: "", description: "", startDate: "", endDate: "", targetAmount: 50000, isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "festivalCampaigns"), orderBy("startDate", "desc"));
    return onSnapshot(q, (snap) => {
      setCampaigns(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FestivalCampaign)));
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!form.title || !form.startDate) { toast.error("Title and start date required."); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, "festivalCampaigns"), { ...form, createdAt: new Date().toISOString() });
      toast.success("Festival campaign created!");
      setForm({ festival: "Diwali", title: "", description: "", startDate: "", endDate: "", targetAmount: 50000, isActive: true });
      setShowForm(false);
    } catch { toast.error("Save failed."); }
    finally { setSaving(false); }
  };

  const handleToggle = async (c: FestivalCampaign) => {
    await updateDoc(doc(db, "festivalCampaigns", c.id), { isActive: !c.isActive });
    toast.success(c.isActive ? "Campaign deactivated." : "Campaign activated.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    await deleteDoc(doc(db, "festivalCampaigns", id));
    toast.success("Deleted.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Festival Campaigns</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-[#1B5E37] text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[#0d3320]">
          <Plus size={16} /> New Campaign
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-700">New Festival Campaign</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Festival</label>
              <select value={form.festival} onChange={(e) => setForm((f) => ({ ...f, festival: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]">
                {FESTIVALS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Campaign Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Target Amount (Rs.)</label>
              <input type="number" min={0} value={form.targetAmount} onChange={(e) => setForm((f) => ({ ...f, targetAmount: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="rounded text-[#1B5E37]" />
                <span className="text-sm text-gray-700">Activate immediately</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37] resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-[#1B5E37] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#0d3320] disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Create Campaign"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📅</p>
          <p>No festival campaigns yet. Create one above.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {campaigns.map((c) => (
            <div key={c.id} className={`bg-white border rounded-2xl p-5 shadow-sm ${c.isActive ? "border-green-200" : "border-gray-100"}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-xs text-[#F5A623] font-semibold uppercase tracking-wide">{c.festival}</span>
                  <h3 className="font-semibold text-gray-800 mt-0.5">{c.title}</h3>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {c.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {c.description && <p className="text-sm text-gray-500 mb-3">{c.description}</p>}
              <div className="text-xs text-gray-400 space-y-0.5 mb-4">
                <p>📅 {new Date(c.startDate).toLocaleDateString("en-IN")} → {c.endDate ? new Date(c.endDate).toLocaleDateString("en-IN") : "Open"}</p>
                <p>🎯 Target: Rs. {c.targetAmount.toLocaleString("en-IN")}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleToggle(c)}
                  className={`flex items-center gap-1.5 flex-1 border rounded-xl py-2 text-xs font-medium transition-colors
                    ${c.isActive ? "border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500" : "border-green-200 text-green-600 hover:bg-green-50"}`}>
                  {c.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  {c.isActive ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => handleDelete(c.id)} className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
