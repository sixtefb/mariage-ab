"use client";
import { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/navigation";

const ALBUMS = [
  { id: "cérémonie", label: "Cérémonie", emoji: "💒" },
  { id: "cocktail",  label: "Cocktail",  emoji: "🥂" },
  { id: "soirée",    label: "Soirée",    emoji: "🎶" },
];

export default function Ajouter() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [album, setAlbum] = useState("cérémonie");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;
    setFiles((f) => [...f, ...picked]);
    setPreviews((p) => [...p, ...picked.map((f) => URL.createObjectURL(f))]);
  }

  function remove(i: number) {
    setFiles((f) => f.filter((_, k) => k !== i));
    setPreviews((p) => p.filter((_, k) => k !== i));
  }

  async function publish() {
    if (!files.length) return;
    setLoading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const photoUrl = await uploadToCloudinary(files[i]);
        await addDoc(collection(db, "photos"), {
          author: name.trim() || "Un invité",
          photoUrl,
          album,
          caption: "",
          createdAt: serverTimestamp(),
        });
      }
      setDone(true);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi. Réessaie !");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={{ minHeight: "100dvh", background: "#F7F1E9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 22px", textAlign: "center", animation: "fadeUp .45s ease" }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="#BE6A47" style={{ display: "block", margin: "0 auto" }}>
          <path d="M12 21s-7.4-4.5-9.9-9.2C.5 8.4 2.1 5 5.2 5c2 0 3.3 1.1 4.8 3C11.5 6.1 12.8 5 14.8 5 17.9 5 19.5 8.4 21.9 11.8 19.4 16.5 12 21 12 21z"/>
        </svg>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 500, color: "#3A2A20", marginTop: 18 }}>
          Vos photos sont dans l'album
        </div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "#9A8576", marginTop: 8, maxWidth: 260 }}>
          Merci ! Tous les invités peuvent maintenant les voir.
        </div>
        <button
          onClick={() => { setDone(false); setFiles([]); setPreviews([]); setName(""); router.push("/album"); }}
          style={{ marginTop: 28, height: 54, background: "#BE6A47", color: "#fff", border: "none", borderRadius: 14, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500, padding: "0 32px", boxShadow: "0 10px 22px rgba(190,106,71,.30)", fontFamily: "inherit", cursor: "pointer" }}
        >
          Voir l'album
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#F7F1E9", paddingBottom: 110 }}>
      <div style={{ padding: "64px 22px 130px", animation: "fadeUp .4s ease" }}>
        <div style={{ fontSize: 10.5, letterSpacing: 2.5, textTransform: "uppercase", color: "#B08A6E" }}>Partager un souvenir</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 500, color: "#3A2A20", lineHeight: 1, marginTop: 6 }}>
          Vos photos
        </div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "#9A8576", marginTop: 8 }}>
          Elles rejoindront l'album, visible par tous les invités du mariage.
        </div>

        {/* Album selector */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: "#B08A6E", marginBottom: 10 }}>Moment de la journée</div>
          <div style={{ display: "flex", gap: 8 }}>
            {ALBUMS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAlbum(a.id)}
                style={{
                  flex: 1, height: 52, borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                  background: album === a.id ? "#BE6A47" : "#fff",
                  color: album === a.id ? "#fff" : "#9A8576",
                  border: album === a.id ? "none" : "1px solid #E7DACE",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                } as React.CSSProperties}
              >
                <span style={{ fontSize: 18 }}>{a.emoji}</span>
                <span style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase" }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upload zone */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            marginTop: 18,
            border: "1.5px dashed #D8B79E", borderRadius: 18,
            background: "#FBF5EE", padding: "38px 20px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 13,
            cursor: "pointer",
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F1DECE", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#BE6A47" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8.5h3l1.4-2h7.2L19 8.5h2a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1v-8a1 1 0 011-1z"/>
              <circle cx="12" cy="13" r="3.4"/>
            </svg>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 23, color: "#3A2A20", whiteSpace: "nowrap" }}>
            Choisir des photos
          </div>
          <div style={{ fontSize: 12, color: "#9A8576", letterSpacing: .3 }}>depuis votre pellicule</div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFiles} />

        {/* Name */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: "#B08A6E" }}>Votre prénom (facultatif)</div>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Camille"
            style={{ width: "100%", marginTop: 8, background: "#fff", border: "1px solid #E7DACE", borderRadius: 12, padding: "13px 14px", fontSize: 14, color: "#33291F", outline: "none" }}
          />
        </div>

        {/* Staged previews */}
        {previews.length > 0 && (
          <div style={{ marginTop: 26 }}>
            <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: "#B08A6E" }}>
              Sélection · {previews.length}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginTop: 11 }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: "relative", aspectRatio: "1/1", borderRadius: 9, overflow: "hidden", background: "#D9C3B0" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div onClick={() => remove(i)}
                    style={{ position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: "50%", background: "rgba(36,28,23,.55)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round">
                      <path d="M6 6l12 12M18 6L6 18"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={publish} disabled={loading}
              style={{ width: "100%", height: 54, marginTop: 18, background: "#BE6A47", color: "#fff", border: "none", borderRadius: 14, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500, boxShadow: "0 10px 22px rgba(190,106,71,.30)", opacity: loading ? 0.7 : 1, fontFamily: "inherit", cursor: "pointer" }}
            >
              {loading ? "Publication…" : `Ajouter ${previews.length} photo${previews.length > 1 ? "s" : ""} · ${ALBUMS.find(a => a.id === album)?.emoji} ${album}`}
            </button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
