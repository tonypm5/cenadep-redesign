import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { api } from "../lib/api";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useFadeUp } from "../lib/gsap";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SEO } from "../components/SEO";

export default function BlogDetail() {
  const { slug } = useParams();
  const { lang, t } = useLang();
  const [post, setPost] = useState(null);
  const [summary, setSummary] = useState("");
  const [loadingSum, setLoadingSum] = useState(false);
  useFadeUp(".reveal", [post]);

  useEffect(() => {
    api.get(`/blog/${slug}`).then((r) => setPost(r.data));
  }, [slug]);

  const requestSummary = async () => {
    setLoadingSum(true);
    try {
      const r = await api.get(`/blog/${slug}/summary`, { params: { lang } });
      setSummary(r.data.summary);
    } finally {
      setLoadingSum(false);
    }
  };

  if (!post) return <div className="pt-40 container-x">{t.common.loading}</div>;

  const title = lang === "fr" ? post.title_fr : post.title_en;
  const content = lang === "fr" ? post.content_fr : post.content_en;

  return (
    <div className="pt-32" data-testid="blog-detail-page">
      <SEO title={title} description={lang === "fr" ? post.excerpt_fr : post.excerpt_en} image={post.image_url} path={`/blog/${slug}`} />
      <article className="container-x max-w-4xl">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-[#736B63] hover:text-[#1A8F4D] mb-8" data-testid="blog-back">
          <ArrowLeft className="w-4 h-4" /> {lang === "fr" ? "Tous les articles" : "All articles"}
        </Link>
        <div className="flex items-center gap-2 mb-6 reveal">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs uppercase tracking-widest text-[#1A8F4D] font-bold">{tag}</span>
          ))}
        </div>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] text-[#0A0A0A] reveal" style={{ fontFamily: "Montserrat" }}>
          {title}
        </h1>
        <div className="mt-6 flex items-center gap-3 text-sm text-[#736B63] reveal">
          <span>{post.author}</span>
          <span>·</span>
          <span>{new Date(post.published_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </article>

      <div className="container-x max-w-5xl mt-12 reveal">
        <div className="rounded-3xl overflow-hidden aspect-[16/9]">
          <img src={post.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="container-x max-w-3xl mt-16 reveal">
        <button
          data-testid="ai-summary-button"
          onClick={requestSummary}
          disabled={loadingSum}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#F8F9FA] border border-black/5 hover:border-[#1A8F4D] transition-colors text-sm font-semibold"
        >
          <Sparkles className="w-4 h-4 text-[#F1C40F]" />
          {loadingSum ? t.common.loading : lang === "fr" ? "Résumé en 3 phrases (IA)" : "AI 3-sentence summary"}
        </button>
        {summary && (
          <div className="mt-6 p-6 rounded-2xl bg-[#1A8F4D]/5 border border-[#1A8F4D]/15" data-testid="ai-summary-result">
            <p className="overline text-[#1A8F4D] mb-2">Gemini 3</p>
            <p className="text-lg text-[#0A0A0A] leading-relaxed">{summary}</p>
          </div>
        )}
      </div>

      <article className="container-x max-w-3xl mt-12 mb-24 reveal">
        <div className="prose-cenadep text-xl text-[#0A0A0A] leading-[1.75]" style={{ fontFamily: "Open Sans" }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
