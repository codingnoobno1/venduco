-- V10: Award of a tender to one of its bids. At most one award per tender.

CREATE TABLE tender_awards (
    tender_id TEXT PRIMARY KEY REFERENCES tenders(id),
    bid_id TEXT NOT NULL REFERENCES bids(id),
    reason TEXT NOT NULL,
    awarded_by TEXT NOT NULL,
    awarded_at TEXT NOT NULL
);
