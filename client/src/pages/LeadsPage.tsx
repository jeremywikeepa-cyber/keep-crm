import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Lead } from "@shared/schema";
import { PIPELINE_STAGES } from "@shared/schema";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import ScoreBadge from "../components/ScoreBadge";
import KanbanBoard from "../components/KanbanBoard";
import {
  stageLabel,
  stageColor,
  productLabel,
  dwellingSizeLabel,
  formatDate,
} from "../lib/utils";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
} from "lucide-react";

type ViewMode = "list" | "kanban";

export default function LeadsPage() {
  const [, navigate] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [classificationFilter, setClassificationFilter] = useState<string>("all");

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: () => api.getLeads(),
  });

  const filtered = leads.filter((lead) => {
    const matchesSearch =
      !search ||
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email?.toLowerCase().includes(search.toLowerCase()) ||
      lead.suburb?.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone?.includes(search);

    const matchesStage =
      stageFilter === "all" || lead.stage === stageFilter;

    const matchesClassification =
      classificationFilter === "all" ||
      lead.aiClassification === classificationFilter;

    return matchesSearch && matchesStage && matchesClassification;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
            Leads
          </h1>
          <p style={{ fontSize: "14px", color: "#666666", marginTop: "4px", fontFamily: '"DM Sans", sans-serif' }}>
            {leads.length} total · {filtered.length} showing
          </p>
        </div>
        <Button onClick={() => navigate("/leads/new")} className="gap-2">
          <Plus className="w-4 h-4" />
          New Lead
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stage filter */}
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {PIPELINE_STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {stageLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Classification filter */}
        <Select
          value={classificationFilter}
          onValueChange={setClassificationFilter}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All leads</SelectItem>
            <SelectItem value="hot">Hot</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="cold">Cold</SelectItem>
          </SelectContent>
        </Select>

        {/* View toggle */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", border: "1px solid #E8E8E8", borderRadius: "6px", overflow: "hidden" }}>
          <button
            onClick={() => setViewMode("kanban")}
            style={{
              padding: "6px 12px",
              fontSize: "14px",
              transition: "background-color 0.12s, color 0.12s",
              backgroundColor: viewMode === "kanban" ? "#111111" : "transparent",
              color: viewMode === "kanban" ? "#FFFFFF" : "#666666",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={e => { if (viewMode !== "kanban") (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F7F7F7"; }}
            onMouseLeave={e => { if (viewMode !== "kanban") (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
          >
            <LayoutGrid style={{ width: "16px", height: "16px" }} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            style={{
              padding: "6px 12px",
              fontSize: "14px",
              transition: "background-color 0.12s, color 0.12s",
              backgroundColor: viewMode === "list" ? "#111111" : "transparent",
              color: viewMode === "list" ? "#FFFFFF" : "#666666",
              border: "none",
              borderLeft: "1px solid #E8E8E8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={e => { if (viewMode !== "list") (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F7F7F7"; }}
            onMouseLeave={e => { if (viewMode !== "list") (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
          >
            <List style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
      </div>

      {/* Views */}
      {viewMode === "kanban" ? (
        <KanbanBoard />
      ) : (
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "8px", overflow: "hidden" }}>
          {isLoading ? (
            <div style={{ padding: "80px 20px", textAlign: "center", color: "#999999", fontFamily: '"DM Sans", sans-serif', fontSize: "14px" }}>
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "80px 20px", textAlign: "center" }}>
              <p style={{ color: "#999999", fontSize: "14px", fontFamily: '"DM Sans", sans-serif' }}>No leads found</p>
              <Button
                variant="outline"
                size="sm"
                style={{ marginTop: "12px" }}
                onClick={() => navigate("/leads/new")}
              >
                Add first lead
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #E8E8E8", backgroundColor: "#F7F7F7" }}>
                  <th style={{ textAlign: "left", padding: "10px 20px", fontSize: "11px", fontWeight: 500, color: "#999999", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: '"DM Sans", sans-serif' }}>
                    Name
                  </th>
                  <th className="hidden md:table-cell" style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", fontWeight: 500, color: "#999999", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: '"DM Sans", sans-serif' }}>
                    Location
                  </th>
                  <th className="hidden lg:table-cell" style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", fontWeight: 500, color: "#999999", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: '"DM Sans", sans-serif' }}>
                    Product
                  </th>
                  <th className="hidden xl:table-cell" style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", fontWeight: 500, color: "#999999", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: '"DM Sans", sans-serif' }}>
                    Size
                  </th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", fontWeight: 500, color: "#999999", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: '"DM Sans", sans-serif' }}>
                    Stage
                  </th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", fontWeight: 500, color: "#999999", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: '"DM Sans", sans-serif' }}>
                    Score
                  </th>
                  <th className="hidden sm:table-cell" style={{ textAlign: "left", padding: "10px 16px", fontSize: "11px", fontWeight: 500, color: "#999999", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: '"DM Sans", sans-serif' }}>
                    Added
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    style={{ borderBottom: "1px solid #E8E8E8", cursor: "pointer", transition: "background-color 0.12s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#F7F7F7"}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "12px 20px" }}>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
                          {lead.name}
                        </p>
                        {lead.email && (
                          <p style={{ fontSize: "12px", color: "#999999", fontFamily: '"DM Sans", sans-serif', margin: 0, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "180px", whiteSpace: "nowrap" }}>
                            {lead.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="hidden md:table-cell" style={{ padding: "12px 16px" }}>
                      <p style={{ fontSize: "14px", color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
                        {lead.suburb || "—"}
                        {lead.state ? `, ${lead.state}` : ""}
                      </p>
                    </td>
                    <td className="hidden lg:table-cell" style={{ padding: "12px 16px" }}>
                      <p style={{ fontSize: "14px", color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
                        {productLabel(lead.productInterest)}
                      </p>
                    </td>
                    <td className="hidden xl:table-cell" style={{ padding: "12px 16px" }}>
                      <p style={{ fontSize: "14px", color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
                        {dwellingSizeLabel(lead.dwellingSize)}
                      </p>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${stageColor(lead.stage)}`}
                      >
                        {stageLabel(lead.stage)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <ScoreBadge
                        score={lead.aiScore}
                        classification={lead.aiClassification}
                        size="sm"
                      />
                    </td>
                    <td className="hidden sm:table-cell" style={{ padding: "12px 16px" }}>
                      <p style={{ fontSize: "14px", color: "#999999", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
                        {formatDate(lead.createdAt)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
