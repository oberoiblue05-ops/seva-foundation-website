"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection, query, orderBy, onSnapshot,
  doc, setDoc, deleteDoc, updateDoc,
} from "firebase/firestore";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import toast from "react-hot-toast";
import Image from "next/image";
import { db } from "@/lib/firebase";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Bold, Italic,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogPost {
  slug:        string;
  title:       string;
  content:     string;
  excerpt:     string;
  coverImage:  string;
  author:      string;
  tags:        string[];
  isPublished: boolean;
  createdAt:   string;
  updatedAt:   string;
}

interface PostForm {
  title:       string;
  slug:        string;
  content:     string;
  excerpt:     string;
  coverImage:  string;
  author:      string;
  tagsRaw:     string;
  isPublished: boolean;
}

const EMPTY_FORM: PostForm = {
  title: "", slug: "", content: "", excerpt: "", coverImage: "", author: "Admin", tagsRaw: "", isPublished: false,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── TipTap Toolbar ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Toolbar({ editor }: { editor: any }) {
  if (!editor) return null;
  const btn = (active: boolean) =>
    `p-2 rounded-lg text-sm transition-colors ${active ? "bg-[#1B5E37] text-white" : "text-gray-500 hover:bg-gray-100"}`;

  // Cast needed because nested starter-kit extensions augment Commands in a scope
  // TypeScript can't resolve from the top-level node_modules.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = () => editor.chain().focus() as any;

  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-100 px-3 py-2">
      <button onClick={() => c().toggleBold().run()} className={btn(editor.isActive("bold"))} title="Bold">
        <Bold size={15} />
      </button>
      <button onClick={() => c().toggleItalic().run()} className={btn(editor.isActive("italic"))} title="Italic">
        <Italic size={15} />
      </button>
      <div className="w-px h-6 bg-gray-200 self-center mx-1" />
      <button onClick={() => c().toggleHeading({ level: 1 }).run()} className={btn(editor.isActive("heading", { level: 1 }))} title="Heading 1">
        <Heading1 size={15} />
      </button>
      <button onClick={() => c().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))} title="Heading 2">
        <Heading2 size={15} />
      </button>
      <button onClick={() => c().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))} title="Heading 3">
        <Heading3 size={15} />
      </button>
      <div className="w-px h-6 bg-gray-200 self-center mx-1" />
      <button onClick={() => c().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))} title="Bullet List">
        <List size={15} />
      </button>
      <button onClick={() => c().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))} title="Ordered List">
        <ListOrdered size={15} />
      </button>
      <button onClick={() => c().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))} title="Blockquote">
        <Quote size={15} />
      </button>
    </div>
  );
}

// ─── Post Editor ──────────────────────────────────────────────────────────────

function PostEditor({
  initial, onSave, onCancel,
}: {
  initial:  PostForm;
  onSave:   (form: PostForm) => Promise<void>;
  onCancel: () => void;
}) {
  const [form,        setForm]        = useState<PostForm>(initial);
  const [showPicker,  setShowPicker]  = useState(false);
  const [saving,      setSaving]      = useState(false);

  const editor = useEditor({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } }) as any],
    content: initial.content,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => setForm((f) => ({ ...f, content: ed.getHTML() })),
  });

  const handleTitleChange = useCallback((title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: f.slug || toSlug(title),
    }));
  }, []);

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error("Title is required."); return; }
    if (!form.slug.trim())  { toast.error("Slug is required."); return; }
    if (!form.content || form.content === "<p></p>") { toast.error("Content cannot be empty."); return; }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-800">← Back to Posts</button>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <span className="text-gray-600">{form.isPublished ? "Published" : "Draft"}</span>
            <div
              onClick={() => setForm((f) => ({ ...f, isPublished: !f.isPublished }))}
              className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${form.isPublished ? "bg-[#1B5E37]" : "bg-gray-300"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${form.isPublished ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
          </label>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#1B5E37] text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-[#0d3320] disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Save Post"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Main editor area */}
        <div className="lg:col-span-2 space-y-4">
          <input
            type="text"
            placeholder="Post title…"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full text-2xl font-bold border-0 border-b-2 border-gray-100 pb-3 outline-none focus:border-[#1B5E37] transition-colors placeholder-gray-300"
          />

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <Toolbar editor={editor} />
            <EditorContent
              editor={editor}
              className="prose prose-sm max-w-none p-4 min-h-[400px] focus:outline-none"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Post Settings</h3>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: toSlug(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1B5E37]"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Author</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1B5E37]"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={form.tagsRaw}
                onChange={(e) => setForm((f) => ({ ...f, tagsRaw: e.target.value }))}
                placeholder="education, health, community"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1B5E37]"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                rows={3}
                placeholder="Short description for listing page…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1B5E37] resize-none"
              />
            </div>
          </div>

          {/* Cover image */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Cover Image</h3>
            {form.coverImage ? (
              <div className="relative h-40 rounded-xl overflow-hidden">
                <Image src={form.coverImage} alt="cover" fill className="object-cover" sizes="300px" />
                <button
                  onClick={() => setShowPicker(true)}
                  className="absolute bottom-2 right-2 bg-white border text-xs px-3 py-1 rounded-lg shadow hover:bg-gray-50"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPicker(true)}
                className="w-full h-28 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-[#1B5E37] hover:text-[#1B5E37] transition-all text-sm"
              >
                + Select Cover Image
              </button>
            )}
          </div>
        </div>
      </div>

      {showPicker && (
        <MediaPickerModal
          onSelect={(m: MediaItem) => setForm((f) => ({ ...f, coverImage: m.url }))}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BlogManagerPage() {
  const [posts,     setPosts]     = useState<BlogPost[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [view,      setView]      = useState<"list" | "editor">("list");
  const [editSlug,  setEditSlug]  = useState<string | null>(null);
  const [deleting,  setDeleting]  = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "blogPosts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ slug: d.id, ...d.data() } as BlogPost)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleSave = async (form: PostForm) => {
    const now = new Date().toISOString();
    const existing = editSlug ? posts.find((p) => p.slug === editSlug) : null;
    const payload: Omit<BlogPost, "slug"> = {
      title:       form.title,
      content:     form.content,
      excerpt:     form.excerpt,
      coverImage:  form.coverImage,
      author:      form.author,
      tags:        form.tagsRaw.split(",").map((t) => t.trim()).filter(Boolean),
      isPublished: form.isPublished,
      createdAt:   existing?.createdAt ?? now,
      updatedAt:   now,
    };
    await setDoc(doc(db, "blogPosts", form.slug), payload);
    toast.success(form.isPublished ? "Post published!" : "Draft saved.");
    setView("list");
    setEditSlug(null);
  };

  const handleTogglePublish = async (post: BlogPost) => {
    await updateDoc(doc(db, "blogPosts", post.slug), { isPublished: !post.isPublished });
    toast.success(post.isPublished ? "Unpublished." : "Published!");
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this post permanently?")) return;
    setDeleting(slug);
    try {
      await deleteDoc(doc(db, "blogPosts", slug));
      toast.success("Post deleted.");
    } catch {
      toast.error("Delete failed.");
    } finally {
      setDeleting(null);
    }
  };

  const openEdit = (post: BlogPost) => {
    setEditSlug(post.slug);
    setView("editor");
  };

  const getInitialForm = (): PostForm => {
    if (editSlug) {
      const p = posts.find((x) => x.slug === editSlug);
      if (p) return {
        title: p.title, slug: p.slug, content: p.content, excerpt: p.excerpt,
        coverImage: p.coverImage, author: p.author, tagsRaw: p.tags.join(", "), isPublished: p.isPublished,
      };
    }
    return EMPTY_FORM;
  };

  if (view === "editor") {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{editSlug ? "Edit Post" : "New Post"}</h1>
        <PostEditor
          initial={getInitialForm()}
          onSave={handleSave}
          onCancel={() => { setView("list"); setEditSlug(null); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Blog Manager</h1>
        <button
          onClick={() => { setEditSlug(null); setView("editor"); }}
          className="flex items-center gap-2 bg-[#1B5E37] text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[#0d3320]"
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 border-2 border-[#1B5E37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📝</p>
          <p>No blog posts yet. Write your first post!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-3 py-3 font-medium">Author</th>
                <th className="px-3 py-3 font-medium">Date</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.slug} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800 truncate max-w-[200px]">{post.title}</p>
                    <p className="text-xs text-gray-400">/news/{post.slug}</p>
                  </td>
                  <td className="px-3 py-3 text-gray-500">{post.author}</td>
                  <td className="px-3 py-3 text-gray-400 whitespace-nowrap">{fmtDate(post.createdAt)}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${post.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {post.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleTogglePublish(post)}
                        title={post.isPublished ? "Unpublish" : "Publish"}
                        className="p-1.5 text-gray-400 hover:text-[#1B5E37] hover:bg-green-50 rounded-lg transition-colors"
                      >
                        {post.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button onClick={() => openEdit(post)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.slug)}
                        disabled={deleting === post.slug}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
