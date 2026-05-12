import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Globe } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { CenadepLogo, CenadepWordmark } from "./CenadepLogo";

export const Navbar = () => {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  const links = [
    { to: "/", label: t.nav.home },
    { to: "/a-propos", label: t.nav.about },
    { to: "/programmes", label: t.nav.programmes },
    { to: "/blog", label: t.nav.blog },
    { to: "/impact", label: t.nav.impact },
    { to: "/actualites", label: t.nav.news },
    { to: "/contact", label: t.nav.contact },
  ];

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-xl bg-white/80 border-b border-black/5" : "bg-transparent"
      }`}
    >
      <div className="container-x flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-2.5" data-testid="logo-home">
          <CenadepLogo className="w-9 h-9" />
          <CenadepWordmark className="text-xl text-[#0A0A0A]" />
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              data-testid={`nav-link-${l.to.replace("/", "") || "home"}`}
              className={({ isActive }) =>
                `nav-link link-underline text-[15px] ${isActive ? "active" : ""}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <button
            data-testid="lang-toggle"
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#0A0A0A] hover:text-[#1A8F4D]"
          >
            <Globe className="w-4 h-4" />
            {lang === "fr" ? "EN" : "FR"}
          </button>
          <Link to="/don" className="btn-primary text-sm" data-testid="nav-donate-cta">
            {t.nav.donate}
          </Link>
        </div>

        <button
          className="lg:hidden p-2"
          onClick={() => setOpen(!open)}
          data-testid="mobile-menu-toggle"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t border-black/5" data-testid="mobile-menu">
          <div className="container-x py-6 flex flex-col gap-4">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className="nav-link text-lg" data-testid={`mobile-link-${l.to.replace("/", "") || "home"}`}>
                {l.label}
              </NavLink>
            ))}
            <button
              data-testid="mobile-lang-toggle"
              onClick={() => setLang(lang === "fr" ? "en" : "fr")}
              className="text-left text-sm font-semibold text-[#1A8F4D]"
            >
              {lang === "fr" ? "Switch to English" : "Passer en Français"}
            </button>
            <Link to="/don" className="btn-primary text-sm w-fit" data-testid="mobile-donate-cta">
              {t.nav.donate}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
