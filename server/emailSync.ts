// Email sync: polls Outlook via Graph API, matches to leads, saves to communications
import { pollNewEmails, hasTokens } from "./graph.js";
import * as storage from "./storage.js";

// ── Sync emails ───────────────────────────────────────────────────────────────

export async function syncEmails(): Promise<void> {
  if (!hasTokens()) return;

  try {
    // Poll last 1 hour (runs every 15 min — 1h gives overlap buffer)
    const messages = await pollNewEmails(1);
    if (!messages.length) return;

    for (const msg of messages) {
      // Skip if already stored (idempotent)
      const existing = await storage.getCommunicationByMsId(msg.id);
      if (existing) continue;

      // Try to match to a lead by email address
      const senderEmail = msg.from?.emailAddress?.address?.toLowerCase();
      if (!senderEmail) continue;

      const lead = await storage.getLeadByEmail(senderEmail);
      if (!lead) continue; // email not in our pipeline — skip

      await storage.createCommunication({
        leadId:      lead.id,
        direction:   "inbound",
        subject:     msg.subject || "(no subject)",
        bodyPreview: msg.bodyPreview || "",
        fullBody:    msg.body?.content || "",
        msMessageId: msg.id,
        msThreadId:  msg.conversationId,
        sentAt:      msg.receivedDateTime ? new Date(msg.receivedDateTime) : new Date(),
      });
    }
  } catch (err) {
    console.error("[emailSync] Poll error:", err);
  }
}

// ── Start polling interval ────────────────────────────────────────────────────

export function startEmailPolling(): void {
  const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
  console.log("[emailSync] Email polling started — interval 15 min");

  // Run once on startup (non-blocking)
  syncEmails().catch((e) => console.error("[emailSync] Initial sync error:", e));

  setInterval(() => {
    syncEmails().catch((e) => console.error("[emailSync] Interval sync error:", e));
  }, INTERVAL_MS);
}
