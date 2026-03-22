import { eq, desc, asc, and, sql, inArray, isNotNull, gt } from "drizzle-orm";
import { db } from "./db.js";
import {
  users,
  leads,
  leadActivities,
  leadNotes,
  type User,
  type InsertUser,
  type Lead,
  type InsertLead,
  type LeadActivity,
  type InsertLeadActivity,
  type LeadNote,
  type InsertLeadNote,
} from "../shared/schema.js";

// ─── USERS ────────────────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<User[]> {
  return db.select().from(users).orderBy(users.firstName);
}

export async function getUserById(id: number): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result[0];
}

export async function createUser(data: InsertUser): Promise<User> {
  const result = await db.insert(users).values(data).returning();
  return result[0];
}

export async function updateUser(
  id: number,
  data: Partial<InsertUser>
): Promise<User | undefined> {
  const result = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning();
  return result[0];
}

// ─── LEADS ────────────────────────────────────────────────────────────────────

export async function getAllLeads(includeArchived = false): Promise<Lead[]> {
  if (includeArchived) {
    return db.select().from(leads).orderBy(desc(leads.createdAt));
  }
  return db
    .select()
    .from(leads)
    .where(eq(leads.archived, false))
    .orderBy(desc(leads.createdAt));
}

export async function getLeadsByStage(stage: string): Promise<Lead[]> {
  return db
    .select()
    .from(leads)
    .where(and(eq(leads.stage, stage), eq(leads.archived, false)))
    .orderBy(desc(leads.createdAt));
}

export async function getLeadById(id: number): Promise<Lead | undefined> {
  const result = await db
    .select()
    .from(leads)
    .where(eq(leads.id, id))
    .limit(1);
  return result[0];
}

export async function createLead(data: InsertLead): Promise<Lead> {
  const result = await db
    .insert(leads)
    .values({
      ...data,
      updatedAt: new Date(),
    })
    .returning();
  return result[0];
}

export async function updateLead(
  id: number,
  data: Partial<InsertLead>
): Promise<Lead | undefined> {
  const result = await db
    .update(leads)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, id))
    .returning();
  return result[0];
}

export async function archiveLead(id: number): Promise<Lead | undefined> {
  return updateLead(id, { archived: true });
}

export async function getInboundLeads(): Promise<Lead[]> {
  return db
    .select()
    .from(leads)
    .where(
      and(
        inArray(leads.source, ["website_form", "manychat", "Website", "website"]),
        gt(leads.createdAt, sql`NOW() - INTERVAL '48 hours'`),
        eq(leads.archived, false)
      )
    )
    .orderBy(desc(leads.createdAt))
    .limit(10);
}

export async function getActionLeads(): Promise<Lead[]> {
  return db
    .select()
    .from(leads)
    .where(
      and(
        inArray(leads.aiClassification, ["hot", "warm"]),
        eq(leads.archived, false),
        isNotNull(leads.aiNextAction)
      )
    )
    .orderBy(desc(leads.aiScore), asc(leads.updatedAt))
    .limit(8);
}

export async function getLeadStats(): Promise<{
  total: number;
  byStage: Record<string, number>;
  hot: number;
  warm: number;
  cold: number;
}> {
  const allLeads = await getAllLeads();

  const byStage: Record<string, number> = {};
  let hot = 0;
  let warm = 0;
  let cold = 0;

  for (const lead of allLeads) {
    byStage[lead.stage] = (byStage[lead.stage] || 0) + 1;
    if (lead.aiClassification === "hot") hot++;
    else if (lead.aiClassification === "warm") warm++;
    else if (lead.aiClassification === "cold") cold++;
  }

  return {
    total: allLeads.length,
    byStage,
    hot,
    warm,
    cold,
  };
}

// ─── LEAD ACTIVITIES ──────────────────────────────────────────────────────────

export async function getActivitiesForLead(
  leadId: number
): Promise<LeadActivity[]> {
  return db
    .select()
    .from(leadActivities)
    .where(eq(leadActivities.leadId, leadId))
    .orderBy(desc(leadActivities.createdAt));
}

export async function createActivity(
  data: InsertLeadActivity
): Promise<LeadActivity> {
  const result = await db.insert(leadActivities).values(data).returning();
  return result[0];
}

export async function getRecentActivities(limit = 20): Promise<LeadActivity[]> {
  return db
    .select()
    .from(leadActivities)
    .orderBy(desc(leadActivities.createdAt))
    .limit(limit);
}

// ─── LEAD NOTES ───────────────────────────────────────────────────────────────

export async function getNotesForLead(leadId: number): Promise<LeadNote[]> {
  return db
    .select()
    .from(leadNotes)
    .where(eq(leadNotes.leadId, leadId))
    .orderBy(desc(leadNotes.createdAt));
}

export async function getNoteById(id: number): Promise<LeadNote | undefined> {
  const result = await db
    .select()
    .from(leadNotes)
    .where(eq(leadNotes.id, id))
    .limit(1);
  return result[0];
}

export async function createNote(data: InsertLeadNote): Promise<LeadNote> {
  const result = await db.insert(leadNotes).values(data).returning();
  return result[0];
}

export async function updateNote(
  id: number,
  data: Partial<InsertLeadNote>
): Promise<LeadNote | undefined> {
  const result = await db
    .update(leadNotes)
    .set(data)
    .where(eq(leadNotes.id, id))
    .returning();
  return result[0];
}

export async function completeNote(id: number): Promise<LeadNote | undefined> {
  return updateNote(id, {
    status: "completed",
    completedAt: new Date(),
  });
}

export async function deleteNote(id: number): Promise<void> {
  await db.delete(leadNotes).where(eq(leadNotes.id, id));
}

export async function getOpenNotesCount(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(leadNotes)
    .where(eq(leadNotes.status, "open"));
  return Number(result[0]?.count ?? 0);
}
