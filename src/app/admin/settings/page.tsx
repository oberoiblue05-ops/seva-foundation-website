"use client";

import { useState, useEffect } from "react";
import {
  doc, getDoc, setDoc,
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, query, orderBy,
} from "firebase/firestore";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import toast from "react-hot-toast";
import Image from "next/image";
import { db, auth } from "@/lib/firebase";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";
import { Plus, Pencil, Trash2, Save } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactInfo {
  address: string;
  phone:   string;
  email:   string;
  hours:   string;
}

interface SocialLinks {
  facebook:  string;
  instagram: string;
  twitter:   string;
  youtube:   string;
  linkedin:  string;
  whatsapp:  string;
}

interface SiteContent {
  heroHeadline:    string;
  heroSubHeadline: string;
  aboutStory:      string;
  footerTagline:   string;
}

interface TeamMember {
  id:        string;
  name:      string;
  role:      string;
  photo:     string;
  linkedin:  string;
  bio:       string;
  sortOrder: number;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h2 className="font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Contact Info ─────────────────────────────────────────────────────────────

function ContactSection() {
  const [data,   setData]   = useState<ContactInfo>({ address: "", phone: "", email: "", hours: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "settings", "contact")).then((s) => {
      if (s.exists()) setData(s.data() as ContactInfo);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "contact"), data);
      toast.success("Contact info saved.");
    } catch { toast.error("Save failed."); }
    finally { setSaving(false); }
  };

  const fields: { key: keyof ContactInfo; label: string; placeholder: string }[] = [
    { key: "address",  label: "Address",       placeholder: "Street No.3, Block D…"            },
    { key: "phone",    label: "Phone",         placeholder: "+91 82870 61147"                   },
    { key: "email",    label: "Email",         placeholder: "contact@sevagroupfdn.org"           },
    { key: "hours",    label: "Office Hours",  placeholder: "Mon–Sat, 9 AM – 6 PM"              },
  ];

  return (
    <Section title="Contact Information">
      <div className="grid sm:grid-cols-2 gap-4">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
            <input
              type="text"
              value={data[key]}
              onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]"
            />
          </div>
        ))}
      </div>
      <SaveBtn onClick={handleSave} busy={saving} />
    </Section>
  );
}

// ─── Social Links ─────────────────────────────────────────────────────────────

function SocialSection() {
  const [data,   setData]   = useState<SocialLinks>({ facebook: "", instagram: "", twitter: "", youtube: "", linkedin: "", whatsapp: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "settings", "social")).then((s) => {
      if (s.exists()) setData(s.data() as SocialLinks);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "social"), data);
      toast.success("Social links saved.");
    } catch { toast.error("Save failed."); }
    finally { setSaving(false); }
  };

  const fields: { key: keyof SocialLinks; label: string; icon: string }[] = [
    { key: "facebook",  label: "Facebook",  icon: "📘" },
    { key: "instagram", label: "Instagram", icon: "📸" },
    { key: "twitter",   label: "Twitter/X", icon: "🐦" },
    { key: "youtube",   label: "YouTube",   icon: "📺" },
    { key: "linkedin",  label: "LinkedIn",  icon: "💼" },
    { key: "whatsapp",  label: "WhatsApp",  icon: "📲" },
  ];

  return (
    <Section title="Social Media Links">
      <div className="grid sm:grid-cols-2 gap-4">
        {fields.map(({ key, label, icon }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">{icon} {label}</label>
            <input
              type="url"
              value={data[key]}
              onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))}
              placeholder={`https://…`}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]"
            />
          </div>
        ))}
      </div>
      <SaveBtn onClick={handleSave} busy={saving} />
    </Section>
  );
}

// ─── Team Manager ─────────────────────────────────────────────────────────────

interface TeamForm { name: string; role: string; photo: string; linkedin: string; bio: string; }
const EMPTY_TEAM: TeamForm = { name: "", role: "", photo: "", linkedin: "", bio: "" };

function TeamSection() {
  const [members,    setMembers]    = useState<TeamMember[]>([]);
  const [showModal,  setShowModal]  = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [form,       setForm]       = useState<TeamForm>(EMPTY_TEAM);
  const [editId,     setEditId]     = useState<string | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "teamMembers"), orderBy("sortOrder", "asc"));
    return onSnapshot(q, (snap) => {
      setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeamMember)));
    });
  }, []);

  const openAdd  = () => { setForm(EMPTY_TEAM); setEditId(null); setShowModal(true); };
  const openEdit = (m: TeamMember) => {
    setForm({ name: m.name, role: m.role, photo: m.photo, linkedin: m.linkedin, bio: m.bio });
    setEditId(m.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.role.trim()) { toast.error("Name and role required."); return; }
    setSaving(true);
    try {
      if (editId) {
        await updateDoc(doc(db, "teamMembers", editId), { ...form });
        toast.success("Team member updated.");
      } else {
        await addDoc(collection(db, "teamMembers"), { ...form, sortOrder: members.length });
        toast.success("Team member added!");
      }
      setShowModal(false);
    } catch { toast.error("Save failed."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this team member?")) return;
    setDeleting(id);
    try { await deleteDoc(doc(db, "teamMembers", id)); toast.success("Removed."); }
    catch { toast.error("Delete failed."); }
    finally { setDeleting(null); }
  };

  return (
    <Section title="Team Manager">
      <div className="flex justify-end mb-4">
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#1B5E37] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#0d3320]">
          <Plus size={15} /> Add Member
        </button>
      </div>

      {members.length === 0 ? (
        <p className="text-center py-8 text-gray-400">No team members yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <div key={m.id} className="border border-gray-100 rounded-xl p-4 text-center hover:shadow-sm transition-shadow">
              <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden bg-gray-100 mb-3">
                {m.photo ? (
                  <Image src={m.photo} alt={m.name} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400 bg-gray-100">
                    {m.name?.[0]}
                  </div>
                )}
              </div>
              <p className="font-semibold text-gray-800 text-sm">{m.name}</p>
              <p className="text-xs text-[#1B5E37] mt-0.5">{m.role}</p>
              <div className="flex justify-center gap-2 mt-3">
                <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(m.id)} disabled={deleting === m.id} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{editId ? "Edit Member" : "Add Team Member"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Photo */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 shrink-0">
                  {form.photo
                    ? <Image src={form.photo} alt="photo" fill className="object-cover" sizes="64px" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">{form.name?.[0] || "?"}</div>
                  }
                </div>
                <button onClick={() => setShowPicker(true)} className="text-sm text-[#1B5E37] border border-[#1B5E37] rounded-xl px-3 py-1.5 hover:bg-[#1B5E37]/5">
                  {form.photo ? "Change Photo" : "Select Photo"}
                </button>
              </div>
              {[
                { key: "name" as keyof TeamForm, label: "Full Name",    placeholder: "e.g. Dr. Priya Sharma" },
                { key: "role" as keyof TeamForm, label: "Role / Title", placeholder: "e.g. Executive Director" },
                { key: "linkedin" as keyof TeamForm, label: "LinkedIn URL", placeholder: "https://linkedin.com/in/…" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
                  <input type="text" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Bio</label>
                <textarea rows={3} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="Short biography…" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37] resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-[#1B5E37] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#0d3320] disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showPicker && (
        <MediaPickerModal onSelect={(m: MediaItem) => setForm((f) => ({ ...f, photo: m.url }))} onClose={() => setShowPicker(false)} />
      )}
    </Section>
  );
}

// ─── Site Content ─────────────────────────────────────────────────────────────

function ContentSection() {
  const [data,   setData]   = useState<SiteContent>({ heroHeadline: "", heroSubHeadline: "", aboutStory: "", footerTagline: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "settings", "content")).then((s) => {
      if (s.exists()) setData(s.data() as SiteContent);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "content"), data);
      toast.success("Site content saved. Pages will use these values.");
    } catch { toast.error("Save failed."); }
    finally { setSaving(false); }
  };

  return (
    <Section title="Site Content Editor">
      <div className="space-y-4">
        {[
          { key: "heroHeadline" as keyof SiteContent,    label: "Hero Headline",      multiline: false },
          { key: "heroSubHeadline" as keyof SiteContent, label: "Hero Sub-headline",  multiline: false },
          { key: "footerTagline" as keyof SiteContent,   label: "Footer Tagline",     multiline: false },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
            <input type="text" value={data[key]} onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]" />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">About Us Story Paragraph</label>
          <textarea rows={6} value={data.aboutStory} onChange={(e) => setData((d) => ({ ...d, aboutStory: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37] resize-none" />
        </div>
      </div>
      <SaveBtn onClick={handleSave} busy={saving} />
    </Section>
  );
}

// ─── Change Password ──────────────────────────────────────────────────────────

function PasswordSection() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [busy,      setBusy]      = useState(false);

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) { toast.error("New password must be at least 6 characters."); return; }
    if (newPw !== confirmPw) { toast.error("Passwords do not match."); return; }
    setBusy(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("Not signed in.");
      const cred = EmailAuthProvider.credential(user.email, currentPw);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPw);
      toast.success("Password changed successfully.");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: unknown) {
      const msg = (err as Error).message.includes("auth/wrong-password")
        ? "Current password is incorrect."
        : (err as Error).message;
      toast.error(msg);
    } finally { setBusy(false); }
  };

  return (
    <Section title="Change Password">
      <form onSubmit={handleChange} className="max-w-sm space-y-4">
        {[
          { label: "Current Password", value: currentPw, onChange: setCurrentPw },
          { label: "New Password",     value: newPw,     onChange: setNewPw     },
          { label: "Confirm Password", value: confirmPw, onChange: setConfirmPw },
        ].map(({ label, value, onChange }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
            <input type="password" value={value} onChange={(e) => onChange(e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1B5E37]" />
          </div>
        ))}
        <button type="submit" disabled={busy}
          className="flex items-center gap-2 bg-[#1B5E37] text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-[#0d3320] disabled:opacity-50">
          {busy ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
          Update Password
        </button>
      </form>
    </Section>
  );
}

// ─── Shared save button ───────────────────────────────────────────────────────

function SaveBtn({ onClick, busy }: { onClick: () => void; busy: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="mt-5 flex items-center gap-2 bg-[#1B5E37] text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-[#0d3320] disabled:opacity-50"
    >
      {busy ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
      Save Changes
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SiteSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <ContactSection />
      <SocialSection />
      <TeamSection />
      <ContentSection />
      <PasswordSection />
    </div>
  );
}
