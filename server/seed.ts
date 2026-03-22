import { db } from "./db.js";
import { users, leads, leadActivities, leadNotes } from "../shared/schema.js";

async function seed() {
  console.log("🌱 Seeding Keep Group CRM...\n");

  // ─── SEED USERS ─────────────────────────────────────────────────────────────

  console.log("Creating users...");

  const [jeremy] = await db
    .insert(users)
    .values({
      email: "jeremy@keepmodular.com.au",
      firstName: "Jeremy",
      lastName: "Wikeepa",
      role: "admin",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const [anthony] = await db
    .insert(users)
    .values({
      email: "anthony@keepmodular.com.au",
      firstName: "Anthony",
      lastName: "Sales",
      role: "manager",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const [theo] = await db
    .insert(users)
    .values({
      email: "theo@keepmodular.com.au",
      firstName: "Theo",
      lastName: "Keep",
      role: "member",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const [clarissa] = await db
    .insert(users)
    .values({
      email: "clarissa@keepmodular.com.au",
      firstName: "Clarissa",
      lastName: "Wikeepa",
      role: "member",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const [shem] = await db
    .insert(users)
    .values({
      email: "shem@keepmodular.com.au",
      firstName: "Shem",
      lastName: "Keep",
      role: "member",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const jeremyId = jeremy?.id;
  const anthonyId = anthony?.id;
  const theoId = theo?.id;

  console.log(`  ✓ Created ${[jeremy, anthony, theo, clarissa, shem].filter(Boolean).length} users`);

  // ─── SEED LEADS ─────────────────────────────────────────────────────────────

  console.log("Creating leads...");

  // Georgia Jarrett — Cringilla — build stage
  const [georgia] = await db
    .insert(leads)
    .values({
      name: "Georgia Jarrett",
      email: "georgia.jarrett@email.com",
      phone: "0412 345 678",
      source: "instagram",
      hearAboutUs: "Instagram @keepmodular — saw the Djua build post",
      assignedTo: anthonyId,
      stage: "build",
      aiScore: 92,
      aiClassification: "hot",
      aiSummary:
        "Georgia is a highly qualified lead with land in Cringilla and cash access. She is building a Duo-Forma secondary dwelling for rental income. Budget is well-aligned and timeline is immediate. Currently in active build phase.",
      aiNextAction:
        "Coordinate site inspection and factory milestone updates. Send weekly build progress photos.",
      productInterest: "secondary_dwelling",
      suburb: "Cringilla",
      state: "NSW",
      ownsLand: true,
      hasAccessToCash: true,
      expectedBudget: "200k_350k",
      financeMethod: "cash",
      requiresApprovals: false,
      hasExistingDesign: false,
      timeline: "asap",
      additionalNotes:
        "Client is very engaged. Building a Duo-Forma Djua 1-bedroom as secondary dwelling for short-term rental. CDC approved. Factory build commenced.",
      archived: false,
    })
    .returning();

  // John Quinell — Sutherland — build stage
  const [john] = await db
    .insert(leads)
    .values({
      name: "John Quinell",
      email: "john.quinell@email.com",
      phone: "0423 456 789",
      source: "referral",
      hearAboutUs: "Referred by a neighbour who saw a Keep build",
      assignedTo: jeremyId,
      stage: "build",
      aiScore: 88,
      aiClassification: "hot",
      aiSummary:
        "John is building a primary dwelling replacement in Sutherland. Long-standing client with strong budget and clear timeline. Life-Forma Acacia 4-bedroom selected.",
      aiNextAction:
        "Weekly construction update call. Coordinate DA approval documentation. Prepare handover checklist.",
      productInterest: "primary_dwelling",
      suburb: "Sutherland",
      state: "NSW",
      ownsLand: true,
      hasAccessToCash: false,
      expectedBudget: "350k_500k",
      financeMethod: "construction_loan",
      requiresApprovals: true,
      hasExistingDesign: true,
      timeline: "asap",
      additionalNotes:
        "Replacing existing home. DA approved. Construction loan settled. Life-Forma Acacia 4-bed. Site works underway, factory build week 3 of 6.",
      archived: false,
    })
    .returning();

  // Chloe & Dane — Penrith — build stage
  const [chloeDane] = await db
    .insert(leads)
    .values({
      name: "Chloe & Dane Penrith",
      email: "chloe.dane@email.com",
      phone: "0434 567 890",
      source: "facebook",
      hearAboutUs: "Facebook Ad — Secondary Dwelling campaign",
      assignedTo: theoId,
      stage: "build",
      aiScore: 78,
      aiClassification: "hot",
      aiSummary:
        "Young couple in Penrith building a Duo-Forma granny flat for in-laws. CDC pathway. Owner-builder with equity finance. Strong commitment.",
      aiNextAction:
        "Organise cranage and site install schedule. Confirm utility connections with site contractor.",
      productInterest: "secondary_dwelling",
      suburb: "Penrith",
      state: "NSW",
      ownsLand: true,
      hasAccessToCash: false,
      expectedBudget: "200k_350k",
      financeMethod: "equity",
      requiresApprovals: false,
      hasExistingDesign: false,
      timeline: "3_months",
      additionalNotes:
        "Building a Raglan 2-bed Duo-Forma for in-laws. CDC approved. Finance settled via equity release. Factory build week 1.",
      archived: false,
    })
    .returning();

  // Additional pipeline leads
  await db.insert(leads).values([
    {
      name: "Sarah Mitchell",
      email: "sarah.mitchell@email.com",
      phone: "0445 123 456",
      source: "instagram",
      hearAboutUs: "Instagram — FLOOR PLAN keyword via ManyChat",
      assignedTo: anthonyId,
      stage: "qualified",
      aiScore: 65,
      aiClassification: "warm",
      aiSummary:
        "Sarah has a block in the Hills District and is interested in a secondary dwelling for Airbnb. Budget aligns but needs to sort construction finance.",
      aiNextAction:
        "Send L1 estimate for Djua 1-bed. Book a 15-min feasibility call via Cal.com.",
      productInterest: "secondary_dwelling",
      suburb: "Castle Hill",
      state: "NSW",
      ownsLand: true,
      hasAccessToCash: false,
      expectedBudget: "200k_350k",
      financeMethod: "construction_loan",
      requiresApprovals: false,
      hasExistingDesign: false,
      timeline: "6_months",
      archived: false,
    },
    {
      name: "Marcus & Priya Sharma",
      email: "m.sharma@email.com",
      phone: "0456 234 567",
      source: "google",
      hearAboutUs: "Google search — modular homes Sydney",
      assignedTo: anthonyId,
      stage: "feasibility",
      aiScore: 72,
      aiClassification: "hot",
      aiSummary:
        "Marcus and Priya are exploring a 4-bedroom Life-Forma for a knockdown rebuild in Parramatta. DA pathway. Strong budget.",
      aiNextAction:
        "Prepare L2 feasibility estimate. Book site inspection with Jeremy.",
      productInterest: "primary_dwelling",
      suburb: "Parramatta",
      state: "NSW",
      ownsLand: true,
      hasAccessToCash: true,
      expectedBudget: "350k_500k",
      financeMethod: "refinance",
      requiresApprovals: true,
      hasExistingDesign: false,
      timeline: "6_months",
      archived: false,
    },
    {
      name: "Tim Okafor",
      email: "tim.okafor@email.com",
      phone: "0467 345 678",
      source: "manychat",
      hearAboutUs: "Instagram DM — FLOOR PLAN trigger",
      assignedTo: theoId,
      stage: "enquiry",
      aiScore: 35,
      aiClassification: "cold",
      aiSummary:
        "Tim is early in his research phase. No land ownership yet and budget is unclear. Interested in micro dwelling / studio concept.",
      aiNextAction:
        "Add to nurture email sequence. Send FORMA product guide. Follow up in 30 days.",
      productInterest: "micro_dwelling",
      suburb: "Liverpool",
      state: "NSW",
      ownsLand: false,
      hasAccessToCash: false,
      expectedBudget: "under_100k",
      financeMethod: "unsure",
      requiresApprovals: false,
      hasExistingDesign: false,
      timeline: "exploring",
      archived: false,
    },
    {
      name: "Natalie Thornton",
      email: "natalie.thornton@email.com",
      phone: "0478 456 789",
      source: "website",
      hearAboutUs: "keepmodular.com.au website enquiry form",
      assignedTo: anthonyId,
      stage: "proposal",
      aiScore: 81,
      aiClassification: "hot",
      aiSummary:
        "Natalie is ready to move forward. Proposal for a Duo-Forma Arramont 3-bed has been presented. Awaiting contract sign-off.",
      aiNextAction:
        "Follow up on proposal. Address any questions. Push for contract signature this week.",
      productInterest: "secondary_dwelling",
      suburb: "Hornsby",
      state: "NSW",
      ownsLand: true,
      hasAccessToCash: true,
      expectedBudget: "200k_350k",
      financeMethod: "cash",
      requiresApprovals: false,
      hasExistingDesign: false,
      timeline: "3_months",
      archived: false,
    },
  ]);

  console.log(`  ✓ Created ${6} leads`);

  // ─── SEED ACTIVITIES ─────────────────────────────────────────────────────────

  if (georgia?.id) {
    await db.insert(leadActivities).values([
      {
        leadId: georgia.id,
        type: "stage_change",
        title: "Stage changed to build",
        description: "Georgia's project moved to active build phase. Factory production commenced.",
        performedBy: anthonyId,
      },
      {
        leadId: georgia.id,
        type: "call",
        title: "Weekly progress call",
        description: "Discussed factory milestone. Module frame complete. Cladding starts next week.",
        performedBy: anthonyId,
      },
      {
        leadId: georgia.id,
        type: "ai_score",
        title: "AI Score: 92/100 (hot)",
        description: "Lead scored as hot. Owns land, cash access, ASAP timeline.",
        performedBy: undefined,
      },
    ]);
  }

  if (john?.id) {
    await db.insert(leadActivities).values([
      {
        leadId: john.id,
        type: "stage_change",
        title: "Stage changed to build",
        description: "DA approved. Construction loan settled. Build commenced.",
        performedBy: jeremyId,
      },
      {
        leadId: john.id,
        type: "site_visit",
        title: "Site inspection completed",
        description: "Site works progressing well. Slab poured. Factory module in week 3.",
        performedBy: jeremyId,
      },
    ]);
  }

  // ─── SEED NOTES ──────────────────────────────────────────────────────────────

  if (georgia?.id) {
    await db.insert(leadNotes).values([
      {
        leadId: georgia.id,
        title: "Send weekly build photos",
        description: "Georgia has requested weekly photo updates from factory floor",
        assignedTo: anthonyId,
        priority: "high",
        status: "open",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ]);
  }

  if (chloeDane?.id) {
    await db.insert(leadNotes).values([
      {
        leadId: chloeDane.id,
        title: "Confirm crane booking",
        description: "Need to book crane for site install. Contact Collins Crane Hire.",
        assignedTo: theoId,
        priority: "high",
        status: "open",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    ]);
  }

  console.log("  ✓ Created activities and notes");

  console.log("\n✅ Seed complete! Keep Group CRM is ready.\n");
  console.log("   Users created:");
  console.log("   • Jeremy Wikeepa (admin) — jeremy@keepmodular.com.au");
  console.log("   • Anthony Sales (manager) — anthony@keepmodular.com.au");
  console.log("   • Theo Keep (member) — theo@keepmodular.com.au");
  console.log("   • Clarissa Wikeepa (member) — clarissa@keepmodular.com.au");
  console.log("   • Shem Keep (member) — shem@keepmodular.com.au");
  console.log("\n   Leads created: 6 (3 active builds + 3 pipeline)");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
