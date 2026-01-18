-- Project Melusine Migration Logic
-- Please run this in your Supabase SQL Editor

ALTER TABLE records 
ADD COLUMN IF NOT EXISTS category_slug text DEFAULT 'wl9_400ee',
ADD COLUMN IF NOT EXISTS runner_name text,
ADD COLUMN IF NOT EXISTS time_ms bigint,
ADD COLUMN IF NOT EXISTS main_attacker_ids text[],
ADD COLUMN IF NOT EXISTS party_ids text[],
ADD COLUMN IF NOT EXISTS platform text DEFAULT 'PC',
ADD COLUMN IF NOT EXISTS game_version text;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_records_category ON records(category_slug);
CREATE INDEX IF NOT EXISTS idx_records_main_attacker ON records using gin (main_attacker_ids);

-- Comment:
-- Columns added to support filtering by main attacker and party members.
-- time_ms will store the run time in milliseconds for sorting.
