import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles, Sprout, Users, Sun } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { useFadeUp, gsap, ScrollTrigger, animateCounter } from "../lib/gsap";
import { api } from "../lib/api";
import { SEO } from "../components/SEO";

const HERO_IMG =
  "https://images.unsplash.com/photo-1713468515390-95e9af5cb3ab?crop=entropy&cs=srgb&fm=jpg&w=2200&q=85";

const PILLAR_IMAGES = [
  "https://images.unsplash.com/photo-1622182474215-e74d12074fcc?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80",
  "https://images.unsplash.com/photo-1573167627769-e201a7ddf409?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80",
  "https://images.unsplash.com/photo-1744809482817-9a9d4fc280af?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80",
];

export default function Home() {
  const { t } = useLang();
  const heroRef = useRef(null);
  const heroImgWrap = useRef(null);
  const heroTitle = useRef(null);
  const statRefs = useRef([]);
  const [posts, setPosts] = useState([]);

  useFadeUp(".reveal", []);

  useEffect(() => {
    api.get("/blog").then((r) => setPosts(r.data.slice(0, 3))).catch(() => {});
  }, []);

  // Hero scrollytelling: shrink text, expand masked image
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!heroRef.current) return;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "+=80%",
          scrub: 1,
          pin: true,
          pinSpacing: true,
        },
      });
      tl.to(heroTitle.current, { scale: 0.85, opacity: 0.4, y: -40, ease: "none" }, 0);
      tl.fromTo(
        heroImgWrap.current,
        { clipPath: "inset(28% 22% round 28px)" },
        { clipPath: "inset(0% 0% round 0px)", ease: "none" },
        0
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // Stats counters
  useEffect(() => {
    const tweens = [];
    const triggers = [];
    statRefs.current.forEach((node, i) => {
      if (!node) return;
      const target = t.home.stats[i].value;
      const trig = ScrollTrigger.create({
        trigger: node,
        start: "top 85%",
        once: true,
        onEnter: () => tweens.push(animateCounter(node, target)),
      });
      triggers.push(trig);
    });
    return () => {
      tweens.forEach((tw) => tw.kill());
      triggers.forEach((tr) => tr.kill());
    };
  }, [t]);

  const pillars = [
    { icon: <Sprout className="w-7 h-7" />, title: t.home.pillar1Title, desc: t.home.pillar1Desc, img: PILLAR_IMAGES[0], color: "#1A8F4D" },
    { icon: <Users className="w-7 h-7" />, title: t.home.pillar2Title, desc: t.home.pillar2Desc, img: PILLAR_IMAGES[1], color: "#3498DB" },
    { icon: <Sun className="w-7 h-7" />, title: t.home.pillar3Title, desc: t.home.pillar3Desc, img: PILLAR_IMAGES[2], color: "#F1C40F" },
  ];

  return (
    <div data-testid="home-page">
      <SEO />
      {/* HERO SCROLLYTELLING */}
      <section ref={heroRef} className="relative h-screen w-full overflow-hidden bg-white" data-testid="hero">
        <div ref={heroImgWrap} className="absolute inset-0 hero-mask">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
        <div ref={heroTitle} className="relative z-10 h-full flex flex-col items-start justify-center container-x">
          <p className="overline mb-6 text-[#1A8F4D] bg-white/80 backdrop-blur px-4 py-1.5 rounded-full" data-testid="hero-overline">
            {t.home.overline}
          </p>
          <h1 className="hero-text text-[12vw] sm:text-[10vw] lg:text-[8vw] text-[#0A0A0A] max-w-[14ch]" data-testid="hero-title">
            <span className="block">{t.home.title1}</span>
            <span className="block text-[#1A8F4D]">{t.home.title2}</span>
            <span className="block">{t.home.title3}</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-[#0A0A0A]/80 leading-relaxed font-medium" data-testid="hero-subtitle">
            {t.home.subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/programmes" className="btn-primary" data-testid="hero-cta-programs">
              {t.home.ctaPrimary} <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link to="/don" className="btn-ghost" data-testid="hero-cta-donate">
              {t.home.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="py-10 border-y border-black/5 overflow-hidden bg-white">
        <div className="marquee-track text-4xl md:text-6xl font-black text-[#0A0A0A]/8" style={{ fontFamily: "Montserrat" }}>
          {[...Array(2)].map((_, k) => (
            <React.Fragment key={k}>
              {["LAÏCITÉ", "TRANSPARENCE", "PARTICIPATION", "DÉMOCRATIE", "COMMUNAUTÉ", "RDC", "ÉVEIL CITOYEN"].map((w, i) => (
                <span key={`${k}-${i}`} className="whitespace-nowrap">{w} ·</span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* PILLARS */}
      <section className="section">
        <div className="container-x">
          <div className="max-w-3xl mb-16 reveal">
            <p className="overline">{t.home.pillarsTag}</p>
            <h2 className="mt-4 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] text-[#0A0A0A]">
              {t.home.pillarsTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {pillars.map((p, i) => (
              <article
                key={i}
                className={`card-soft p-8 md:p-10 reveal ${i === 0 ? "md:col-span-7" : "md:col-span-5"} flex flex-col`}
                data-testid={`pillar-${i + 1}`}
              >
                <div className="rounded-2xl overflow-hidden aspect-[16/10] mb-8">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: p.color }}>
                    {p.icon}
                  </span>
                  <span className="overline" style={{ color: p.color }}>Pilier {i + 1}</span>
                </div>
                <h3 className="text-3xl font-bold tracking-tight text-[#0A0A0A]" style={{ fontFamily: "Montserrat" }}>{p.title}</h3>
                <p className="mt-4 text-[#736B63] leading-relaxed">{p.desc}</p>
                <Link to="/a-propos" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold link-underline w-fit" style={{ color: p.color }}>
                  {t.common.learnMore} <ArrowUpRight className="w-4 h-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT COUNTERS */}
      <section className="section bg-[#F8F9FA]">
        <div className="container-x">
          <div className="max-w-3xl mb-16 reveal">
            <p className="overline text-[#F1C40F]">{t.home.impactTag}</p>
            <h2 className="mt-4 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] text-[#0A0A0A]">{t.home.impactTitle}</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {t.home.stats.map((s, i) => (
              <div key={i} className="reveal" data-testid={`stat-${i}`}>
                <div className="flex items-baseline gap-1">
                  <span ref={(el) => (statRefs.current[i] = el)} className="stat-num text-6xl md:text-7xl font-black text-[#1A8F4D] tracking-tighter" style={{ fontFamily: "Montserrat" }}>
                    0
                  </span>
                  <span className="text-4xl md:text-5xl font-black text-[#1A8F4D]" style={{ fontFamily: "Montserrat" }}>{s.suffix}</span>
                </div>
                <p className="mt-3 text-[#736B63] max-w-[24ch] leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST POSTS */}
      <section className="section">
        <div className="container-x">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 reveal">
            <div className="max-w-2xl">
              <p className="overline">{t.home.newsTag}</p>
              <h2 className="mt-4 text-5xl sm:text-6xl font-black tracking-tighter leading-[0.95] text-[#0A0A0A]">{t.home.newsTitle}</h2>
            </div>
            <Link to="/blog" className="btn-ghost text-sm whitespace-nowrap" data-testid="home-blog-all">
              {t.home.newsLink} <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="group reveal" data-testid={`home-post-${p.slug}`}>
                <div className="rounded-2xl overflow-hidden aspect-[5/4] mb-5">
                  <img src={p.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-[#0A0A0A] group-hover:text-[#1A8F4D] transition-colors" style={{ fontFamily: "Montserrat" }}>
                  {p.title_fr}
                </h3>
                <p className="mt-2 text-sm text-[#736B63] line-clamp-2">{p.excerpt_fr}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BIG */}
      <section className="section">
        <div className="container-x">
          <div className="rounded-[40px] bg-[#0A0A0A] text-white p-12 md:p-20 relative overflow-hidden grain reveal">
            <div className="relative z-10 max-w-3xl">
              <p className="overline text-[#F1C40F]">{t.home.ctaBigTag}</p>
              <h2 className="mt-4 text-5xl md:text-6xl font-black tracking-tighter leading-[0.95]">
                <Sparkles className="inline w-10 h-10 text-[#F1C40F] mr-2" />
                {t.home.ctaBigTitle}
              </h2>
              <p className="mt-6 text-white/70 text-lg max-w-2xl">{t.home.ctaBigDesc}</p>
              <Link to="/don" className="btn-primary mt-10" data-testid="cta-big-donate">
                {t.nav.donate} <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute -right-20 -bottom-20 w-[420px] h-[420px] rounded-full bg-[#1A8F4D] opacity-30 blur-3xl" />
          </div>
        </div>
      </section>
    </div>
  );
}
