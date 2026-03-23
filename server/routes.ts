import { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { requireAuth, loginHandler, logoutHandler, meHandler } from "./auth.js";
import * as storage from "./storage.js";
import type { InsertLead, InsertLeadActivity, InsertLeadNote, InsertUser } from "../shared/schema.js";
import { generateL1Estimate } from "./l1-estimate.js";

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────

router.get("/auth/me", meHandler);
router.post("/auth/login", loginHandler);
router.post("/auth/logout", logoutHandler);

// ─── USER ROUTES ──────────────────────────────────────────────────────────────

router.get("/users", requireAuth, async (req: Request, res: Response) => {
  try {
    const allUsers = await storage.getAllUsers();
    res.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.post("/users", requireAuth, async (req: Request, res: Response) => {
  try {
    const data = req.body as InsertUser;
    const user = await storage.createUser(data);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.put("/users/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const user = await storage.updateUser(id, req.body);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// ─── PUBLIC ENQUIRY ENDPOINT (no auth — website form) ────────────────────────

router.post("/leads/enquiry", async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Accept both camelCase and snake_case field names (form sends snake_case)
    const name             = body.name;
    const email            = body.email;
    const phone            = body.phone;
    const productInterest  = body.productInterest  ?? body.product_interest;
    const suburb           = body.suburb;
    const state            = body.state;
    const ownsLand         = body.ownsLand         ?? body.owns_land;
    const hasAccessToCash  = body.hasAccessToCash  ?? body.has_access_to_cash;
    const requiresApprovals= body.requiresApprovals?? body.requires_approvals;
    const hasExistingDesign= body.hasExistingDesign?? body.has_existing_design;
    const timeline         = body.timeline;
    const expectedBudget   = body.expectedBudget   ?? body.expected_budget;
    const financeMethod    = body.financeMethod     ?? body.finance_method;
    const additionalNotes  = body.additionalNotes  ?? body.additional_notes;
    const source           = body.source;
    const hearAboutUs      = body.hearAboutUs       ?? body.hear_about_us;
    const dwellingSize     = body.dwellingSize      ?? body.dwelling_size;

    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    // Create lead
    const lead = await storage.createLead({
      name: String(name),
      email: email ? String(email) : undefined,
      phone: phone ? String(phone) : undefined,
      productInterest: productInterest ? String(productInterest) : undefined,
      suburb: suburb ? String(suburb) : undefined,
      state: state ? String(state) : undefined,
      ownsLand: ownsLand === true || ownsLand === "true",
      hasAccessToCash: hasAccessToCash === true || hasAccessToCash === "true",
      requiresApprovals: requiresApprovals === true || requiresApprovals === "true",
      hasExistingDesign: hasExistingDesign === true || hasExistingDesign === "true",
      timeline: timeline ? String(timeline) : undefined,
      expectedBudget: expectedBudget ? String(expectedBudget) : undefined,
      financeMethod: financeMethod ? String(financeMethod) : undefined,
      additionalNotes: additionalNotes ? String(additionalNotes) : undefined,
      source: source ? String(source) : "website_form",
      hearAboutUs: hearAboutUs ? String(hearAboutUs) : undefined,
      dwellingSize: dwellingSize ? String(dwellingSize) : undefined,
      stage: "enquiry",
    });

    // Log activity
    await storage.createActivity({
      leadId: lead.id,
      type: "webhook",
      title: "Lead received via website enquiry form",
      description: `Public enquiry form submission from ${lead.name}`,
    });

    // Generate L1 estimate
    const l1Estimate = generateL1Estimate({
      productInterest: lead.productInterest,
      expectedBudget: lead.expectedBudget,
      dwellingSize: lead.dwellingSize,
    });

    // Trigger AI scoring in background (don't await — keep response fast)
    if (process.env.ANTHROPIC_API_KEY) {
      (async () => {
        try {
          let score = 0;
          if (lead.ownsLand) score += 30;
          if (lead.hasAccessToCash) score += 25;
          if (["200k_280k","280k_350k","350k_450k","450k_600k","600k_800k","800k_1m","over_1m"].includes(lead.expectedBudget ?? "")) score += 20;
          if (lead.timeline === "asap" || lead.timeline === "3_months") score += 15;
          if (["secondary_dwelling","primary_dwelling"].includes(lead.productInterest ?? "")) score += 10;
          score = Math.min(100, Math.max(0, score));
          const classification = score >= 70 ? "hot" : score >= 40 ? "warm" : "cold";

          const anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
          const message = await anthropicClient.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 400,
            messages: [{
              role: "user",
              content: `You are Scout, the AI sales agent for Keep Group — a modular construction company in Sydney, AU. Analyse this lead and return ONLY valid JSON with fields "summary" (2-3 sentences) and "next_action" (specific next step).\n\nLead: ${JSON.stringify({ name: lead.name, productInterest: lead.productInterest, suburb: lead.suburb, ownsLand: lead.ownsLand, hasAccessToCash: lead.hasAccessToCash, expectedBudget: lead.expectedBudget, timeline: lead.timeline, score, classification })}\n\nReturn only valid JSON.`,
            }],
          });
          const content = message.content[0];
          if (content.type === "text") {
            const parsed = JSON.parse(content.text);
            await storage.updateLead(lead.id, {
              aiScore: score,
              aiClassification: classification as "hot" | "warm" | "cold",
              aiSummary: parsed.summary || "",
              aiNextAction: parsed.next_action || "",
            });
          }
        } catch (e) {
          console.error("Background AI scoring failed:", e);
        }
      })();
    }

    // Always return success to the public form — never expose errors
    res.status(201).json({
      success: true,
      leadId: lead.id,
      l1Estimate,
    });

  } catch (error) {
    console.error("Enquiry form submission error:", error);
    // Still return 201 — never show errors to public form users
    res.status(201).json({
      success: true,
      l1Estimate: generateL1Estimate({}),
    });
  }
});

// ─── LEAD ROUTES ──────────────────────────────────────────────────────────────

router.get("/leads/inbound", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await storage.getInboundLeads();
    res.json(result);
  } catch (error) {
    console.error("Error fetching inbound leads:", error);
    res.status(500).json({ error: "Failed to fetch inbound leads" });
  }
});

router.get("/leads/actions", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await storage.getActionLeads();
    res.json(result);
  } catch (error) {
    console.error("Error fetching action leads:", error);
    res.status(500).json({ error: "Failed to fetch action leads" });
  }
});

router.get("/leads", requireAuth, async (req: Request, res: Response) => {
  try {
    const includeArchived = req.query.archived === "true";
    const stage = req.query.stage as string | undefined;

    let allLeads;
    if (stage) {
      allLeads = await storage.getLeadsByStage(stage);
    } else {
      allLeads = await storage.getAllLeads(includeArchived);
    }

    res.json(allLeads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

router.get("/leads/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const stats = await storage.getLeadStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching lead stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/leads/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const lead = await storage.getLeadById(id);
    if (!lead) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }
    res.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({ error: "Failed to fetch lead" });
  }
});

router.post("/leads", requireAuth, async (req: Request, res: Response) => {
  try {
    const data = req.body as InsertLead;
    const lead = await storage.createLead(data);

    // Log activity
    await storage.createActivity({
      leadId: lead.id,
      type: "note",
      title: "Lead created",
      description: `New lead ${lead.name} added to pipeline`,
      performedBy: data.assignedTo ?? undefined,
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({ error: "Failed to create lead" });
  }
});

router.put("/leads/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await storage.getLeadById(id);
    if (!existing) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }

    const data = req.body as Partial<InsertLead>;
    const lead = await storage.updateLead(id, data);

    // Log stage change activity
    if (data.stage && data.stage !== existing.stage) {
      await storage.createActivity({
        leadId: id,
        type: "stage_change",
        title: `Stage changed to ${data.stage}`,
        description: `Pipeline stage updated from ${existing.stage} to ${data.stage}`,
      });
    }

    res.json(lead);
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ error: "Failed to update lead" });
  }
});

router.delete("/leads/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await storage.archiveLead(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error archiving lead:", error);
    res.status(500).json({ error: "Failed to archive lead" });
  }
});

// ─── AI SCORING ───────────────────────────────────────────────────────────────

router.post("/leads/:id/score", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const lead = await storage.getLeadById(id);

    if (!lead) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }

    // Calculate rule-based score
    let score = 0;

    if (lead.ownsLand === true) score += 30;
    if (lead.hasAccessToCash === true) score += 25;
    if (
      lead.expectedBudget === "200k_350k" ||
      lead.expectedBudget === "350k_500k" ||
      lead.expectedBudget === "500k_plus"
    ) {
      score += 20;
    }
    if (lead.timeline === "asap" || lead.timeline === "3_months") score += 15;
    if (
      lead.productInterest === "secondary_dwelling" ||
      lead.productInterest === "primary_dwelling"
    ) {
      score += 10;
    }

    // Clamp score to 0-100
    score = Math.min(100, Math.max(0, score));

    let classification: "hot" | "warm" | "cold";
    if (score >= 70) classification = "hot";
    else if (score >= 40) classification = "warm";
    else classification = "cold";

    // Use Claude for AI summary and next action
    let summary = "";
    let nextAction = "";

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const leadContext = `
Lead Name: ${lead.name}
Product Interest: ${lead.productInterest || "unknown"}
Location: ${lead.suburb || "unknown"}, ${lead.state || "unknown"}
Owns Land: ${lead.ownsLand}
Has Access to Cash: ${lead.hasAccessToCash}
Expected Budget: ${lead.expectedBudget || "unknown"}
Finance Method: ${lead.financeMethod || "unknown"}
Timeline: ${lead.timeline || "unknown"}
Requires Approvals: ${lead.requiresApprovals}
Has Existing Design: ${lead.hasExistingDesign}
Additional Notes: ${lead.additionalNotes || "none"}
Source: ${lead.source || "unknown"}
AI Score: ${score}/100 (${classification})
        `.trim();

        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: `You are Scout, the AI sales agent for Keep Group — a modular construction company in Sydney, Australia. Keep's product system is called FORMA. Key products include Duo-Forma granny flats ($167k–$193k) and Life-Forma primary homes.

Analyse this lead and return ONLY a JSON object with two fields:
- "summary": A 2-3 sentence summary of the lead's situation and suitability for Keep's products
- "next_action": A specific, actionable next step the sales team should take

Lead details:
${leadContext}

Return only valid JSON, no markdown, no explanation.`,
            },
          ],
        });

        const content = message.content[0];
        if (content.type === "text") {
          const parsed = JSON.parse(content.text);
          summary = parsed.summary || "";
          nextAction = parsed.next_action || "";
        }
      } catch (aiError) {
        console.error("AI scoring error:", aiError);
        summary = `Lead scored ${score}/100. Classification: ${classification}.`;
        nextAction =
          score >= 70
            ? "Schedule a factory visit or feasibility call immediately."
            : score >= 40
              ? "Send product brochure and follow up within 48 hours."
              : "Add to nurture sequence and check in next month.";
      }
    } else {
      summary = `Lead scored ${score}/100. Classification: ${classification}.`;
      nextAction =
        score >= 70
          ? "Schedule a factory visit or feasibility call immediately."
          : score >= 40
            ? "Send product brochure and follow up within 48 hours."
            : "Add to nurture sequence and check in next month.";
    }

    // Update lead with AI results
    const updatedLead = await storage.updateLead(id, {
      aiScore: score,
      aiClassification: classification,
      aiSummary: summary,
      aiNextAction: nextAction,
    });

    // Log activity
    await storage.createActivity({
      leadId: id,
      type: "ai_score",
      title: `AI Score: ${score}/100 (${classification})`,
      description: summary,
    });

    res.json({
      score,
      classification,
      summary,
      nextAction,
      lead: updatedLead,
    });
  } catch (error) {
    console.error("Error scoring lead:", error);
    res.status(500).json({ error: "Failed to score lead" });
  }
});

// ─── LEAD ACTIVITIES ──────────────────────────────────────────────────────────

router.get(
  "/leads/:id/activities",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const activities = await storage.getActivitiesForLead(id);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  }
);

router.post(
  "/leads/:id/activities",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const data = req.body as Omit<InsertLeadActivity, "leadId">;
      const activity = await storage.createActivity({
        ...data,
        leadId: id,
      });
      res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ error: "Failed to create activity" });
    }
  }
);

// ─── LEAD NOTES ───────────────────────────────────────────────────────────────

router.get(
  "/leads/:id/notes",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const notes = await storage.getNotesForLead(id);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  }
);

router.post(
  "/leads/:id/notes",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const data = req.body as Omit<InsertLeadNote, "leadId">;
      const note = await storage.createNote({
        ...data,
        leadId: id,
      });
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ error: "Failed to create note" });
    }
  }
);

router.put("/notes/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const note = await storage.updateNote(id, req.body);
    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }
    res.json(note);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
});

router.post(
  "/notes/:id/complete",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.completeNote(id);
      res.json(note);
    } catch (error) {
      console.error("Error completing note:", error);
      res.status(500).json({ error: "Failed to complete note" });
    }
  }
);

router.delete("/notes/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteNote(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// ─── WEBHOOK: MANYCHAT ────────────────────────────────────────────────────────

router.post("/webhook/manychat", async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      source = "manychat",
      product_interest,
      hear_about_us,
    } = req.body as {
      name: string;
      email?: string;
      phone?: string;
      source?: string;
      product_interest?: string;
      hear_about_us?: string;
    };

    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const lead = await storage.createLead({
      name,
      email: email || undefined,
      phone: phone || undefined,
      source,
      productInterest: product_interest || undefined,
      hearAboutUs: hear_about_us || undefined,
      stage: "enquiry",
    });

    await storage.createActivity({
      leadId: lead.id,
      type: "webhook",
      title: "Lead received via ManyChat",
      description: `Automated lead capture from Instagram / ManyChat`,
    });

    res.status(201).json({ success: true, leadId: lead.id });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────

router.get("/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const stats = await storage.getLeadStats();
    const recentActivities = await storage.getRecentActivities(10);
    const openNotesCount = await storage.getOpenNotesCount();

    res.json({
      ...stats,
      openNotesCount,
      recentActivities,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
