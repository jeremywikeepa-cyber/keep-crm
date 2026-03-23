import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  primary: "#111111",
  olive: "#4A5240",
  muted: "#999999",
  border: "#E8E8E8",
};

const S = {
  page: { maxWidth: "960px" } as React.CSSProperties,
  heading: {
    fontSize: "22px",
    fontWeight: 600,
    color: "#111111",
    fontFamily: '"DM Sans", sans-serif',
    margin: 0,
  } as React.CSSProperties,
  subheading: {
    fontSize: "13px",
    color: "#666666",
    fontFamily: '"DM Sans", sans-serif',
    marginTop: "4px",
    marginBottom: "28px",
  } as React.CSSProperties,
  card: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E8E8E8",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "16px",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#111111",
    fontFamily: '"DM Sans", sans-serif',
    marginBottom: "16px",
    marginTop: 0,
  } as React.CSSProperties,
  sectionLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#999999",
    fontFamily: '"DM Sans", sans-serif',
    textTransform: "uppercase" as const,
    letterSpacing: "0.07em",
    marginBottom: "4px",
  } as React.CSSProperties,
  statValue: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#111111",
    fontFamily: '"DM Sans", sans-serif',
    marginTop: "4px",
  } as React.CSSProperties,
};

// ─── 90-Day Goal Tracker ────────────────────────────────────────────────────

function GoalTracker({ leads = [] }: { leads: any[] }) {
  const START = new Date("2026-01-01").getTime();
  const END   = new Date("2026-04-01").getTime();
  const NOW   = Date.now();
  const GOAL  = 10;
  const REVENUE_GOAL = 1_820_000;
  const DUO_PRICE    = 182_000;

  const totalDays = Math.round((END - START) / 86_400_000);
  const daysRemaining = Math.max(0, Math.round((END - NOW) / 86_400_000));

  const sold = leads.filter((l: any) => {
    const stage = (l.stage || "").toLowerCase();
    const product = (l.productInterest || "").toLowerCase();
    const isDuoStage = stage === "build" || stage === "delivered";
    const isDuoProduct = product.includes("duo") || product.includes("secondary") || product.includes("granny") || product.includes("djua") || product.includes("raglan") || product.includes("arramont") || product.includes("karri") || product.includes("yarra") || product.includes("madison 30");
    return isDuoStage && isDuoProduct;
  }).length;

  const pct = Math.min(100, Math.round((sold / GOAL) * 100));
  const revenue = sold * DUO_PRICE;
  const daysElapsed = totalDays - daysRemaining;
  const daysPct = Math.min(100, Math.round((daysElapsed / totalDays) * 100));

  return (
    <div style={{ ...S.card, background: "linear-gradient(135deg, #4A5240 0%, #2C2820 100%)", color: "#FFFFFF", marginBottom: "24px" }}>
      <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.65)", marginBottom: "6px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        90-Day Goal
      </div>
      <h2 style={{ fontFamily: '"DM Sans", sans-serif', fontSize: "20px", fontWeight: 700, color: "#FFFFFF", margin: "0 0 20px" }}>
        10 Duo Forma Sales
      </h2>

      {/* Sales progress bar */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: "32px", fontWeight: 800, color: "#FFFFFF" }}>
            {sold} <span style={{ fontSize: "16px", fontWeight: 400, color: "rgba(255,255,255,0.6)" }}>of {GOAL}</span>
          </span>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: "13px", color: "rgba(255,255,255,0.7)", alignSelf: "flex-end", marginBottom: "4px" }}>
            {daysRemaining} days remaining
          </span>
        </div>
        <div style={{ height: "10px", borderRadius: "5px", backgroundColor: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: "5px", backgroundColor: "#B8AD8E", width: `${pct}%`, transition: "width 0.4s ease" }} />
        </div>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontFamily: '"DM Sans", sans-serif', marginTop: "5px" }}>
          {pct}% complete · {daysElapsed} of {totalDays} days elapsed ({daysPct}%)
        </div>
      </div>

      {/* Revenue row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "6px", padding: "12px 14px" }}>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", fontFamily: '"DM Sans", sans-serif', textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Revenue to Date</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#FFFFFF", fontFamily: '"DM Sans", sans-serif' }}>${revenue.toLocaleString()}</div>
        </div>
        <div style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "6px", padding: "12px 14px" }}>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", fontFamily: '"DM Sans", sans-serif', textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Revenue Target</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#B8AD8E", fontFamily: '"DM Sans", sans-serif' }}>${REVENUE_GOAL.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Pipeline Health ─────────────────────────────────────────────────────────

function PipelineHealth({ stats }: { stats: any }) {
  const stages = ["enquiry", "qualified", "feasibility", "proposal", "build", "delivered"];
  const byStage = stats?.byStage ?? {};

  const data = stages.map(stage => ({
    name: stage.charAt(0).toUpperCase() + stage.slice(1),
    count: byStage[stage] ?? 0,
  }));

  return (
    <div style={S.card}>
      <h3 style={S.sectionTitle}>Pipeline Health</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: '"DM Sans", sans-serif', fill: COLORS.muted }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fontFamily: '"DM Sans", sans-serif', fill: COLORS.muted }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ fontFamily: '"DM Sans", sans-serif', fontSize: "12px", border: "1px solid #E8E8E8", borderRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
            cursor={{ fill: "#F5F5F5" }}
          />
          <Bar dataKey="count" fill={COLORS.olive} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Lead Quality ────────────────────────────────────────────────────────────

function LeadQuality({ leads = [] }: { leads: any[] }) {
  const counts = { hot: 0, warm: 0, cold: 0, unscored: 0 };
  let totalScore = 0;
  let scoredCount = 0;

  leads.forEach((l: any) => {
    const cls = (l.aiClassification || "").toLowerCase();
    if (cls === "hot") counts.hot++;
    else if (cls === "warm") counts.warm++;
    else if (cls === "cold") counts.cold++;
    else counts.unscored++;
    if (l.aiScore != null) { totalScore += l.aiScore; scoredCount++; }
  });

  const avgScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : null;
  const qualityMap: { key: keyof typeof counts; label: string; color: string }[] = [
    { key: "hot", label: "Hot", color: "#DC2626" },
    { key: "warm", label: "Warm", color: "#D97706" },
    { key: "cold", label: "Cold", color: "#2563EB" },
    { key: "unscored", label: "Unscored", color: "#999999" },
  ];

  return (
    <div style={S.card}>
      <h3 style={S.sectionTitle}>Lead Quality</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
        {qualityMap.map(({ key, label, color }) => (
          <div key={key} style={{ textAlign: "center", padding: "12px", backgroundColor: "#F7F7F7", borderRadius: "6px" }}>
            <div style={{ fontSize: "22px", fontWeight: 700, color, fontFamily: '"DM Sans", sans-serif' }}>{counts[key]}</div>
            <div style={{ fontSize: "11px", color: "#666666", fontFamily: '"DM Sans", sans-serif', marginTop: "2px" }}>{label}</div>
          </div>
        ))}
        <div style={{ textAlign: "center", padding: "12px", backgroundColor: "#F7F7F7", borderRadius: "6px" }}>
          <div style={{ fontSize: "22px", fontWeight: 700, color: COLORS.olive, fontFamily: '"DM Sans", sans-serif' }}>
            {avgScore != null ? avgScore : "—"}
          </div>
          <div style={{ fontSize: "11px", color: "#666666", fontFamily: '"DM Sans", sans-serif', marginTop: "2px" }}>Avg Score</div>
        </div>
      </div>
    </div>
  );
}

// ─── Source Attribution ──────────────────────────────────────────────────────

function SourceAttribution({ leads = [] }: { leads: any[] }) {
  const counts: Record<string, number> = {};
  leads.forEach((l: any) => {
    const src = l.source || "unknown";
    counts[src] = (counts[src] ?? 0) + 1;
  });

  const data = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
    }));

  if (data.length === 0) {
    return (
      <div style={S.card}>
        <h3 style={S.sectionTitle}>Source Attribution</h3>
        <p style={{ fontSize: "13px", color: "#999999", fontFamily: '"DM Sans", sans-serif' }}>No source data yet.</p>
      </div>
    );
  }

  return (
    <div style={S.card}>
      <h3 style={S.sectionTitle}>Source Attribution</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fontFamily: '"DM Sans", sans-serif', fill: COLORS.muted }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontFamily: '"DM Sans", sans-serif', fill: COLORS.primary }} axisLine={false} tickLine={false} width={80} />
          <Tooltip
            contentStyle={{ fontFamily: '"DM Sans", sans-serif', fontSize: "12px", border: "1px solid #E8E8E8", borderRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
            cursor={{ fill: "#F5F5F5" }}
          />
          <Bar dataKey="count" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Recent AI Insights ──────────────────────────────────────────────────────

function RecentInsights({ leads = [] }: { leads: any[] }) {
  const withSummaries = leads
    .filter((l: any) => l.aiSummary)
    .slice(0, 5);

  const scoreBg = (cls: string) => {
    const c = (cls || "").toLowerCase();
    if (c === "hot") return { bg: "#FEE2E2", color: "#DC2626" };
    if (c === "warm") return { bg: "#FEF3C7", color: "#D97706" };
    return { bg: "#DBEAFE", color: "#2563EB" };
  };

  return (
    <div style={S.card}>
      <h3 style={S.sectionTitle}>Recent AI Insights</h3>
      {withSummaries.length === 0 ? (
        <p style={{ fontSize: "13px", color: "#999999", fontFamily: '"DM Sans", sans-serif' }}>
          No AI summaries yet. Score some leads to generate insights.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {withSummaries.map((l: any) => {
            const { bg, color } = scoreBg(l.aiClassification);
            return (
              <div key={l.id} style={{ padding: "14px", backgroundColor: "#F7F7F7", borderRadius: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span style={{ fontWeight: 600, fontSize: "13px", color: "#111111", fontFamily: '"DM Sans", sans-serif' }}>
                    {l.name}
                  </span>
                  {l.aiClassification && (
                    <span style={{ fontSize: "11px", fontWeight: 600, fontFamily: '"DM Sans", sans-serif', padding: "2px 8px", borderRadius: "100px", backgroundColor: bg, color }}>
                      {l.aiClassification.charAt(0).toUpperCase() + l.aiClassification.slice(1)}
                      {l.aiScore != null ? ` · ${l.aiScore}` : ""}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "12px", color: "#444444", fontFamily: '"DM Sans", sans-serif', margin: "0 0 6px", lineHeight: 1.5 }}>
                  {l.aiSummary}
                </p>
                {l.aiNextAction && (
                  <div style={{ fontSize: "11px", color: COLORS.olive, fontFamily: '"DM Sans", sans-serif', fontWeight: 500 }}>
                    → {l.aiNextAction}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function IntelligencePage() {
  const { data: leads = [], isLoading: leadsLoading } = useQuery<any[]>({
    queryKey: ["leads-all"],
    queryFn: () => api.getLeads(),
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["lead-stats"],
    queryFn: () => api.getLeadStats(),
  });

  if (leadsLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "80px" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: "#999999" }} />
      </div>
    );
  }

  return (
    <div style={S.page}>
      <h1 style={S.heading}>Intelligence</h1>
      <p style={S.subheading}>Pipeline analytics, lead quality, and AI insights across all active leads.</p>

      <GoalTracker leads={leads} />
      <PipelineHealth stats={stats} />
      <LeadQuality leads={leads} />
      <SourceAttribution leads={leads} />
      <RecentInsights leads={leads} />
    </div>
  );
}
