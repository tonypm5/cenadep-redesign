import React, { useState } from "react";
import { api } from "../lib/api";
import { useLang } from "../context/LanguageContext";
import { Mail, Check, Loader2 } from "lucide-react";

export const NewsletterForm = () => {
  const { lang } = useLang();
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | loading | sent | error

  const submit = async (e) => {
    e.preventDefault();
    setState("loading");
    try {
      await api.post("/newsletter/subscribe", { email, lang });
      setState("sent");
    } catch {
      setState("error");
    }
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full p-1.5 max-w-md" data-testid="newsletter-form">
      <Mail className="w-4 h-4 ml-3 text-white/60" />
      <input
        data-testid="newsletter-email"
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={lang === "fr" ? "votre@email.com" : "your@email.com"}
        className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/50 py-2"
        disabled={state === "sent" || state === "loading"}
      />
      <button
        data-testid="newsletter-submit"
        type="submit"
        disabled={state === "sent" || state === "loading"}
        className="px-5 py-2 rounded-full bg-[#1A8F4D] hover:bg-[#F1C40F] hover:text-[#0A0A0A] text-white text-xs font-bold transition-colors disabled:opacity-60"
      >
        {state === "loading" ? <Loader2 className="w-3 h-3 animate-spin" /> :
          state === "sent" ? <Check className="w-3 h-3" /> :
          lang === "fr" ? "S'abonner" : "Subscribe"}
      </button>
    </form>
  );
};
