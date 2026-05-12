import React from "react";
import { useLang } from "../context/LanguageContext";
import { useFadeUp } from "../lib/gsap";
import { Quote } from "lucide-react";

const ABOUT_IMG = "https://images.unsplash.com/photo-1573167627769-e201a7ddf409?crop=entropy&cs=srgb&fm=jpg&w=2000&q=80";
const TEAM_IMG = "https://images.unsplash.com/photo-1744809482817-9a9d4fc280af?crop=entropy&cs=srgb&fm=jpg&w=2000&q=80";

export default function About() {
  const { lang } = useLang();
  useFadeUp(".reveal", []);

  const fr = {
    overline: "Notre histoire",
    title: "Depuis 1994, nous semons la République.",
    intro:
      "Le CENADEP est une ASBL congolaise née de l'aspiration des communautés à reprendre la parole sur leur propre développement. Trois décennies plus tard, nous demeurons fidèles à cette intuition fondatrice: la démocratie se construit du bas vers le haut.",
    missionLabel: "Mission",
    missionText:
      "Promouvoir le développement participatif et la construction de la démocratie en République Démocratique du Congo, par la formation citoyenne, la gouvernance locale et le plaidoyer institutionnel.",
    visionLabel: "Vision",
    visionText:
      "Une RDC où chaque citoyen est outillé pour exiger la transparence et co-construire les politiques publiques de son territoire.",
    valuesLabel: "Valeurs",
    values: ["Laïcité", "Apolitisme", "Inclusion", "Transparence", "Ancrage local"],
    quote:
      "« La démocratie n'est pas un don, c'est une discipline collective. Le CENADEP la pratique, jour après jour, village après village. »",
    quoteAuthor: "Le Conseil d'Administration",
    timelineTitle: "Trente ans d'éveil citoyen",
    timeline: [
      { y: "1994", t: "Naissance du CENADEP à Kinshasa." },
      { y: "2001", t: "Premiers comités citoyens au Bandundu." },
      { y: "2010", t: "Programme national d'éducation civique." },
      { y: "2018", t: "Observatoires budgétaires dans 8 provinces." },
      { y: "2024", t: "500 000 citoyens formés cumulés." },
      { y: "2026", t: "Rebranding et nouvelle stratégie 2026-2030." },
    ],
  };
  const en = {
    overline: "Our story",
    title: "Since 1994, sowing the Republic.",
    intro:
      "CENADEP is a Congolese non-profit born from communities' aspiration to take back the conversation on their own development. Three decades later, we remain faithful to that founding intuition: democracy is built from the ground up.",
    missionLabel: "Mission",
    missionText:
      "Promote participatory development and democratic construction in DRC, through civic training, local governance, and institutional advocacy.",
    visionLabel: "Vision",
    visionText:
      "A DRC where every citizen is equipped to demand transparency and co-build the public policies of their territory.",
    valuesLabel: "Values",
    values: ["Secularism", "Non-partisanship", "Inclusion", "Transparency", "Local anchoring"],
    quote:
      "“Democracy is not a gift, it is a collective discipline. CENADEP practices it, day after day, village after village.”",
    quoteAuthor: "The Board of Directors",
    timelineTitle: "Thirty years of civic awakening",
    timeline: [
      { y: "1994", t: "CENADEP founded in Kinshasa." },
      { y: "2001", t: "First citizen committees in Bandundu." },
      { y: "2010", t: "National civic education program." },
      { y: "2018", t: "Budget watchdog groups in 8 provinces." },
      { y: "2024", t: "500,000 citizens trained cumulatively." },
      { y: "2026", t: "Rebrand and 2026–2030 strategy." },
    ],
  };
  const c = lang === "fr" ? fr : en;

  return (
    <div className="pt-32" data-testid="about-page">
      <section className="container-x">
        <p className="overline reveal">{c.overline}</p>
        <h1 className="mt-4 text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.92] text-[#0A0A0A] max-w-5xl reveal" style={{ fontFamily: "Montserrat" }}>
          {c.title}
        </h1>
        <p className="mt-10 max-w-2xl text-xl text-[#736B63] leading-relaxed reveal">{c.intro}</p>
      </section>

      <section className="container-x mt-24 grid md:grid-cols-2 gap-12 items-stretch">
        <div className="rounded-3xl overflow-hidden aspect-[4/5] reveal">
          <img src={ABOUT_IMG} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col gap-12 reveal">
          <div>
            <p className="overline">{c.missionLabel}</p>
            <p className="mt-4 text-3xl font-bold tracking-tight leading-tight text-[#0A0A0A]" style={{ fontFamily: "Montserrat" }}>
              {c.missionText}
            </p>
          </div>
          <div>
            <p className="overline text-[#F1C40F]">{c.visionLabel}</p>
            <p className="mt-4 text-3xl font-bold tracking-tight leading-tight text-[#0A0A0A]" style={{ fontFamily: "Montserrat" }}>
              {c.visionText}
            </p>
          </div>
          <div>
            <p className="overline text-[#3498DB]">{c.valuesLabel}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {c.values.map((v) => (
                <span key={v} className="px-4 py-2 rounded-full bg-[#F8F9FA] border border-black/5 text-sm font-semibold text-[#0A0A0A]">{v}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <div className="rounded-[40px] bg-[#0A0A0A] text-white p-12 md:p-20 reveal relative overflow-hidden grain">
            <Quote className="w-12 h-12 text-[#F1C40F] mb-6" />
            <p className="text-3xl md:text-4xl font-bold leading-tight max-w-4xl" style={{ fontFamily: "Montserrat" }}>{c.quote}</p>
            <p className="mt-8 text-white/60">— {c.quoteAuthor}</p>
          </div>
        </div>
      </section>

      <section className="section bg-[#F8F9FA]">
        <div className="container-x">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.95] mb-16 reveal" style={{ fontFamily: "Montserrat" }}>
            {c.timelineTitle}
          </h2>
          <div className="grid md:grid-cols-2 gap-x-16">
            {c.timeline.map((e, i) => (
              <div key={i} className="flex gap-6 py-6 border-b border-black/5 reveal">
                <span className="text-3xl font-black text-[#1A8F4D] min-w-[80px]" style={{ fontFamily: "Montserrat" }}>{e.y}</span>
                <p className="text-lg text-[#0A0A0A] leading-relaxed">{e.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x mb-32">
        <div className="rounded-[40px] overflow-hidden aspect-[21/9] reveal">
          <img src={TEAM_IMG} alt="" className="w-full h-full object-cover" />
        </div>
      </section>
    </div>
  );
}
