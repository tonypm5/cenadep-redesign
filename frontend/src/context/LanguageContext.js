import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext(null);

const STORAGE_KEY = "cenadep_lang";

export const translations = {
  fr: {
    nav: {
      home: "Accueil",
      about: "À propos",
      programmes: "Programmes",
      blog: "Blog",
      impact: "Impact",
      news: "Actualités",
      contact: "Contact",
      donate: "Faire un don",
    },
    home: {
      overline: "Société civile · RDC · Depuis 1994",
      title1: "Cultivons",
      title2: "la démocratie",
      title3: "participative.",
      subtitle:
        "Le CENADEP accompagne les communautés congolaises dans la construction d'une République transparente, inclusive et résiliente.",
      ctaPrimary: "Découvrir nos programmes",
      ctaSecondary: "Soutenir le mouvement",
      pillarsTag: "Nos trois piliers",
      pillarsTitle: "Une vision, trois forces.",
      pillar1Title: "Terre & Communauté",
      pillar1Desc:
        "La fertilité de l'ancrage local. Nous accompagnons les coopératives, les comités villageois et l'économie populaire.",
      pillar2Title: "Participation & Éveil",
      pillar2Desc:
        "La citoyenneté active. Nous formons une génération outillée pour le dialogue démocratique et la gouvernance.",
      pillar3Title: "Rayonnement & Espoir",
      pillar3Desc:
        "La transparence comme horizon. Nous portons la voix des communautés jusque dans les institutions nationales.",
      impactTag: "L'impact en chiffres",
      impactTitle: "Trois décennies d'action communautaire.",
      stats: [
        { value: 500000, suffix: "+", label: "Citoyens formés à la gouvernance" },
        { value: 26, suffix: "", label: "Provinces couvertes en RDC" },
        { value: 1200, suffix: "+", label: "Comités locaux accompagnés" },
        { value: 32, suffix: "", label: "Années d'engagement (1994 → aujourd'hui)" },
      ],
      newsTag: "Notre journal",
      newsTitle: "Lectures fraîches du terrain.",
      newsLink: "Lire tous les articles",
      ctaBigTag: "Engagez-vous",
      ctaBigTitle: "Votre voix bâtit la République.",
      ctaBigDesc:
        "Soutenez une organisation laïque et apolitique qui transforme la démocratie congolaise depuis le terrain.",
    },
    common: {
      readMore: "Lire l'article",
      learnMore: "En savoir plus",
      backHome: "Retour à l'accueil",
      send: "Envoyer",
      submit: "Soumettre",
      loading: "Chargement…",
    },
    chatbot: {
      title: "Assistant CENADEP",
      placeholder: "Posez-nous une question…",
      welcome:
        "Bonjour ! Je suis l'assistant virtuel du CENADEP. Comment puis-je vous orienter aujourd'hui ?",
    },
    contact: {
      tag: "Parlons",
      title: "Écrivez-nous, nous répondons.",
      name: "Nom complet",
      email: "Adresse e-mail",
      subject: "Sujet",
      message: "Votre message",
      sent: "Message envoyé. Merci !",
      address:
        "Avenue de la Démocratie, Kinshasa-Gombe, République Démocratique du Congo",
    },
    donate: {
      tag: "Faire un don",
      title: "Chaque contribution sème une démocratie plus forte.",
      desc:
        "Vos dons financent directement la formation citoyenne, l'observation budgétaire et l'accompagnement des communautés rurales.",
      selectAmount: "Choisissez un montant",
      custom: "Montant libre",
      donorName: "Votre nom (facultatif)",
      donorEmail: "Votre e-mail (facultatif)",
      donateBtn: "Faire un don sécurisé",
      success: "Merci pour votre don !",
      verifying: "Vérification du paiement…",
      cancelled: "Don annulé",
    },
  },
  en: {
    nav: {
      home: "Home",
      about: "About",
      programmes: "Programs",
      blog: "Blog",
      impact: "Impact",
      news: "News",
      contact: "Contact",
      donate: "Donate",
    },
    home: {
      overline: "Civil society · DRC · Since 1994",
      title1: "Let us grow",
      title2: "participatory",
      title3: "democracy.",
      subtitle:
        "CENADEP stands beside Congolese communities to build a transparent, inclusive and resilient Republic.",
      ctaPrimary: "Explore our programs",
      ctaSecondary: "Support the movement",
      pillarsTag: "Our three pillars",
      pillarsTitle: "One vision, three forces.",
      pillar1Title: "Land & Community",
      pillar1Desc:
        "The fertility of local roots. We accompany cooperatives, village committees and the people's economy.",
      pillar2Title: "Participation & Awakening",
      pillar2Desc:
        "Active citizenship. We equip a new generation to engage in democratic dialogue and good governance.",
      pillar3Title: "Radiance & Hope",
      pillar3Desc:
        "Transparency as a horizon. We carry communities' voices all the way to national institutions.",
      impactTag: "Impact in numbers",
      impactTitle: "Three decades of grassroots action.",
      stats: [
        { value: 500000, suffix: "+", label: "Citizens trained in governance" },
        { value: 26, suffix: "", label: "Provinces covered in DRC" },
        { value: 1200, suffix: "+", label: "Local committees supported" },
        { value: 32, suffix: "", label: "Years of commitment (1994 → today)" },
      ],
      newsTag: "Our journal",
      newsTitle: "Fresh reads from the field.",
      newsLink: "Read all articles",
      ctaBigTag: "Get involved",
      ctaBigTitle: "Your voice builds the Republic.",
      ctaBigDesc:
        "Support a secular, non-partisan organization transforming Congolese democracy from the ground up.",
    },
    common: {
      readMore: "Read article",
      learnMore: "Learn more",
      backHome: "Back home",
      send: "Send",
      submit: "Submit",
      loading: "Loading…",
    },
    chatbot: {
      title: "CENADEP Assistant",
      placeholder: "Ask us anything…",
      welcome: "Hello! I am the CENADEP virtual assistant. How can I guide you today?",
    },
    contact: {
      tag: "Let's talk",
      title: "Write to us, we answer.",
      name: "Full name",
      email: "Email address",
      subject: "Subject",
      message: "Your message",
      sent: "Message sent. Thank you!",
      address:
        "Avenue de la Démocratie, Kinshasa-Gombe, Democratic Republic of Congo",
    },
    donate: {
      tag: "Donate",
      title: "Every contribution seeds a stronger democracy.",
      desc:
        "Your gifts directly fund civic training, budget watchdog work and rural community support.",
      selectAmount: "Choose an amount",
      custom: "Custom amount",
      donorName: "Your name (optional)",
      donorEmail: "Your email (optional)",
      donateBtn: "Donate securely",
      success: "Thank you for your gift!",
      verifying: "Verifying payment…",
      cancelled: "Donation cancelled",
    },
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem(STORAGE_KEY) || "fr");
  useEffect(() => { localStorage.setItem(STORAGE_KEY, lang); }, [lang]);
  const t = translations[lang];
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
