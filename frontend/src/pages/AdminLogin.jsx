import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { api, auth } from "../lib/api";
import { Lock } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function AdminLogin() {
  const { lang } = useLang();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api.post("/auth/login", { email, password });
      auth.setToken(r.data.access_token);
      toast.success("Bienvenue");
      nav("/admin/blog");
    } catch {
      toast.error(lang === "fr" ? "Identifiants invalides" : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-40 pb-40 min-h-screen" data-testid="admin-login-page">
      <Toaster position="top-center" richColors />
      <div className="container-x max-w-md">
        <div className="card-soft p-10">
          <Lock className="w-8 h-8 text-[#1A8F4D]" />
          <h1 className="mt-6 text-3xl font-black tracking-tight" style={{ fontFamily: "Montserrat" }}>
            Admin · CENADEP
          </h1>
          <p className="mt-2 text-sm text-[#736B63]">{lang === "fr" ? "Accès réservé à l'équipe éditoriale" : "Editorial team access only"}</p>
          <form onSubmit={submit} className="mt-8 space-y-4" data-testid="admin-login-form">
            <input
              data-testid="admin-email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-black/5 focus:border-[#1A8F4D] focus:outline-none"
            />
            <input
              data-testid="admin-password"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={lang === "fr" ? "Mot de passe" : "Password"}
              className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-black/5 focus:border-[#1A8F4D] focus:outline-none"
            />
            <button data-testid="admin-login-submit" type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-50">
              {loading ? "…" : lang === "fr" ? "Se connecter" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
