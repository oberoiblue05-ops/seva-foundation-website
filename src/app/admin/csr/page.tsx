"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface CSRInquiry {
  id:          string;
  company:     string;
  contact:     string;
  email:       string;
  phone:       string;
  tier:        string;
  message:     string;
  submittedAt: string;
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function CSRInquiriesPage() {
  const [inquiries, setInquiries] = useState<CSRInquiry[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState<CSRInquiry | null>(null);

  useEffect(() => {
    const q = query(collection(db, "csrInquiries"), orderBy("submittedAt", "desc"));
    return onSnapshot(q, (snap) => {
      setInquiries(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CSRInquiry)));
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">CSR Inquiries</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">💼</p>
          <p>No CSR inquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              onClick={() => setSelected(inq)}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">{inq.company}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{inq.contact} · {inq.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs bg-[#1B5E37]/10 text-[#1B5E37] px-2 py-0.5 rounded-full font-medium capitalize">{inq.tier}</span>
                  <p className="text-xs text-gray-400 mt-1">{inq.submittedAt ? fmtDate(inq.submittedAt) : "—"}</p>
                </div>
              </div>
              {inq.message && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{inq.message}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">CSR Inquiry</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {[
                ["Company",  selected.company],
                ["Contact",  selected.contact],
                ["Email",    selected.email],
                ["Phone",    selected.phone],
                ["Tier",     selected.tier],
                ["Date",     selected.submittedAt ? fmtDate(selected.submittedAt) : "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-4">
                  <span className="text-sm text-gray-400 w-20 shrink-0">{label}</span>
                  <span className="text-sm font-medium text-gray-700 capitalize">{value}</span>
                </div>
              ))}
              {selected.message && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Message</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{selected.message}</p>
                </div>
              )}
              <a
                href={`mailto:${selected.email}?subject=Re: CSR Partnership with Seva Group Foundation`}
                className="block w-full bg-[#1B5E37] text-white rounded-xl py-2.5 text-sm font-medium text-center hover:bg-[#0d3320] transition-colors"
              >
                Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
