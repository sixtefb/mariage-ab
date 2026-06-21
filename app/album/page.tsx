"use client";
import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, onSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import BottomNav from "@/components/BottomNav";

interface Photo {
  id: string;
  author: string;
  photoUrl: string;
  caption?: string;
  album?: string;
  createdAt: { seconds: number } | null;
}

const FILTERS = [
  { id: "tout",      label: "Tout" },
  { id: "cérémonie", label: "💒 Cérémonie" },
  { id: "cocktail",  label: "🥂 Cocktail" },
  { id: "soirée",    label: "🎶 Soirée" },
];

export default function Album() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("tout");
  const [carousel, setCarousel] = useState<{ open: boolean; idx: number }>({ open: false, idx: 0 });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [selectMode, setSelectMode] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setPhotos(snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })) as Photo[]);
      setLoading(false);
    });
  }, []);

  const filtered = filter === "tout" ? photos : photos.filter((p) => p.album === filter);
  const cur = filtered[carousel.idx];

  const touchStartX = useRef(0);
  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) setCarousel((c) => ({ ...c, idx: (c.idx + 1) % filtered.length }));
    else setCarousel((c) => ({ ...c, idx: (c.idx - 1 + filtered.length) % filtered.length }));
  }

  function toggleSelect(id: string) {
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function handlePhotoClick(photo: Photo, i: number) {
    if (selectMode) toggleSelect(photo.id);
    else setCarousel({ open: true, idx: i });
  }

  async function saveSelected() {
    const toSave = filtered.filter((p) => selected.has(p.id));
    if (!toSave.length) return;
    setSaving(true);
    if (navigator.canShare) {
      try {
        const files: File[] = await Promise.all(
          toSave.map(async (p, i) => {
            const res = await fetch(p.photoUrl);
            const blob = await res.blob();
            const ext = blob.type.includes("png") ? "png" : "jpg";
            return new File([blob], `mariage-AB-${i + 1}.${ext}`, { type: blob.type });
          })
        );
        if (navigator.canShare({ files })) {
          await navigator.share({ files, title: "Mariage Alban & Baptistine" });
          setSelected(new Set()); setSelectMode(false); setSaving(false);
          return;
        }
      } catch {}
    }
    toSave.forEach((p) => {
      const a = document.createElement("a");
      a.href = p.photoUrl; a.download = `mariage-AB.jpg`; a.target = "_blank"; a.click();
    });
    setSelected(new Set()); setSelectMode(false); setSaving(false);
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#F7F1E9", paddingBottom: 90 }}>

      {/* Header */}
      <div style={{ padding: "64px 22px 12px", animation: "fadeUp .4s ease" }}>
        <div style={{ fontSize: 10.5, letterSpacing: 2.5, textTransform: "uppercase", color: "#B08A6E" }}>
          Alban &amp; Baptistine · 04.07.26
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 500, color: "#3A2A20", lineHeight: 1, marginTop: 6 }}>
          L'album
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <div style={{ fontSize: 13, color: "#9A8576" }}>
            {loading ? "Chargement…" : `${filtered.length} souvenir${filtered.length !== 1 ? "s" : ""}`}
          </div>
          {!loading && photos.length > 0 && (
            <button onClick={() => { setSelectMode((v) => !v); setSelected(new Set()); }}
              style={{ background: "none", border: "none", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: selectMode ? "#BE6A47" : "#B08A6E", cursor: "pointer", fontFamily: "inherit" }}>
              {selectMode ? "Annuler" : "Sélectionner"}
            </button>
          )}
        </div>
      </div>

      {/* Album filter tabs */}
      <div style={{ display: "flex", gap: 6, padding: "8px 14px", overflowX: "auto" }}>
        {FILTERS.map((f) => {
          const count = f.id === "tout" ? photos.length : photos.filter((p) => p.album === f.id).length;
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); setCarousel({ open: false, idx: 0 }); }}
              style={{
                flexShrink: 0, height: 34, borderRadius: 50, cursor: "pointer",
                padding: "0 14px", fontFamily: "inherit",
                background: active ? "#BE6A47" : "#fff",
                color: active ? "#fff" : "#9A8576",
                fontSize: 12, letterSpacing: 0.5,
                boxShadow: active ? "0 4px 12px rgba(190,106,71,.25)" : "none",
                border: active ? "none" : "1px solid #E7DACE",
              } as React.CSSProperties}
            >
              {f.label}{count > 0 ? ` · ${count}` : ""}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "40px 22px", color: "#9A8576", fontSize: 14, fontStyle: "italic" }}>
          {filter === "tout" ? "Aucune photo pour l'instant." : `Aucune photo pour ${filter} pour l'instant.`}
          <br />Soyez le premier à en partager !
        </div>
      )}

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5, padding: "8px 14px 20px" }}>
        {filtered.map((photo, i) => {
          const isSelected = selected.has(photo.id);
          return (
            <div key={photo.id} onClick={() => handlePhotoClick(photo, i)}
              style={{ position: "relative", aspectRatio: "1/1", borderRadius: 3, overflow: "hidden", cursor: "pointer", background: "#D9C3B0" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.photoUrl} alt={photo.author} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(155deg, rgba(255,255,255,.08), rgba(0,0,0,.10))" }} />
              {selectMode && (
                <div style={{
                  position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: "50%",
                  background: isSelected ? "#BE6A47" : "rgba(255,255,255,0.7)",
                  border: isSelected ? "none" : "1.5px solid rgba(255,255,255,0.9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                }}>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L19 7"/>
                    </svg>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save bar */}
      {selectMode && (
        <div style={{ position: "fixed", bottom: 80, left: 0, right: 0, zIndex: 50, display: "flex", justifyContent: "center", padding: "0 20px" }}>
          <button onClick={saveSelected} disabled={selected.size === 0 || saving}
            style={{
              height: 52, borderRadius: 50, border: "none",
              background: selected.size > 0 ? "#BE6A47" : "#D9C3B0",
              color: "#fff", fontSize: 12, letterSpacing: 2, textTransform: "uppercase",
              fontWeight: 500, fontFamily: "inherit", cursor: selected.size > 0 ? "pointer" : "default",
              padding: "0 28px", boxShadow: selected.size > 0 ? "0 8px 20px rgba(190,106,71,.35)" : "none",
            }}>
            {saving ? "Enregistrement…" : selected.size > 0 ? `Enregistrer ${selected.size} photo${selected.size > 1 ? "s" : ""}` : "Sélectionne des photos"}
          </button>
        </div>
      )}

      {/* Carousel */}
      {carousel.open && cur && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#241C17", display: "flex", flexDirection: "column", animation: "fadeUp .25s ease" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "58px 20px 8px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: 12, letterSpacing: 2, color: "rgba(255,255,255,.7)" }}>{carousel.idx + 1} / {filtered.length}</div>
              {cur.album && <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,.4)" }}>{cur.album}</div>}
            </div>
            <div onClick={() => setCarousel((c) => ({ ...c, open: false }))}
              style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round">
                <path d="M5 5l14 14M19 5L5 19"/>
              </svg>
            </div>
          </div>
          <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
            style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
            <div onClick={() => setCarousel((c) => ({ ...c, idx: (c.idx - 1 + filtered.length) % filtered.length }))}
              style={{ position: "absolute", left: 8, top: 0, bottom: 0, width: 64, display: "flex", alignItems: "center", cursor: "pointer", zIndex: 2 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" stroke="rgba(255,255,255,.8)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
            </div>
            <div style={{ width: "100%", maxWidth: 420, maxHeight: "70dvh", borderRadius: 12, overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cur.photoUrl} alt={cur.author} style={{ width: "100%", height: "100%", objectFit: "contain", maxHeight: "70dvh" }} />
            </div>
            <div onClick={() => setCarousel((c) => ({ ...c, idx: (c.idx + 1) % filtered.length }))}
              style={{ position: "absolute", right: 8, top: 0, bottom: 0, width: 64, display: "flex", alignItems: "center", justifyContent: "flex-end", cursor: "pointer", zIndex: 2 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" stroke="rgba(255,255,255,.8)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>
          <div style={{ padding: "16px 26px 44px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: "#fff" }}>
                {(cur.author || "?").charAt(0)}
              </div>
              <div style={{ fontSize: 14, color: "#fff" }}>Partagé par {cur.author || "Un invité"}</div>
            </div>
            <a href={cur.photoUrl} download target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,.8)", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Garder
            </a>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
