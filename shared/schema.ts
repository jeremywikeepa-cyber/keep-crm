import { pgTable, serial, text, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("member"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  source: varchar("source", { length: 100 }),
  hearAboutUs: text("hear_about_us"),
  assignedTo: integer("assigned_to").references(() => users.id),
  stage: varchar("stage", { length: 50 }).notNull().default("enquiry"),
  aiScore: integer("ai_score"),
  aiClassification: varchar("ai_classification", { length: 20 }),
  aiSummary: text("ai_summary"),
  aiNextAction: text("ai_next_action"),
  productInterest: varchar("product_interest", { length: 100 }),
  suburb: varchar("suburb", { length: 100 }),
  state: varchar("state", { length: 50 }),
  ownsLand: boolean("owns_land"),
  hasAccessToCash: boolean("has_access_to_cash"),
  expectedBudget: varchar("expected_budget", { length: 100 }),
  financeMethod: varchar("finance_method", { length: 100 }),
  requiresApprovals: boolean("requires_approvals"),
  hasExistingDesign: boolean("has_existing_design"),
  timeline: varchar("timeline", { length: 100 }),
  additionalNotes: text("additional_notes"),
  dwellingSize: varchar("dwelling_size", { length: 50 }),
  onedriveFolderUrl: text("onedrive_folder_url"),
  lossReason: varchar("loss_reason", { length: 255 }),
  lossStage: varchar("loss_stage", { length: 50 }),
  winBackSent: boolean("win_back_sent").default(false),
  winBackResponse: boolean("win_back_response").default(false),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leadActivities = pgTable("lead_activities", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  performedBy: integer("performed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leadNotes = pgTable("lead_notes", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assignedTo: integer("assigned_to").references(() => users.id),
  priority: varchar("priority", { length: 20 }).default("medium"),
  status: varchar("status", { length: 20 }).default("open"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const communications = pgTable("communications", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id).notNull(),
  direction: varchar("direction", { length: 20 }).notNull(), // 'inbound' | 'outbound'
  subject: text("subject"),
  bodyPreview: text("body_preview"),
  fullBody: text("full_body"),
  msMessageId: varchar("ms_message_id", { length: 512 }).unique(),
  msThreadId: varchar("ms_thread_id", { length: 512 }),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
export type LeadActivity = typeof leadActivities.$inferSelect;
export type InsertLeadActivity = typeof leadActivities.$inferInsert;
export type LeadNote = typeof leadNotes.$inferSelect;
export type InsertLeadNote = typeof leadNotes.$inferInsert;
export type Communication = typeof communications.$inferSelect;
export type InsertCommunication = typeof communications.$inferInsert;

// Stage constants
export const PIPELINE_STAGES = [
  "enquiry",
  "qualified",
  "feasibility",
  "proposal",
  "build",
  "delivered",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

// Source options
export const LEAD_SOURCES = [
  "instagram",
  "facebook",
  "website",
  "referral",
  "manychat",
  "google",
  "other",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

// Product interest options
export const PRODUCT_INTERESTS = [
  "micro_dwelling",
  "secondary_dwelling",
  "primary_dwelling",
  "duplex",
  "bespoke",
  "other",
] as const;

export type ProductInterest = (typeof PRODUCT_INTERESTS)[number];

// Budget options
export const BUDGET_OPTIONS = [
  "under_100k",
  "100k_200k",
  "200k_350k",
  "350k_500k",
  "500k_plus",
] as const;

export type BudgetOption = (typeof BUDGET_OPTIONS)[number];

// Timeline options
export const TIMELINE_OPTIONS = [
  "asap",
  "3_months",
  "6_months",
  "12_months",
  "exploring",
] as const;

export type TimelineOption = (typeof TIMELINE_OPTIONS)[number];

// Finance methods
export const FINANCE_METHODS = [
  "cash",
  "construction_loan",
  "refinance",
  "equity",
  "unsure",
] as const;

export type FinanceMethod = (typeof FINANCE_METHODS)[number];

// Dwelling size options
export const DWELLING_SIZES = [
  "under_20",
  "20_60",
  "60_100",
  "100_150",
  "150_200",
  "200_300",
  "300_plus",
  "not_sure",
] as const;

export type DwellingSize = (typeof DWELLING_SIZES)[number];

// AI classification
export type AiClassification = "hot" | "warm" | "cold";

// Activity types
export const ACTIVITY_TYPES = [
  "call",
  "email",
  "meeting",
  "site_visit",
  "factory_visit",
  "stage_change",
  "note",
  "ai_score",
  "webhook",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];
