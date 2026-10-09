-- V5: Persisted access model
--   * roles are data (system roles are written at startup from SystemRoles.kt, custom roles by admins)
--   * a user holds one or more scoped role assignments; each request runs under one of them
--   * audit_log records privileged changes
-- users.role stays for now as a bridge: it is mirrored into a LEGACY_ROLE assignment.

CREATE TABLE roles (
    id TEXT PRIMARY KEY,
    role_key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    portal TEXT NOT NULL,
    scope_level TEXT NOT NULL,
    is_system INTEGER NOT NULL DEFAULT 0,
    organization_id TEXT REFERENCES organizations(id),
    default_dashboard_key TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE role_permissions (
    role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_key TEXT NOT NULL,
    PRIMARY KEY (role_id, permission_key)
);

CREATE TABLE role_assignments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES roles(id),
    organization_id TEXT REFERENCES organizations(id),
    project_id TEXT REFERENCES projects(id),
    scope_type TEXT NOT NULL DEFAULT 'ALL',
    access_level TEXT NOT NULL DEFAULT 'FULL',
    approval_limit_minor INTEGER CHECK (approval_limit_minor IS NULL OR approval_limit_minor >= 0),
    approval_limit_currency TEXT,
    reviewer_user_id TEXT REFERENCES users(id),
    valid_from TEXT NOT NULL,
    valid_until TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    source TEXT NOT NULL DEFAULT 'MANUAL',
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_role_assignments_user ON role_assignments(user_id);
CREATE INDEX idx_role_assignments_role ON role_assignments(role_id);
CREATE INDEX idx_role_assignments_project ON role_assignments(project_id);

-- What scope_ref holds depends on role_assignments.scope_type: a discipline key, package id or section id.
CREATE TABLE assignment_scopes (
    assignment_id TEXT NOT NULL REFERENCES role_assignments(id) ON DELETE CASCADE,
    scope_ref TEXT NOT NULL,
    PRIMARY KEY (assignment_id, scope_ref)
);

CREATE TABLE audit_log (
    id TEXT PRIMARY KEY,
    occurred_at TEXT NOT NULL,
    actor_user_id TEXT,
    assignment_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    summary TEXT NOT NULL
);
CREATE INDEX idx_audit_log_occurred ON audit_log(occurred_at);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_user_id);
