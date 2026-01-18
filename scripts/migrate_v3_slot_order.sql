-- record_characters テーブルの拡張
-- 1. slot_order カラム追加（表示順序用）
-- 2. role の check constraint を更新して Flex を追加

-- slot_order カラムを追加
ALTER TABLE record_characters ADD COLUMN IF NOT EXISTS slot_order int DEFAULT 0;

-- 既存の role constraint を削除して新しいものを追加
ALTER TABLE record_characters DROP CONSTRAINT IF EXISTS record_characters_role_check;
ALTER TABLE record_characters ADD CONSTRAINT record_characters_role_check 
  CHECK (role IN ('Main DPS', 'Sub DPS', 'Support', 'Healer', 'Flex'));
