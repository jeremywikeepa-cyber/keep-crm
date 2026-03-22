import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Lead } from "@shared/schema";
import { PIPELINE_STAGES } from "@shared/schema";
import { api } from "../lib/api";
import { stageLabel } from "../lib/utils";
import LeadCard from "./LeadCard";
import { Loader2 } from "lucide-react";

const COLUMN_TINTS: Record<string, string> = {
  enquiry:     "#F0F4FF",
  qualified:   "#F0F7F0",
  feasibility: "#FFFBF0",
  proposal:    "#F5F0FF",
  build:       "#F0FFF8",
  delivered:   "#F8F8F8",
};

export default function KanbanBoard() {
  const queryClient = useQueryClient();
  const [draggingLead, setDraggingLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: () => api.getLeads(),
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, stage }: { id: number; stage: string }) =>
      api.updateLead(id, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const leadsByStage = PIPELINE_STAGES.reduce(
    (acc, stage) => {
      acc[stage] = leads.filter((l) => l.stage === stage);
      return acc;
    },
    {} as Record<string, Lead[]>
  );

  const handleDragStart = (lead: Lead) => setDraggingLead(lead);
  const handleDragOver  = (e: React.DragEvent, stage: string) => { e.preventDefault(); setDragOverStage(stage); };
  const handleDrop      = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    if (draggingLead && draggingLead.stage !== stage) {
      updateLeadMutation.mutate({ id: draggingLead.id, stage });
    }
    setDraggingLead(null);
    setDragOverStage(null);
  };
  const handleDragEnd = () => { setDraggingLead(null); setDragOverStage(null); };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#999999]" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-max">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = leadsByStage[stage] || [];
          const isOver = dragOverStage === stage;
          const bgColor = COLUMN_TINTS[stage] || "#F7F7F7";

          return (
            <div
              key={stage}
              style={{
                width: "256px",
                flexShrink: 0,
                borderRadius: "8px",
                backgroundColor: bgColor,
                outline: isOver ? "2px solid #111111" : "none",
                outlineOffset: "2px",
                transition: "outline 0.1s",
              }}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {/* Column header */}
              <div style={{ padding: "10px 12px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 500,
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#999999",
                }}>
                  {stageLabel(stage)}
                </span>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "18px",
                  height: "18px",
                  padding: "0 4px",
                  borderRadius: "4px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E8E8E8",
                  fontSize: "10px",
                  fontWeight: 500,
                  color: "#666666",
                  fontFamily: '"DM Sans", sans-serif',
                }}>
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ padding: "0 8px 8px", display: "flex", flexDirection: "column", gap: "6px", minHeight: "200px" }}>
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead)}
                    onDragEnd={handleDragEnd}
                    style={{ opacity: draggingLead?.id === lead.id ? 0.45 : 1, transition: "opacity 0.15s" }}
                  >
                    <LeadCard lead={lead} />
                  </div>
                ))}

                {stageLeads.length === 0 && (
                  <div style={{ paddingTop: "2rem", textAlign: "center" }}>
                    <p style={{ fontSize: "11px", color: "#CCCCCC", fontFamily: '"DM Sans", sans-serif' }}>Empty</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
