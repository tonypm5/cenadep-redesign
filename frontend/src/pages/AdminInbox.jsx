import React, { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { api, auth, API } from "../lib/api";
import { useLang } from "../context/LanguageContext";
import { Download, ArrowLeft, Mail, Users } from "lucide-react";

export default function AdminInbox() {
  const { lang } = useLang();
  const [messages, setMessages] = useState([]);
  const [subs, setSubs] = useState([]);
  const [tab, setTab] = useState("messages");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthed()) return;
    Promise.all([api.get("/admin/contact"), api.get("/admin/newsletter/subscribers")])
      .then(([m, s]) => { setMessages(m.data); setSubs(s.data); })
      .finally(() => setLoading(false));
  }, []);

  if (!auth.isAuthed()) return <Navigate to="/admin/login" replace />;

  const downloadCsv = async () => {
    const token = auth.getToken();
    const r = await fetch(`${API}/admin/newsletter/export.csv`, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await r.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cenadep-newsletter.csv";
    a.click();
  };

  return (
    <div className="pt-32 pb-32" data-testid="admin-inbox-page">
      <div className="container-x">
        <Link to="/admin/blog" className="inline-flex items-center gap-2 text-sm text-[#736B63] hover:text-[#1A8F4D] mb-6" data-testid="admin-inbox-back">
          <ArrowLeft className="w-4 h-4" /> {lang === "fr" ? "Retour" : "Back"}
        </Link>
        <p className="overline">Admin</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-black tracking-tight mb-10" style={{ fontFamily: "Montserrat" }}>
          {lang === "fr" ? "Boîte de réception" : "Inbox"}
        </h1>

        <div className="flex gap-3 mb-8">
          <button onClick={() => setTab("messages")} data-testid="tab-messages" className={`px-5 py-2.5 rounded-full text-sm font-semibold inline-flex items-center gap-2 ${tab === "messages" ? "bg-[#1A8F4D] text-white" : "bg-[#F8F9FA] text-[#0A0A0A]"}`}>
            <Mail className="w-4 h-4" /> {lang === "fr" ? "Messages" : "Messages"} ({messages.length})
          </button>
          <button onClick={() => setTab("subs")} data-testid="tab-subs" className={`px-5 py-2.5 rounded-full text-sm font-semibold inline-flex items-center gap-2 ${tab === "subs" ? "bg-[#1A8F4D] text-white" : "bg-[#F8F9FA] text-[#0A0A0A]"}`}>
            <Users className="w-4 h-4" /> Newsletter ({subs.length})
          </button>
          {tab === "subs" && (
            <button onClick={downloadCsv} data-testid="export-csv" className="ml-auto btn-ghost text-sm"><Download className="w-4 h-4" /> CSV</button>
          )}
        </div>

        {loading ? (
          <p className="text-[#736B63]">{lang === "fr" ? "Chargement…" : "Loading…"}</p>
        ) : tab === "messages" ? (
          <div className="space-y-4">
            {messages.length === 0 && <p className="text-[#736B63]">{lang === "fr" ? "Aucun message." : "No messages."}</p>}
            {messages.map((m) => (
              <div key={m.id} className="card-soft p-6" data-testid={`message-${m.id}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-bold text-[#0A0A0A]" style={{ fontFamily: "Montserrat" }}>{m.subject}</p>
                    <p className="text-sm text-[#736B63] mt-0.5">{m.name} · <a href={`mailto:${m.email}`} className="text-[#1A8F4D]">{m.email}</a></p>
                  </div>
                  <span className="text-xs text-[#736B63] whitespace-nowrap">{new Date(m.created_at).toLocaleString()}</span>
                </div>
                <p className="text-[#0A0A0A] whitespace-pre-wrap leading-relaxed">{m.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {subs.length === 0 && <p className="text-[#736B63]">{lang === "fr" ? "Aucun abonné." : "No subscribers."}</p>}
            {subs.map((s) => (
              <div key={s.id} className="py-4 flex items-center justify-between" data-testid={`sub-${s.id}`}>
                <div>
                  <p className="font-semibold text-[#0A0A0A]">{s.email}</p>
                  <p className="text-xs text-[#736B63]">{s.lang.toUpperCase()} · {new Date(s.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${s.confirmed ? "bg-[#1A8F4D]/10 text-[#1A8F4D]" : "bg-[#F1C40F]/15 text-[#736B63]"}`}>
                  {s.confirmed ? (lang === "fr" ? "Confirmé" : "Confirmed") : (lang === "fr" ? "En attente" : "Pending")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
