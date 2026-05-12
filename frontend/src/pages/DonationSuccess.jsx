import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { api } from "../lib/api";
import { Check, Loader2 } from "lucide-react";

export default function DonationSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { lang, t } = useLang();
  const [status, setStatus] = useState("pending");
  const [amount, setAmount] = useState(null);

  useEffect(() => {
    if (!sessionId) { setStatus("error"); return; }
    let attempts = 0;
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      if (attempts >= 8) { setStatus("timeout"); return; }
      try {
        const r = await api.get(`/donations/status/${sessionId}`);
        if (r.data.payment_status === "paid") {
          setStatus("paid");
          setAmount(r.data.amount_total);
          return;
        }
        if (r.data.status === "expired") { setStatus("expired"); return; }
        attempts += 1;
        setTimeout(poll, 2000);
      } catch {
        attempts += 1;
        setTimeout(poll, 2000);
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [sessionId]);

  return (
    <div className="pt-40 pb-40 min-h-screen flex items-center justify-center" data-testid="donate-success-page">
      <div className="container-x text-center max-w-2xl">
        {status === "pending" && (
          <>
            <Loader2 className="w-12 h-12 mx-auto text-[#1A8F4D] animate-spin" />
            <p className="mt-6 text-xl text-[#736B63]">{t.donate.verifying}</p>
          </>
        )}
        {status === "paid" && (
          <>
            <div className="w-24 h-24 mx-auto rounded-full bg-[#1A8F4D] flex items-center justify-center">
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
            <h1 className="mt-10 text-5xl md:text-6xl font-black tracking-tighter text-[#0A0A0A]" style={{ fontFamily: "Montserrat" }}>
              {t.donate.success}
            </h1>
            {amount && (
              <p className="mt-6 text-2xl text-[#1A8F4D] font-bold" style={{ fontFamily: "Montserrat" }}>
                ${(amount / 100).toFixed(2)}
              </p>
            )}
            <p className="mt-6 text-lg text-[#736B63]">
              {lang === "fr"
                ? "Votre contribution finance directement la démocratie participative en RDC."
                : "Your gift directly funds participatory democracy in DRC."}
            </p>
            <Link to="/" className="btn-primary mt-10 inline-flex" data-testid="success-back-home">
              {t.common.backHome}
            </Link>
          </>
        )}
        {(status === "expired" || status === "timeout" || status === "error") && (
          <>
            <h1 className="text-4xl font-black text-[#0A0A0A]" style={{ fontFamily: "Montserrat" }}>
              {lang === "fr" ? "Paiement non confirmé" : "Payment not confirmed"}
            </h1>
            <p className="mt-4 text-[#736B63]">
              {lang === "fr"
                ? "Si vous avez été débité, contactez-nous : contact@cenadep.org"
                : "If you were charged, contact us: contact@cenadep.org"}
            </p>
            <Link to="/don" className="btn-ghost mt-8 inline-flex">{lang === "fr" ? "Réessayer" : "Try again"}</Link>
          </>
        )}
      </div>
    </div>
  );
}
