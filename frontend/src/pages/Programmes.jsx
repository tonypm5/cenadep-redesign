import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { gsap, ScrollTrigger, useFadeUp } from "../lib/gsap";

const PROGRAMS = {
  fr: [
    { code: "01", title: "École de la Gouvernance", desc: "Formation continue des élus locaux et des comités citoyens.", img: "https://images.unsplash.com/photo-1573167627769-e201a7ddf409?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80" },
    { code: "02", title: "Observatoires Budgétaires", desc: "Analyse citoyenne des budgets communaux et provinciaux.", img: "https://images.unsplash.com/photo-1713468515390-95e9af5cb3ab?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80" },
    { code: "03", title: "Coopératives Femmes Leaders", desc: "Économie populaire, agriculture vivrière, leadership féminin.", img: "https://images.unsplash.com/photo-1622182474215-e74d12074fcc?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80" },
    { code: "04", title: "Jeunesse & Citoyenneté", desc: "Clubs de débat, journalisme citoyen, simulations parlementaires.", img: "https://images.unsplash.com/photo-1744809482817-9a9d4fc280af?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80" },
    { code: "05", title: "Plaidoyer National", desc: "Notes de politique publique, dialogue institutionnel, mémoires.", img: "https://images.unsplash.com/photo-1576769267415-9242c9cd9fa5?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80" },
  ],
  en: [
    { code: "01", title: "Governance School", desc: "Ongoing training of local officials and citizen committees.", img: "https://images.unsplash.com/photo-1573167627769-e201a7ddf409?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80" },
    { code: "02", title: "Budget Watchdogs", desc: "Citizen analysis of municipal and provincial budgets.", img: "https://images.unsplash.com/photo-1713468515390-95e9af5cb3ab?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80" },
    { code: "03", title: "Women-Led Cooperatives", desc: "Popular economy, food agriculture, women's leadership.", img: "https://images.unsplash.com/photo-1622182474215-e74d12074fcc?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80" },
    { code: "04", title: "Youth & Citizenship", desc: "Debate clubs, citizen journalism, parliamentary simulations.", img: "https://images.unsplash.com/photo-1744809482817-9a9d4fc280af?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80" },
    { code: "05", title: "National Advocacy", desc: "Policy briefs, institutional dialogue, position papers.", img: "https://images.unsplash.com/photo-1576769267415-9242c9cd9fa5?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80" },
  ],
};

export default function Programmes() {
  const { lang } = useLang();
  const scrollSection = useRef(null);
  const track = useRef(null);
  const programs = PROGRAMS[lang];

  useFadeUp(".reveal", []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!track.current || !scrollSection.current) return;
      const totalWidth = track.current.scrollWidth - window.innerWidth;
      const tween = gsap.to(track.current, {
        x: -totalWidth,
        ease: "none",
        scrollTrigger: {
          trigger: scrollSection.current,
          start: "top top",
          end: () => `+=${totalWidth}`,
          scrub: 1,
          pin: true,
        },
      });
      return () => tween.kill();
    }, scrollSection);
    return () => ctx.revert();
  }, [lang]);

  return (
    <div className="pt-32" data-testid="programmes-page">
      <section className="container-x">
        <p className="overline reveal">{lang === "fr" ? "Programmes" : "Programs"}</p>
        <h1 className="mt-4 text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.92] text-[#0A0A0A] max-w-5xl reveal" style={{ fontFamily: "Montserrat" }}>
          {lang === "fr" ? "Cinq leviers pour transformer la République." : "Five levers to transform the Republic."}
        </h1>
        <p className="mt-10 max-w-2xl text-xl text-[#736B63] leading-relaxed reveal">
          {lang === "fr"
            ? "Faites défiler horizontalement pour découvrir nos chantiers majeurs."
            : "Scroll horizontally to explore our major workstreams."}
        </p>
      </section>

      <section ref={scrollSection} className="relative h-screen w-full overflow-hidden mt-24 bg-[#0A0A0A]">
        <div ref={track} className="absolute top-0 left-0 h-full flex items-center pl-12 will-change-transform">
          {programs.map((p, i) => (
            <article key={i} className="relative h-[78vh] w-[80vw] md:w-[55vw] lg:w-[42vw] mr-10 rounded-[32px] overflow-hidden flex-shrink-0" data-testid={`program-${p.code}`}>
              <img src={p.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-end p-10 text-white">
                <span className="text-sm tracking-[0.3em] text-[#F1C40F] font-bold" style={{ fontFamily: "Montserrat" }}>{p.code}</span>
                <h3 className="mt-4 text-4xl md:text-5xl font-black tracking-tight leading-[0.95] max-w-md" style={{ fontFamily: "Montserrat" }}>{p.title}</h3>
                <p className="mt-4 text-white/80 max-w-md">{p.desc}</p>
                <Link to="/contact" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#F1C40F]">
                  {lang === "fr" ? "Rejoindre" : "Join"} <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container-x text-center reveal">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.95]" style={{ fontFamily: "Montserrat" }}>
            {lang === "fr" ? "Vous voulez collaborer ?" : "Want to collaborate?"}
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-[#736B63]">
            {lang === "fr"
              ? "Bailleurs, universités, mouvements citoyens — discutons d'un partenariat."
              : "Donors, universities, citizen movements — let's discuss a partnership."}
          </p>
          <Link to="/contact" className="btn-primary mt-10" data-testid="programs-contact-cta">
            {lang === "fr" ? "Nous contacter" : "Contact us"} <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
