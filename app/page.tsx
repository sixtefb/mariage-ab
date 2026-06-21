"use client";
import { useRouter } from "next/navigation";

export default function Welcome() {
  const router = useRouter();

  return (
    <main style={{
      position: "fixed", inset: 0,
      display: "flex", flexDirection: "column", alignItems: "center",
      textAlign: "center", padding: "98px 34px 42px",
      background: "radial-gradient(120% 78% at 50% 0%, #FCF7F0 0%, #F4EADE 58%, #EEE1D2 100%)",
      animation: "fadeUp .6s ease",
      overflowY: "auto",
    }}>
      {/* Monogram */}
      <div style={{
        width: 62, height: 62, borderRadius: "50%",
        border: "1px solid #CA8A68",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#A85339",
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 21, letterSpacing: ".5px",
        animation: "floatY 5s ease-in-out infinite",
        flexShrink: 0,
      }}>A&amp;B</div>

      {/* Subtitle */}
      <div style={{ marginTop: 26, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#B08A6E" }}>
        Célébrons le mariage de
      </div>

      {/* Names */}
      <div style={{ marginTop: 14, fontFamily: "'Cormorant Garamond', serif", color: "#3A2A20", lineHeight: 0.96 }}>
        <div style={{ fontSize: 56, fontWeight: 500 }}>Alban</div>
        <div style={{ fontSize: 34, fontStyle: "italic", color: "#BE6A47", margin: "1px 0" }}>&amp;</div>
        <div style={{ fontSize: 56, fontWeight: 500 }}>Baptistine</div>
      </div>

      {/* Date */}
      <div style={{ marginTop: 20, fontSize: 12, letterSpacing: 4, color: "#9A8576" }}>04 · 07 · 2026</div>

      {/* Divider */}
      <div style={{ width: 38, height: 1, background: "#D9C3B0", margin: "24px 0" }} />

      {/* Description */}
      <div style={{ maxWidth: 282, fontSize: 14.5, lineHeight: 1.66, color: "#6B5D52" }}>
        Vos photos racontent cette journée. Ajoutez les vôtres, parcourez celles des autres, et glissez-nous un mot.
      </div>

      <div style={{ flex: 1, minHeight: 24 }} />

      {/* CTA */}
      <button
        onClick={() => router.push("/album")}
        style={{
          width: "100%", height: 56,
          background: "#BE6A47", color: "#fff",
          border: "none", borderRadius: 14,
          fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500,
          boxShadow: "0 10px 24px rgba(190,106,71,.32)",
          maxWidth: 400,
        }}
      >
        Entrer dans l'album
      </button>

      <div style={{ marginTop: 16, fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", color: "#B3A498" }}>
        Sans compte · visible par tous les invités
      </div>
    </main>
  );
}
