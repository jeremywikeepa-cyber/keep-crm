import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Separator } from "../components/ui/separator";
import type { User } from "@shared/schema";
import { formatDate } from "../lib/utils";
import {
  Users,
  Plus,
  Webhook,
  BookOpen,
  Building2,
  ExternalLink,
} from "lucide-react";

const cardStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E8E8E8",
  borderRadius: "8px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
};

const cardHeaderStyle: React.CSSProperties = {
  padding: "16px 20px 12px",
  borderBottom: "1px solid #E8E8E8",
};

const cardContentStyle: React.CSSProperties = {
  padding: "16px 20px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 500,
  color: "#111111",
  fontFamily: '"DM Sans", sans-serif',
  margin: 0,
};

const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 500,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "#999999",
  fontFamily: '"DM Sans", sans-serif',
};

const valueStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#111111",
  fontFamily: '"DM Sans", sans-serif',
  fontWeight: 500,
};

const roleColors: Record<string, React.CSSProperties> = {
  admin:   { backgroundColor: "#111111", color: "#FFFFFF" },
  manager: { backgroundColor: "#F7F7F7", color: "#111111", border: "1px solid #E8E8E8" },
  member:  { backgroundColor: "#F7F7F7", color: "#666666", border: "1px solid #E8E8E8" },
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [newUserOpen, setNewUserOpen] = useState(false);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => api.getUsers(),
  });

  const createUserMutation = useMutation({
    mutationFn: (data: any) => api.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setNewUserOpen(false);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return (
    <div style={{ maxWidth: "768px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
          Settings
        </h1>
        <p style={{ fontSize: "14px", color: "#666666", fontFamily: '"DM Sans", sans-serif', margin: 0, marginTop: "4px" }}>
          Manage your Keep Group CRM configuration
        </p>
      </div>

      {/* Company info */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Building2 style={{ width: "16px", height: "16px", color: "#666666" }} />
            <h2 style={sectionTitleStyle}>Keep Group</h2>
          </div>
          <p style={{ fontSize: "13px", color: "#666666", fontFamily: '"DM Sans", sans-serif', margin: "4px 0 0" }}>
            Trixie OS — Layer 2: Client Pipeline
          </p>
        </div>
        <div style={cardContentStyle}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <p style={labelStyle}>Company</p>
              <p style={valueStyle}>Keep Group</p>
            </div>
            <div>
              <p style={labelStyle}>Address</p>
              <p style={{ ...valueStyle, fontWeight: 400 }}>166 Parramatta Rd, Croydon NSW 2132</p>
            </div>
            <div>
              <p style={labelStyle}>Website</p>
              <a
                href="https://keepmodular.com.au"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "14px", color: "#666666", fontFamily: '"DM Sans", sans-serif', display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#111111"}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#666666"}
              >
                keepmodular.com.au
                <ExternalLink style={{ width: "12px", height: "12px" }} />
              </a>
            </div>
            <div>
              <p style={labelStyle}>Trixie Version</p>
              <p style={{ ...valueStyle, fontWeight: 400 }}>v2.2 — March 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div style={cardStyle}>
        <div style={{ ...cardHeaderStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Users style={{ width: "16px", height: "16px", color: "#666666" }} />
              <h2 style={sectionTitleStyle}>Team Members</h2>
            </div>
            <p style={{ fontSize: "13px", color: "#666666", fontFamily: '"DM Sans", sans-serif', margin: "4px 0 0" }}>
              Manage who has access to the CRM
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setNewUserOpen(true)}
            style={{ gap: "6px" }}
          >
            <Plus style={{ width: "14px", height: "14px" }} />
            Add User
          </Button>
        </div>
        <div>
          {users.map((user) => (
            <div
              key={user.id}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #E8E8E8" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#111111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: '"DM Sans", sans-serif',
                  flexShrink: 0,
                }}>
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
                    {user.firstName} {user.lastName}
                  </p>
                  <p style={{ fontSize: "12px", color: "#666666", fontFamily: '"DM Sans", sans-serif', margin: 0, marginTop: "2px" }}>
                    {user.email}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 10px",
                    borderRadius: "20px",
                    fontWeight: 600,
                    fontFamily: '"DM Sans", sans-serif',
                    ...(roleColors[user.role] || { backgroundColor: "#F7F7F7", color: "#666666", border: "1px solid #E8E8E8" }),
                  }}
                >
                  {user.role}
                </span>
                <Select
                  value={user.isActive ? "active" : "inactive"}
                  onValueChange={(v) =>
                    updateUserMutation.mutate({
                      id: user.id,
                      data: { isActive: v === "active" },
                    })
                  }
                >
                  <SelectTrigger style={{ height: "28px", width: "96px", fontSize: "12px" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhook info */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Webhook style={{ width: "16px", height: "16px", color: "#666666" }} />
            <h2 style={sectionTitleStyle}>Webhooks</h2>
          </div>
          <p style={{ fontSize: "13px", color: "#666666", fontFamily: '"DM Sans", sans-serif', margin: "4px 0 0" }}>
            Receive leads automatically from external tools
          </p>
        </div>
        <div style={cardContentStyle}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: "0 0 4px" }}>
              ManyChat Webhook
            </p>
            <p style={{ fontSize: "12px", color: "#666666", fontFamily: '"DM Sans", sans-serif', margin: "0 0 10px" }}>
              Use this endpoint in ManyChat to automatically capture Instagram leads when the FLOOR PLAN keyword is triggered.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <code style={{ flex: 1, fontSize: "12px", backgroundColor: "#111111", color: "#E8E8E8", padding: "8px 12px", borderRadius: "6px", fontFamily: "monospace" }}>
                POST /api/webhook/manychat
              </code>
            </div>
            <div style={{ marginTop: "12px" }}>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: "0 0 6px" }}>
                Payload fields:
              </p>
              <ul style={{ listStyle: "disc", paddingLeft: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                {[
                  ["name", "required"],
                  ["email", "optional"],
                  ["phone", "optional"],
                  ["product_interest", "optional"],
                  ["hear_about_us", "optional"],
                ].map(([field, req]) => (
                  <li key={field} style={{ fontSize: "13px", color: "#666666", fontFamily: '"DM Sans", sans-serif' }}>
                    <code style={{ color: "#111111", fontFamily: "monospace" }}>{field}</code> — {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline stages */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BookOpen style={{ width: "16px", height: "16px", color: "#666666" }} />
            <h2 style={sectionTitleStyle}>Pipeline Stages</h2>
          </div>
          <p style={{ fontSize: "13px", color: "#666666", fontFamily: '"DM Sans", sans-serif', margin: "4px 0 0" }}>
            The 6-stage Keep Group sales pipeline
          </p>
        </div>
        <div style={cardContentStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { stage: "enquiry",     label: "Enquiry",     desc: "New lead, initial contact received",                         color: "#4338CA" },
              { stage: "qualified",   label: "Qualified",   desc: "Lead has been qualified — owns land, budget confirmed",       color: "#059669" },
              { stage: "feasibility", label: "Feasibility", desc: "Site visit done, L2 estimate in progress",                   color: "#D97706" },
              { stage: "proposal",    label: "Proposal",    desc: "L3 proposal sent, awaiting contract sign-off",               color: "#7C3AED" },
              { stage: "build",       label: "Build",       desc: "Contract signed, factory production and site works underway", color: "#16A34A" },
              { stage: "delivered",   label: "Delivered",   desc: "Module installed and handed over",                           color: "#475569" },
            ].map(({ stage, label, desc, color }, i) => (
              <div
                key={stage}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "6px", backgroundColor: "#F7F7F7" }}
              >
                <div style={{ width: "4px", height: "40px", borderRadius: "4px", backgroundColor: color, flexShrink: 0 }} />
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#999999", fontFamily: '"DM Sans", sans-serif', width: "16px" }}>
                  {i + 1}
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>{label}</p>
                  <p style={{ fontSize: "12px", color: "#666666", fontFamily: '"DM Sans", sans-serif', margin: 0, marginTop: "2px" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Scoring */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h2 style={sectionTitleStyle}>AI Scoring — Scout</h2>
          <p style={{ fontSize: "13px", color: "#666666", fontFamily: '"DM Sans", sans-serif', margin: "4px 0 0" }}>
            How Scout calculates the lead score (0–100)
          </p>
        </div>
        <div style={cardContentStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { criterion: "Owns land",                    points: "+30", desc: "Biggest qualifier — ready to build" },
              { criterion: "Has access to cash",           points: "+25", desc: "Reduces finance risk" },
              { criterion: "Budget $200k+",                points: "+20", desc: "Aligns with FORMA price range" },
              { criterion: "Timeline ASAP or 3 months",   points: "+15", desc: "Urgency signals intent" },
              { criterion: "Secondary or primary dwelling", points: "+10", desc: "Core FORMA product types" },
            ].map(({ criterion, points, desc }) => (
              <div
                key={criterion}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "6px", backgroundColor: "#F7F7F7" }}
              >
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "#111111", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>{criterion}</p>
                  <p style={{ fontSize: "12px", color: "#666666", fontFamily: '"DM Sans", sans-serif', margin: 0, marginTop: "2px" }}>{desc}</p>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#16A34A", fontFamily: '"DM Sans", sans-serif' }}>{points}</span>
              </div>
            ))}
            <Separator style={{ margin: "4px 0" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", paddingTop: "4px" }}>
              <div style={{ textAlign: "center", padding: "10px", borderRadius: "6px", backgroundColor: "#FEF2F2" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#DC2626", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>Hot</p>
                <p style={{ fontSize: "12px", color: "#DC2626", fontFamily: '"DM Sans", sans-serif', margin: "2px 0 0" }}>70–100 pts</p>
              </div>
              <div style={{ textAlign: "center", padding: "10px", borderRadius: "6px", backgroundColor: "#FFFBEB" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#D97706", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>Warm</p>
                <p style={{ fontSize: "12px", color: "#D97706", fontFamily: '"DM Sans", sans-serif', margin: "2px 0 0" }}>40–69 pts</p>
              </div>
              <div style={{ textAlign: "center", padding: "10px", borderRadius: "6px", backgroundColor: "#F7F7F7" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#6B7280", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>Cold</p>
                <p style={{ fontSize: "12px", color: "#6B7280", fontFamily: '"DM Sans", sans-serif', margin: "2px 0 0" }}>Under 40 pts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <NewUserForm
            onSubmit={(data) => createUserMutation.mutate(data)}
            onCancel={() => setNewUserOpen(false)}
            loading={createUserMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewUserForm({
  onSubmit,
  onCancel,
  loading,
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "member",
  });

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Label>First Name</Label>
          <Input
            value={form.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            required
            autoFocus
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Label>Last Name</Label>
          <Input
            value={form.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            required
          />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <Label>Email</Label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          required
          placeholder="name@keepmodular.com.au"
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <Label>Role</Label>
        <Select value={form.role} onValueChange={(v) => set("role", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Member"}
        </Button>
      </DialogFooter>
    </form>
  );
}
