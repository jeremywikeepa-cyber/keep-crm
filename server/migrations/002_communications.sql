-- Migration 002: Communications table + lead loss fields
-- Run manually: psql $DATABASE_URL < server/migrations/002_communications.sql
-- DO NOT run automatically — requires approval per CLAUDE.md

-- ── Add loss tracking fields to leads ────────────────────────────────────────

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS loss_reason    VARCHAR(255),
  ADD COLUMN IF NOT EXISTS loss_stage     VARCHAR(50),
  ADD COLUMN IF NOT EXISTS win_back_sent  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS win_back_response BOOLEAN NOT NULL DEFAULT FALSE;

-- ── Communications table ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS communications (
  id             SERIAL PRIMARY KEY,
  lead_id        INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  direction      VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  subject        TEXT,
  body_preview   TEXT,
  full_body      TEXT,
  ms_message_id  VARCHAR(512) UNIQUE,
  ms_thread_id   VARCHAR(512),
  sent_at        TIMESTAMP,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS communications_lead_id_idx ON communications(lead_id);
CREATE INDEX IF NOT EXISTS communications_sent_at_idx  ON communications(sent_at DESC);
