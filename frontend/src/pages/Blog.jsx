import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { useFadeUp } from "../lib/gsap";
import { api } from "../lib/api";
import { ArrowUpRight } from "lucide-react";

export default function Blog() {
  const { lang, t } = useLang();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  useFadeUp(".reveal", [posts]);

  useEffect(() => {
    api.get("/blog").then((r) => setPosts(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-32" data-testid="blog-page">
      <section className="container-x">
        <p className="overline reveal">{lang === "fr" ? "Le journal" : "The journal"}</p>
        <h1 className="mt-4 text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.92] text-[#0A0A0A] max-w-5xl reveal" style={{ fontFamily: "Montserrat" }}>
          {lang === "fr" ? "Récits, analyses, plaidoyers." : "Stories, analyses, advocacy."}
        </h1>
      </section>

      <section className="section">
        <div className="container-x">
          {loading ? (
            <p className="text-[#736B63]">{t.common.loading}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {posts.map((p, i) => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="group reveal" data-testid={`blog-card-${p.slug}`}>
                  <div className="rounded-2xl overflow-hidden mb-5" style={{ aspectRatio: i % 3 === 0 ? "4/5" : "5/4" }}>
                    <img src={p.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    {p.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs uppercase tracking-widest text-[#1A8F4D] font-bold">{tag}</span>
                    ))}
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#0A0A0A] group-hover:text-[#1A8F4D] transition-colors leading-tight" style={{ fontFamily: "Montserrat" }}>
                    {lang === "fr" ? p.title_fr : p.title_en}
                  </h2>
                  <p className="mt-3 text-[#736B63] line-clamp-3">{lang === "fr" ? p.excerpt_fr : p.excerpt_en}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1A8F4D] link-underline">
                    {t.common.readMore} <ArrowUpRight className="w-4 h-4" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
