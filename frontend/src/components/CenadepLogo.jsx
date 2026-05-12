import React from "react";

export const CenadepLogo = ({ className = "", variant = "color" }) => {
  const green = variant === "mono" ? "#0A0A0A" : "#1A8F4D";
  const gray = variant === "mono" ? "#0A0A0A" : "#736B63";
  const gold = variant === "mono" ? "#0A0A0A" : "#F1C40F";
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CENADEP logo"
    >
      <circle cx="32" cy="30" r="22" fill={gold} opacity={variant === "mono" ? 0.0 : 0.18} />
      {/* rays */}
      {[...Array(8)].map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const x1 = 32 + Math.cos(a) * 22;
        const y1 = 30 + Math.sin(a) * 22;
        const x2 = 32 + Math.cos(a) * 28;
        const y2 = 30 + Math.sin(a) * 28;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={gold} strokeWidth="1.5" strokeLinecap="round" opacity={variant === "mono" ? 0 : 0.7} />
        );
      })}
      {/* socle */}
      <path d="M10 50 Q32 38 54 50 Q54 56 32 56 Q10 56 10 50 Z" fill={gray} />
      {/* ascending shape - leaf / arrow */}
      <path
        d="M32 12 C24 22 22 32 28 44 C30 38 32 34 34 30 C36 36 38 40 40 44 C44 32 40 22 32 12 Z"
        fill={green}
      />
    </svg>
  );
};

export const CenadepWordmark = ({ className = "" }) => (
  <span className={`font-extrabold tracking-tight ${className}`} style={{ fontFamily: "Montserrat, sans-serif" }}>
    CENADEP
  </span>
);
