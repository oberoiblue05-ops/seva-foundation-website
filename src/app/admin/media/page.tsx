"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { collection, query, orderBy, getDocs, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { Copy, Trash2, Upload, CheckCircle } from "lucide-react";

interface MediaItem {
  id:         string;
  url:        string;
  publicId:   string;
  filename:   string;
  size:       number;
  width:      number;
  height:     number;
  uploadedAt: string;
}

function fmtSize(bytes: number) {
  if (bytes < 1024)       return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function MediaManagerPage() {
  const [items,     setItems]     = useState<MediaItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [copied,    setCopied]    = useState<string | null>(null);
  const [deleting,  setDeleting]  = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "media"), orderBy("uploadedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MediaItem)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const uploadFiles = useCallback(async (files: File[]) => {
    setUploading(true);
    setProgress(0);
    const total = files.length;
    let done = 0;
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res  = await fetch("/api/media/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        done++;
        setProgress(Math.round((done / total) * 100));
      } catch (err: unknown) {
        toast.error(`${file.name}: ${(err as Error).message}`);
      }
    }
    setUploading(false);
    if (done > 0) toast.success(`${done} file${done > 1 ? "s" : ""} uploaded!`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxSize: 10 * 1024 * 1024,
    onDrop:  uploadFiles,
    onDropRejected: (rejections) => {
      rejections.forEach((r) => {
        const err = r.errors[0];
        toast.error(err?.code === "file-too-large" ? `${r.file.name} exceeds 10 MB` : `${r.file.name}: ${err?.message}`);
      });
    },
  });

  const handleCopy = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Delete "${item.filename}"? This cannot be undone.`)) return;
    setDeleting(item.id);
    try {
      const res = await fetch("/api/media/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: item.publicId, docId: item.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Deleted.");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Media Manager</h1>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
          ${isDragActive
            ? "border-[#1B5E37] bg-[#1B5E37]/5"
            : "border-gray-200 hover:border-[#1B5E37] hover:bg-gray-50"
          }`}
      >
        <input {...getInputProps()} />
        <Upload size={32} className="mx-auto text-gray-300 mb-3" />
        {isDragActive ? (
          <p className="text-[#1B5E37] font-medium">Drop images here…</p>
        ) : (
          <>
            <p className="text-gray-600 font-medium">Drag & drop images here</p>
            <p className="text-gray-400 text-sm mt-1">or click to browse · JPEG, PNG, WebP · max 10 MB</p>
          </>
        )}
        {uploading && (
          <div className="mt-4 space-y-1">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1B5E37] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">Uploading… {progress}%</p>
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🖼️</p>
          <p>No media yet. Upload your first image above.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400">{items.length} file{items.length !== 1 ? "s" : ""}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-square bg-gray-50">
                    <Image
                      src={item.url}
                      alt={item.filename}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  </div>

                  {/* Meta */}
                  <div className="p-3">
                    <p className="text-xs font-medium text-gray-700 truncate">{item.filename}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {fmtSize(item.size)}  ·  {fmtDate(item.uploadedAt)}
                    </p>
                    {item.width && (
                      <p className="text-[10px] text-gray-400">{item.width}×{item.height}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleCopy(item.url, item.id)}
                        className="flex-1 flex items-center justify-center gap-1 border border-gray-200 rounded-lg py-1.5
                          text-[11px] text-gray-500 hover:border-[#1B5E37] hover:text-[#1B5E37] transition-colors"
                      >
                        {copied === item.id ? (
                          <><CheckCircle size={12} /> Copied</>
                        ) : (
                          <><Copy size={12} /> Copy URL</>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={deleting === item.id}
                        className="flex items-center justify-center w-8 border border-gray-200 rounded-lg
                          text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-40"
                      >
                        {deleting === item.id ? (
                          <span className="h-3 w-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
