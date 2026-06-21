"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const T = "#BE6A47";
const M = "#B3A498";

export default function BottomNav() {
  const path = usePathname();
  const c = (p: string) => path === p ? T : M;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      display: "flex",
      background: "#FBF6EF",
      borderTop: "1px solid #EADDCF",
      padding: "12px 0 calc(26px + env(safe-area-inset-bottom))",
    }}>
      <Link href="/album" style={navItem}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c("/album")} strokeWidth="1.6">
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/>
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/>
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/>
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>
        </svg>
        <span style={{ fontSize: 9, letterSpacing: 1.3, textTransform: "uppercase", color: c("/album") }}>Album</span>
      </Link>

      <Link href="/ajouter" style={navItem}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c("/ajouter")} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8.5h3l1.4-2h7.2L19 8.5h2a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1v-8a1 1 0 011-1z"/>
          <circle cx="12" cy="13" r="3.2"/>
        </svg>
        <span style={{ fontSize: 9, letterSpacing: 1.3, textTransform: "uppercase", color: c("/ajouter") }}>Ajouter</span>
      </Link>

      <Link href="/mot-doux" style={navItem}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c("/mot-doux")} strokeWidth="1.6">
          <rect x="3" y="5.5" width="18" height="13" rx="2.5"/>
          <path d="M3.5 7l8.5 6 8.5-6"/>
        </svg>
        <span style={{ fontSize: 9, letterSpacing: 1.3, textTransform: "uppercase", color: c("/mot-doux") }}>Mot doux</span>
      </Link>
    </div>
  );
}

const navItem: React.CSSProperties = {
  flex: 1, display: "flex", flexDirection: "column",
  alignItems: "center", gap: 5,
};
