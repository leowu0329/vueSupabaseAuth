-- 創建示例表 items
-- 在 Supabase Dashboard 的 SQL Editor 中執行此腳本

CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 啟用 Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- 創建策略：允許所有人讀取
CREATE POLICY "允許所有人讀取 items"
  ON items FOR SELECT
  USING (true);

-- 創建策略：允許所有人插入
CREATE POLICY "允許所有人插入 items"
  ON items FOR INSERT
  WITH CHECK (true);

-- 創建策略：允許所有人更新
CREATE POLICY "允許所有人更新 items"
  ON items FOR UPDATE
  USING (true);

-- 創建策略：允許所有人刪除
CREATE POLICY "允許所有人刪除 items"
  ON items FOR DELETE
  USING (true);

