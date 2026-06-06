import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 強制除錯輸出
console.log('--- Supabase 初始化參數 ---')
console.log('URL:', supabaseUrl)
console.log('Key exists:', !!supabaseKey)

if (!supabaseUrl || !supabaseKey) {
  console.error('致命錯誤：請確保 .env 檔案中的 VITE_SUPABASE_URL 與 KEY 已正確設定。')
}

export const supabase = createClient(supabaseUrl, supabaseKey)