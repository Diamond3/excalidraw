CREATE TABLE IF NOT EXISTS workspaces (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    data       BYTEA NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
