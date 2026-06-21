"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function Print() {
  const [qrUrl, setQrUrl] = useState("");
  const [appUrl, setAppUrl] = useState("");

  useEffect(() => {
    const url = window.location.origin;
    setAppUrl(url);
    QRCode.toDataURL(url, {
      width: 600,
      margin: 2,
      color: { dark: "#3A2A20", light: "#FDF6EE" },
    }).then(setQrUrl);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; }
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* Print button — hidden when printing */}
      <div className="no-print" style={{ textAlign: "center", padding: "20px", background: "#F7F1E9" }}>
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, color: "#9A8576", marginBottom: 12 }}>
          Imprime cette page en format A5 et pose-la sur les tables
        </p>
        <button
          onClick={() => window.print()}
          style={{ background: "#BE6A47", color: "#fff", border: "none", borderRadius: 50, padding: "10px 28px", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Jost', sans-serif", cursor: "pointer" }}
        >
          Imprimer
        </button>
      </div>

      {/* A5 card — 148mm × 210mm */}
      <div style={{
        width: "148mm", minHeight: "210mm",
        margin: "20px auto",
        background: "#FDF6EE",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center",
        padding: "14mm 12mm",
        fontFamily: "'Jost', sans-serif",
        position: "relative",
        border: "1px solid #E8D8C4",
      }}>
        {/* Corner ornaments */}
        {["topleft","topright","bottomleft","bottomright"].map((pos) => (
          <div key={pos} style={{
            position: "absolute",
            top: pos.includes("top") ? 8 : "auto",
            bottom: pos.includes("bottom") ? 8 : "auto",
            left: pos.includes("left") ? 8 : "auto",
            right: pos.includes("right") ? 8 : "auto",
            width: 20, height: 20,
            borderTop: pos.includes("top") ? "1px solid #CA8A68" : "none",
            borderBottom: pos.includes("bottom") ? "1px solid #CA8A68" : "none",
            borderLeft: pos.includes("left") ? "1px solid #CA8A68" : "none",
            borderRight: pos.includes("right") ? "1px solid #CA8A68" : "none",
          }}/>
        ))}

        {/* Monogram */}
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          border: "1px solid #CA8A68",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#A85339", fontFamily: "'Cormorant Garamond', serif",
          fontSize: 18, letterSpacing: 1, marginBottom: 10,
        }}>A&amp;B</div>

        {/* Names */}
        <div style={{ fontFamily: "'Cormorant Garamond', serif", color: "#3A2A20", lineHeight: 1 }}>
          <div style={{ fontSize: 36, fontWeight: 500 }}>Alban</div>
          <div style={{ fontSize: 22, fontStyle: "italic", color: "#BE6A47", margin: "2px 0" }}>&amp;</div>
          <div style={{ fontSize: 36, fontWeight: 500 }}>Baptistine</div>
        </div>

        {/* Date */}
        <div style={{ marginTop: 10, fontSize: 10, letterSpacing: 4, color: "#9A8576", textTransform: "uppercase" }}>
          04 · 07 · 2026
        </div>

        {/* Divider */}
        <div style={{ width: 30, height: "0.5px", background: "#D9C3B0", margin: "14px 0" }} />

        {/* QR Code */}
        {qrUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrUrl} alt="QR Code" style={{ width: 130, height: 130 }} />
        )}

        {/* CTA */}
        <div style={{ marginTop: 12, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#B08A6E" }}>
          Scannez pour partager
        </div>
        <div style={{ marginTop: 4, fontSize: 10, color: "#BE6A47", letterSpacing: 1 }}>
          vos photos & vos mots
        </div>

        {/* URL */}
        <div style={{ marginTop: 10, fontSize: 8, color: "#C9BAB0", letterSpacing: 0.5, wordBreak: "break-all" }}>
          {appUrl}
        </div>
      </div>
    </>
  );
}
