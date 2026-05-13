import React from "react";
import { Helmet } from "react-helmet-async";
import { useLang } from "../context/LanguageContext";

const SITE = "CENADEP";
const DESC_FR = "Centre National d'Appui au Développement et à la Participation Populaire — ONG laïque et apolitique œuvrant pour le développement participatif et la démocratie en RDC.";
const DESC_EN = "National Centre for Support to Development and Popular Participation — secular, non-partisan NGO advancing participatory development and democracy in DRC.";
const HERO_OG = "https://images.unsplash.com/photo-1713468515390-95e9af5cb3ab?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80";

export const SEO = ({ title, description, image, path }) => {
  const { lang } = useLang();
  const fullTitle = title ? `${title} · ${SITE}` : `${SITE} · Cultivons la démocratie participative`;
  const desc = description || (lang === "fr" ? DESC_FR : DESC_EN);
  const url = (typeof window !== "undefined" ? window.location.origin : "") + (path || (typeof window !== "undefined" ? window.location.pathname : "/"));
  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={image || HERO_OG} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE} />
      <meta property="og:locale" content={lang === "fr" ? "fr_FR" : "en_US"} />
      <meta property="og:locale:alternate" content={lang === "fr" ? "en_US" : "fr_FR"} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image || HERO_OG} />
      <meta name="theme-color" content="#1A8F4D" />
    </Helmet>
  );
};
