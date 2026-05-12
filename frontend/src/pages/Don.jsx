import React, { useState } from "react";
import { useLang } from "../context/LanguageContext";
import { useFadeUp } from "../lib/gsap";
import { api } from "../lib/api";
import { Heart, Lock } from "lucide-react";
import { toast, Toaster } from "sonner";

const PACKAGES = [
  { id: "small", amount: 10 },
  { id: "medium", amount: 25 },
  { id: "large", amount: 50 },
  { id: "champion", amount: 100 },
];

export default function Don() {
  const { lang, t } = useLang();
  const [pkg, setPkg] = useState("medium");
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  useFadeUp(".reveal", []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        origin_url: window.location.origin,
        donor_name: name || null,
        donor_email: email || null,
      };
      const customAmount = parseFloat(custom);
      if (pkg === "custom" && customAmount >= 1) body.custom_amount = customAmount;
      else body.package_id = pkg;
      const r = await api.post("/donations/checkout", body);
      window.location.href = r.data.url;
    } catch (err) {
      toast.error(lang === "fr" ? "Erreur lors de la création du don" : "Error creating donation");
      setLoading(false);
    }
  };

  return (
    <div className="pt-32" data-testid="donate-page">
      <Toaster position="top-center" richColors />
      <section className="container-x">
        <p className="overline reveal">{t.donate.tag}</p>
        <h1 className="mt-4 text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.92] text-[#0A0A0A] max-w-4xl reveal" style={{ fontFamily: "Montserrat" }}>
          {t.donate.title}
        </h1>
        <p className="mt-8 max-w-2xl text-xl text-[#736B63] leading-relaxed reveal">{t.donate.desc}</p>
      </section>

      <section className="section">
        <div className="container-x max-w-3xl">
          <form onSubmit={submit} className="card-soft p-8 md:p-12 reveal" data-testid="donate-form">
            <p className="overline">{t.donate.selectAmount}</p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {PACKAGES.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  data-testid={`donate-amount-${p.id}`}
                  onClick={() => setPkg(p.id)}
                  className={`py-5 rounded-2xl border-2 transition-all font-bold text-2xl ${pkg === p.id ? "bg-[#1A8F4D] text-white border-[#1A8F4D]" : "bg-white text-[#0A0A0A] border-black/10 hover:border-[#1A8F4D]"}`}
                  style={{ fontFamily: "Montserrat" }}
                >
                  ${p.amount}
                </button>
              ))}
            </div>
            <button
              type="button"
              data-testid="donate-amount-custom"
              onClick={() => setPkg("custom")}
              className={`mt-3 w-full py-4 rounded-2xl border-2 transition-all font-semibold ${pkg === "custom" ? "bg-[#1A8F4D] text-white border-[#1A8F4D]" : "bg-white text-[#0A0A0A] border-black/10 hover:border-[#1A8F4D]"}`}
            >
              {t.donate.custom}
            </button>
            {pkg === "custom" && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-3xl font-black text-[#1A8F4D]" style={{ fontFamily: "Montserrat" }}>$</span>
                <input
                  data-testid="donate-custom-input"
                  type="number"
                  min="1"
                  step="1"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="50"
                  className="flex-1 px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-black/5 focus:border-[#1A8F4D] focus:outline-none text-2xl font-bold"
                  style={{ fontFamily: "Montserrat" }}
                />
              </div>
            )}

            <div className="mt-10 grid md:grid-cols-2 gap-4">
              <input
                data-testid="donate-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.donate.donorName}
                className="px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-black/5 focus:border-[#1A8F4D] focus:outline-none"
              />
              <input
                data-testid="donate-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.donate.donorEmail}
                className="px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-black/5 focus:border-[#1A8F4D] focus:outline-none"
              />
            </div>

            <button
              data-testid="donate-submit"
              type="submit"
              disabled={loading || (pkg === "custom" && !custom)}
              className="btn-primary mt-10 w-full justify-center disabled:opacity-50"
            >
              <Heart className="w-4 h-4" /> {loading ? t.common.loading : t.donate.donateBtn}
            </button>
            <p className="mt-6 flex items-center justify-center gap-2 text-xs text-[#736B63]">
              <Lock className="w-3 h-3" /> Stripe · {lang === "fr" ? "Paiement 100% sécurisé" : "100% secure payment"}
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
