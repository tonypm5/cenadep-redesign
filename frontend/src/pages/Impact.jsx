import React, { useEffect, useRef } from "react";
import { useLang } from "../context/LanguageContext";
import { useFadeUp, ScrollTrigger, animateCounter } from "../lib/gsap";

const IMPACT_IMG = "https://images.unsplash.com/photo-1622182474215-e74d12074fcc?crop=entropy&cs=srgb&fm=jpg&w=2200&q=85";

export default function Impact() {
  const { lang } = useLang();
  const statRefs = useRef([]);
  useFadeUp(".reveal", []);

  const c = lang === "fr" ? {
    overline: "Impact & Rapports",
    title: "Mesurer ce qui compte vraiment.",
    intro: "Nous publions chaque année des rapports indépendants pour rendre compte de notre action et de l'argent qui nous est confié.",
    stats: [
      { v: 500000, s: "+", l: "Citoyens formés" },
      { v: 26, s: "", l: "Provinces touchées" },
      { v: 1200, s: "+", l: "Comités accompagnés" },
      { v: 87, s: "%", l: "Taux de satisfaction terrain" },
      { v: 142, s: "", l: "Rapports publiés" },
      { v: 32, s: "", l: "Années d'engagement" },
    ],
    reportsTitle: "Rapports annuels",
    reports: [
      { y: "2025", t: "Rapport d'activités & financier", size: "PDF · 4.2 MB" },
      { y: "2024", t: "Bilan triennal 2022-2024", size: "PDF · 6.8 MB" },
      { y: "2023", t: "Observatoires budgétaires : 5 ans", size: "PDF · 3.5 MB" },
      { y: "2022", t: "Femmes et gouvernance locale", size: "PDF · 5.1 MB" },
    ],
  } : {
    overline: "Impact & Reports",
    title: "Measuring what truly counts.",
    intro: "Each year we publish independent reports to account for our work and the resources entrusted to us.",
    stats: [
      { v: 500000, s: "+", l: "Citizens trained" },
      { v: 26, s: "", l: "Provinces reached" },
      { v: 1200, s: "+", l: "Committees supported" },
      { v: 87, s: "%", l: "Field satisfaction rate" },
      { v: 142, s: "", l: "Reports published" },
      { v: 32, s: "", l: "Years of action" },
    ],
    reportsTitle: "Annual reports",
    reports: [
      { y: "2025", t: "Activity & financial report", size: "PDF · 4.2 MB" },
      { y: "2024", t: "Three-year review 2022-2024", size: "PDF · 6.8 MB" },
      { y: "2023", t: "Budget watchdogs: 5 years", size: "PDF · 3.5 MB" },
      { y: "2022", t: "Women and local governance", size: "PDF · 5.1 MB" },
    ],
  };

  useEffect(() => {
    const triggers = [];
    statRefs.current.forEach((node, i) => {
      if (!node) return;
      const target = c.stats[i].v;
      const t = ScrollTrigger.create({
        trigger: node,
        start: "top 85%",
        once: true,
        onEnter: () => animateCounter(node, target),
      });
      triggers.push(t);
    });
    return () => triggers.forEach((tr) => tr.kill());
  }, [c]);

  return (
    <div className="pt-32" data-testid="impact-page">
      <section className="container-x">
        <p className="overline reveal">{c.overline}</p>
        <h1 className="mt-4 text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.92] text-[#0A0A0A] max-w-5xl reveal" style={{ fontFamily: "Montserrat" }}>
          {c.title}
        </h1>
        <p className="mt-10 max-w-2xl text-xl text-[#736B63] leading-relaxed reveal">{c.intro}</p>
      </section>

      <section className="section">
        <div className="container-x grid grid-cols-2 lg:grid-cols-3 gap-12">
          {c.stats.map((s, i) => (
            <div key={i} className="reveal" data-testid={`impact-stat-${i}`}>
              <div className="flex items-baseline gap-1">
                <span ref={(el) => (statRefs.current[i] = el)} className="stat-num text-6xl md:text-7xl font-black text-[#1A8F4D] tracking-tighter" style={{ fontFamily: "Montserrat" }}>
                  0
                </span>
                <span className="text-5xl font-black text-[#1A8F4D]" style={{ fontFamily: "Montserrat" }}>{s.s}</span>
              </div>
              <p className="mt-3 text-[#736B63] max-w-[24ch]">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x mb-24">
        <div className="rounded-[40px] overflow-hidden aspect-[21/9] reveal">
          <img src={IMPACT_IMG} alt="" className="w-full h-full object-cover" />
        </div>
      </section>

      <section className="section bg-[#F8F9FA]">
        <div className="container-x">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.95] mb-16 reveal" style={{ fontFamily: "Montserrat" }}>{c.reportsTitle}</h2>
          <div className="divide-y divide-black/10">
            {c.reports.map((r) => (
              <a key={r.y} href="#" className="flex flex-col md:flex-row md:items-center justify-between py-8 group reveal" data-testid={`report-${r.y}`}>
                <div className="flex items-center gap-8">
                  <span className="text-3xl font-black text-[#1A8F4D] min-w-[80px]" style={{ fontFamily: "Montserrat" }}>{r.y}</span>
                  <span className="text-2xl font-bold text-[#0A0A0A] group-hover:text-[#1A8F4D] transition-colors" style={{ fontFamily: "Montserrat" }}>{r.t}</span>
                </div>
                <span className="text-sm text-[#736B63] mt-2 md:mt-0">{r.size}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
