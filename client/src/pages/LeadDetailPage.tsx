import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import ScoreBadge from "../components/ScoreBadge";
import {
  stageLabel,
  stageColor,
  productLabel,
  sourceLabel,
  budgetLabel,
  timelineLabel,
  financeLabel,
  dwellingSizeLabel,
  formatDate,
  timeAgo,
  activityTypeIcon,
  activityTypeLabel,
} from "../lib/utils";
import {
  ArrowLeft,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  MessageSquare,
  Plus,
  ChevronRight,
} from "lucide-react";
import type { Lead } from "@shared/schema";
import { PIPELINE_STAGES } from "@shared/schema";

export default function LeadDetailPage() {
  const [, params] = useRoute("/leads/:id");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const id = params?.id ? parseInt(params.id) : null;

  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState("note");
  const [editingStage, setEditingStage] = useState(false);

  const { data: lead, isLoading } = useQuery<Lead>({
    queryKey: ["lead", id],
    queryFn: () => api.getLead(id!),
    enabled: !!id,
  });

  const { data: activities = [] } = useQuery<any[]>({
    queryKey: ["activities", id],
    queryFn: () => api.getActivities(id!),
    enabled: !!id,
  });

  const updateLeadMutation = useMutation({
    mutationFn: (data: Partial<Lead>) => api.updateLead(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setEditingStage(false);
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: (data: { type: string; title: string; body?: string }) =>
      api.createActivity(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", id] });
      setNoteText("");
    },
  });

  const scoreLeadMutation = useMutation({
    mutationFn: () => api.scoreLead(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
    },
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "80px" }}>
        <Loader2 style={{ width: "24px", height: "24px", color: "#999999" }} className="animate-spin" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div style={{ textAlign: "center", paddingTop: "80px" }}>
        <p style={{ fontSize: "14px", color: "#666666", fontFamily: '"DM Sans", sans-serif' }}>Lead not found</p>
        <Button variant="outline" onClick={() => navigate("/leads")} style={{ marginTop: "16px" }}>
          Back to Leads
        </Button>
      </div>
    );
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addNoteMutation.mutate({ type: noteType, title: noteText });
  };

  return (
    <div style={{ maxWidth: "900px" }}>
      {/* Back + header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "24px" }}>
        <button
          onClick={() => navigate("/leads")}
          style={{
            padding: "6px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "transparent",
            color: "#999999",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            transition: "background-color 0.12s, color 0.12s",
            marginTop: "2px",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F7F7F7"; (e.currentTarget as HTMLButtonElement).style.color = "#111111"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#999999"; }}
        >
          <ArrowLeft style={{ width: "16px", height: "16px" }} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
              {lead.name}
            </h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${stageColor(lead.stage)}`}>
              {stageLabel(lead.stage)}
            </span>
            <ScoreBadge
              score={lead.aiScore}
              classification={lead.aiClassification}
              size="sm"
            />
          </div>
          <p style={{ fontSize: "12px", color: "#999999", fontFamily: '"DM Sans", sans-serif', margin: 0, marginTop: "4px" }}>
            Added {formatDate(lead.createdAt)}
            {lead.suburb ? ` · ${lead.suburb}${lead.state ? `, ${lead.state}` : ""}` : ""}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => scoreLeadMutation.mutate()}
          disabled={scoreLeadMutation.isPending}
          className="gap-1.5"
        >
          {scoreLeadMutation.isPending ? (
            <Loader2 style={{ width: "14px", height: "14px" }} className="animate-spin" />
          ) : null}
          Re-score
        </Button>
      </div>

      {/* Pipeline stage progress */}
      <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "8px", padding: "16px", marginBottom: "20px", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {PIPELINE_STAGES.map((stage, idx) => {
            const stageIdx = PIPELINE_STAGES.indexOf(lead.stage as any);
            const isActive = stage === lead.stage;
            const isCompleted = idx < stageIdx;
            return (
              <div key={stage} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <button
                  onClick={() => updateLeadMutation.mutate({ stage: stage as "enquiry" | "qualified" | "feasibility" | "proposal" | "build" | "delivered" })}
                  style={{
                    flex: 1,
                    padding: "6px 4px",
                    borderRadius: "4px",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "center",
                    fontSize: "11px",
                    fontWeight: isActive ? 600 : 400,
                    fontFamily: '"DM Sans", sans-serif',
                    backgroundColor: isActive ? "#111111" : "transparent",
                    color: isActive ? "#FFFFFF" : isCompleted ? "#666666" : "#CCCCCC",
                    transition: "background-color 0.12s, color 0.12s",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F7F7F7";
                      (e.currentTarget as HTMLButtonElement).style.color = "#111111";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = isCompleted ? "#666666" : "#CCCCCC";
                    }
                  }}
                >
                  {stageLabel(stage)}
                </button>
                {idx < PIPELINE_STAGES.length - 1 && (
                  <ChevronRight style={{ width: "12px", height: "12px", color: "#CCCCCC", flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px" }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* AI Summary */}
          {(lead.aiSummary || lead.aiNextAction) && (
            <div style={{ backgroundColor: "#F7F7F7", border: "1px solid #E8E8E8", borderRadius: "8px", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999999", fontFamily: '"DM Sans", sans-serif', margin: "0 0 10px" }}>
                Scout AI Analysis
              </p>
              {lead.aiSummary && (
                <p style={{ fontSize: "14px", color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: "0 0 10px", lineHeight: 1.6 }}>
                  {lead.aiSummary}
                </p>
              )}
              {lead.aiNextAction && (
                <div style={{ borderTop: "1px solid #E8E8E8", paddingTop: "10px", marginTop: "4px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999999", fontFamily: '"DM Sans", sans-serif', margin: "0 0 4px" }}>
                    Suggested Next Action
                  </p>
                  <p style={{ fontSize: "14px", color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0, lineHeight: 1.6 }}>
                    {lead.aiNextAction}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Add note / activity */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "8px", padding: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: "0 0 12px" }}>
              Add Activity
            </h3>
            <form onSubmit={handleAddNote} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <Select value={noteType} onValueChange={setNoteType}>
                  <SelectTrigger style={{ width: "140px" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="site_visit">Site Visit</SelectItem>
                    <SelectItem value="factory_visit">Factory Visit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note or log an activity..."
                rows={3}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit" size="sm" disabled={!noteText.trim() || addNoteMutation.isPending}>
                  {addNoteMutation.isPending ? (
                    <Loader2 style={{ width: "14px", height: "14px", marginRight: "6px" }} className="animate-spin" />
                  ) : (
                    <Plus style={{ width: "14px", height: "14px", marginRight: "6px" }} />
                  )}
                  Add
                </Button>
              </div>
            </form>
          </div>

          {/* Activity feed */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
            <div style={{ padding: "16px 16px 12px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
                Activity
              </h3>
            </div>
            <div style={{ borderTop: "1px solid #E8E8E8" }}>
              {activities.length === 0 ? (
                <div style={{ padding: "32px 16px", textAlign: "center" }}>
                  <p style={{ fontSize: "14px", color: "#999999", fontFamily: '"DM Sans", sans-serif' }}>No activity yet</p>
                </div>
              ) : (
                activities.map((activity: any) => (
                  <div
                    key={activity.id}
                    style={{ padding: "12px 16px", borderBottom: "1px solid #E8E8E8", display: "flex", gap: "10px", alignItems: "flex-start" }}
                  >
                    <span style={{ fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>{activityTypeIcon(activity.type)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
                        <p style={{ fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#999999", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
                          {activityTypeLabel(activity.type)}
                        </p>
                        <span style={{ fontSize: "11px", color: "#999999", fontFamily: '"DM Sans", sans-serif', flexShrink: 0 }}>
                          {timeAgo(activity.createdAt)}
                        </span>
                      </div>
                      <p style={{ fontSize: "14px", color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: "4px 0 0", lineHeight: 1.5 }}>
                        {activity.title}
                      </p>
                      {activity.body && (
                        <p style={{ fontSize: "13px", color: "#666666", fontFamily: '"DM Sans", sans-serif', margin: "4px 0 0", lineHeight: 1.5 }}>
                          {activity.body}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column — lead details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Contact */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "8px", padding: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: "0 0 12px" }}>
              Contact
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {lead.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Phone style={{ width: "14px", height: "14px", color: "#999999", flexShrink: 0 }} />
                  <span style={{ fontSize: "14px", color: "#111111", fontFamily: '"DM Sans", sans-serif' }}>{lead.phone}</span>
                </div>
              )}
              {lead.email && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Mail style={{ width: "14px", height: "14px", color: "#999999", flexShrink: 0 }} />
                  <span style={{ fontSize: "14px", color: "#111111", fontFamily: '"DM Sans", sans-serif', overflow: "hidden", textOverflow: "ellipsis" }}>{lead.email}</span>
                </div>
              )}
              {(lead.suburb || lead.state) && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin style={{ width: "14px", height: "14px", color: "#999999", flexShrink: 0 }} />
                  <span style={{ fontSize: "14px", color: "#111111", fontFamily: '"DM Sans", sans-serif' }}>
                    {[lead.suburb, lead.state].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Project details */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "8px", padding: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: "0 0 12px" }}>
              Project
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <DetailRow label="Product" value={productLabel(lead.productInterest)} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "#666666", fontFamily: '"DM Sans", sans-serif', flexShrink: 0 }}>Dwelling size</span>
                <Select
                  value={lead.dwellingSize || ""}
                  onValueChange={(v) => updateLeadMutation.mutate({ dwellingSize: v || null })}
                >
                  <SelectTrigger style={{ height: "28px", fontSize: "13px", border: "1px solid transparent", backgroundColor: "transparent", padding: "0 8px 0 6px", gap: "4px", minWidth: "120px", color: "#111111" }}>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_20">Under 20m²</SelectItem>
                    <SelectItem value="20_60">20–60m²</SelectItem>
                    <SelectItem value="60_100">60–100m²</SelectItem>
                    <SelectItem value="100_150">100–150m²</SelectItem>
                    <SelectItem value="150_200">150–200m²</SelectItem>
                    <SelectItem value="200_300">200–300m²</SelectItem>
                    <SelectItem value="300_plus">300m²+</SelectItem>
                    <SelectItem value="not_sure">Not sure yet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DetailRow label="Budget" value={budgetLabel(lead.expectedBudget)} />
              <DetailRow label="Timeline" value={timelineLabel(lead.timeline)} />
              <DetailRow label="Finance" value={financeLabel(lead.financeMethod)} />
            </div>
          </div>

          {/* Qualifiers */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "8px", padding: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: "0 0 12px" }}>
              Qualifiers
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <QualifierRow label="Owns Land" value={lead.ownsLand} />
              <QualifierRow label="Has Cash" value={lead.hasAccessToCash} />
              <QualifierRow label="Needs Approvals" value={lead.requiresApprovals} />
              <QualifierRow label="Has Design" value={lead.hasExistingDesign} />
            </div>
          </div>

          {/* Source */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "8px", padding: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: "0 0 12px" }}>
              Source
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <DetailRow label="Channel" value={sourceLabel(lead.source)} />
              {lead.hearAboutUs && <DetailRow label="How they heard" value={lead.hearAboutUs} />}
            </div>
          </div>

          {/* Notes */}
          {lead.additionalNotes && (
            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "8px", padding: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: "0 0 8px" }}>
                Notes
              </h3>
              <p style={{ fontSize: "14px", color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0, lineHeight: 1.6 }}>
                {lead.additionalNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
      <span style={{ fontSize: "12px", color: "#666666", fontFamily: '"DM Sans", sans-serif', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "14px", color: "#111111", fontFamily: '"DM Sans", sans-serif', textAlign: "right" }}>{value || "—"}</span>
    </div>
  );
}

function QualifierRow({ label, value }: { label: string; value: boolean | null | undefined }) {
  const display = value === null || value === undefined ? "—" : value ? "Yes" : "No";
  const color = value === true ? "#16A34A" : value === false ? "#DC2626" : "#999999";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
      <span style={{ fontSize: "12px", color: "#666666", fontFamily: '"DM Sans", sans-serif', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "14px", fontWeight: 500, color, fontFamily: '"DM Sans", sans-serif' }}>{display}</span>
    </div>
  );
}
