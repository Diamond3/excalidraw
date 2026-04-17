ALTER TABLE workspaces
    ADD COLUMN IF NOT EXISTS encryption_key TEXT;
