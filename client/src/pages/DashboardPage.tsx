import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "../lib/api";
import { stageLabel, timeAgo, activityTypeIcon } from "../lib/utils";
import type { Lead } from "@shared/schema";
import { PIPELINE_STAGES } from "@shared/schema";

const FONT = '"DM Sans", sans-serif';

const card: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E8E8E8",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const sectionLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#999999",
  fontFamily: FONT,
};

function sourcePill(source: string | null | undefined): string {
  if (!source) return "Offline";
  const s = source.toLowerCase();
  if (s === "manychat") return "ManyChat";
  if (s.includes("website") || s === "website_form") return "Website Form";
  return "Offline";
}

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const [showActivity, setShowActivity] = useState(false);

  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: () => api.getStats() });
  const { data: leads = [] } = useQuery<Lead[]>({ queryKey: ["leads"], queryFn: () => api.getLeads() });
  const { data: actionLeads = [] } = useQuery<Lead[]>({ queryKey: ["leads/actions"], queryFn: () => api.getActionLeads() });
  const { data: inboundLeads = [] } = useQuery<Lead[]>({ queryKey: ["leads/inbound"], queryFn: () => api.getInboundLeads() });

  const heroLead = actionLeads[0] || null;
  const todayActions = actionLeads.slice(1, 6);

  const today = new Date();
  const dayName = today.toLocaleDateString("en-AU", { weekday: "long" });
  const dayNum = today.getDate();
  const monthName = today.toLocaleDateString("en-AU", { month: "long" });
  const dateStr = `${dayName}, ${dayNum} ${monthName}`;

  return (
    <div style={{ fontFamily: FONT }}>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <p style={{ fontSize: "22px", fontWeight: 600, color: "#111111", fontFamily: FONT, margin: 0 }}>
            Good morning, Jeremy
          </p>
          <p style={{ fontSize: "13px", color: "#999999", fontFamily: FONT, margin: 0, marginTop: "2px" }}>
            {dateStr}
          </p>
        </div>
        <button
          onClick={() => navigate("/leads/new")}
          style={{
            backgroundColor: "#111111",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          + New Lead
        </button>
      </div>

      {/* ── SECTION 1: YOUR NEXT MOVE ── */}
      <div style={{ ...card, borderLeft: "4px solid #4A5240", padding: "24px", marginBottom: "20px" }}>
        {heroLead ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{
                backgroundColor: "#4A5240",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "3px 10px",
                borderRadius: "100px",
                fontFamily: FONT,
              }}>
                Top Priority
              </span>
              {heroLead.aiClassification && heroLead.aiScore != null && (
                <span style={{
                  backgroundColor: heroLead.aiClassification === "hot" ? "#DC2626" : "#D97706",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: 600,
                  width: "28px",
                  height: "28px",
                  borderRadius: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT,
                }}>
                  {heroLead.aiScore}
                </span>
              )}
            </div>

            <p style={{ fontSize: "24px", fontWeight: 600, color: "#111111", fontFamily: FONT, margin: 0 }}>
              {heroLead.name}
            </p>

            {heroLead.aiNextAction && (
              <p style={{ fontSize: "16px", color: "#444444", fontFamily: FONT, marginTop: "6px", marginBottom: 0 }}>
                {heroLead.aiNextAction}
              </p>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {heroLead.suburb && (
                  <span style={{ fontSize: "13px", color: "#666666", fontFamily: FONT }}>{heroLead.suburb}</span>
                )}
                <span style={{
                  fontSize: "12px",
                  color: "#555555",
                  backgroundColor: "#F3F3F3",
                  border: "1px solid #E8E8E8",
                  borderRadius: "100px",
                  padding: "2px 10px",
                  fontFamily: FONT,
                }}>
                  {stageLabel(heroLead.stage)}
                </span>
                <span style={{ fontSize: "12px", color: "#999999", fontFamily: FONT }}>
                  updated {timeAgo(heroLead.updatedAt)}
                </span>
              </div>
              <button
                onClick={() => navigate(`/leads/${heroLead.id}`)}
                style={{
                  backgroundColor: "#111111",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontFamily: FONT,
                  fontWeight: 500,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                → Open Lead
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px", color: "#16A34A" }}>✓</span>
            <p style={{ fontSize: "15px", color: "#666666", fontFamily: FONT, margin: 0 }}>
              All caught up — no urgent actions right now
            </p>
          </div>
        )}
      </div>

      {/* ── SECTION 2: NEW INBOUND ── */}
      {inboundLeads.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <span style={sectionLabel}>New Inbound</span>
            <span style={{
              backgroundColor: "#16A34A",
              color: "#FFFFFF",
              fontSize: "11px",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "100px",
              fontFamily: FONT,
            }}>
              {inboundLeads.length}
            </span>
          </div>
          <div style={card}>
            {inboundLeads.slice(0, 5).map((lead, i) => (
              <div
                key={lead.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: i < Math.min(inboundLeads.length, 5) - 1 ? "1px solid #E8E8E8" : "none",
                  cursor: "pointer",
                  transition: "background-color 0.12s",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = "#F7F7F7"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "100%", backgroundColor: "#16A34A", flexShrink: 0 }} />
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#111111", fontFamily: FONT }}>{lead.name}</span>
                  <span style={{
                    fontSize: "11px",
                    color: "#16A34A",
                    border: "1px solid #16A34A",
                    borderRadius: "100px",
                    padding: "1px 8px",
                    fontFamily: FONT,
                  }}>
                    {sourcePill(lead.source)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {(lead.productInterest || lead.suburb) && (
                    <span style={{ fontSize: "12px", color: "#666666", fontFamily: FONT }}>
                      {[lead.productInterest, lead.suburb].filter(Boolean).join(" · ")}
                    </span>
                  )}
                  <span style={{ fontSize: "12px", color: "#999999", fontFamily: FONT }}>{timeAgo(lead.createdAt)}</span>
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/leads/${lead.id}`); }}
                    style={{
                      backgroundColor: "transparent",
                      color: "#111111",
                      border: "1px solid #E8E8E8",
                      borderRadius: "6px",
                      padding: "4px 12px",
                      fontFamily: FONT,
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Score →
                  </button>
                </div>
              </div>
            ))}
            {inboundLeads.length > 5 && (
              <div style={{ padding: "10px 16px", borderTop: "1px solid #E8E8E8" }}>
                <button
                  onClick={() => navigate("/leads")}
                  style={{ background: "none", border: "none", fontSize: "13px", color: "#4A5240", cursor: "pointer", fontFamily: FONT }}
                >
                  + {inboundLeads.length - 5} more
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SECTION 3: TODAY'S ACTIONS ── */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <span style={sectionLabel}>Today's Actions</span>
        </div>
        <div style={card}>
          {todayActions.length > 0 ? (
            todayActions.map((lead, i) => (
              <div
                key={lead.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: i < todayActions.length - 1 ? "1px solid #E8E8E8" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "100%",
                    backgroundColor: lead.aiClassification === "hot" ? "#DC2626" : "#D97706",
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#111111", fontFamily: FONT, whiteSpace: "nowrap" }}>
                    {lead.name}
                  </span>
                  <span style={{
                    fontSize: "11px",
                    color: "#555555",
                    backgroundColor: "#F3F3F3",
                    border: "1px solid #E8E8E8",
                    borderRadius: "100px",
                    padding: "2px 8px",
                    fontFamily: FONT,
                    whiteSpace: "nowrap",
                  }}>
                    {stageLabel(lead.stage)}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0, padding: "0 16px" }}>
                  {lead.aiNextAction && (
                    <p style={{
                      fontSize: "12px",
                      color: "#666666",
                      fontFamily: FONT,
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {lead.aiNextAction}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/leads/${lead.id}`)}
                  style={{ background: "none", border: "none", color: "#111111", fontFamily: FONT, fontSize: "13px", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Open →
                </button>
              </div>
            ))
          ) : (
            <div style={{ padding: "16px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "#999999", fontFamily: FONT, margin: 0 }}>No other actions today</p>
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 4: PIPELINE PULSE ── */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <span style={sectionLabel}>Pipeline</span>
        </div>
        <div style={{ ...card, padding: "16px 20px" }}>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {PIPELINE_STAGES.map((stage) => {
              const count = stats?.byStage?.[stage] ?? leads.filter(l => l.stage === stage).length;
              return (
                <button
                  key={stage}
                  onClick={() => navigate("/leads")}
                  style={{
                    textAlign: "center",
                    padding: "12px 8px",
                    borderRadius: "6px",
                    backgroundColor: "#F7F7F7",
                    border: "1px solid #E8E8E8",
                    cursor: "pointer",
                    fontFamily: FONT,
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F0F0F0")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#F7F7F7")}
                >
                  <p style={{ fontSize: "24px", fontWeight: 600, color: "#111111", margin: 0, fontFamily: FONT }}>{count}</p>
                  <p style={{ fontSize: "11px", color: "#666666", marginTop: "2px", fontFamily: FONT }}>{stageLabel(stage)}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── SECTION 5: RECENT ACTIVITY ── */}
      <div>
        <button
          onClick={() => setShowActivity(v => !v)}
          style={{ background: "none", border: "none", fontSize: "13px", color: "#999999", cursor: "pointer", fontFamily: FONT, marginBottom: "10px", padding: 0 }}
        >
          {showActivity ? "Hide recent activity ↑" : "Show recent activity ↓"}
        </button>
        {showActivity && (
          <div style={card}>
            {(stats?.recentActivities || []).slice(0, 8).map((activity: any) => (
              <div
                key={activity.id}
                style={{ padding: "10px 16px", borderBottom: "1px solid #E8E8E8", display: "flex", alignItems: "flex-start", gap: "10px" }}
              >
                <span style={{ fontSize: "14px" }}>{activityTypeIcon(activity.type)}</span>
                <div>
                  <p style={{ fontSize: "13px", color: "#111111", fontFamily: FONT, margin: 0 }}>{activity.title}</p>
                  <p style={{ fontSize: "11px", color: "#999999", fontFamily: FONT, margin: 0, marginTop: "2px" }}>{timeAgo(activity.createdAt)}</p>
                </div>
              </div>
            ))}
            {(!stats?.recentActivities || stats.recentActivities.length === 0) && (
              <div style={{ padding: "16px", textAlign: "center" }}>
                <p style={{ fontSize: "13px", color: "#999999", fontFamily: FONT, margin: 0 }}>No activity yet</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
