-- Records Schema Migration v3
-- Supabase SQL Editorで実行

-- まず既存のダミーデータを削除
DELETE FROM record_characters;
DELETE FROM records;

-- 1. recordsテーブルに必要なカラムを追加
ALTER TABLE records ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE records ADD COLUMN IF NOT EXISTS time_ms INT;
ALTER TABLE records ADD COLUMN IF NOT EXISTS category_slug TEXT;
ALTER TABLE records ADD COLUMN IF NOT EXISTS runner_name TEXT;
ALTER TABLE records ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'PC';
ALTER TABLE records ADD COLUMN IF NOT EXISTS main_attacker_ids TEXT[];
ALTER TABLE records ADD COLUMN IF NOT EXISTS party_ids TEXT[];

-- 2. 新しいカラム追加：バージョン、シアターバフ、地脈
ALTER TABLE records ADD COLUMN IF NOT EXISTS game_version TEXT;      -- 例: '5.3', '5.2'
ALTER TABLE records ADD COLUMN IF NOT EXISTS theater_buff BOOLEAN DEFAULT FALSE;  -- シアターバフの有無
ALTER TABLE records ADD COLUMN IF NOT EXISTS leyline_buff BOOLEAN DEFAULT FALSE;  -- 地脈の有無

-- 3. record_characters テーブルに slot カラムを追加
ALTER TABLE record_characters
  ADD COLUMN IF NOT EXISTS slot INT CHECK (slot >= 1 AND slot <= 4);

-- 4. ロールに 'Flex'（移動枠）を追加
ALTER TABLE record_characters DROP CONSTRAINT IF EXISTS record_characters_role_check;
ALTER TABLE record_characters ADD CONSTRAINT record_characters_role_check
  CHECK (role IN ('Main DPS', 'Sub DPS', 'Support', 'Healer', 'Flex'));

-- 5. パフォーマンス用インデックス
CREATE INDEX IF NOT EXISTS idx_records_time_ms ON records(time_ms);
CREATE INDEX IF NOT EXISTS idx_records_category ON records(category_slug);
CREATE INDEX IF NOT EXISTS idx_records_version ON records(game_version);
CREATE INDEX IF NOT EXISTS idx_record_characters_slot ON record_characters(slot);
