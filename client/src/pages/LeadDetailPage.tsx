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
  formatDateTime,
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
  Send,
  ChevronDown,
  ChevronUp,
  Link,
} from "lucide-react";
import type { Lead } from "@shared/schema";
import { PIPELINE_STAGES } from "@shared/schema";

const EMAIL_TEMPLATES = [
  {
    label: "Feasibility follow-up",
    subject: "Following up on your feasibility enquiry",
    body: `Hi [Name],\n\nI wanted to follow up on your recent enquiry about a modular build with Keep Group.\n\nWe'd love to arrange a quick 15-minute feasibility call to understand your project better and give you a clearer picture of what's possible.\n\nAre you free for a call this week?\n\nWarm regards,\nKeep Group Team`,
  },
  {
    label: "Factory visit invite",
    subject: "Invitation to visit our Croydon factory",
    body: `Hi [Name],\n\nWe'd love to invite you to visit our factory in Croydon to see the FORMA building system in action.\n\nSeeing the quality of our modules first-hand is the best way to understand what we build — and it only takes about an hour.\n\nLet us know a time that suits you.\n\nWarm regards,\nKeep Group Team`,
  },
  {
    label: "Proposal sent – next steps",
    subject: "Your Keep Group proposal — next steps",
    body: `Hi [Name],\n\nThank you for taking the time to review your proposal. I wanted to check in and see if you had any questions.\n\nOur next step would be to lock in a design session to refine the configuration and move toward a fixed-price contract sum.\n\nHappy to walk you through anything.\n\nWarm regards,\nKeep Group Team`,
  },
];

export default function LeadDetailPage() {
  const [, params] = useRoute("/leads/:id");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const id = params?.id ? parseInt(params.id) : null;

  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState("note");
  const [editingStage, setEditingStage] = useState(false);
  const [leftTab, setLeftTab] = useState<"activity" | "communications">("activity");
  const [expandedComm, setExpandedComm] = useState<number | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

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

  const { data: communications = [] } = useQuery<any[]>({
    queryKey: ["communications", id],
    queryFn:  () => api.getCommunications(id!),
    enabled:  !!id,
  });

  const { data: oauthData } = useQuery<{ url: string }>({
    queryKey: ["graph-oauth-url"],
    queryFn:  () => api.getGraphOAuthUrl(),
    enabled:  leftTab === "communications",
  });

  const sendEmailMutation = useMutation({
    mutationFn: () => api.createCommunication(id!, {
      subject: composeSubject,
      body:    composeBody,
      to:      composeTo,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communications", id] });
      setComposeOpen(false);
      setComposeSubject("");
      setComposeBody("");
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

          {/* Tab bar: Activity | Communications */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            {/* Tab headers */}
            <div style={{ display: "flex", borderBottom: "1px solid #E8E8E8" }}>
              {(["activity", "communications"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLeftTab(tab)}
                  style={{
                    padding: "12px 16px",
                    border: "none",
                    borderBottom: leftTab === tab ? "2px solid #4A5240" : "2px solid transparent",
                    backgroundColor: "transparent",
                    color: leftTab === tab ? "#111111" : "#999999",
                    fontSize: "13px",
                    fontWeight: leftTab === tab ? 600 : 400,
                    fontFamily: '"DM Sans", sans-serif',
                    cursor: "pointer",
                    marginBottom: "-1px",
                    transition: "color 0.12s",
                  }}
                >
                  {tab === "activity" ? "Activity" : "Communications"}
                </button>
              ))}
            </div>

            {/* ── Activity tab ─────────────────────────────────────────────── */}
            {leftTab === "activity" && (
              <>
                {/* Add note / activity */}
                <div style={{ padding: "16px", borderBottom: "1px solid #E8E8E8" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: "0 0 12px" }}>
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
                <div>
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
              </>
            )}

            {/* ── Communications tab ───────────────────────────────────────── */}
            {leftTab === "communications" && (
              <>
                {/* Toolbar */}
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #E8E8E8", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#666666", fontFamily: '"DM Sans", sans-serif' }}>
                    {communications.length} email{communications.length !== 1 ? "s" : ""}
                  </span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {oauthData?.url && (
                      <a
                        href={oauthData.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex", alignItems: "center", gap: "4px",
                          fontSize: "12px", color: "#4A5240", fontFamily: '"DM Sans", sans-serif',
                          textDecoration: "none", padding: "4px 10px",
                          border: "1px solid #4A5240", borderRadius: "5px",
                        }}
                      >
                        <Link size={12} />
                        Connect Outlook
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setComposeTo(lead.email || "");
                        setComposeOpen(!composeOpen);
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        padding: "5px 10px", backgroundColor: "#111111", color: "#FFFFFF",
                        border: "none", borderRadius: "5px", fontSize: "12px",
                        fontFamily: '"DM Sans", sans-serif', cursor: "pointer",
                      }}
                    >
                      <Send size={11} />
                      Compose
                    </button>
                  </div>
                </div>

                {/* Compose panel */}
                {composeOpen && (
                  <div style={{ padding: "16px", borderBottom: "1px solid #E8E8E8", backgroundColor: "#FAFAFA" }}>
                    {/* Template selector */}
                    <div style={{ marginBottom: "10px" }}>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => {
                          const t = EMAIL_TEMPLATES.find(t => t.label === e.target.value);
                          if (t) {
                            setComposeSubject(t.subject);
                            setComposeBody(t.body.replace("[Name]", lead.name.split(" ")[0]));
                            setSelectedTemplate(e.target.value);
                          } else {
                            setSelectedTemplate("");
                          }
                        }}
                        style={{
                          width: "100%", padding: "6px 10px", border: "1px solid #E8E8E8",
                          borderRadius: "5px", fontSize: "13px", backgroundColor: "#FFFFFF",
                          color: "#111111", fontFamily: '"DM Sans", sans-serif',
                        }}
                      >
                        <option value="">— Use a template —</option>
                        {EMAIL_TEMPLATES.map(t => (
                          <option key={t.label} value={t.label}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <input
                        type="email"
                        value={composeTo}
                        onChange={(e) => setComposeTo(e.target.value)}
                        placeholder="To"
                        style={{
                          padding: "6px 10px", border: "1px solid #E8E8E8", borderRadius: "5px",
                          fontSize: "13px", fontFamily: '"DM Sans", sans-serif', color: "#111111",
                        }}
                      />
                      <input
                        type="text"
                        value={composeSubject}
                        onChange={(e) => setComposeSubject(e.target.value)}
                        placeholder="Subject"
                        style={{
                          padding: "6px 10px", border: "1px solid #E8E8E8", borderRadius: "5px",
                          fontSize: "13px", fontFamily: '"DM Sans", sans-serif', color: "#111111",
                        }}
                      />
                      <textarea
                        value={composeBody}
                        onChange={(e) => setComposeBody(e.target.value)}
                        placeholder="Message body…"
                        rows={6}
                        style={{
                          padding: "8px 10px", border: "1px solid #E8E8E8", borderRadius: "5px",
                          fontSize: "13px", fontFamily: '"DM Sans", sans-serif', color: "#111111",
                          resize: "vertical",
                        }}
                      />
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setComposeOpen(false)}
                          style={{
                            padding: "6px 14px", border: "1px solid #E8E8E8", borderRadius: "5px",
                            backgroundColor: "transparent", fontSize: "13px",
                            fontFamily: '"DM Sans", sans-serif', cursor: "pointer", color: "#666666",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => sendEmailMutation.mutate()}
                          disabled={!composeSubject.trim() || !composeBody.trim() || sendEmailMutation.isPending}
                          style={{
                            padding: "6px 14px", border: "none", borderRadius: "5px",
                            backgroundColor: "#111111", color: "#FFFFFF", fontSize: "13px",
                            fontFamily: '"DM Sans", sans-serif', cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "5px",
                            opacity: (!composeSubject.trim() || !composeBody.trim()) ? 0.5 : 1,
                          }}
                        >
                          {sendEmailMutation.isPending
                            ? <Loader2 size={12} className="animate-spin" />
                            : <Send size={12} />}
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email list */}
                {communications.length === 0 ? (
                  <div style={{ padding: "32px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: "14px", color: "#999999", fontFamily: '"DM Sans", sans-serif' }}>No emails yet</p>
                  </div>
                ) : (
                  communications.map((comm: any) => (
                    <div key={comm.id} style={{ borderBottom: "1px solid #E8E8E8" }}>
                      <button
                        onClick={() => setExpandedComm(expandedComm === comm.id ? null : comm.id)}
                        style={{
                          width: "100%", padding: "12px 16px", display: "flex",
                          alignItems: "flex-start", gap: "10px", border: "none",
                          backgroundColor: "transparent", cursor: "pointer", textAlign: "left",
                        }}
                      >
                        <div style={{
                          width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                          backgroundColor: comm.direction === "inbound" ? "#EEF2FF" : "#F0FDF4",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Mail size={12} style={{ color: comm.direction === "inbound" ? "#4338CA" : "#16A34A" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {comm.subject || "(no subject)"}
                            </span>
                            <span style={{ fontSize: "11px", color: "#999999", fontFamily: '"DM Sans", sans-serif', flexShrink: 0 }}>
                              {timeAgo(comm.sentAt || comm.createdAt)}
                            </span>
                          </div>
                          <p style={{ fontSize: "12px", color: "#666666", fontFamily: '"DM Sans", sans-serif', margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {comm.direction === "inbound" ? "Received" : "Sent"} · {comm.bodyPreview || "—"}
                          </p>
                        </div>
                        {expandedComm === comm.id
                          ? <ChevronUp size={14} style={{ color: "#999999", flexShrink: 0, marginTop: "4px" }} />
                          : <ChevronDown size={14} style={{ color: "#999999", flexShrink: 0, marginTop: "4px" }} />}
                      </button>
                      {expandedComm === comm.id && (
                        <div style={{ padding: "0 16px 16px 54px" }}>
                          <div style={{ padding: "10px 12px", backgroundColor: "#F7F7F7", borderRadius: "6px", fontSize: "13px", color: "#111111", fontFamily: '"DM Sans", sans-serif', lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                            {comm.fullBody || comm.bodyPreview || "—"}
                          </div>
                          <p style={{ fontSize: "11px", color: "#999999", fontFamily: '"DM Sans", sans-serif', margin: "6px 0 0" }}>
                            {formatDateTime(comm.sentAt || comm.createdAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </>
            )}
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
