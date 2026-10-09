-- V3: Data-integrity fixes
--   * users: case-insensitive unique email, FK to organizations
--   * money stored as INTEGER minor units (paise) instead of REAL (floating point)
--   * tenders belong to a project (the corridor project) instead of a dangling corridor_id
--   * tables for the child entities that exist in the domain model
-- SQLite cannot ALTER column types or add constraints, so affected tables are rebuilt.

-- ── users ──
UPDATE users SET email = lower(trim(email));

CREATE TABLE users_new (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'VENDOR',
    organization_id TEXT REFERENCES organizations(id),
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
INSERT INTO users_new SELECT id, email, full_name, password_hash, role, organization_id, is_active, created_at, updated_at FROM users;

-- projects references users, so rebuild it after users (it also gets integer money).
CREATE TABLE projects_new (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    corridor_name TEXT NOT NULL,
    organization_id TEXT NOT NULL REFERENCES organizations(id),
    project_head_id TEXT NOT NULL REFERENCES users_new(id),
    status TEXT NOT NULL DEFAULT 'PLANNING',
    estimated_budget_minor INTEGER NOT NULL DEFAULT 0,
    estimated_budget_currency TEXT NOT NULL DEFAULT 'INR',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
INSERT INTO projects_new
SELECT id, name, corridor_name, organization_id, project_head_id, status,
       CAST(round(estimated_budget_amount * 100) AS INTEGER), estimated_budget_currency, created_at, updated_at
FROM projects;

-- tenders: corridor_id (pointed at nothing) becomes project_id → projects.
CREATE TABLE tenders_new (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    reference_number TEXT NOT NULL UNIQUE,
    project_id TEXT NOT NULL REFERENCES projects_new(id),
    package_id TEXT,
    estimated_value_minor INTEGER NOT NULL DEFAULT 0,
    estimated_value_currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'DRAFT',
    publish_date TEXT,
    closing_date TEXT,
    ai_risk_score REAL,
    ai_analyzed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
INSERT INTO tenders_new
SELECT id, title, description, reference_number, corridor_id, package_id,
       CAST(round(estimated_value_amount * 100) AS INTEGER), estimated_value_currency, status,
       publish_date, closing_date, ai_risk_score, ai_analyzed_at, created_at, updated_at
FROM tenders;

DROP TABLE tenders;
DROP TABLE projects;
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;
ALTER TABLE projects_new RENAME TO projects;
ALTER TABLE tenders_new RENAME TO tenders;

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tenders_status ON tenders(status);
CREATE INDEX idx_tenders_project ON tenders(project_id);

-- ── Child entities from the domain model ──
CREATE TABLE tender_items (
    id TEXT PRIMARY KEY,
    tender_id TEXT NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,
    estimated_rate_minor INTEGER NOT NULL DEFAULT 0,
    estimated_rate_currency TEXT NOT NULL DEFAULT 'INR'
);
CREATE INDEX idx_tender_items_tender ON tender_items(tender_id);

CREATE TABLE project_sections (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_latitude REAL NOT NULL,
    start_longitude REAL NOT NULL,
    start_label TEXT,
    end_latitude REAL NOT NULL,
    end_longitude REAL NOT NULL,
    end_label TEXT,
    length_km REAL NOT NULL CHECK (length_km >= 0)
);
CREATE INDEX idx_project_sections_project ON project_sections(project_id);

CREATE TABLE corridor_packages (
    id TEXT PRIMARY KEY,
    section_id TEXT NOT NULL REFERENCES project_sections(id) ON DELETE CASCADE,
    package_number TEXT NOT NULL,
    description TEXT NOT NULL,
    contractor_id TEXT REFERENCES organizations(id),
    status TEXT NOT NULL DEFAULT 'NOT_STARTED',
    estimated_value_minor INTEGER NOT NULL DEFAULT 0,
    estimated_value_currency TEXT NOT NULL DEFAULT 'INR'
);
CREATE INDEX idx_corridor_packages_section ON corridor_packages(section_id);
