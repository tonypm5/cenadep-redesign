import React, { useState } from "react";
import { useLang } from "../context/LanguageContext";
import { useFadeUp } from "../lib/gsap";
import { api } from "../lib/api";
import { Mail, MapPin, Phone, Send, Check } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function Contact() {
  const { lang, t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  useFadeUp(".reveal", []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contact", form);
      setSent(true);
      toast.success(t.contact.sent);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Erreur — merci de réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32" data-testid="contact-page">
      <Toaster position="top-center" richColors />
      <section className="container-x">
        <p className="overline reveal">{t.contact.tag}</p>
        <h1 className="mt-4 text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.92] text-[#0A0A0A] max-w-5xl reveal" style={{ fontFamily: "Montserrat" }}>
          {t.contact.title}
        </h1>
      </section>

      <section className="section">
        <div className="container-x grid md:grid-cols-12 gap-16">
          <div className="md:col-span-5 space-y-10 reveal">
            <div className="flex gap-4">
              <span className="w-12 h-12 rounded-full bg-[#1A8F4D]/10 flex items-center justify-center text-[#1A8F4D] flex-shrink-0"><MapPin className="w-5 h-5" /></span>
              <div>
                <p className="overline">{lang === "fr" ? "Siège" : "Headquarters"}</p>
                <p className="mt-2 text-lg text-[#0A0A0A]">{t.contact.address}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="w-12 h-12 rounded-full bg-[#1A8F4D]/10 flex items-center justify-center text-[#1A8F4D] flex-shrink-0"><Mail className="w-5 h-5" /></span>
              <div>
                <p className="overline">Email</p>
                <p className="mt-2 text-lg text-[#0A0A0A]">contact@cenadep.org</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="w-12 h-12 rounded-full bg-[#1A8F4D]/10 flex items-center justify-center text-[#1A8F4D] flex-shrink-0"><Phone className="w-5 h-5" /></span>
              <div>
                <p className="overline">{lang === "fr" ? "Téléphone" : "Phone"}</p>
                <p className="mt-2 text-lg text-[#0A0A0A]">+243 999 000 000</p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="md:col-span-7 reveal space-y-5" data-testid="contact-form">
            <div className="grid md:grid-cols-2 gap-5">
              <input
                data-testid="contact-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t.contact.name}
                className="px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-black/5 focus:border-[#1A8F4D] focus:outline-none text-[#0A0A0A]"
              />
              <input
                data-testid="contact-email"
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={t.contact.email}
                className="px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-black/5 focus:border-[#1A8F4D] focus:outline-none text-[#0A0A0A]"
              />
            </div>
            <input
              data-testid="contact-subject"
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder={t.contact.subject}
              className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-black/5 focus:border-[#1A8F4D] focus:outline-none text-[#0A0A0A]"
            />
            <textarea
              data-testid="contact-message"
              required
              rows={7}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder={t.contact.message}
              className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-black/5 focus:border-[#1A8F4D] focus:outline-none text-[#0A0A0A]"
            />
            <button
              data-testid="contact-submit"
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {sent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              {sent ? t.contact.sent : t.common.send}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
