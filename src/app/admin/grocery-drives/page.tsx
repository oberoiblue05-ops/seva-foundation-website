"use client";

import { useState, useEffect } from "react";
import {
  collection, query, where, orderBy, onSnapshot, addDoc, updateDoc,
  doc, serverTimestamp, limit, getDocs,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { GROCERY_ITEMS } from "@/app/(public)/donate-groceries/DonateGroceriesContent";
import {
  Plus, Save, CheckCircle, MessageCircle, Download, ChevronDown,
  ShoppingBasket, Clock, MapPin, Calendar, Edit3, X,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DriveItem { target: number; received: number; }
interface Drive {
  id:             string;
  name:           string;
  status:         "active" | "completed";
  date:           string;
  time:           string;
  location:       string;
  mapsLink?:      string;
  totalKg?:       number;
  familiesServed?: number;
  pledgeCount?:   number;
  items?:         Record<string, DriveItem>;
  createdAt?:     { toDate: () => Date };
}

interface Pledge {
  id:             string;
  name:           string;
  phone:          string;
  items:          Record<string, number>;
  dropoffMethod:  "dropoff" | "pickup";
  pickupAddress?: string;
  pickupTime?:    string;
  additionalItems?: string;
  status:         "pledged" | "confirmed" | "received" | "no-show";
  createdAt?:     { toDate: () => Date } | string;
}

const PLEDGE_STATUSES = ["pledged", "confirmed", "received", "no-show"] as const;
const STATUS_COLORS: Record<string, string> = {
  pledged:   "bg-blue-100  text-blue-700",
  confirmed: "bg-amber-100 text-amber-700",
  received:  "bg-green-100 text-green-700",
  "no-show": "bg-red-100   text-red-600",
};

const DEFAULT_DRIVE_FORM = {
  name:     "",
  date:     "",
  time:     "",
  location: "",
  mapsLink: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function Spinner({ sm }: { sm?: boolean }) {
  return (
    <span
      className={`border-2 border-t-transparent rounded-full animate-spin inline-block ${
        sm ? "h-3.5 w-3.5" : "h-5 w-5"
      } border-current`}
    />
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function GroceryDriveManagerPage() {
  const [activeDrive,     setActiveDrive]     = useState<Drive | null>(null);
  const [pledges,         setPledges]         = useState<Pledge[]>([]);
  const [loadingDrive,    setLoadingDrive]    = useState(true);
  const [loadingPledges,  setLoadingPledges]  = useState(false);

  // Drive form (create / edit)
  const [showForm,   setShowForm]   = useState(false);
  const [editMode,   setEditMode]   = useState(false);
  const [driveForm,  setDriveForm]  = useState(DEFAULT_DRIVE_FORM);
  const [savingDrive, setSavingDrive] = useState(false);

  // Received items tracker
  const [receivedQtys, setReceivedQtys] = useState<Record<string, string>>({});
  const [savingReceived, setSavingReceived] = useState(false);

  // Mark complete form
  const [showCompleteForm,  setShowCompleteForm]  = useState(false);
  const [totalKgInput,      setTotalKgInput]      = useState("");
  const [familiesInput,     setFamiliesInput]     = useState("");
  const [markingComplete,   setMarkingComplete]   = useState(false);

  // ── Load active drive ───────────────────────────────────────────────────────

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "groceryDrives"), where("status", "==", "active"), orderBy("date", "desc"), limit(1)),
      (snap) => {
        if (!snap.empty) {
          const d = snap.docs[0];
          const data = { id: d.id, ...d.data() } as Drive;
          setActiveDrive(data);

          // Seed received qty inputs from Firestore
          const seeded: Record<string, string> = {};
          GROCERY_ITEMS.forEach(({ key }) => {
            seeded[key] = String(data.items?.[key]?.received ?? 0);
          });
          setReceivedQtys(seeded);
        } else {
          setActiveDrive(null);
        }
        setLoadingDrive(false);
      },
      () => setLoadingDrive(false)
    );
    return () => unsub();
  }, []);

  // ── Load pledges ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!activeDrive?.id) { setPledges([]); return; }
    setLoadingPledges(true);
    const unsub = onSnapshot(
      query(collection(db, "groceryDrives", activeDrive.id, "pledges"), orderBy("createdAt", "desc")),
      (snap) => {
        setPledges(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Pledge)));
        setLoadingPledges(false);
      },
      () => setLoadingPledges(false)
    );
    return () => unsub();
  }, [activeDrive?.id]);

  // ── Drive CRUD ──────────────────────────────────────────────────────────────

  const openCreateForm = () => {
    setEditMode(false);
    setDriveForm(DEFAULT_DRIVE_FORM);
    setShowForm(true);
  };

  const openEditForm = () => {
    if (!activeDrive) return;
    setEditMode(true);
    setDriveForm({
      name:     activeDrive.name,
      date:     activeDrive.date,
      time:     activeDrive.time,
      location: activeDrive.location,
      mapsLink: activeDrive.mapsLink || "",
    });
    setShowForm(true);
  };

  const handleSaveDrive = async () => {
    if (!driveForm.name || !driveForm.date) { toast.error("Name and date are required."); return; }
    setSavingDrive(true);
    try {
      if (editMode && activeDrive) {
        await updateDoc(doc(db, "groceryDrives", activeDrive.id), {
          name:     driveForm.name,
          date:     driveForm.date,
          time:     driveForm.time,
          location: driveForm.location,
          mapsLink: driveForm.mapsLink,
        });
        toast.success("Drive updated.");
      } else {
        // Build default items
        const items: Record<string, DriveItem> = {};
        GROCERY_ITEMS.forEach(({ key, defaultTarget }) => {
          items[key] = { target: defaultTarget, received: 0 };
        });
        await addDoc(collection(db, "groceryDrives"), {
          ...driveForm,
          status:      "active",
          pledgeCount: 0,
          items,
          createdAt:   serverTimestamp(),
        });
        toast.success("New drive created!");
      }
      setShowForm(false);
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSavingDrive(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!activeDrive) return;
    setMarkingComplete(true);
    try {
      await updateDoc(doc(db, "groceryDrives", activeDrive.id), {
        status:         "completed",
        totalKg:        Number(totalKgInput) || 0,
        familiesServed: Number(familiesInput) || 0,
      });
      toast.success("Drive marked as complete!");
      setShowCompleteForm(false);
    } catch {
      toast.error("Failed.");
    } finally {
      setMarkingComplete(false);
    }
  };

  // ── Item targets (editable) ─────────────────────────────────────────────────

  const [targetQtys, setTargetQtys] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!activeDrive?.items) return;
    const t: Record<string, string> = {};
    GROCERY_ITEMS.forEach(({ key, defaultTarget }) => {
      t[key] = String(activeDrive.items?.[key]?.target ?? defaultTarget);
    });
    setTargetQtys(t);
  }, [activeDrive]);

  const [savingTargets, setSavingTargets] = useState(false);

  const handleSaveTargets = async () => {
    if (!activeDrive) return;
    setSavingTargets(true);
    try {
      const updates: Record<string, number> = {};
      GROCERY_ITEMS.forEach(({ key }) => {
        updates[`items.${key}.target`] = Number(targetQtys[key]) || 0;
      });
      await updateDoc(doc(db, "groceryDrives", activeDrive.id), updates);
      toast.success("Targets saved!");
    } catch {
      toast.error("Failed.");
    } finally {
      setSavingTargets(false);
    }
  };

  // ── Received Items ──────────────────────────────────────────────────────────

  const handleSaveReceived = async () => {
    if (!activeDrive) return;
    setSavingReceived(true);
    try {
      const updates: Record<string, number> = {};
      GROCERY_ITEMS.forEach(({ key }) => {
        updates[`items.${key}.received`] = Number(receivedQtys[key]) || 0;
      });
      await updateDoc(doc(db, "groceryDrives", activeDrive.id), updates);
      toast.success("Received quantities saved! Public page updated in real-time.");
    } catch {
      toast.error("Failed.");
    } finally {
      setSavingReceived(false);
    }
  };

  // ── Pledge actions ──────────────────────────────────────────────────────────

  const handleStatusChange = async (pledgeId: string, status: string) => {
    if (!activeDrive) return;
    try {
      await updateDoc(doc(db, "groceryDrives", activeDrive.id, "pledges", pledgeId), { status });
      toast.success("Status updated.");
    } catch {
      toast.error("Failed.");
    }
  };

  const handleWhatsApp = (p: Pledge) => {
    if (!activeDrive) return;
    const itemList = Object.entries(p.items)
      .map(([k, qty]) => {
        const item = GROCERY_ITEMS.find((i) => i.key === k);
        return `${item?.emoji || ""} ${item?.label || k}: ${qty} ${item?.unit || ""}`;
      })
      .join(", ");
    const msg = `Hi ${p.name}! 🙏\n\nThis is a reminder from Seva Group Foundation.\n\nYou have pledged to donate groceries for *${activeDrive.name}* on *${formatDate(activeDrive.date)}*.\n\n*Items:* ${itemList}\n*Method:* ${p.dropoffMethod === "dropoff" ? "Drop off at centre" : `Pickup (${p.pickupAddress})`}\n\nPlease confirm your attendance. Thank you! 🙏`;
    window.open(`https://wa.me/91${p.phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const exportCSV = () => {
    if (!pledges.length) return;
    const header = "Name,Phone,Items,Qty,Drop-off/Pickup,Pickup Address,Pickup Time,Additional,Status,Date";
    const rows = pledges.map((p) => {
      const itemsStr = Object.entries(p.items)
        .map(([k, q]) => {
          const item = GROCERY_ITEMS.find((i) => i.key === k);
          return `${item?.label || k}: ${q} ${item?.unit || ""}`;
        })
        .join(" | ");
      const date =
        p.createdAt && typeof (p.createdAt as { toDate?: () => Date }).toDate === "function"
          ? (p.createdAt as { toDate: () => Date }).toDate().toLocaleDateString("en-IN")
          : String(p.createdAt || "");
      return [
        `"${p.name}"`,
        p.phone,
        `"${itemsStr}"`,
        Object.values(p.items).reduce((s, q) => s + q, 0),
        p.dropoffMethod === "dropoff" ? "Drop-off" : "Pickup",
        `"${p.pickupAddress || ""}"`,
        `"${p.pickupTime || ""}"`,
        `"${p.additionalItems || ""}"`,
        p.status,
        date,
      ].join(",");
    });
    const csv  = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `pledges-${activeDrive?.name || "drive"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grocery Drives</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage drives, pledges, and received items.</p>
        </div>
        {!activeDrive && !loadingDrive && (
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 bg-[#1B5E37] text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[#0d3320] transition-colors"
          >
            <Plus size={16} /> Create New Drive
          </button>
        )}
      </div>

      {/* ── Section A: Drive Manager ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBasket size={18} className="text-[#1B5E37]" />
            Active Drive
          </h2>
          {activeDrive && (
            <div className="flex gap-2">
              <button
                onClick={openEditForm}
                className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Edit3 size={14} /> Edit
              </button>
              <button
                onClick={() => setShowCompleteForm(true)}
                className="flex items-center gap-1.5 bg-green-600 text-white rounded-xl px-3 py-2 text-sm hover:bg-green-700 transition-colors"
              >
                <CheckCircle size={14} /> Mark Complete
              </button>
              <button
                onClick={openCreateForm}
                className="flex items-center gap-1.5 bg-[#1B5E37] text-white rounded-xl px-3 py-2 text-sm hover:bg-[#0d3320] transition-colors"
              >
                <Plus size={14} /> New Drive
              </button>
            </div>
          )}
        </div>

        <div className="p-6">
          {loadingDrive ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : !activeDrive ? (
            <div className="text-center py-10 text-gray-400">
              <ShoppingBasket size={36} className="mx-auto mb-3 opacity-40" />
              <p>No active drive. Create one to get started.</p>
              <button
                onClick={openCreateForm}
                className="mt-4 inline-flex items-center gap-2 bg-[#1B5E37] text-white rounded-xl px-5 py-2.5 text-sm font-medium"
              >
                <Plus size={16} /> Create New Drive
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Drive Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block rounded-full bg-green-100 text-green-700 text-xs font-bold px-3 py-1 uppercase">
                    Active
                  </span>
                  <span className="text-sm font-medium text-gray-500">
                    {activeDrive.pledgeCount || 0} pledges received
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{activeDrive.name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-[#1B5E37]" />
                    {formatDate(activeDrive.date)}
                  </div>
                  {activeDrive.time && (
                    <div className="flex items-center gap-2">
                      <Clock size={15} className="text-[#1B5E37]" />
                      {activeDrive.time}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="text-[#1B5E37]" />
                    {activeDrive.location}
                  </div>
                </div>
              </div>

              {/* Item Targets (editable) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-700">Target Quantities</p>
                  <button
                    onClick={handleSaveTargets}
                    disabled={savingTargets}
                    className="flex items-center gap-1.5 bg-[#1B5E37] text-white rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-60"
                  >
                    {savingTargets ? <Spinner sm /> : <Save size={12} />}
                    Save Targets
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {GROCERY_ITEMS.map(({ key, label, unit, emoji }) => (
                    <div key={key} className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
                      <span className="text-base">{emoji}</span>
                      <span className="text-xs text-gray-600 flex-1 min-w-0 truncate">{label}</span>
                      <input
                        type="number"
                        min="0"
                        value={targetQtys[key] ?? ""}
                        onChange={(e) => setTargetQtys((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-14 text-xs border border-gray-200 rounded-lg px-2 py-1 text-center outline-none focus:border-[#1B5E37]"
                      />
                      <span className="text-[10px] text-gray-400">{unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Drive form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-800">
              {editMode ? "Edit Drive" : "Create New Drive"}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Drive Name", key: "name", placeholder: "e.g. August 2025 Monthly Grocery Drive" },
              { label: "Date", key: "date", type: "date" },
              { label: "Time", key: "time", placeholder: "e.g. 10:00 AM – 4:00 PM" },
              { label: "Location", key: "location", placeholder: "Street No.3, Block D, Saraswati Kunj…" },
              { label: "Google Maps Link (optional)", key: "mapsLink", placeholder: "https://maps.google.com/…" },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key} className={key === "name" || key === "mapsLink" ? "sm:col-span-2" : ""}>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
                <input
                  type={type || "text"}
                  placeholder={placeholder || ""}
                  value={driveForm[key as keyof typeof driveForm]}
                  onChange={(e) => setDriveForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDrive}
              disabled={savingDrive}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1B5E37] text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {savingDrive ? <Spinner sm /> : <Save size={14} />}
              {editMode ? "Update Drive" : "Create Drive"}
            </button>
          </div>
        </div>
      )}

      {/* Mark complete modal */}
      {showCompleteForm && activeDrive && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-800">Mark Drive as Complete</h3>
            <button onClick={() => setShowCompleteForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            This will move <strong>{activeDrive.name}</strong> to the Past Drives section on the public page.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Total Collected (kg)</label>
              <input
                type="number"
                value={totalKgInput}
                onChange={(e) => setTotalKgInput(e.target.value)}
                placeholder="e.g. 280"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Families Served</label>
              <input
                type="number"
                value={familiesInput}
                onChange={(e) => setFamiliesInput(e.target.value)}
                placeholder="e.g. 45"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCompleteForm(false)}
              className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleMarkComplete}
              disabled={markingComplete}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {markingComplete ? <Spinner sm /> : <CheckCircle size={14} />}
              Confirm & Mark Complete
            </button>
          </div>
        </div>
      )}

      {/* ── Section B: Pledges Table ── */}
      {activeDrive && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">
              Pledges ({pledges.length})
            </h2>
            <button
              onClick={exportCSV}
              disabled={pledges.length === 0}
              className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>

          {loadingPledges ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : pledges.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No pledges yet for this drive.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    {["Name", "Phone", "Items Pledged", "Method", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase px-4 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pledges.map((p) => {
                    const itemsList = Object.entries(p.items)
                      .map(([k, q]) => {
                        const item = GROCERY_ITEMS.find((i) => i.key === k);
                        return `${item?.emoji || ""} ${item?.label || k} ×${q}`;
                      })
                      .join(", ");

                    return (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">+91 {p.phone}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                          <p className="truncate" title={itemsList}>{itemsList}</p>
                          {p.additionalItems && (
                            <p className="text-xs text-gray-400 mt-0.5">+{p.additionalItems}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.dropoffMethod === "dropoff" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                            {p.dropoffMethod === "dropoff" ? "Drop-off" : "Pickup"}
                          </span>
                          {p.dropoffMethod === "pickup" && p.pickupAddress && (
                            <p className="text-xs text-gray-400 mt-1 max-w-[140px] truncate" title={p.pickupAddress}>
                              {p.pickupAddress}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={p.status}
                            onChange={(e) => handleStatusChange(p.id, e.target.value)}
                            className={`rounded-lg border-0 px-2 py-1 text-xs font-medium cursor-pointer outline-none ${STATUS_COLORS[p.status] ?? ""}`}
                          >
                            {PLEDGE_STATUSES.map((s) => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleWhatsApp(p)}
                            className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 hover:bg-green-100 rounded-lg px-3 py-1.5 transition-colors"
                          >
                            <MessageCircle size={12} />
                            Remind
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Section C: Received Items Tracker ── */}
      {activeDrive && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-gray-800">Received Items Tracker</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Enter received quantities. Saves in real-time to the public page.
              </p>
            </div>
            <button
              onClick={handleSaveReceived}
              disabled={savingReceived}
              className="flex items-center gap-2 bg-[#1B5E37] text-white rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {savingReceived ? <Spinner sm /> : <Save size={14} />}
              Save Received
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {GROCERY_ITEMS.map(({ key, label, unit, emoji, defaultTarget }) => {
              const target  = activeDrive.items?.[key]?.target ?? defaultTarget;
              const received = Number(receivedQtys[key]) || 0;
              const pct     = target > 0 ? Math.round((received / target) * 100) : 0;

              return (
                <div key={key} className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{emoji}</span>
                    <span className="text-xs font-medium text-gray-700 leading-tight">{label}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="number"
                      min="0"
                      max={target * 2}
                      value={receivedQtys[key] ?? ""}
                      onChange={(e) =>
                        setReceivedQtys((p) => ({ ...p, [key]: e.target.value }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-center outline-none focus:border-[#1B5E37]"
                    />
                    <span className="text-xs text-gray-400 shrink-0">{unit}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        background: pct >= 100 ? "#22c55e" : "linear-gradient(90deg, #1B5E37, #F5A623)",
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 text-right">
                    {pct}% of {target} {unit} target
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
