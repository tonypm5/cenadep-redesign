import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api, auth } from "../lib/api";
import { useLang } from "../context/LanguageContext";
import { toast, Toaster } from "sonner";
import { Plus, Edit2, Trash2, LogOut, X } from "lucide-react";

const empty = {
  slug: "",
  title_fr: "",
  title_en: "",
  excerpt_fr: "",
  excerpt_en: "",
  content_fr: "",
  content_en: "",
  image_url: "",
  author: "CENADEP",
  tags: [],
};

export default function AdminBlog() {
  const { lang } = useLang();
  const nav = useNavigate();
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const r = await api.get("/blog");
    setPosts(r.data);
  };

  useEffect(() => { load(); }, []);

  if (!auth.isAuthed()) return <Navigate to="/admin/login" replace />;

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p) => {
    setEditing(p.slug);
    setForm({ ...p, tags: p.tags || [] });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, tags: typeof form.tags === "string" ? form.tags.split(",").map(s => s.trim()).filter(Boolean) : form.tags };
      if (editing) {
        await api.put(`/admin/blog/${editing}`, payload);
        toast.success(lang === "fr" ? "Article mis à jour" : "Article updated");
      } else {
        await api.post("/admin/blog", payload);
        toast.success(lang === "fr" ? "Article créé" : "Article created");
      }
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Error");
    }
  };

  const del = async (slug) => {
    if (!window.confirm(lang === "fr" ? "Supprimer cet article ?" : "Delete this article?")) return;
    await api.delete(`/admin/blog/${slug}`);
    toast.success(lang === "fr" ? "Supprimé" : "Deleted");
    load();
  };

  const logout = () => { auth.clear(); nav("/admin/login"); };

  return (
    <div className="pt-32 pb-32" data-testid="admin-blog-page">
      <Toaster position="top-center" richColors />
      <div className="container-x">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="overline">Admin</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-black tracking-tight" style={{ fontFamily: "Montserrat" }}>
              {lang === "fr" ? "Gestion du blog" : "Blog management"}
            </h1>
          </div>
          <div className="flex gap-3">
            <button onClick={openCreate} className="btn-primary text-sm" data-testid="admin-new-post"><Plus className="w-4 h-4" /> {lang === "fr" ? "Nouvel article" : "New article"}</button>
            <button onClick={logout} className="btn-ghost text-sm" data-testid="admin-logout"><LogOut className="w-4 h-4" /> {lang === "fr" ? "Quitter" : "Sign out"}</button>
          </div>
        </div>

        <div className="divide-y divide-black/10">
          {posts.map((p) => (
            <div key={p.id} className="py-6 flex items-center gap-6" data-testid={`admin-row-${p.slug}`}>
              <img src={p.image_url} alt="" className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#736B63]">{p.slug}</p>
                <h3 className="text-lg font-bold text-[#0A0A0A] truncate" style={{ fontFamily: "Montserrat" }}>{p.title_fr}</h3>
              </div>
              <button onClick={() => openEdit(p)} data-testid={`admin-edit-${p.slug}`} className="p-3 rounded-full bg-[#F8F9FA] hover:bg-[#1A8F4D] hover:text-white"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => del(p.slug)} data-testid={`admin-delete-${p.slug}`} className="p-3 rounded-full bg-[#F8F9FA] hover:bg-red-500 hover:text-white"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="bg-white rounded-3xl w-full max-w-2xl p-8 my-12 max-h-[90vh] overflow-y-auto" data-testid="admin-post-form">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black" style={{ fontFamily: "Montserrat" }}>{editing ? (lang === "fr" ? "Éditer" : "Edit") : (lang === "fr" ? "Nouveau" : "New")}</h2>
              <button type="button" onClick={() => setOpen(false)}><X /></button>
            </div>
            <div className="space-y-3">
              <input data-testid="post-slug" required disabled={!!editing} placeholder="slug-de-larticle" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-[#F8F9FA] border border-black/5 focus:border-[#1A8F4D] focus:outline-none" />
              <input data-testid="post-image" required placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-[#F8F9FA] border border-black/5 focus:border-[#1A8F4D] focus:outline-none" />
              <input data-testid="post-tags" placeholder="tags, comma, separated" value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-[#F8F9FA] border border-black/5 focus:border-[#1A8F4D] focus:outline-none" />
              <div className="grid md:grid-cols-2 gap-3">
                <input data-testid="post-title-fr" required placeholder="Titre FR" value={form.title_fr} onChange={(e) => setForm({ ...form, title_fr: e.target.value })} className="px-5 py-3 rounded-2xl bg-[#F8F9FA] border border-black/5 focus:border-[#1A8F4D] focus:outline-none" />
                <input data-testid="post-title-en" required placeholder="Title EN" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} className="px-5 py-3 rounded-2xl bg-[#F8F9FA] border border-black/5 focus:border-[#1A8F4D] focus:outline-none" />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <textarea data-testid="post-excerpt-fr" required rows={3} placeholder="Extrait FR" value={form.excerpt_fr} onChange={(e) => setForm({ ...form, excerpt_fr: e.target.value })} className="px-5 py-3 rounded-2xl bg-[#F8F9FA] border border-black/5 focus:border-[#1A8F4D] focus:outline-none" />
                <textarea data-testid="post-excerpt-en" required rows={3} placeholder="Excerpt EN" value={form.excerpt_en} onChange={(e) => setForm({ ...form, excerpt_en: e.target.value })} className="px-5 py-3 rounded-2xl bg-[#F8F9FA] border border-black/5 focus:border-[#1A8F4D] focus:outline-none" />
              </div>
              <textarea data-testid="post-content-fr" required rows={8} placeholder="Contenu FR" value={form.content_fr} onChange={(e) => setForm({ ...form, content_fr: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-[#F8F9FA] border border-black/5 focus:border-[#1A8F4D] focus:outline-none" />
              <textarea data-testid="post-content-en" required rows={8} placeholder="Content EN" value={form.content_en} onChange={(e) => setForm({ ...form, content_en: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-[#F8F9FA] border border-black/5 focus:border-[#1A8F4D] focus:outline-none" />
            </div>
            <button type="submit" data-testid="post-save" className="btn-primary mt-6 w-full justify-center">{lang === "fr" ? "Enregistrer" : "Save"}</button>
          </form>
        </div>
      )}
    </div>
  );
}
