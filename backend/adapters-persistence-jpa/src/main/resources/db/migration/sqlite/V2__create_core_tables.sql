-- V2: Create Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- V2: Create Tenders table
CREATE TABLE IF NOT EXISTS tenders (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    reference_number TEXT NOT NULL UNIQUE,
    corridor_id TEXT NOT NULL,
    package_id TEXT,
    estimated_value_amount REAL NOT NULL DEFAULT 0,
    estimated_value_currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'DRAFT',
    publish_date TEXT,
    closing_date TEXT,
    ai_risk_score REAL,
    ai_analyzed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- V2: Create Projects table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    corridor_name TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    project_head_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PLANNING',
    estimated_budget_amount REAL NOT NULL DEFAULT 0,
    estimated_budget_currency TEXT NOT NULL DEFAULT 'INR',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (project_head_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_corridor ON tenders(corridor_id);
CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
