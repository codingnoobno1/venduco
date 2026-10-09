-- V9: Bids on tenders
-- One bid per tender per bidder (a company, or an individual without one). The quotation file
-- lives with the bid: uploading again replaces it.

CREATE TABLE bids (
    id TEXT PRIMARY KEY,
    tender_id TEXT NOT NULL REFERENCES tenders(id),
    subject_type TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    amount_minor INTEGER CHECK (amount_minor IS NULL OR amount_minor >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    validity_days INTEGER,
    note TEXT,
    quotation_file_name TEXT,
    quotation_content_type TEXT,
    quotation_size_bytes INTEGER,
    quotation_storage_path TEXT,
    quotation_uploaded_at TEXT,
    submitted_by TEXT,
    submitted_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (tender_id, subject_type, subject_id)
);
CREATE INDEX idx_bids_subject ON bids(subject_type, subject_id);
