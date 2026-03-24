// Email sync: polls Outlook via Graph API, matches to leads, saves to communications
import { pollNewEmailsFromFolder, hasTokens } from "./graph.js";
import * as storage from "./storage.js";

// ─── Team email addresses (used to identify outbound direction) ───────────────
const TEAM_EMAILS = new Set([
  "jeremy@keepmodular.com.au",
  "jeremy@keepconstructions.com.au",
  "shem@keepmodular.com.au",
  "anthony@keepmodular.com.au",
  "clarissa@keepmodular.com.au",
  "theo@keepmodular.com.au",
]);

// ─── Sync emails ──────────────────────────────────────────────────────────────

export async function syncEmails(): Promise<void> {
  if (!hasTokens()) return;

  try {
    // Poll last 1 hour from both Inbox and Sent Items
    const [inboxMessages, sentMessages] = await Promise.all([
      pollNewEmailsFromFolder("inbox", 1),
      pollNewEmailsFromFolder("sentitems", 1),
    ]);

    console.log(`[emailSync] Inbox: ${inboxMessages.length} msgs, Sent: ${sentMessages.length} msgs`);

    // Process inbox messages as inbound
    for (const msg of inboxMessages) {
      const existing = await storage.getCommunicationByMsId(msg.id);
      if (existing) continue;

      // Sender is the lead (someone emailed the team)
      const senderEmail = msg.from?.emailAddress?.address?.toLowerCase();
      if (!senderEmail) continue;

      // Skip if sender is a team member (internal email)
      if (TEAM_EMAILS.has(senderEmail)) continue;

      const lead = await storage.getLeadByEmail(senderEmail);
      if (!lead) continue;

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

      console.log(`[emailSync] Inbound: ${senderEmail} → lead #${lead.id}`);
    }

    // Process sent items as outbound
    for (const msg of sentMessages) {
      const existing = await storage.getCommunicationByMsId(msg.id);
      if (existing) continue;

      // For sent items, match by recipient email (the lead we emailed)
      const recipients = msg.toRecipients || [];
      for (const recipient of recipients) {
        const recipientEmail = recipient.emailAddress?.address?.toLowerCase();
        if (!recipientEmail) continue;

        // Skip if recipient is a team member (internal email)
        if (TEAM_EMAILS.has(recipientEmail)) continue;

        const lead = await storage.getLeadByEmail(recipientEmail);
        if (!lead) continue;

        await storage.createCommunication({
          leadId:      lead.id,
          direction:   "outbound",
          subject:     msg.subject || "(no subject)",
          bodyPreview: msg.bodyPreview || "",
          fullBody:    msg.body?.content || "",
          msMessageId: msg.id,
          msThreadId:  msg.conversationId,
          sentAt:      msg.receivedDateTime ? new Date(msg.receivedDateTime) : new Date(),
        });

        console.log(`[emailSync] Outbound: → ${recipientEmail} (lead #${lead.id})`);
        break; // Only log once per sent message
      }
    }
  } catch (err) {
    console.error("[emailSync] Poll error:", err);
  }
}

// ─── Start polling interval ───────────────────────────────────────────────────

export function startEmailPolling(): void {
  const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
  console.log("[emailSync] Email polling started — interval 15 min");

  // Run once on startup (non-blocking)
  syncEmails().catch((e) => console.error("[emailSync] Initial sync error:", e));

  setInterval(() => {
    syncEmails().catch((e) => console.error("[emailSync] Interval sync error:", e));
  }, INTERVAL_MS);
}
