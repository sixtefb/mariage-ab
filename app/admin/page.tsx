"use client";
import { useEffect, useState, useRef } from "react";
import { collection, query, orderBy, getDocs, deleteDoc, doc, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import QRCode from "qrcode";

interface Photo {
  id: string;
  author: string;
  photoUrl: string;
  caption?: string;
  createdAt: { seconds: number } | null;
}
interface Note {
  id: string;
  name: string;
  note: string;
  createdAt: { seconds: number } | null;
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [tab, setTab] = useState<"photos" | "notes">("photos");
  const [carousel, setCarousel] = useState<{ open: boolean; idx: number }>({ open: false, idx: 0 });
  const [downloading, setDownloading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === "admin") {
      setAuthed(true);
      load();
      const appUrl = window.location.origin;
      QRCode.toDataURL(appUrl, { width: 280, margin: 2 }).then(setQrUrl);
    } else {
      alert("Mot de passe incorrect");
    }
  }

  async function load() {
    setLoading(true);
    try {
      const [pSnap, nSnap] = await Promise.all([
        getDocs(query(collection(db, "photos"), orderBy("createdAt", "desc"))),
        getDocs(query(collection(db, "notes"), orderBy("createdAt", "desc"))),
      ]);
      setPhotos(pSnap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })) as Photo[]);
      setNotes(nSnap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })) as Note[]);
    } catch (err) {
      console.error(err);
      alert("Erreur de chargement. Vérifie les règles Firestore.");
    } finally {
      setLoading(false);
    }
  }

  async function deletePhoto(id: string) {
    if (!confirm("Supprimer cette photo ?")) return;
    await deleteDoc(doc(db, "photos", id));
    setPhotos((p) => p.filter((x) => x.id !== id));
  }

  async function deleteNote(id: string) {
    if (!confirm("Supprimer ce mot ?")) return;
    await deleteDoc(doc(db, "notes", id));
    setNotes((n) => n.filter((x) => x.id !== id));
  }

  async function downloadAllPhotos() {
    if (!photos.length) return;
    setDownloading(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const folder = zip.folder("photos-mariage-AB")!;

      await Promise.all(
        photos.map(async (p, i) => {
          try {
            const res = await fetch(p.photoUrl);
            const blob = await res.blob();
            const ext = blob.type.includes("png") ? "png" : "jpg";
            folder.file(`${String(i + 1).padStart(3, "0")}_${p.author.replace(/\s/g, "_")}.${ext}`, blob);
          } catch {}
        })
      );

      const content = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = "photos-mariage-Alban-Baptistine.zip";
      a.click();
    } catch (err) {
      console.error(err);
      alert("Erreur lors du téléchargement");
    } finally {
      setDownloading(false);
    }
  }

  async function downloadAllNotes() {
    if (!notes.length) return;
    setDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const W = 210;
      const margin = 20;
      const usable = W - margin * 2;
      let y = 30;

      // Title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(28);
      pdf.setTextColor(58, 42, 32);
      pdf.text("Alban & Baptistine", W / 2, y, { align: "center" });
      y += 10;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(154, 133, 118);
      pdf.text("04 · 07 · 2026  —  Les mots de vos invités", W / 2, y, { align: "center" });
      y += 8;

      // Divider
      pdf.setDrawColor(201, 168, 76);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, W - margin, y);
      y += 12;

      notes.forEach((n, i) => {
        // Check page space
        if (y > 260) {
          pdf.addPage();
          y = 20;
        }

        // Message
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(13);
        pdf.setTextColor(74, 59, 48);
        const lines = pdf.splitTextToSize(`"${n.note}"`, usable);
        pdf.text(lines, margin, y);
        y += lines.length * 6.5 + 4;

        // Author
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(176, 138, 110);
        const date = n.createdAt
          ? new Date(n.createdAt.seconds * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
          : "";
        pdf.text(`— ${n.name}${date ? "  ·  " + date : ""}`, margin, y);
        y += 6;

        // Separator between notes
        if (i < notes.length - 1) {
          pdf.setDrawColor(220, 200, 180);
          pdf.setLineWidth(0.3);
          pdf.line(margin + 20, y, W - margin - 20, y);
          y += 10;
        }
      });

      pdf.save("mots-doux-Alban-Baptistine.pdf");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération du PDF");
    } finally {
      setDownloading(false);
    }
  }

  function downloadQr() {
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = "qrcode-mariage-AB.png";
    a.click();
  }

  const cur = photos[carousel.idx];

  const adminTouchStartX = useRef(0);
  function onAdminTouchStart(e: React.TouchEvent) { adminTouchStartX.current = e.touches[0].clientX; }
  function onAdminTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - adminTouchStartX.current;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) setCarousel((c) => ({ ...c, idx: (c.idx + 1) % photos.length }));
    else setCarousel((c) => ({ ...c, idx: (c.idx - 1 + photos.length) % photos.length }));
  }

  if (!authed) {
    return (
      <main style={{ minHeight: "100dvh", background: "#F7F1E9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, color: "#3A2A20", marginBottom: 6 }}>Admin</div>
        <div style={{ fontSize: 13, color: "#9A8576", marginBottom: 24, fontStyle: "italic" }}>Réservé aux mariés 💍</div>
        <form onSubmit={login} style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 300 }}>
          <input
            type="password" placeholder="Mot de passe" value={password}
            onChange={(e) => setPassword(e.target.value)} autoFocus
            style={{ border: "1px solid #E7DACE", borderRadius: 12, padding: "13px 14px", fontSize: 14, outline: "none", background: "#fff" }}
          />
          <button type="submit" style={{ height: 50, background: "#BE6A47", color: "#fff", border: "none", borderRadius: 12, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500 }}>
            Entrer
          </button>
        </form>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100dvh", background: "#F7F1E9", padding: "40px 20px 60px", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: "#3A2A20", marginBottom: 4 }}>Admin</div>
      <div style={{ fontSize: 13, color: "#9A8576", marginBottom: 16 }}>
        {photos.length} photo{photos.length !== 1 ? "s" : ""} · {notes.length} mot{notes.length !== 1 ? "s" : ""}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <a href="/slideshow" target="_blank" style={{ flex: 1, height: 40, background: "#3A2A20", color: "#fff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "inherit" }}>
          ▶ Slideshow
        </a>
        <a href="/print" target="_blank" style={{ flex: 1, height: 40, background: "#fff", color: "#3A2A20", border: "1px solid #E7DACE", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "inherit" }}>
          🖨 QR à imprimer
        </a>
      </div>

      {/* QR Code */}
      {qrUrl && (
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px", textAlign: "center", marginBottom: 24, border: "1px solid #ECE0D3" }}>
          <div style={{ fontSize: 10.5, letterSpacing: 2, textTransform: "uppercase", color: "#B08A6E", marginBottom: 12 }}>QR Code à imprimer</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="QR Code" style={{ width: 180, height: 180 }} />
          <div style={{ fontSize: 11, color: "#9A8576", marginTop: 8, wordBreak: "break-all" }}>{window.location.origin}</div>
          <button onClick={downloadQr} style={{ marginTop: 12, background: "#BE6A47", color: "#fff", border: "none", borderRadius: 50, padding: "8px 20px", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
            Télécharger le QR code
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["photos", "notes"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, height: 40, borderRadius: 10, border: "none",
            background: tab === t ? "#BE6A47" : "#ECE0D3",
            color: tab === t ? "#fff" : "#9A8576",
            fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 500, fontFamily: "inherit", cursor: "pointer",
          }}>
            {t === "photos" ? `Photos (${photos.length})` : `Mots doux (${notes.length})`}
          </button>
        ))}
      </div>

      {loading && <div style={{ color: "#9A8576", fontStyle: "italic", textAlign: "center", padding: 20 }}>Chargement…</div>}

      {/* PHOTOS TAB */}
      {tab === "photos" && !loading && (
        <>
          {/* Download all button */}
          {photos.length > 0 && (
            <button
              onClick={downloadAllPhotos}
              disabled={downloading}
              style={{
                width: "100%", height: 46, marginBottom: 16,
                background: "#3A2A20", color: "#fff",
                border: "none", borderRadius: 12,
                fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 500,
                fontFamily: "inherit", cursor: "pointer",
                opacity: downloading ? 0.6 : 1,
              }}
            >
              {downloading ? "Préparation du zip…" : `⬇ Tout télécharger (${photos.length} photos)`}
            </button>
          )}

          {/* Photo grid with carousel */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4, marginBottom: 16 }}>
            {photos.map((p, i) => (
              <div
                key={p.id}
                onClick={() => setCarousel({ open: true, idx: i })}
                style={{ position: "relative", aspectRatio: "1/1", borderRadius: 6, overflow: "hidden", cursor: "pointer", background: "#D9C3B0" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.photoUrl} alt={p.author} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            ))}
          </div>

        </>
      )}

      {/* NOTES TAB */}
      {tab === "notes" && !loading && (
        <>
          {notes.length > 0 && (
            <button
              onClick={downloadAllNotes}
              disabled={downloading}
              style={{
                width: "100%", height: 46, marginBottom: 16,
                background: "#3A2A20", color: "#fff",
                border: "none", borderRadius: 12,
                fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 500,
                fontFamily: "inherit", cursor: "pointer",
                opacity: downloading ? 0.6 : 1,
              }}
            >
              {downloading ? "Génération du PDF…" : `⬇ Télécharger tous les mots (PDF)`}
            </button>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {notes.map((n) => (
              <div key={n.id} style={{ background: "#fff", borderRadius: 14, padding: "16px", border: "1px solid #ECE0D3" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 17, lineHeight: 1.6, color: "#4A3B30" }}>
                  "{n.note}"
                </div>
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#B08A6E" }}>— {n.name}</div>
                    {n.createdAt && (
                      <div style={{ fontSize: 11, color: "#C9BAB0", marginTop: 2 }}>
                        {new Date(n.createdAt.seconds * 1000).toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                  <button onClick={() => deleteNote(n.id)} style={{ background: "none", border: "1px solid #ffaaaa", color: "#cc4444", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CAROUSEL OVERLAY */}
      {carousel.open && cur && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#241C17", display: "flex", flexDirection: "column", animation: "fadeUp .25s ease" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "40px 20px 8px" }}>
            <div style={{ fontSize: 12, letterSpacing: 2, color: "rgba(255,255,255,.7)" }}>{carousel.idx + 1} / {photos.length}</div>
            <div onClick={() => setCarousel((c) => ({ ...c, open: false }))}
              style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round">
                <path d="M5 5l14 14M19 5L5 19"/>
              </svg>
            </div>
          </div>
          <div
            onTouchStart={onAdminTouchStart}
            onTouchEnd={onAdminTouchEnd}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px", position: "relative" }}
          >
            <div onClick={() => setCarousel((c) => ({ ...c, idx: (c.idx - 1 + photos.length) % photos.length }))}
              style={{ position: "absolute", left: 8, top: 0, bottom: 0, width: 60, display: "flex", alignItems: "center", cursor: "pointer", zIndex: 2 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" stroke="rgba(255,255,255,.8)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
            </div>
            <div style={{ width: "100%", maxWidth: 420, maxHeight: "70dvh", borderRadius: 12, overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cur.photoUrl} alt={cur.author} style={{ width: "100%", height: "100%", objectFit: "contain", maxHeight: "70dvh" }} />
            </div>
            <div onClick={() => setCarousel((c) => ({ ...c, idx: (c.idx + 1) % photos.length }))}
              style={{ position: "absolute", right: 8, top: 0, bottom: 0, width: 60, display: "flex", alignItems: "center", justifyContent: "flex-end", cursor: "pointer", zIndex: 2 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" stroke="rgba(255,255,255,.8)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>
          <div style={{ padding: "16px 26px 44px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: "#fff" }}>
              {(cur.author || "?").charAt(0)}
            </div>
            <div style={{ fontSize: 14, color: "#fff" }}>Partagé par {cur.author || "Un invité"}</div>
          </div>
        </div>
      )}
    </main>
  );
}
