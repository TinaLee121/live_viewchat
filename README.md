# CMoney 直播管理台

CMoney 直播聊天室管理介面，提供主播即時管理聊天室訊息、用戶與直播串流的操作工具。

🔗 **線上預覽**：[https://TinaLee121.github.io/live_viewchat/](https://TinaLee121.github.io/live_viewchat/)

---

## 功能特色

- **即時聊天室** — 模擬直播訊息串流，自動捲動至最新訊息
- **訊息管理** — 刪除訊息（軟刪除）、釘選重要訊息至頂部
- **用戶管理** — 隱藏違規用戶，隱藏後訊息對所有人消失
- **管理日誌** — 記錄所有刪除與隱藏操作，支援篩選
- **串流切換** — 從側邊欄切換不同應用程式的直播聊天室
- **未讀訊息標記** — 往上看歷史訊息時，自動標示未讀分隔線
- **字體大小調整** — 12–24px 即時縮放，所有元件同步更新
- **深色 / 淺色模式** — 深色為預設，淺色採卡其暖色系
- **網路斷線偵測** — 離線提示、重連後自動補發訊息

## 行動裝置支援

- iOS / Android 適配，符合 HIG 設計規範
- 長按訊息觸發操作選單（ActionSheet）
- 安全區域（safe-area-inset）支援
- 防止 iOS 輸入框自動縮放

---

## 技術棧

| 項目 | 版本 |
|------|------|
| React | 19 |
| Vite | 7 |
| CSS Modules | — |
| lucide-react | 最新 |

---

## 本地開發

**環境需求**：Node.js 20+（建議使用 nvm）

```bash
# 安裝依賴
npm install

# 啟動開發伺服器（含區網存取）
npm run dev -- --host

# 建置正式版本
npm run build
```

開發伺服器啟動後開啟 `http://localhost:5173/`

---

## 專案結構

```
src/
├── pages/          # 登入頁
├── context/        # ChatContext、ThemeContext
├── components/
│   ├── Header/     # 頂部列、網路狀態
│   ├── Sidebar/    # 側邊欄、應用程式列表、串流列表
│   ├── Chat/       # 聊天區域、訊息氣泡、釘選訊息
│   ├── Controls/   # 訊息輸入框、字體控制
│   ├── Modals/     # 確認彈窗、ActionSheet
│   └── Admin/      # 管理日誌面板
├── hooks/          # useLongPress、useNetworkStatus、usePing、usePointerMode
└── data/           # Mock 資料（訊息、用戶、串流）
```

---

## 待串接功能

| 功能 | 目前狀態 |
|------|---------|
| CMoney OIDC 登入 | Mock（點擊直接進入） |
| 即時訊息 WebSocket | Mock（每 3 秒模擬） |
| 刪除 / 隱藏 API | 僅 Frontend State |
| 訊息歷史分頁 | 靜態 Mock 資料 |
| 串流清單 API | 靜態 Mock 資料 |
