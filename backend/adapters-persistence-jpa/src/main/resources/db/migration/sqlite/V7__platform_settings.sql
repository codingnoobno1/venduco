-- V7: Settings an administrator can change at runtime.
-- A row exists only once a setting has been changed in the console; until then the value from
-- application configuration applies.

CREATE TABLE platform_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    updated_by TEXT
);
