import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Users, Settings, LogOut, Plus } from "lucide-react";
import { api } from "../lib/api";

interface SidebarProps {
  onLogout: () => void;
}

const navLinks = [
  { href: "/",         label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads",    label: "Leads",     icon: Users },
  { href: "/settings", label: "Settings",  icon: Settings },
];

const K_LOGO = "https://static.showit.co/200/0CrL-cInTnquIoalvzzssQ/219535/keep-mini-spaces-icon-dark-olive-rgb-900px-w-72ppi.png";

export default function Sidebar({ onLogout }: SidebarProps) {
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try { await api.logout(); } catch {}
    queryClient.clear();
    onLogout();
  };

  return (
    <aside style={{
      width: "228px",
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#FFFFFF",
      borderRight: "1px solid #E8E8E8",
      height: "100vh",
      position: "sticky",
      top: 0,
    }}>

      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div
        onClick={() => navigate("/")}
        style={{
          padding: "1.375rem 1.25rem 1.125rem",
          borderBottom: "1px solid #E8E8E8",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
          userSelect: "none",
        }}
      >
        <img
          src={K_LOGO}
          alt="Keep"
          style={{ width: "30px", height: "30px", objectFit: "contain", flexShrink: 0 }}
        />
        <div>
          <div style={{
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 600,
            color: "#111111",
            fontSize: "15px",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}>
            Keep Group
          </div>
          <div style={{
            color: "#999999",
            fontSize: "10px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginTop: "2px",
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 500,
          }}>
            Trixie OS
          </div>
        </div>
      </div>

      {/* ── New Lead button ───────────────────────────────────────────────── */}
      <div style={{ padding: "0.875rem 1rem 0.25rem" }}>
        <button
          onClick={() => navigate("/leads/new")}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.375rem",
            padding: "0.5rem 0.75rem",
            backgroundColor: "#111111",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.8125rem",
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 500,
            cursor: "pointer",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#333333")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#111111")}
        >
          <Plus size={13} />
          New Lead
        </button>
      </div>

      {/* ── Nav links ────────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: "0.5rem 0.75rem", display: "flex", flexDirection: "column", gap: "1px" }}>
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? location === "/" : location.startsWith(href);
          return (
            <button
              key={href}
              onClick={() => navigate(href)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: active ? "0.5625rem 0.75rem 0.5625rem calc(0.75rem - 2px)" : "0.5625rem 0.75rem",
                borderRadius: "6px",
                border: "none",
                borderLeft: active ? "2px solid #4A5240" : "2px solid transparent",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: active ? 500 : 400,
                backgroundColor: active ? "#F5F5F5" : "transparent",
                color: active ? "#111111" : "#666666",
                textAlign: "left",
                width: "100%",
                transition: "background-color 0.12s, color 0.12s",
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "#F5F5F5";
                  e.currentTarget.style.color = "#111111";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#666666";
                }
              }}
            >
              <Icon size={15} strokeWidth={active ? 2 : 1.75} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* ── Layer label ──────────────────────────────────────────────────── */}
      <div style={{
        padding: "0.625rem 1.25rem",
        fontSize: "9px",
        color: "#CCCCCC",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontFamily: '"DM Sans", sans-serif',
        borderTop: "1px solid #E8E8E8",
      }}>
        Layer 2 · Client Pipeline
      </div>

      {/* ── Sign out ─────────────────────────────────────────────────────── */}
      <button
        onClick={handleLogout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.875rem 1.25rem",
          borderTop: "1px solid #E8E8E8",
          backgroundColor: "transparent",
          border: "none",
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderTopColor: "#E8E8E8",
          color: "#999999",
          fontSize: "0.8125rem",
          fontFamily: '"DM Sans", sans-serif',
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
          transition: "color 0.12s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "#111111")}
        onMouseLeave={e => (e.currentTarget.style.color = "#999999")}
      >
        <LogOut size={13} />
        Sign out
      </button>
    </aside>
  );
}
