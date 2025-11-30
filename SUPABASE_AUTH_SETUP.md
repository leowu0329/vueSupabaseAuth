# Supabase 認證設置指南

如果遇到 "Email address is invalid" 錯誤，請檢查以下設置：

## 1. 檢查 Supabase Dashboard 設置

### Authentication > Settings

1. **Site URL**: 設置為你的應用 URL（例如：`http://localhost:5173`）
2. **Redirect URLs**: 添加你的應用 URL
3. **Email Auth**: 確保已啟用

### Authentication > Providers > Email

1. **Enable Email Provider**: 確保已啟用
2. **Confirm email**: 可以選擇啟用或禁用（開發時建議禁用）
3. **Secure email change**: 可選設置

## 2. 檢查郵箱域名限制

在 Supabase Dashboard 中：
- 前往 **Authentication > Settings**
- 檢查是否有 **Email Domain Allowlist** 或 **Email Domain Blocklist** 設置
- 如果有限制，確保你的郵箱域名在允許列表中

## 3. 開發環境建議設置

對於開發環境，建議：
- 禁用 **Confirm email**（在 Authentication > Providers > Email 中）
- 這樣可以立即註冊，無需等待確認郵件

## 4. 測試註冊

如果仍然遇到問題：
1. 檢查瀏覽器控制台的完整錯誤信息
2. 檢查 Supabase Dashboard 的 Logs 查看詳細錯誤
3. 嘗試使用不同的郵箱地址測試

