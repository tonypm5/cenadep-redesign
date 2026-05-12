import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { useFadeUp } from "../lib/gsap";
import { api } from "../lib/api";
import { ArrowUpRight } from "lucide-react";

export default function Actualites() {
  const { lang } = useLang();
  const [posts, setPosts] = useState([]);
  useFadeUp(".reveal", [posts]);

  useEffect(() => {
    api.get("/blog").then((r) => setPosts(r.data)).catch(() => {});
  }, []);

  return (
    <div className="pt-32" data-testid="news-page">
      <section className="container-x">
        <p className="overline reveal">{lang === "fr" ? "Actualités" : "News"}</p>
        <h1 className="mt-4 text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.92] text-[#0A0A0A] max-w-5xl reveal" style={{ fontFamily: "Montserrat" }}>
          {lang === "fr" ? "Le terrain en direct." : "Live from the field."}
        </h1>
      </section>

      <section className="section">
        <div className="container-x grid grid-cols-1 md:grid-cols-2 gap-10">
          {posts.slice(0, 6).map((p) => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="group reveal flex gap-6 items-start" data-testid={`news-card-${p.slug}`}>
              <div className="rounded-2xl overflow-hidden w-32 h-32 md:w-44 md:h-44 flex-shrink-0">
                <img src={p.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#736B63] mb-2">{new Date(p.published_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#0A0A0A] group-hover:text-[#1A8F4D] transition-colors leading-tight" style={{ fontFamily: "Montserrat" }}>
                  {lang === "fr" ? p.title_fr : p.title_en}
                </h2>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1A8F4D] link-underline">
                  {lang === "fr" ? "Lire" : "Read"} <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
