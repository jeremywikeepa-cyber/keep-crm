# Trixie OS — Architecture Decisions Log

## Keep Group CRM · Layer 2 Client Pipeline Module

---

### 1. Microsoft Graph over IMAP
**Decision:** Use Microsoft Graph API for email integration, not IMAP.
**Reason:** Unified OAuth2 flow gives access to both Outlook email and OneDrive file storage under a single token. IMAP would require separate credentials and would not give access to OneDrive folders needed for document linking. Graph also supports send-on-behalf-of and webhook subscriptions for real-time sync in Phase 2.

---

### 2. Token storage in environment variables, not database
**Decision:** Store Microsoft Graph OAuth tokens (`MS_ACCESS_TOKEN`, `MS_REFRESH_TOKEN`) in `.env`, not in the database.
**Reason:** Storing OAuth tokens in a shared database increases the blast radius of any DB compromise. Single-user admin tool (Jeremy) does not require per-user token storage. Env vars are not committed to source control and are injected at runtime by the hosting environment.

---

### 3. Email sync: 15-minute poll with 1-hour lookback window
**Decision:** `emailSync.ts` polls the Graph API every 15 minutes with a `receivedDateTime` filter looking back 1 hour.
**Reason:** The 1-hour overlap ensures no emails are missed between poll cycles even if a poll is delayed. Not using webhooks (Graph change notifications) in Phase 1 to reduce infrastructure complexity — polling is sufficient for current lead volume.

---

### 4. Loss analysis never auto-sends
**Decision:** The win-back email draft is always surfaced for human review before any send action is taken.
**Reason:** Trixie OS escalation rules require human sign-off before any communication goes to a client. Auto-sending a re-engagement email to a lost lead without review could damage the relationship or send incorrect information. The draft panel requires an explicit 'Send via Outlook' button press after reviewing subject and body.

---

### 5. Win-back email generation via Anthropic claude-sonnet-4-6
**Decision:** Use `claude-sonnet-4-6` (not Haiku or Opus) for loss analysis and win-back message generation.
**Reason:** Sonnet provides the right balance of reasoning quality and cost for customer-facing copy generation. Win-back messages tailored by drop-off reason (price, timeline, competitor, etc.) require nuanced tone — Haiku is insufficient. Opus is not needed for this task.

---

### 6. recharts for Intelligence dashboard
**Decision:** Use `recharts` for bar charts and other visualisations in `IntelligencePage.tsx`.
**Reason:** recharts is the standard React charting library with good TypeScript support and zero additional configuration needed with Vite. No other charting library is in the project. D3 directly would add unnecessary complexity for simple bar and line charts.

---

### 7. Trixie OS Layer assignment
**Decision:** This CRM module is assigned to **Layer 2 — Client Pipeline** (enquiry to contract).
**Data flow:** Lead record is the central data object. Originates at Layer 0 (content/ManyChat), flows through Layer 2 (this module), and is consumed by Layer 3 (Design), Layer 4 (Estimating), Layer 5 (Factory), and Layer 6 (Site Delivery).
**API-first:** All data mutations are through documented REST endpoints so other Trixie layers can consume them.

---

*Last updated: 2026-03-23*
