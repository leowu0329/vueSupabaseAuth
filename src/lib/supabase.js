import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 調試信息
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnonKey ? "已設置" : "未設置");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// 驗證 URL 格式
if (supabaseUrl && !supabaseUrl.startsWith("http")) {
  console.warn("警告: Supabase URL 格式可能不正確，應以 http:// 或 https:// 開頭");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

// 測試連線
(async () => {
  try {
    // 使用 auth.getSession() 測試連線（即使沒有登入也能測試連線）
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      // 如果是網絡錯誤或配置錯誤
      if (
        error.message.includes("Invalid API key") ||
        error.message.includes("JWT")
      ) {
        console.warn("Supabase 連線測試失敗:", error.message);
      } else {
        // 其他錯誤可能是正常的（例如沒有 session）
        console.log("成功連線到Supabase");
      }
    } else {
      // 沒有錯誤表示連線成功
      console.log("成功連線到Supabase");
    }
  } catch (err) {
    // 捕獲網絡錯誤或其他異常
    if (
      err.message &&
      (err.message.includes("fetch") || err.message.includes("network"))
    ) {
      console.error("Supabase 連線錯誤: 無法連接到 Supabase 服務器");
    } else {
      console.error("Supabase 連線錯誤:", err.message || err);
    }
  }
})();
