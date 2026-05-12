import React from "react";
import { Link } from "react-router-dom";
import { CenadepLogo, CenadepWordmark } from "./CenadepLogo";
import { useLang } from "../context/LanguageContext";
import { Mail, MapPin, Phone, Instagram, Linkedin, Facebook } from "lucide-react";

export const Footer = () => {
  const { t } = useLang();
  return (
    <footer className="bg-[#0A0A0A] text-white rounded-t-[40px] mt-24 overflow-hidden relative grain" data-testid="footer">
      <div className="container-x py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center gap-3" data-testid="footer-logo">
              <CenadepLogo className="w-10 h-10" />
              <CenadepWordmark className="text-2xl text-white" />
            </Link>
            <p className="mt-6 text-white/70 max-w-md leading-relaxed">
              Centre National d'Appui au Développement et à la Participation Populaire — ASBL,
              République Démocratique du Congo. Laïque · Apolitique · Inclusif.
            </p>
            <div className="flex gap-4 mt-8">
              <a className="text-white/60 hover:text-[#1A8F4D]" href="#" data-testid="social-instagram"><Instagram className="w-5 h-5" /></a>
              <a className="text-white/60 hover:text-[#1A8F4D]" href="#" data-testid="social-facebook"><Facebook className="w-5 h-5" /></a>
              <a className="text-white/60 hover:text-[#1A8F4D]" href="#" data-testid="social-linkedin"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="overline text-[#F1C40F]">Navigation</p>
            <ul className="mt-6 space-y-3 text-white/70">
              <li><Link to="/a-propos" className="hover:text-white">{t.nav.about}</Link></li>
              <li><Link to="/programmes" className="hover:text-white">{t.nav.programmes}</Link></li>
              <li><Link to="/blog" className="hover:text-white">{t.nav.blog}</Link></li>
              <li><Link to="/impact" className="hover:text-white">{t.nav.impact}</Link></li>
              <li><Link to="/actualites" className="hover:text-white">{t.nav.news}</Link></li>
              <li><Link to="/contact" className="hover:text-white">{t.nav.contact}</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="overline text-[#F1C40F]">Contact</p>
            <ul className="mt-6 space-y-4 text-white/70 text-sm">
              <li className="flex gap-3"><MapPin className="w-5 h-5 text-[#1A8F4D] flex-shrink-0" /><span>{t.contact.address}</span></li>
              <li className="flex gap-3"><Mail className="w-5 h-5 text-[#1A8F4D] flex-shrink-0" /> contact@cenadep.org</li>
              <li className="flex gap-3"><Phone className="w-5 h-5 text-[#1A8F4D] flex-shrink-0" /> +243 999 000 000</li>
            </ul>
            <Link to="/don" className="btn-primary mt-8 text-sm" data-testid="footer-donate-cta">{t.nav.donate}</Link>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-white/40 text-sm">
          <span>© 2026 CENADEP. Tous droits réservés.</span>
          <span>Cultivons la démocratie · Land, People, Light.</span>
        </div>
      </div>
    </footer>
  );
};
