-- V11: Fleet register. A machine belongs to a company, or to an individual without one.

CREATE TABLE machines (
    id TEXT PRIMARY KEY,
    owner_type TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    machine_code TEXT NOT NULL,
    name TEXT,
    machine_type TEXT NOT NULL,
    manufacturer TEXT,
    model TEXT,
    year_of_manufacture INTEGER,
    capacity TEXT,
    location TEXT,
    registration_number TEXT,
    insurance_expiry TEXT,
    last_maintenance_date TEXT,
    status TEXT NOT NULL DEFAULT 'AVAILABLE',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (owner_type, owner_id, machine_code)
);
CREATE INDEX idx_machines_owner ON machines(owner_type, owner_id);
