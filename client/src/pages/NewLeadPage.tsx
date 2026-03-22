import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import type { User } from "@shared/schema";

const sectionLabelStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#999999",
  fontFamily: '"DM Sans", sans-serif',
  margin: "0 0 12px",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E8E8E8",
  borderRadius: "8px",
  padding: "20px 24px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
};

export default function NewLeadPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => api.getUsers(),
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    suburb: "",
    state: "NSW",
    source: "",
    hearAboutUs: "",
    assignedTo: "",
    stage: "enquiry",
    productInterest: "",
    expectedBudget: "",
    timeline: "",
    financeMethod: "",
    dwellingSize: "",
    ownsLand: "",
    hasAccessToCash: "",
    requiresApprovals: "",
    hasExistingDesign: "",
    additionalNotes: "",
  });

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createLead(data),
    onSuccess: (lead) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      navigate(`/leads/${lead.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      suburb: form.suburb || undefined,
      state: form.state || undefined,
      source: form.source || undefined,
      hearAboutUs: form.hearAboutUs || undefined,
      assignedTo: form.assignedTo ? parseInt(form.assignedTo) : undefined,
      stage: form.stage,
      productInterest: form.productInterest || undefined,
      dwellingSize: form.dwellingSize || undefined,
      expectedBudget: form.expectedBudget || undefined,
      timeline: form.timeline || undefined,
      financeMethod: form.financeMethod || undefined,
      additionalNotes: form.additionalNotes || undefined,
    };

    if (form.ownsLand !== "") payload.ownsLand = form.ownsLand === "true";
    if (form.hasAccessToCash !== "") payload.hasAccessToCash = form.hasAccessToCash === "true";
    if (form.requiresApprovals !== "") payload.requiresApprovals = form.requiresApprovals === "true";
    if (form.hasExistingDesign !== "") payload.hasExistingDesign = form.hasExistingDesign === "true";

    createMutation.mutate(payload);
  };

  return (
    <div style={{ maxWidth: "672px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
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
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F7F7F7"; (e.currentTarget as HTMLButtonElement).style.color = "#111111"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#999999"; }}
        >
          <ArrowLeft style={{ width: "16px", height: "16px" }} />
        </button>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
            New Lead
          </h1>
          <p style={{ fontSize: "14px", color: "#666666", fontFamily: '"DM Sans", sans-serif', margin: 0, marginTop: "4px" }}>
            Add a new lead to the pipeline
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Contact Info */}
        <div style={cardStyle}>
          <p style={sectionLabelStyle}>Contact Information</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Label htmlFor="name">
                Full Name <span style={{ color: "#DC2626" }}>*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Georgia Jarrett"
                required
                autoFocus
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="georgia@email.com"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="0412 345 678"
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Label htmlFor="suburb">Suburb</Label>
                <Input
                  id="suburb"
                  value={form.suburb}
                  onChange={(e) => set("suburb", e.target.value)}
                  placeholder="Cringilla"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Label htmlFor="state">State</Label>
                <Select value={form.state} onValueChange={(v) => set("state", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"].map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Source */}
        <div style={cardStyle}>
          <p style={sectionLabelStyle}>Lead Source</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Label>Source</Label>
                <Select value={form.source} onValueChange={(v) => set("source", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="manychat">ManyChat</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Label>Assign To</Label>
                <Select
                  value={form.assignedTo}
                  onValueChange={(v) => set("assignedTo", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.firstName} {u.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Label>How did they hear about us?</Label>
              <Input
                value={form.hearAboutUs}
                onChange={(e) => set("hearAboutUs", e.target.value)}
                placeholder="e.g. Saw the Djua build post on Instagram"
              />
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div style={cardStyle}>
          <p style={sectionLabelStyle}>Project Details</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Label>Product Interest</Label>
                <Select
                  value={form.productInterest}
                  onValueChange={(v) => set("productInterest", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="micro_dwelling">Micro Dwelling</SelectItem>
                    <SelectItem value="secondary_dwelling">Secondary Dwelling</SelectItem>
                    <SelectItem value="primary_dwelling">Primary Dwelling</SelectItem>
                    <SelectItem value="duplex">Duplex</SelectItem>
                    <SelectItem value="bespoke">Bespoke</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Label>Dwelling Size</Label>
                <Select
                  value={form.dwellingSize}
                  onValueChange={(v) => set("dwellingSize", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
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
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Label>Expected Budget</Label>
                <Select
                  value={form.expectedBudget}
                  onValueChange={(v) => set("expectedBudget", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_100k">Under $100k</SelectItem>
                    <SelectItem value="100k_200k">$100k–$200k</SelectItem>
                    <SelectItem value="200k_350k">$200k–$350k</SelectItem>
                    <SelectItem value="350k_500k">$350k–$500k</SelectItem>
                    <SelectItem value="500k_plus">$500k+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Label>Timeline</Label>
                <Select
                  value={form.timeline}
                  onValueChange={(v) => set("timeline", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP</SelectItem>
                    <SelectItem value="3_months">Within 3 months</SelectItem>
                    <SelectItem value="6_months">Within 6 months</SelectItem>
                    <SelectItem value="12_months">Within 12 months</SelectItem>
                    <SelectItem value="exploring">Just exploring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Label>Finance Method</Label>
                <Select
                  value={form.financeMethod}
                  onValueChange={(v) => set("financeMethod", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="construction_loan">Construction Loan</SelectItem>
                    <SelectItem value="refinance">Refinance</SelectItem>
                    <SelectItem value="equity">Equity Release</SelectItem>
                    <SelectItem value="unsure">Unsure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Qualifiers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Label>Owns Land?</Label>
                <Select
                  value={form.ownsLand}
                  onValueChange={(v) => set("ownsLand", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unknown" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Label>Has Access to Cash?</Label>
                <Select
                  value={form.hasAccessToCash}
                  onValueChange={(v) => set("hasAccessToCash", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unknown" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Label>Requires Approvals?</Label>
                <Select
                  value={form.requiresApprovals}
                  onValueChange={(v) => set("requiresApprovals", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unknown" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes (DA)</SelectItem>
                    <SelectItem value="false">No (CDC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Label>Has Existing Design?</Label>
                <Select
                  value={form.hasExistingDesign}
                  onValueChange={(v) => set("hasExistingDesign", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unknown" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={cardStyle}>
          <p style={sectionLabelStyle}>Additional Notes</p>
          <Textarea
            value={form.additionalNotes}
            onChange={(e) => set("additionalNotes", e.target.value)}
            placeholder="Any additional context about this lead..."
            rows={4}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", paddingBottom: "32px" }}>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/leads")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || !form.name}
            style={{ backgroundColor: "#111111", color: "#FFFFFF" }}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 style={{ width: "16px", height: "16px", marginRight: "8px" }} className="animate-spin" />
                Creating...
              </>
            ) : (
              "Create Lead"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
