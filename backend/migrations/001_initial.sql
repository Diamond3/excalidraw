CREATE TABLE IF NOT EXISTS scenes (
    room_id       TEXT PRIMARY KEY,
    scene_version INTEGER NOT NULL DEFAULT 0,
    iv            BYTEA NOT NULL,
    ciphertext    BYTEA NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS files (
    id         SERIAL PRIMARY KEY,
    prefix     TEXT NOT NULL,
    file_id    TEXT NOT NULL,
    data       BYTEA NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(prefix, file_id)
);

CREATE TABLE IF NOT EXISTS share_links (
    id         TEXT PRIMARY KEY,
    data       BYTEA NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
