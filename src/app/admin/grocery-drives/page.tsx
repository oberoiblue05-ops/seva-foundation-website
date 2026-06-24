"use client";

import { useState, useEffect } from "react";
import {
  collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { Plus, Trash2 } from "lucide-react";

interface GroceryDrive {
  id:          string;
  title:       string;
  date:        string;
  location:    string;
  description: string;
  createdAt:   string;
}

export default function GroceryDriveManagerPage() {
  const [drives,  setDrives]  = useState<GroceryDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", date: "", location: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "groceryDrives"), orderBy("date", "desc"));
    return onSnapshot(q, (snap) => {
      setDrives(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GroceryDrive)));
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!form.title || !form.date) { toast.error("Title and date required."); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, "groceryDrives"), { ...form, createdAt: new Date().toISOString() });
      toast.success("Drive scheduled!");
      setForm({ title: "", date: "", location: "", description: "" });
      setShowForm(false);
    } catch { toast.error("Save failed."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this drive?")) return;
    await deleteDoc(doc(db, "groceryDrives", id));
    toast.success("Deleted.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Grocery Drives</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-[#1B5E37] text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[#0d3320]">
          <Plus size={16} /> Schedule Drive
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-700">New Grocery Drive</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-[#1B5E37] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#0d3320] disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Save Drive"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : drives.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🛒</p>
          <p>No grocery drives scheduled. Add your first drive.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drives.map((d) => (
            <div key={d.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-800">{d.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">📅 {new Date(d.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                {d.location && <p className="text-sm text-gray-500">📍 {d.location}</p>}
                {d.description && <p className="text-sm text-gray-400 mt-1">{d.description}</p>}
              </div>
              <button onClick={() => handleDelete(d.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
