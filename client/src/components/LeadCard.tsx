import { useLocation } from "wouter";
import type { Lead } from "@shared/schema";
import { productLabel, dwellingSizeLabel, timeAgo } from "../lib/utils";
import ScoreBadge from "./ScoreBadge";

interface LeadCardProps {
  lead: Lead;
}

export default function LeadCard({ lead }: LeadCardProps) {
  const [, navigate] = useLocation();

  return (
    <div
      onClick={() => navigate(`/leads/${lead.id}`)}
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E8E8E8",
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        borderRadius: "8px",
        padding: "12px 14px",
        cursor: "pointer",
        transition: "box-shadow 0.15s, border-color 0.15s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#CCCCCC";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 2px rgba(0,0,0,0.06)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#E8E8E8";
      }}
    >
      {/* Name & Score */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "6px", gap: "6px" }}>
        <h4 style={{
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 500,
          fontSize: "14px",
          color: "#111111",
          lineHeight: 1.3,
          margin: 0,
        }}>
          {lead.name}
        </h4>
        <ScoreBadge
          score={lead.aiScore}
          classification={lead.aiClassification}
          size="sm"
          showScore={false}
        />
      </div>

      {/* Product interest + dwelling size */}
      {(lead.productInterest || lead.dwellingSize) && (
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px", marginBottom: "4px" }}>
          {lead.productInterest && (
            <p style={{ fontSize: "12px", color: "#666666", margin: 0, fontFamily: '"DM Sans", sans-serif' }}>
              {productLabel(lead.productInterest)}
            </p>
          )}
          {lead.dwellingSize && (
            <span style={{
              fontSize: "10px",
              fontWeight: 500,
              color: "#666666",
              backgroundColor: "#F0F0F0",
              borderRadius: "3px",
              padding: "1px 5px",
              fontFamily: '"DM Sans", sans-serif',
            }}>
              {dwellingSizeLabel(lead.dwellingSize)}
            </span>
          )}
        </div>
      )}

      {/* Location */}
      {(lead.suburb || lead.state) && (
        <p style={{ fontSize: "12px", color: "#999999", margin: "0 0 8px", fontFamily: '"DM Sans", sans-serif' }}>
          {[lead.suburb, lead.state].filter(Boolean).join(", ")}
        </p>
      )}

      {/* Footer */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: "8px",
        borderTop: "1px solid #F0F0F0",
        marginTop: "4px",
      }}>
        <span style={{ fontSize: "11px", color: "#999999", fontFamily: '"DM Sans", sans-serif' }}>
          {timeAgo(lead.createdAt)}
        </span>
        {lead.aiScore !== null && lead.aiScore !== undefined && (
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#666666", fontFamily: '"DM Sans", sans-serif' }}>
            {lead.aiScore}/100
          </span>
        )}
      </div>
    </div>
  );
}
