-- V8: Partner qualification application
--   * one application per company (or per individual without a company)
--   * answers are stored as one JSON object keyed by field; sensitive answers are encrypted before they get here
--   * each document slot holds at most one file; uploading again replaces it

CREATE TABLE qualification_applications (
    id TEXT PRIMARY KEY,
    subject_type TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    version INTEGER NOT NULL DEFAULT 1,
    template_version INTEGER NOT NULL,
    data_json TEXT NOT NULL DEFAULT '{}',
    submitted_by TEXT,
    submitted_at TEXT,
    review_note TEXT,
    decided_by TEXT,
    decided_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (subject_type, subject_id)
);
CREATE INDEX idx_qualification_status ON qualification_applications(status);

CREATE TABLE qualification_documents (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL REFERENCES qualification_applications(id) ON DELETE CASCADE,
    field_key TEXT NOT NULL,
    file_name TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    uploaded_by TEXT,
    uploaded_at TEXT NOT NULL,
    UNIQUE (application_id, field_key)
);
