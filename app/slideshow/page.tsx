"use client";
import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, onSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Photo {
  id: string;
  author: string;
  photoUrl: string;
  album?: string;
}

export default function Slideshow() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setPhotos(snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })) as Photo[]);
    });
  }, []);

  // Auto-advance with crossfade
  useEffect(() => {
    if (photos.length < 2) return;
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % photos.length);
        setVisible(true);
      }, 700);
    }, 5000);
    return () => clearTimeout(timerRef.current);
  }, [idx, photos]);

  function prev() {
    clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(() => { setIdx((i) => (i - 1 + photos.length) % photos.length); setVisible(true); }, 300);
  }
  function next() {
    clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(() => { setIdx((i) => (i + 1) % photos.length); setVisible(true); }, 300);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  const cur = photos[idx];

  if (photos.length === 0) {
    return (
      <div style={{ minHeight: "100dvh", background: "#241C17", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "rgba(255,255,255,.5)", fontStyle: "italic" }}>
          En attente de photos…
        </div>
        <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,.25)" }}>
          Les photos des invités apparaîtront ici
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ position: "fixed", inset: 0, background: "#1A1310", overflow: "hidden", cursor: "none" }}
      onMouseMove={(e) => { (e.currentTarget as HTMLDivElement).style.cursor = "default"; clearTimeout((e.currentTarget as any)._ht); (e.currentTarget as any)._ht = setTimeout(() => { (e.currentTarget as HTMLDivElement).style.cursor = "none"; }, 2000); }}
    >
      {/* Background blur */}
      {cur && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cur.photoUrl}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(30px) brightness(0.3) saturate(0.6)", transform: "scale(1.1)", transition: "opacity .7s ease" }}
        />
      )}

      {/* Main photo */}
      {cur && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={cur.id}
          src={cur.photoUrl}
          alt={cur.author}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "contain",
            opacity: visible ? 1 : 0,
            transition: "opacity .7s ease",
          }}
        />
      )}

      {/* Gradient overlay bottom */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 180, background: "linear-gradient(to top, rgba(0,0,0,.7), transparent)", zIndex: 2 }} />

      {/* Author info */}
      {cur && (
        <div style={{
          position: "absolute", bottom: 40, left: 50, zIndex: 3,
          opacity: visible ? 1 : 0, transition: "opacity .7s ease",
        }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: "#fff", fontStyle: "italic" }}>
            {cur.author}
          </div>
          {cur.album && (
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,.5)", marginTop: 4 }}>
              {cur.album}
            </div>
          )}
        </div>
      )}

      {/* Counter + logo */}
      <div style={{ position: "absolute", top: 30, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", zIndex: 3 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "rgba(255,255,255,.6)", letterSpacing: 1 }}>
          A &amp; B
        </div>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,.4)", textTransform: "uppercase" }}>
          {idx + 1} / {photos.length}
        </div>
      </div>

      {/* Prev / Next arrows */}
      <div onClick={prev} style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "15%", zIndex: 4, display: "flex", alignItems: "center", paddingLeft: 20, cursor: "pointer" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 5l-7 7 7 7"/>
        </svg>
      </div>
      <div onClick={next} style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "15%", zIndex: 4, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 20, cursor: "pointer" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5l7 7-7 7"/>
        </svg>
      </div>

      {/* Fullscreen button */}
      <div onClick={toggleFullscreen} style={{ position: "absolute", bottom: 36, right: 40, zIndex: 5, cursor: "pointer", opacity: 0.5 }}>
        {isFullscreen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round">
            <path d="M8 3v3a2 2 0 01-2 2H3M21 8h-3a2 2 0 01-2-2V3M3 16h3a2 2 0 012 2v3M16 21v-3a2 2 0 012-2h3"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round">
            <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3"/>
          </svg>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,.1)", zIndex: 5 }}>
        <div style={{
          height: "100%", background: "#BE6A47",
          animation: "progress 5s linear",
          animationIterationCount: 1,
        }} />
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400&display=swap');
        @keyframes progress { from { width: 0% } to { width: 100% } }
      `}</style>
    </div>
  );
}
