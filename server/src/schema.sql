-- Bazaar PostgreSQL schema (v1)
-- Matches domain types in types.ts / StorageService

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'EDITOR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE account_status AS ENUM (
    'ACTIVE', 'PENDING_DELETION', 'DEACTIVATED', 'SUSPENDED',
    'BANNED', 'DELETED', 'ANONYMIZED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ad_status AS ENUM (
    'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'REMOVED',
    'PAUSED', 'ARCHIVED_ACCOUNT_DELETION'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  city TEXT,
  role user_role NOT NULL DEFAULT 'USER',
  avatar TEXT,
  account_status account_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  phone_verified_at TIMESTAMPTZ,
  deletion_requested_at TIMESTAMPTZ,
  deletion_scheduled_at TIMESTAMPTZ,
  deletion_cancelled_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  anonymized_at TIMESTAMPTZ,
  deletion_reason TEXT,
  deletion_reason_details TEXT,
  deactivated_at TIMESTAMPTZ,
  banned_at TIMESTAMPTZ,
  ban_reason TEXT,
  suspended_at TIMESTAMPTZ,
  suspension_reason TEXT,
  saved_ad_ids JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS users_phone_active_uq
  ON users (phone)
  WHERE phone <> '' AND account_status IN (
    'ACTIVE', 'PENDING_DELETION', 'DEACTIVATED', 'SUSPENDED', 'BANNED'
  );

-- Ads
CREATE TABLE IF NOT EXISTS ads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR' CHECK (currency IN ('EUR', 'TOMAN')),
  is_negotiable BOOLEAN NOT NULL DEFAULT FALSE,
  is_free BOOLEAN NOT NULL DEFAULT FALSE,
  is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
  is_promoted BOOLEAN NOT NULL DEFAULT FALSE,
  condition TEXT,
  city TEXT NOT NULL,
  state TEXT,
  district TEXT,
  category_id TEXT NOT NULL,
  sub_category_id TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  status ad_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  contact_phone TEXT NOT NULL DEFAULT '',
  show_phone BOOLEAN NOT NULL DEFAULT TRUE,
  allow_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
  telegram_id TEXT,
  show_telegram BOOLEAN NOT NULL DEFAULT FALSE,
  rejection_reason TEXT,
  removal_reason TEXT,
  removed_at TIMESTAMPTZ,
  removed_by TEXT,
  sold_feedback TEXT,
  views_count INTEGER NOT NULL DEFAULT 0,
  is_verified_seller BOOLEAN NOT NULL DEFAULT FALSE,
  attributes JSONB,
  previous_status ad_status,
  archived_at TIMESTAMPTZ,
  deletion_reason TEXT
);

CREATE INDEX IF NOT EXISTS ads_status_idx ON ads (status);
CREATE INDEX IF NOT EXISTS ads_user_id_idx ON ads (user_id);
CREATE INDEX IF NOT EXISTS ads_city_idx ON ads (city);
CREATE INDEX IF NOT EXISTS ads_category_idx ON ads (category_id);

-- Categories (nested subcategories as JSONB for parity with SPA)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Layers',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  subcategories JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Cities (ManagedCity)
CREATE TABLE IF NOT EXISTS cities (
  name TEXT PRIMARY KEY,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  province TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Platform settings (single-row JSON document)
CREATE TABLE IF NOT EXISTS platform_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  link TEXT,
  position TEXT NOT NULL DEFAULT 'HOME_TOP',
  alt_text TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'INFO',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  link TEXT,
  category TEXT
);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications (user_id, created_at DESC);

-- Support messages
CREATE TABLE IF NOT EXISTS support_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reply TEXT,
  is_replied BOOLEAN NOT NULL DEFAULT FALSE
);

-- Violation reports
CREATE TABLE IF NOT EXISTS violation_reports (
  id TEXT PRIMARY KEY,
  ad_id TEXT NOT NULL,
  ad_title TEXT NOT NULL,
  ad_city TEXT NOT NULL,
  ad_price NUMERIC(14, 2) NOT NULL DEFAULT 0,
  ad_image TEXT,
  ad_user_id TEXT NOT NULL,
  reporter_user_id TEXT,
  reason TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'PENDING'
);

-- Appeals
CREATE TABLE IF NOT EXISTS appeals (
  id TEXT PRIMARY KEY,
  ad_id TEXT NOT NULL,
  ad_title TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  original_reason TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  admin_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  actor_name TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Account deletion requests
CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  reason TEXT,
  reason_details TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Phone restrictions
CREATE TABLE IF NOT EXISTS phone_restrictions (
  phone TEXT PRIMARY KEY,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT
);

-- OTP challenges
CREATE TABLE IF NOT EXISTS otp_challenges (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  purpose TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id TEXT
);

CREATE INDEX IF NOT EXISTS otp_phone_purpose_idx ON otp_challenges (phone, purpose, created_at DESC);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id TEXT NOT NULL,
  ad_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, ad_id)
);

-- Recent views (per browser/user optional; store by user_id or 'guest')
CREATE TABLE IF NOT EXISTS recent_views (
  viewer_key TEXT NOT NULL,
  ad_id TEXT NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (viewer_key, ad_id)
);
