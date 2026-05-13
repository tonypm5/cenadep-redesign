import React from "react";

export const CenadepLogo = ({ className = "" }) => (
  <img
    src="/brand/cenadep-favicon.jpg"
    alt="CENADEP"
    className={`${className} object-contain rounded-full bg-white`}
    style={{ aspectRatio: "1/1" }}
  />
);

export const CenadepWordmark = ({ className = "" }) => (
  <span className={`font-extrabold tracking-tight ${className}`} style={{ fontFamily: "Montserrat, sans-serif" }}>
    CENADEP
  </span>
);

export const CenadepFullLogo = ({ className = "" }) => (
  <img src="/brand/cenadep-logo.jpg" alt="CENADEP — Centre National d'Appui au Développement et à la Participation Populaire" className={className} />
);
