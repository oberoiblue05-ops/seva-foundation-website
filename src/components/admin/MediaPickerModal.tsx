"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

interface MediaItem {
  id:         string;
  url:        string;
  publicId:   string;
  filename:   string;
  width:      number;
  height:     number;
  uploadedAt: string;
}

interface Props {
  onSelect: (item: MediaItem) => void;
  onClose:  () => void;
}

export default function MediaPickerModal({ onSelect, onClose }: Props) {
  const [items,   setItems]   = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    (async () => {
      const snap = await getDocs(query(collection(db, "media"), orderBy("uploadedAt", "desc")));
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MediaItem)));
      setLoading(false);
    })();
  }, []);

  const filtered = items.filter((i) =>
    i.filename?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Select Image</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-50">
          <input
            type="text"
            placeholder="Search by filename…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#1B5E37]"
          />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="h-8 w-8 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No images found. Upload some in Media Manager.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item); onClose(); }}
                  className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-[#1B5E37] transition-all"
                >
                  <Image
                    src={item.url}
                    alt={item.filename}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="120px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export type { MediaItem };
