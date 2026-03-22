import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import KanbanBoard from "../components/KanbanBoard";
import { stageLabel, timeAgo, activityTypeIcon, activityTypeLabel } from "../lib/utils";
import ScoreBadge from "../components/ScoreBadge";
import {
  Users,
  TrendingUp,
  Flame,
  CheckSquare,
  Plus,
  ArrowRight,
  Activity,
} from "lucide-react";
import type { Lead } from "@shared/schema";
import { PIPELINE_STAGES } from "@shared/schema";

export default function DashboardPage() {
  const [, navigate] = useLocation();

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => api.getStats(),
  });

  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: () => api.getLeads(),
  });

  const hotLeads = leads.filter((l) => l.aiClassification === "hot");
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: "14px", color: "#666666", marginTop: "4px", fontFamily: '"DM Sans", sans-serif' }}>
            Keep Group CRM · Trixie OS Layer 2
          </p>
        </div>
        <Button onClick={() => navigate("/leads/new")} className="gap-2">
          <Plus className="w-4 h-4" />
          New Lead
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "8px", padding: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999999", marginBottom: "6px", fontFamily: '"DM Sans", sans-serif' }}>
                Total Leads
              </p>
              <p style={{ fontSize: "28px", fontWeight: 600, color: "#111111", fontFamily: '"DM Sans", sans-serif', lineHeight: 1 }}>
                {leads.length}
              </p>
            </div>
            <div style={{ width: "36px", height: "36px", backgroundColor: "#F7F7F7", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Users style={{ width: "18px", height: "18px", color: "#666666" }} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "8px", padding: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999999", marginBottom: "6px", fontFamily: '"DM Sans", sans-serif' }}>
                Hot Leads
              </p>
              <p style={{ fontSize: "28px", fontWeight: 600, color: "#111111", fontFamily: '"DM Sans", sans-serif', lineHeight: 1 }}>
                {stats?.hot ?? hotLeads.length}
              </p>
            </div>
            <div style={{ width: "36px", height: "36px", backgroundColor: "#FEF2F2", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Flame style={{ width: "18px", height: "18px", color: "#DC2626" }} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "8px", padding: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999999", marginBottom: "6px", fontFamily: '"DM Sans", sans-serif' }}>
                In Build
              </p>
              <p style={{ fontSize: "28px", fontWeight: 600, color: "#111111", fontFamily: '"DM Sans", sans-serif', lineHeight: 1 }}>
                {stats?.byStage?.build ?? leads.filter((l) => l.stage === "build").length}
              </p>
            </div>
            <div style={{ width: "36px", height: "36px", backgroundColor: "#F0FDF4", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <TrendingUp style={{ width: "18px", height: "18px", color: "#16A34A" }} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "8px", padding: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999999", marginBottom: "6px", fontFamily: '"DM Sans", sans-serif' }}>
                Open Tasks
              </p>
              <p style={{ fontSize: "28px", fontWeight: 600, color: "#111111", fontFamily: '"DM Sans", sans-serif', lineHeight: 1 }}>
                {stats?.openNotesCount ?? 0}
              </p>
            </div>
            <div style={{ width: "36px", height: "36px", backgroundColor: "#FFFBEB", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <CheckSquare style={{ width: "18px", height: "18px", color: "#D97706" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline stage counts */}
      <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "16px 20px 12px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
            Pipeline Overview
          </h2>
        </div>
        <div style={{ padding: "0 20px 20px" }}>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {PIPELINE_STAGES.map((stage) => {
              const count = stats?.byStage?.[stage] ?? leads.filter((l) => l.stage === stage).length;
              return (
                <button
                  key={stage}
                  onClick={() => navigate("/leads")}
                  style={{
                    textAlign: "center",
                    padding: "12px",
                    borderRadius: "6px",
                    backgroundColor: "#F7F7F7",
                    border: "1px solid #E8E8E8",
                    cursor: "pointer",
                    transition: "background-color 0.15s",
                    fontFamily: '"DM Sans", sans-serif',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F0F0F0")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#F7F7F7")}
                >
                  <p style={{ fontSize: "20px", fontWeight: 600, color: "#111111", margin: 0, fontFamily: '"DM Sans", sans-serif' }}>{count}</p>
                  <p style={{ fontSize: "11px", color: "#666666", marginTop: "2px", fontFamily: '"DM Sans", sans-serif' }}>{stageLabel(stage)}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: "16px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
            Pipeline Board
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/leads")}
            className="gap-1.5 text-xs"
          >
            View all leads
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
        <KanbanBoard />
      </div>

      {/* Bottom row: Recent leads + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent leads */}
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
              Recent Leads
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/leads")}
              className="text-xs gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          <div>
            <div style={{ borderTop: "1px solid #E8E8E8" }}>
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 20px",
                    borderBottom: "1px solid #E8E8E8",
                    cursor: "pointer",
                    transition: "background-color 0.12s",
                  }}
                  onClick={() => navigate(`/leads/${lead.id}`)}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = "#F7F7F7"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent"}
                >
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
                      {lead.name}
                    </p>
                    <p style={{ fontSize: "12px", color: "#666666", fontFamily: '"DM Sans", sans-serif', margin: 0, marginTop: "2px" }}>
                      {lead.suburb ? `${lead.suburb} · ` : ""}{stageLabel(lead.stage)}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {lead.aiClassification && (
                      <ScoreBadge
                        score={lead.aiScore}
                        classification={lead.aiClassification}
                        size="sm"
                        showScore={false}
                      />
                    )}
                    <span style={{ fontSize: "11px", color: "#999999", fontFamily: '"DM Sans", sans-serif' }}>
                      {timeAgo(lead.createdAt)}
                    </span>
                  </div>
                </div>
              ))}

              {recentLeads.length === 0 && (
                <div style={{ padding: "32px 20px", textAlign: "center" }}>
                  <p style={{ fontSize: "14px", color: "#999999", fontFamily: '"DM Sans", sans-serif' }}>No leads yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{ marginTop: "12px" }}
                    onClick={() => navigate("/leads/new")}
                  >
                    Add first lead
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
              Recent Activity
            </h2>
            <Activity style={{ width: "16px", height: "16px", color: "#999999" }} />
          </div>
          <div style={{ borderTop: "1px solid #E8E8E8" }}>
            {(stats?.recentActivities || []).slice(0, 8).map((activity: any) => (
              <div
                key={activity.id}
                style={{ padding: "10px 20px", borderBottom: "1px solid #E8E8E8" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ fontSize: "14px", marginTop: "2px" }}>
                    {activityTypeIcon(activity.type)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "14px", color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {activity.title}
                    </p>
                    <p style={{ fontSize: "11px", color: "#999999", fontFamily: '"DM Sans", sans-serif', margin: 0, marginTop: "2px" }}>
                      {timeAgo(activity.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {(!stats?.recentActivities || stats.recentActivities.length === 0) && (
              <div style={{ padding: "32px 20px", textAlign: "center" }}>
                <p style={{ fontSize: "14px", color: "#999999", fontFamily: '"DM Sans", sans-serif' }}>No activity yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
