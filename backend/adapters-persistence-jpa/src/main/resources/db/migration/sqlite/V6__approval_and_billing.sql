-- V6: Account approval and subscription billing
--   * users and organizations carry an approval status; everything that exists today is approved
--   * a subscription ties one company or one individual to a monthly plan
--   * payments extend the period a subscription is paid for

ALTER TABLE users ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'APPROVED';
ALTER TABLE users ADD COLUMN approval_note TEXT;
ALTER TABLE organizations ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'APPROVED';
ALTER TABLE organizations ADD COLUMN approval_note TEXT;
CREATE INDEX idx_users_approval ON users(approval_status);
CREATE INDEX idx_organizations_approval ON organizations(approval_status);

CREATE TABLE plans (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    audience TEXT NOT NULL,
    monthly_price_minor INTEGER NOT NULL CHECK (monthly_price_minor >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- One subscription per subject. subject_id is organizations.id or users.id, depending on subject_type.
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY,
    subject_type TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    plan_id TEXT NOT NULL REFERENCES plans(id),
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    started_on TEXT NOT NULL,
    paid_until TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (subject_type, subject_id)
);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan_id);

-- Append-only ledger. A correction is a new row, never an edit.
CREATE TABLE payments (
    id TEXT PRIMARY KEY,
    subscription_id TEXT NOT NULL REFERENCES subscriptions(id),
    amount_minor INTEGER NOT NULL CHECK (amount_minor >= 0),
    currency TEXT NOT NULL,
    period_from TEXT NOT NULL,
    period_to TEXT NOT NULL,
    method TEXT NOT NULL,
    reference TEXT,
    received_on TEXT NOT NULL,
    recorded_by TEXT,
    note TEXT,
    created_at TEXT NOT NULL
);
CREATE INDEX idx_payments_subscription ON payments(subscription_id);
CREATE INDEX idx_payments_received ON payments(received_on);
