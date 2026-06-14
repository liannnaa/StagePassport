CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(128) NOT NULL UNIQUE,
    email VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, normalized_name)
);

CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    normalized_key VARCHAR(512) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, normalized_key)
);

CREATE TABLE shows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    show_name VARCHAR(255) NOT NULL,
    show_id VARCHAR(255) NOT NULL,
    venue_id UUID REFERENCES venues(id),
    city VARCHAR(255),
    show_date DATE,
    raw_date VARCHAR(32),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, show_id)
);

CREATE TABLE genres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255) NOT NULL,
    parent_genre_id UUID REFERENCES genres(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, normalized_name, parent_genre_id)
);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, normalized_name)
);

CREATE TABLE performances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES artists(id),
    show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id),
    genre_id UUID REFERENCES genres(id),
    sub_genre_id UUID REFERENCES genres(id),
    billing VARCHAR(255),
    raw_date VARCHAR(32),
    date_sort_key DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE performance_tags (
    performance_id UUID NOT NULL REFERENCES performances(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (performance_id, tag_id)
);

CREATE TABLE user_artist_stats (
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    performance_count INTEGER NOT NULL DEFAULT 0,
    latest_performance_date DATE,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, artist_id)
);

CREATE TABLE user_venue_stats (
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    performance_count INTEGER NOT NULL DEFAULT 0,
    latest_performance_date DATE,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, venue_id)
);

CREATE INDEX idx_artists_user_normalized ON artists(user_id, normalized_name);
CREATE INDEX idx_venues_user_normalized ON venues(user_id, normalized_key);
CREATE INDEX idx_shows_user_show_id ON shows(user_id, show_id);
CREATE INDEX idx_performances_user_date ON performances(user_id, date_sort_key DESC);
CREATE INDEX idx_performances_artist ON performances(artist_id);
CREATE INDEX idx_performances_show ON performances(show_id);
CREATE INDEX idx_performance_tags_tag ON performance_tags(tag_id);