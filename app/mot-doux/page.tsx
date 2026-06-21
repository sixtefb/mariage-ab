"use client";
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import BottomNav from "@/components/BottomNav";

export default function MotDoux() {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function send() {
    if (!note.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "notes"), {
        name: name.trim() || "Un invité",
        note: note.trim(),
        createdAt: serverTimestamp(),
      });
      setSent(true);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi. Réessaie !");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div style={{ minHeight: "100dvh", background: "#F7F1E9", paddingBottom: 90 }}>
        <div style={{ padding: "64px 22px 130px", animation: "fadeUp .45s ease", textAlign: "center", paddingTop: 100 }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="#BE6A47" style={{ display: "block", margin: "0 auto" }}>
            <path d="M12 21s-7.4-4.5-9.9-9.2C.5 8.4 2.1 5 5.2 5c2 0 3.3 1.1 4.8 3C11.5 6.1 12.8 5 14.8 5 17.9 5 19.5 8.4 21.9 11.8 19.4 16.5 12 21 12 21z"/>
          </svg>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 500, color: "#3A2A20", marginTop: 18 }}>
            Votre mot est envoyé
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "#9A8576", marginTop: 8, maxWidth: 260, margin: "8px auto 0" }}>
            Alban &amp; Baptistine le découvriront parmi les souvenirs de leur journée.
          </div>

          {/* Note preview card */}
          <div style={{ marginTop: 24, background: "#fff", border: "1px solid #ECE0D3", borderRadius: 16, padding: 20, textAlign: "left", boxShadow: "0 8px 22px rgba(120,80,50,.06)" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 18, lineHeight: 1.5, color: "#4A3B30" }}>
              {note}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#B08A6E" }}>
              — {name || "Un invité"}
            </div>
          </div>

          <div onClick={() => { setSent(false); setNote(""); setName(""); }}
            style={{ marginTop: 22, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: "#BE6A47", cursor: "pointer" }}>
            Écrire un autre mot
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#F7F1E9", paddingBottom: 90 }}>
      <div style={{ padding: "64px 22px 130px", animation: "fadeUp .4s ease" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B08A6E" strokeWidth="1.8">
            <rect x="5" y="11" width="14" height="10" rx="2"/>
            <path d="M8 11V7.5a4 4 0 018 0V11"/>
          </svg>
          <span style={{ fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: "#B08A6E" }}>
            Privé · lu par les mariés uniquement
          </span>
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 500, color: "#3A2A20", lineHeight: 1, marginTop: 10 }}>
          Un petit mot
        </div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "#9A8576", marginTop: 8 }}>
          Quelques lignes pour Alban &amp; Baptistine. Eux seuls les liront.
        </div>

        {/* Textarea */}
        <textarea
          value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="Écrivez vos mots aux mariés…"
          maxLength={800}
          rows={6}
          style={{
            width: "100%", marginTop: 18,
            background: "#fff", border: "1px solid #E7DACE", borderRadius: 14,
            padding: 14, fontSize: 14.5, lineHeight: 1.6,
            color: "#33291F", outline: "none", resize: "none",
          }}
        />

        {/* Name */}
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Votre prénom"
          style={{
            width: "100%", marginTop: 12,
            background: "#fff", border: "1px solid #E7DACE", borderRadius: 12,
            padding: "13px 14px", fontSize: 14, color: "#33291F", outline: "none",
          }}
        />

        {/* Send */}
        <button
          onClick={send}
          disabled={loading || !note.trim()}
          style={{
            width: "100%", height: 54, marginTop: 22,
            background: "#BE6A47", color: "#fff",
            border: "none", borderRadius: 14,
            fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500,
            boxShadow: "0 10px 22px rgba(190,106,71,.30)",
            opacity: !note.trim() || loading ? 0.5 : 1,
          }}
        >
          {loading ? "Envoi…" : "Envoyer mon mot"}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
