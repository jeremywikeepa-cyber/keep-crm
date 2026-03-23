import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { TrendingDown, Loader2 } from "lucide-react";

const S = {
  page: {
    maxWidth: "860px",
  } as React.CSSProperties,
  heading: {
    fontSize: "22px",
    fontWeight: 600,
    color: "#111111",
    fontFamily: '"DM Sans", sans-serif',
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  } as React.CSSProperties,
  subheading: {
    fontSize: "13px",
    color: "#666666",
    fontFamily: '"DM Sans", sans-serif',
    marginTop: "4px",
  } as React.CSSProperties,
  tabs: {
    display: "flex",
    gap: "0",
    borderBottom: "1px solid #E8E8E8",
    marginBottom: "24px",
    marginTop: "24px",
  } as React.CSSProperties,
  card: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E8E8E8",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "16px",
  } as React.CSSProperties,
  label: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#999999",
    fontFamily: '"DM Sans", sans-serif',
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    marginBottom: "6px",
  } as React.CSSProperties,
  select: {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #E8E8E8",
    borderRadius: "6px",
    fontSize: "13px",
    fontFamily: '"DM Sans", sans-serif',
    color: "#111111",
    backgroundColor: "#FFFFFF",
    outline: "none",
    cursor: "pointer",
  } as React.CSSProperties,
  textarea: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #E8E8E8",
    borderRadius: "6px",
    fontSize: "13px",
    fontFamily: '"DM Sans", sans-serif',
    color: "#111111",
    backgroundColor: "#FFFFFF",
    resize: "vertical" as const,
    outline: "none",
    boxSizing: "border-box" as const,
    minHeight: "180px",
  } as React.CSSProperties,
  btn: {
    padding: "9px 18px",
    borderRadius: "6px",
    border: "none",
    fontSize: "13px",
    fontFamily: '"DM Sans", sans-serif',
    fontWeight: 500,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  } as React.CSSProperties,
  btnPrimary: {
    backgroundColor: "#4A5240",
    color: "#FFFFFF",
  } as React.CSSProperties,
  btnOutline: {
    backgroundColor: "#FFFFFF",
    color: "#111111",
    border: "1px solid #E8E8E8",
  } as React.CSSProperties,
  sectionLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#999999",
    fontFamily: '"DM Sans", sans-serif',
    textTransform: "uppercase" as const,
    letterSpacing: "0.07em",
    marginBottom: "4px",
  } as React.CSSProperties,
  valueText: {
    fontSize: "14px",
    color: "#111111",
    fontFamily: '"DM Sans", sans-serif',
  } as React.CSSProperties,
};

function badge(text: string, bg: string, color = "#FFFFFF") {
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "100px",
      fontSize: "12px",
      fontWeight: 600,
      fontFamily: '"DM Sans", sans-serif',
      backgroundColor: bg,
      color,
    }}>
      {text}
    </span>
  );
}

function sentimentBadge(s: string) {
  if (!s) return null;
  const map: Record<string, string> = {
    positive: "#16A34A",
    neutral: "#666666",
    negative: "#DC2626",
  };
  return badge(s.charAt(0).toUpperCase() + s.slice(1), map[s.toLowerCase()] ?? "#666666");
}

function winBackBadge(w: string) {
  if (!w) return null;
  const map: Record<string, string> = { high: "#16A34A", medium: "#D97706", low: "#DC2626" };
  return badge(w.charAt(0).toUpperCase() + w.slice(1), map[w.toLowerCase()] ?? "#666666");
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 18px",
        border: "none",
        borderBottom: active ? "2px solid #4A5240" : "2px solid transparent",
        backgroundColor: "transparent",
        fontSize: "13px",
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: active ? 600 : 400,
        color: active ? "#4A5240" : "#666666",
        cursor: "pointer",
        marginBottom: "-1px",
        transition: "color 0.12s",
      }}
    >
      {children}
    </button>
  );
}

// ─── Analyse Loss Tab ────────────────────────────────────────────────────────

function AnalyseLossTab() {
  const queryClient = useQueryClient();
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [correspondence, setCorrespondence] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [editing, setEditing] = useState(false);

  const { data: archivedLeads = [] } = useQuery<any[]>({
    queryKey: ["leads-archived"],
    queryFn: () => api.getLeads({ archived: true }),
  });

  const analyseMutation = useMutation({
    mutationFn: () => api.analyseLoss(parseInt(selectedLeadId), correspondence || undefined),
    onSuccess: (data) => {
      setAnalysis(data);
      setDraft(null);
    },
  });

  const winBackMutation = useMutation({
    mutationFn: () => api.generateWinBack(parseInt(selectedLeadId), {
      lossReason: analysis?.dropOffReason,
      correspondence: correspondence || undefined,
    }),
    onSuccess: (data) => {
      setDraft(data);
      setDraftSubject(data.subject || "");
      setDraftBody(data.body || "");
      setEditing(false);
    },
  });

  const sendMutation = useMutation({
    mutationFn: () => api.createCommunication(parseInt(selectedLeadId), {
      subject: draftSubject,
      body: draftBody,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communications"] });
      setDraft(null);
      setAnalysis(null);
    },
  });

  return (
    <div>
      {/* Select lead */}
      <div style={S.card}>
        <div style={S.label}>Select archived lead</div>
        <select
          value={selectedLeadId}
          onChange={e => { setSelectedLeadId(e.target.value); setAnalysis(null); setDraft(null); }}
          style={S.select}
        >
          <option value="">— Choose a lead —</option>
          {archivedLeads.map((l: any) => (
            <option key={l.id} value={l.id}>
              {l.name}{l.suburb ? ` · ${l.suburb}` : ""}
              {l.productInterest ? ` · ${l.productInterest}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Correspondence */}
      <div style={S.card}>
        <div style={S.label}>Correspondence (optional)</div>
        <textarea
          value={correspondence}
          onChange={e => setCorrespondence(e.target.value)}
          placeholder="Paste all correspondence here (emails, notes, WhatsApp)"
          style={S.textarea}
        />
        <div style={{ marginTop: "12px" }}>
          <button
            disabled={!selectedLeadId || analyseMutation.isPending}
            onClick={() => analyseMutation.mutate()}
            style={{
              ...S.btn,
              ...(selectedLeadId ? S.btnPrimary : { backgroundColor: "#E8E8E8", color: "#999999", cursor: "not-allowed" }),
            }}
          >
            {analyseMutation.isPending && <Loader2 size={14} className="animate-spin" />}
            Analyse with Trixie
          </button>
        </div>
      </div>

      {/* Results */}
      {analysis && (
        <div style={S.card}>
          <div style={{ fontWeight: 600, fontSize: "14px", color: "#111111", fontFamily: '"DM Sans", sans-serif', marginBottom: "16px" }}>
            Analysis Results
          </div>
          <div style={{ display: "grid", gap: "14px" }}>
            <div>
              <div style={S.sectionLabel}>Drop-off Reason</div>
              {badge(analysis.dropOffReason || "Unknown", "#4A5240")}
            </div>
            <div>
              <div style={S.sectionLabel}>Last Sentiment</div>
              {sentimentBadge(analysis.lastSentiment || "neutral")}
            </div>
            <div>
              <div style={S.sectionLabel}>Key Objection</div>
              <div style={S.valueText}>{analysis.keyObjection || "—"}</div>
            </div>
            <div>
              <div style={S.sectionLabel}>Pipeline Stage Reached</div>
              <div style={S.valueText}>{analysis.pipelineStageReached || "—"}</div>
            </div>
            <div>
              <div style={S.sectionLabel}>Win-Back Potential</div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                {winBackBadge(analysis.winBackPotential || "low")}
                {analysis.winBackReason && (
                  <span style={{ fontSize: "13px", color: "#666666", fontFamily: '"DM Sans", sans-serif' }}>
                    {analysis.winBackReason}
                  </span>
                )}
              </div>
            </div>
            <div>
              <div style={S.sectionLabel}>Recommended Message Angle</div>
              <div style={{ ...S.valueText, fontStyle: "italic", color: "#4A5240" }}>
                {analysis.recommendedMessageAngle || "—"}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "20px", borderTop: "1px solid #E8E8E8", paddingTop: "16px" }}>
            <button
              disabled={winBackMutation.isPending}
              onClick={() => winBackMutation.mutate()}
              style={{ ...S.btn, ...S.btnPrimary }}
            >
              {winBackMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Generate Win-Back Message
            </button>
          </div>
        </div>
      )}

      {/* Draft email */}
      {draft && (
        <div style={S.card}>
          <div style={{ fontWeight: 600, fontSize: "14px", color: "#111111", fontFamily: '"DM Sans", sans-serif', marginBottom: "12px" }}>
            Win-Back Draft
          </div>

          {/* Warning */}
          <div style={{
            backgroundColor: "#FFFBEB",
            border: "1px solid #FDE68A",
            borderRadius: "6px",
            padding: "10px 14px",
            fontSize: "12px",
            color: "#92400E",
            fontFamily: '"DM Sans", sans-serif',
            marginBottom: "16px",
          }}>
            Review carefully before sending. This email will come from your Keep Group Outlook account.
          </div>

          <div style={{ marginBottom: "10px" }}>
            <div style={S.label}>Subject</div>
            <textarea
              value={draftSubject}
              onChange={e => setDraftSubject(e.target.value)}
              readOnly={!editing}
              style={{
                ...S.textarea,
                minHeight: "44px",
                resize: editing ? "vertical" : "none",
                backgroundColor: editing ? "#FFFFFF" : "#F7F7F7",
              }}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <div style={S.label}>Body</div>
            <textarea
              value={draftBody}
              onChange={e => setDraftBody(e.target.value)}
              readOnly={!editing}
              style={{
                ...S.textarea,
                minHeight: "220px",
                resize: editing ? "vertical" : "none",
                backgroundColor: editing ? "#FFFFFF" : "#F7F7F7",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              disabled={sendMutation.isPending}
              onClick={() => sendMutation.mutate()}
              style={{ ...S.btn, ...S.btnPrimary }}
            >
              {sendMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Send via Outlook
            </button>
            <button
              onClick={() => setEditing(true)}
              style={{ ...S.btn, ...S.btnOutline }}
            >
              Edit first
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Loss Patterns Tab ───────────────────────────────────────────────────────

function LossPatternsTab() {
  const { data, isLoading } = useQuery<any>({
    queryKey: ["loss-intelligence"],
    queryFn: () => api.getLossIntelligence(),
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "60px" }}>
        <Loader2 size={22} className="animate-spin" style={{ color: "#999999" }} />
      </div>
    );
  }

  const stats = data?.stats ?? {};
  const reasons: Record<string, number> = data?.lossReasons ?? {};
  const pipelineValue = data?.pipelineValue ?? {};
  const maxCount = Math.max(...Object.values(reasons).map(Number), 1);

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Total Lost Leads", value: stats.totalLost ?? 0 },
          { label: "Avg Pipeline Stage", value: stats.avgPipelineStage ?? "—" },
          { label: "Win-Backs Sent", value: stats.winBacksSent ?? 0 },
          { label: "Responses Received", value: stats.responsesReceived ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} style={S.card}>
            <div style={S.sectionLabel}>{label}</div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#111111", fontFamily: '"DM Sans", sans-serif', marginTop: "4px" }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Loss reasons bar chart */}
      <div style={S.card}>
        <div style={{ fontWeight: 600, fontSize: "14px", color: "#111111", fontFamily: '"DM Sans", sans-serif', marginBottom: "16px" }}>
          Loss Reasons
        </div>
        {Object.keys(reasons).length === 0 ? (
          <p style={{ fontSize: "13px", color: "#999999", fontFamily: '"DM Sans", sans-serif' }}>No loss data yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {Object.entries(reasons)
              .sort(([, a], [, b]) => Number(b) - Number(a))
              .map(([reason, count]) => (
                <div key={reason}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px", color: "#111111", fontFamily: '"DM Sans", sans-serif' }}>{reason}</span>
                    <span style={{ fontSize: "12px", color: "#666666", fontFamily: '"DM Sans", sans-serif' }}>{count}</span>
                  </div>
                  <div style={{ height: "8px", borderRadius: "4px", backgroundColor: "#E8E8E8", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      borderRadius: "4px",
                      backgroundColor: "#4A5240",
                      width: `${(Number(count) / maxCount) * 100}%`,
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Pipeline value lost */}
      <div style={S.card}>
        <div style={{ fontWeight: 600, fontSize: "14px", color: "#111111", fontFamily: '"DM Sans", sans-serif', marginBottom: "16px" }}>
          Pipeline Value Lost
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ ...S.card, margin: 0 }}>
            <div style={S.sectionLabel}>This Month</div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#DC2626", fontFamily: '"DM Sans", sans-serif', marginTop: "4px" }}>
              ${(pipelineValue.thisMonth ?? 0).toLocaleString()}
            </div>
          </div>
          <div style={{ ...S.card, margin: 0 }}>
            <div style={S.sectionLabel}>This Quarter</div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#DC2626", fontFamily: '"DM Sans", sans-serif', marginTop: "4px" }}>
              ${(pipelineValue.thisQuarter ?? 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LostIntelligencePage() {
  const [tab, setTab] = useState<"analyse" | "patterns">("analyse");

  return (
    <div style={S.page}>
      <div>
        <h1 style={S.heading}>
          <TrendingDown size={22} color="#4A5240" />
          Lost Intelligence
        </h1>
        <p style={S.subheading}>Analyse why leads dropped off and generate targeted win-back messages.</p>
      </div>

      <div style={S.tabs}>
        <TabButton active={tab === "analyse"} onClick={() => setTab("analyse")}>Analyse Loss</TabButton>
        <TabButton active={tab === "patterns"} onClick={() => setTab("patterns")}>Loss Patterns</TabButton>
      </div>

      {tab === "analyse" ? <AnalyseLossTab /> : <LossPatternsTab />}
    </div>
  );
}
