-- 創建個人資料表 profiles
-- 在 Supabase Dashboard 的 SQL Editor 中執行此腳本

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  phone TEXT,
  address TEXT,
  birthday DATE,
  role TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 啟用 Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 創建策略：用戶只能讀取自己的資料
CREATE POLICY "用戶可以讀取自己的資料"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 創建策略：用戶可以插入自己的資料
CREATE POLICY "用戶可以插入自己的資料"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 創建策略：用戶可以更新自己的資料
CREATE POLICY "用戶可以更新自己的資料"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 創建策略：用戶可以刪除自己的資料
CREATE POLICY "用戶可以刪除自己的資料"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- 創建更新時間的觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 創建觸發器：自動更新 updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

