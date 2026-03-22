import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function stageLabel(stage: string): string {
  const labels: Record<string, string> = {
    enquiry:     "Enquiry",
    qualified:   "Qualified",
    feasibility: "Feasibility",
    proposal:    "Proposal",
    build:       "Build",
    delivered:   "Delivered",
  };
  return labels[stage] || stage;
}

export function stageColor(stage: string): string {
  const colors: Record<string, string> = {
    enquiry:     "bg-[#EEF2FF] text-[#4338CA]",
    qualified:   "bg-[#ECFDF5] text-[#059669]",
    feasibility: "bg-[#FFFBEB] text-[#D97706]",
    proposal:    "bg-[#F5F3FF] text-[#7C3AED]",
    build:       "bg-[#F0FDF4] text-[#16A34A]",
    delivered:   "bg-[#F8FAFC] text-[#475569]",
  };
  return colors[stage] || "bg-[#F7F7F7] text-[#666666]";
}

export function classificationColor(classification: string | null): string {
  if (classification === "hot") return "bg-red-100 text-red-700";
  if (classification === "warm") return "bg-orange-100 text-orange-700";
  if (classification === "cold") return "bg-gray-100 text-gray-600";
  return "bg-gray-100 text-gray-600";
}

export function classificationEmoji(classification: string | null): string {
  if (classification === "hot") return "Hot";
  if (classification === "warm") return "Warm";
  if (classification === "cold") return "Cold";
  return "—";
}

export function sourceLabel(source: string | null): string {
  const labels: Record<string, string> = {
    instagram: "Instagram",
    facebook:  "Facebook",
    website:   "Website",
    referral:  "Referral",
    manychat:  "ManyChat",
    google:    "Google",
    other:     "Other",
  };
  return source ? (labels[source] || source) : "Unknown";
}

export function productLabel(product: string | null): string {
  const labels: Record<string, string> = {
    micro_dwelling:     "Micro Dwelling",
    secondary_dwelling: "Secondary Dwelling",
    primary_dwelling:   "Primary Dwelling",
    duplex:             "Duplex",
    bespoke:            "Bespoke",
    other:              "Other",
  };
  return product ? (labels[product] || product) : "—";
}

export function budgetLabel(budget: string | null): string {
  const labels: Record<string, string> = {
    under_100k:  "Under $100k",
    "100k_200k": "$100k–$200k",
    "200k_350k": "$200k–$350k",
    "350k_500k": "$350k–$500k",
    "500k_plus": "$500k+",
  };
  return budget ? (labels[budget] || budget) : "—";
}

export function timelineLabel(timeline: string | null): string {
  const labels: Record<string, string> = {
    asap:        "ASAP",
    "3_months":  "Within 3 months",
    "6_months":  "Within 6 months",
    "12_months": "Within 12 months",
    exploring:   "Just exploring",
  };
  return timeline ? (labels[timeline] || timeline) : "—";
}

export function financeLabel(finance: string | null): string {
  const labels: Record<string, string> = {
    cash:              "Cash",
    construction_loan: "Construction Loan",
    refinance:         "Refinance",
    equity:            "Equity Release",
    unsure:            "Unsure",
  };
  return finance ? (labels[finance] || finance) : "—";
}

export function dwellingSizeLabel(size: string | null): string {
  const labels: Record<string, string> = {
    under_20:  "Under 20m²",
    "20_60":   "20–60m²",
    "60_100":  "60–100m²",
    "100_150": "100–150m²",
    "150_200": "150–200m²",
    "200_300": "200–300m²",
    "300_plus": "300m²+",
    not_sure:  "Not sure yet",
  };
  return size ? (labels[size] || size) : "—";
}

export function activityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    call:           "Phone Call",
    email:          "Email",
    meeting:        "Meeting",
    site_visit:     "Site Visit",
    factory_visit:  "Factory Visit",
    stage_change:   "Stage Change",
    note:           "Note",
    ai_score:       "AI Score",
    webhook:        "Webhook",
  };
  return labels[type] || type;
}

export function activityTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    call:          "📞",
    email:         "✉️",
    meeting:       "🤝",
    site_visit:    "🏗️",
    factory_visit: "🏭",
    stage_change:  "➡️",
    note:          "📝",
    ai_score:      "🤖",
    webhook:       "🔗",
  };
  return icons[type] || "•";
}
