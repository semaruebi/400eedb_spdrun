-- record_characters テーブルに武器名と精錬ランクのカラムを追加
ALTER TABLE record_characters ADD COLUMN IF NOT EXISTS weapon_name TEXT;
ALTER TABLE record_characters ADD COLUMN IF NOT EXISTS refinement INT DEFAULT 1 CHECK (refinement >= 1 AND refinement <= 5);
