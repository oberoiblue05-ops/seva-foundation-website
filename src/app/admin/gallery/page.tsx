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
import { Plus, Pencil, Trash2, Star } from "lucide-react";

const CATEGORIES = ["All", "Education", "Food Relief", "Medical", "Events", "Volunteers", "Nature", "Community"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

interface GalleryItem {
  id:        string;
  url:       string;
  publicId:  string;
  caption:   string;
  category:  string;
  year:      number;
  featured:  boolean;
  addedAt:   string;
}

interface GalleryForm {
  url:      string;
  publicId: string;
  caption:  string;
  category: string;
  year:     number;
  featured: boolean;
}

const EMPTY_FORM: GalleryForm = {
  url: "", publicId: "", caption: "", category: "Community", year: CURRENT_YEAR, featured: false,
};

export default function GalleryManagerPage() {
  const [items,       setItems]       = useState<GalleryItem[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [showPicker,  setShowPicker]  = useState(false);
  const [form,        setForm]        = useState<GalleryForm>(EMPTY_FORM);
  const [editId,      setEditId]      = useState<string | null>(null);
  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("addedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryItem)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (item: GalleryItem) => {
    setForm({ url: item.url, publicId: item.publicId, caption: item.caption, category: item.category, year: item.year, featured: item.featured });
    setEditId(item.id);
    setShowModal(true);
  };

  const handlePickImage = (media: MediaItem) => {
    setForm((f) => ({ ...f, url: media.url, publicId: media.publicId }));
  };

  const handleSave = async () => {
    if (!form.url) { toast.error("Please select an image."); return; }
    if (!form.caption.trim()) { toast.error("Caption is required."); return; }
    setSaving(true);
    try {
      if (editId) {
        await updateDoc(doc(db, "gallery", editId), { ...form });
        toast.success("Gallery item updated.");
      } else {
        await addDoc(collection(db, "gallery"), { ...form, addedAt: new Date().toISOString() });
        toast.success("Added to gallery!");
      }
      setShowModal(false);
    } catch {
      toast.error("Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this item from gallery?")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "gallery", id));
      toast.success("Removed.");
    } catch {
      toast.error("Delete failed.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gallery Manager</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#1B5E37] text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[#0d3320] transition-colors"
        >
          <Plus size={16} /> Add to Gallery
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🖼️</p>
          <p>No gallery items yet. Add your first image.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="relative aspect-square bg-gray-50">
                <Image src={item.url} alt={item.caption} fill className="object-cover" sizes="250px" />
                {item.featured && (
                  <span className="absolute top-2 left-2 bg-[#F5A623] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star size={10} /> Featured
                  </span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button onClick={() => openEdit(item)} className="bg-white rounded-lg p-2 shadow hover:bg-gray-50 transition-colors">
                    <Pencil size={14} className="text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="bg-white rounded-lg p-2 shadow hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-gray-800 truncate">{item.caption}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.category} · {item.year}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{editId ? "Edit Gallery Item" : "Add to Gallery"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Image preview / picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                {form.url ? (
                  <div className="relative h-40 bg-gray-50 rounded-xl overflow-hidden">
                    <Image src={form.url} alt="preview" fill className="object-cover" sizes="400px" />
                    <button
                      onClick={() => setShowPicker(true)}
                      className="absolute bottom-2 right-2 bg-white border border-gray-200 text-xs px-3 py-1 rounded-lg shadow hover:bg-gray-50"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPicker(true)}
                    className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-[#1B5E37] hover:text-[#1B5E37] transition-all text-sm"
                  >
                    + Select from Media Library
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Caption</label>
                <input
                  type="text"
                  value={form.caption}
                  onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
                  placeholder="Describe the image…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
                  <select
                    value={form.year}
                    onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]"
                  >
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  className="rounded text-[#1B5E37] focus:ring-[#1B5E37]"
                />
                <span className="text-sm text-gray-700">Mark as Featured</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-[#1B5E37] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#0d3320] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPicker && (
        <MediaPickerModal onSelect={handlePickImage} onClose={() => setShowPicker(false)} />
      )}
    </div>
  );
}
