# CMoney 直播管理台 — Claude Code Prompt 文件

> 給 RD 使用：將本文件貼入 Claude Code，即可快速理解專案並繼續開發。

---

## 專案概述

**專案名稱**：live_viewchat — CMoney 直播聊天室管理台
**技術棧**：React 19 + Vite 7 + CSS Modules
**路徑**：`C:\live_viewchat`（WSL 路徑：`/mnt/c/live_viewchat`）
**目的**：提供主播管理直播聊天室的操作介面，包含訊息管理、用戶隱藏、釘選訊息等功能。

---

## 功能描述（完整細項）

---

### 1. 登入入口頁（`src/pages/LoginPage.jsx`）

- CMoney 品牌風格登入卡片，置中顯示於全螢幕
- Logo：`C`（品牌紅 `#E8001C`）+ `Money`（主文字色）
- 卡片頂部：`border-top: 4px solid #E8001C` + 紅色光暈陰影
- 副標題：「請使用 CMoney 帳號登入以繼續」
- 主按鈕：「使用 CMoney 帳號登入」，背景色 `#E8001C`，點擊呼叫 `onLogin()` 進入管理台
- 右上角深/淺色切換按鈕（Sun/Moon icon）
- 底部免責聲明文字
- 全版面背景色使用 `var(--bg-primary)`，卡片使用 `var(--bg-secondary)`
- **未來串接**：`onLogin()` 替換為 CMoney OIDC redirect

---

### 2. 頁面切換架構（`src/main.jsx`）

- `Root` component 持有 `loggedIn` boolean state
- `loggedIn = false` → 顯示 `<LoginPage onLogin={...} />`
- `loggedIn = true` → 顯示 `<App onLogout={...} />`
- `ThemeProvider` 包在 `Root` 最外層，確保登入頁與主 App 共用同一主題狀態
- `App` 本身不包 `ThemeProvider`，只包 `ChatProvider`

---

### 3. 主畫面整體佈局（`src/App.jsx`）

**佈局結構：**
```
.app（flex column，全螢幕高）
├── .topBar（flex column，shrink: 0）
│   ├── NetworkStatus（網路狀態橫幅）
│   └── Header（頂部列）
└── .body（flex row，撐滿剩餘高度）
    ├── Sidebar（可收合側邊欄）
    └── .main（flex column）
        ├── PinnedMessage（釘選訊息，條件顯示）
        ├── ChatArea（訊息列表）
        └── MessageInput（輸入框）
```

**訊息模擬（開發用）：**
- `setInterval` 每 3 秒從 `randomMessages` 陣列依序取出訊息工廠函式並呼叫
- 使用 `msgIndexRef`（useRef）追蹤當前索引，用 modulo 循環

**行動裝置鍵盤避讓：**
- 監聽 `window.visualViewport` 的 `resize` 與 `scroll` 事件
- 計算鍵盤高度：`window.innerHeight - vv.height - vv.offsetTop`
- 將結果寫入 CSS 變數 `--keyboard-height`，讓輸入框不被虛擬鍵盤遮蓋

**網路重連處理：**
- `useNetworkStatus(handleReconnect)` 偵測網路恢復
- 重連後模擬 1.5 秒延遲，呼叫 `appendReconnectMessages()` 插入補發訊息
- 同時觸發 `setIsSyncing(true/false)` 顯示同步中動畫

**串流切換：**
- `currentStream` state（預設第一個 live 串流）
- `handleSelectStream(stream)` → 更新 `currentStream`、呼叫 `resetMessages()`、關閉 Sidebar

**Sidebar 狀態：**
- `sidebarForceOpen`：點擊 Menu 按鈕觸發 pin/unpin
- `sidebarMenuHover`：滑鼠 hover Menu 按鈕觸發暫時展開

---

### 4. Header（`src/components/Header/Header.jsx`）

**左側區域：**
- **Menu 按鈕（☰）**：
  - `onMouseEnter` → `setSidebarMenuHover(true)`（側邊欄暫時展開）
  - `onMouseLeave` → `setSidebarMenuHover(false)`（側邊欄 300ms 後收合）
  - `onClick` → `setSidebarForceOpen(toggle)`（pin/unpin 側邊欄）
- **標題群組（`.titleGroup`）**：
  - 第一行：「CMoney 直播管理台」（`.title`）
  - 第二行：`currentStream.title`（`.streamTitle`，僅在有選中串流時顯示）

**右側區域：**
- **字體大小按鈕（ALargeSmall icon）**：點擊展開下拉面板，包含字體大小滑桿；title 為「字體大小」；點擊外部自動關閉（mousedown 事件偵測）
- **主題切換**：Sun（淺色模式時顯示）/ Moon（深色模式時顯示），呼叫 `toggleTheme()`
- **管理日誌按鈕（ScrollText icon）**：`showLogsPanel` 時套用 `.active`；有未讀時顯示紅色數字 badge（最多顯示 99+）
- **登出（LogOut icon）**：點擊顯示 ConfirmModal，確認後呼叫 `onLogout()`；手機版（≤768px）`display: none`（登出移至 Sidebar footer）

**Settings 下拉面板：**
- `position: absolute`，顯示於 Header 正下方
- `fadeDown` 動畫（0.15s）
- z-index: 300（高於 Sidebar 的 100）

---

### 5. 網路狀態橫幅（`src/components/Header/NetworkStatus.jsx`）

- `status === 'online'`：不渲染（return null）
- `status === 'offline'`：紅色橫幅，顯示「網路連線中斷，可能無法接收最新訊息」
- `status === 'reconnected'`：綠色橫幅，顯示「網路已恢復」，3 秒後自動消失（由 `useNetworkStatus` hook 控制）
- 所有狀態變化有 `slideDown` 動畫（0.3s）

**`useNetworkStatus` hook 邏輯：**
- 初始值來自 `navigator.onLine`
- 監聽 `window.offline` → `setStatus('offline')`
- 監聽 `window.online` → `setStatus('reconnected')` + 呼叫 `onReconnect()` callback + 3 秒後改回 `'online'`

---

### 6. 側邊欄（`src/components/Sidebar/Sidebar.jsx`）

**開關邏輯（依裝置模式分開）：**

| 觸發方式 | Mouse 模式 | Touch 模式 |
|---------|-----------|-----------|
| `forceOpen` prop | 設定 `pinned=true, open=true`（click pin） | 直接控制 `open` state |
| `menuHover` prop | 立即 open；側邊欄 hover 中不關閉 | 無效果 |
| 滑鼠 hover 側邊欄本體 | 200ms debounce 後 open | 無效果 |
| 滑鼠離開側邊欄本體 | 300ms 後 close（pinned 時不關） | 無效果 |
| 8px 觸發條（左側邊緣） | hover 觸發 handleMouseEnter | 不顯示 |
| 背景遮罩點擊 | 不顯示 | 關閉側邊欄 |

**Hover 競態修復：**
- `sidebarHoveredRef` 記錄側邊欄是否處於 hover 狀態
- `menuHover` effect 的關閉分支：若 `sidebarHoveredRef.current === true` 則不設關閉 timer，防止側邊欄閃縮

**可見性邏輯：**
```javascript
isVisible = pointerMode === 'mouse' ? (open || pinned) : open
```

**Pin 按鈕：**
- 僅 mouse 模式顯示（在側邊欄 header 右側）
- Pin 狀態下側邊欄不因滑鼠離開而收合
- 圖示：Pin / PinOff（lucide-react）

**Header：**
- 標題：「應用程式清單」

**Footer（手機版登出）：**
- 桌面版 `display: none`，手機版（≤768px）`display: block`
- 包含 LogOut 按鈕（紅色），呼叫 `onLogout`
- padding-bottom: `max(12px, env(safe-area-inset-bottom, 12px))`

**動畫與 RWD：**
- 桌面版（>768px）：`width` 從 0 到 `var(--sidebar-width)`（0.25s cubic-bezier）；側邊欄為普通 block 元素（push layout）
- 行動版（≤768px）：`position: fixed`；`translateX(-100%)` 到 `translateX(0)`；overlay 為 frosted glass（`backdrop-filter: blur(8px)`）

**觸發條：**
- Mouse 模式且側邊欄不可見時，在畫面最左側顯示 8px 寬透明觸發帶
- hover 觸發 `handleMouseEnter`（與 hover 側邊欄本體效果相同）

---

### 7. 應用程式列表（`src/components/Sidebar/AppList.jsx`）

- 顯示 CMoney 應用程式列表（從 `mockData.apps` 取得）
- 點擊 App 項目展開/收合，顯示 `<StreamList appId={id} />`
- 展開時 Chevron 旋轉 90°
- hover 時背景色變化（`var(--bg-hover)`）
- 有直播中串流時，App 名稱右側顯示紅色「LIVE」badge

**淺色模式視覺層次：**
- App 名稱：`color: var(--text-muted)`（退為次要）
- 串流標題：`color: var(--text-primary)` + `font-weight: 600`（突出）
- 串流列表左側加 2px `--border` 色引導線（`margin-left: 18px`）

**串流列表（`StreamList.jsx`）：**
- 從 `mockData.streams[appId]` 取得串流列表
- 直播中：紅色 Radio icon + 「LIVE」badge；可點擊（呼叫 `onSelectStream`）
- 離線：灰色圓點 icon；`opacity: 0.5`，`cursor: default`（不可點擊）
- 當前選中串流套用 `.active` 高亮背景
- 串流名稱過長時用 `text-overflow: ellipsis` 截斷

---

### 8. 管理日誌面板（`src/components/Admin/LogsPanel.jsx`）

- 獨立浮動面板，顯示於聊天室右側
- 右上角 × 按鈕關閉（呼叫 `onClose` prop）
- 篩選 chips：全部 / 刪除訊息 / 隱藏用戶
- 面板寬度：`clamp(260px, calc(260px * var(--font-scale)), 320px)`
- 手機版（≤768px）：`position: fixed; inset: 0`，填滿全螢幕，從右側滑入（spring animation）

**`AdminLogs.jsx`（日誌內容）：**
- 顯示所有管理操作記錄（由 `ChatContext.adminLogs` 提供）
- 依 `filter` prop 過濾（all / remove / hide）
- 無記錄時顯示「尚無管理記錄」
- 每筆記錄顯示：
  - **Badge**：動作類型（刪除訊息 / 隱藏用戶），顏色不同
  - **時間**：HH:MM:SS 格式
  - **操作流程（`.detailRow`）**：`actorName → targetName`（同一行）
  - **詳情（`.extra`）**：刪除訊息內容顯示在下一行（`「訊息前20字」`）
- 最多保留 200 筆，超過自動截斷（最新在上）
- 所有字體大小使用 `calc(Xpx * var(--font-scale, 1))`

---

### 9. 聊天室訊息列表（`src/components/Chat/ChatArea.jsx`）

**自動捲動邏輯：**
- 每次 `messages.length` 變化觸發 effect
- 若 `isAtBottom`（距底部 < 80px）→ 強制捲到底，清除未讀計數
- 若不在底部 → `newCount + 1`，顯示「N 則新訊息」按鈕

**未讀訊息分隔線：**
- 當使用者往上捲離底部（開始新的閱讀 session），記錄此時最新訊息 ID 為 `firstUnreadId`
- 後續新進訊息在 `firstUnreadId` 對應的訊息前方插入紅色分隔線「以下為未讀訊息」
- `wasAtBottomRef` 追蹤前一個 frame 是否在底部；只有從底部捲離時才更新 `firstUnreadId`（session-based，不因往下捲而消失）

**未讀訊息按鈕：**
- `newCount > 0` 且不在底部 → 顯示藍色按鈕「N 則新訊息」（附 ChevronDown icon）
- `newCount === 0` 且不在底部 → 顯示圓形捲動到底按鈕（灰色，僅 ChevronDown icon）
- 點擊「N 則新訊息」→ `scrollToUnread()`（捲到分隔線位置）
- 點擊灰色按鈕 → 捲到底部

**歷史訊息載入：**
- 捲動到距頂部 60px 以內時觸發 `loadHistory()`
- 僅觸發一次（`historyLoaded` flag 防止重複）
- 顯示 Loading spinner（Loader icon + 「載入歷史訊息...」）
- 模擬 1000ms 延遲
- 載入後用 `requestAnimationFrame` 計算 scroll 位置差補正，防止畫面跳動
  ```javascript
  el.scrollTop = newScrollHeight - prevScrollHeight.current
  ```

**DOM 回收：**
- 訊息數超過 500 且在底部時呼叫 `trimOldMessages()`
- 從陣列頭部移除最舊的 100 則

**訊息過濾：**
- 渲染前過濾 `hidden: true` 的訊息（`messages.filter(msg => !msg.hidden)`）
- `removed: true` 的訊息仍渲染，但顯示為「該訊息已被移除」

**同步中動畫：**
- `isSyncing = true` 時在列表頂部顯示「正在同步訊息...」+ Loader icon 旋轉

---

### 10. 訊息氣泡（`src/components/Chat/MessageBubble.jsx`）

**訊息類型判斷：**
- `isOwn`：`message.userId === CURRENT_USER_ID`（主播自己）
- `isStreamer`：`user.role === ROLES.STREAMER`（顯示主播 Badge）

**頭像系統：**
- 6 種顏色循環：`AVATAR_COLORS[userId % 6]`
- 顯示用戶名稱第一個字
- 圓形，24×24px（隨 --font-scale 縮放）

**訊息狀態顯示：**
- `pending`：整體 opacity 0.5 + 「傳送中...」標籤
- `failed`：氣泡紅色邊框 + 「傳送失敗」標籤 + 「重試」按鈕（RotateCcw icon，緊貼氣泡右側）
- `removed`：整個 MessageBubble 替換為「該訊息已被移除」灰色斜體文字

**bubbleRow DOM 順序（own 訊息 row-reverse）：**
```
bubble → retryBtn → timeWrapper → actionsWrapper
視覺效果：actions（最外）| time | retry | bubble（最內）
```

**操作按鈕（Desktop / 有滑鼠裝置）：**
- 永遠在 DOM 中（防止 layout shift），預設 `visibility: hidden + opacity: 0 + pointer-events: none`
- **僅 `@media (hover: hover)` 裝置**（真實滑鼠）才透過 `.wrapper:hover .actions` 顯示，觸控裝置完全不觸發
- wrapper 加 `onContextMenu={(e) => e.preventDefault()}` 阻止原生長按選單

**操作按鈕內容（非自己的訊息）：**
- 釘選/取消釘選（Pin / PinOff icon）：直接執行，無需確認
- 刪除訊息（Trash2 icon）：需確認，軟刪除 `removed: true`
- 隱藏用戶（UserX icon）：需確認，設定 `hidden: true` 並移除釘選

**自己的訊息：**
- 僅顯示釘選按鈕，不顯示刪除/隱藏

**確認流程：**
```
點擊刪除/隱藏 → setConfirmAction({ type }) → 顯示 ConfirmModal
→ 確認 → 執行對應 ChatContext 函式 → setConfirmAction(null)
→ 取消 → setConfirmAction(null)
```

**ActionSheet（Mobile / 長按）：**
- `useLongPress(500ms)` 觸發；touch 裝置唯一操作入口
- 僅在 `message.status !== 'pending'` 且 `!message.removed` 時啟用
- 顯示底部 ActionSheet Modal

**訊息進場動畫：**
- `@keyframes msgEnter`：`translateY(12px)` → `translateY(0)` + fade in（0.25s）

---

### 11. 釘選訊息（`src/components/Chat/PinnedMessage.jsx`）

- 顯示在 ChatArea 頂部（固定位置）
- 內容：Pin icon + 用戶名稱 + 訊息文字（截斷加 ellipsis）
- 右側關閉按鈕 → 呼叫 `onUnpin()`（`pinMessage(pinnedMessage)` toggle 取消釘選）
- 左側紫色邊框（`var(--pinned-border)`）
- 背景：`var(--pinned-bg)`
- Fade-in 動畫
- **所有字體與 icon 大小隨 --font-scale 縮放**（`useChat()` 取 `fontSize`，icon size = `Math.round(13/14 * scale)`）

**釘選邏輯（ChatContext）：**
- 同一則訊息點釘選 → 取消釘選
- 不同訊息點釘選 → 替換（只能有一則釘選）
- 若訊息被刪除或用戶被隱藏 → 自動移除釘選

---

### 12. 訊息輸入框（`src/components/Controls/MessageInput.jsx`）

**送出邏輯：**
- `Enter`：送出訊息（呼叫 `sendMessage(text)`）
- `Shift+Enter`：換行

**草稿儲存：**
- key：`live_chatview_draft`
- 每次 `text` 變化時寫入 `localStorage`
- 元件 mount 時從 `localStorage` 恢復
- 送出成功或文字清空後刪除草稿

**離線狀態：**
- `networkStatus === 'offline'` 時 textarea 和送出按鈕停用（`disabled`）
- placeholder 改為「離線中 — 草稿已暫存」

**傳送失敗提示：**
- `sendMessage()` 回傳 `{ willFail }`
- `willFail === true` 時，延遲 1.1 秒後顯示錯誤橫幅「傳送失敗，請稍後再試」
- 橫幅 4 秒後自動消失（`useEffect` + `failTimerRef` setTimeout）
- 橫幅可點 × 手動立即關閉
- 訊息已從輸入框清除（在 `willFail` 判定前就清除）

**送出按鈕顏色：**
- 深色 / 淺色模式統一使用品牌紅 `#E8001C`（hardcoded，不走 CSS 變數）

**ChatContext 送出流程：**
1. 立即新增 `status: 'pending'` 訊息至列表
2. 模擬 600–1000ms 延遲
3. 10% 機率 `willFail = true` → 更新 `status: 'failed'`
4. 90% 機率 → 更新 `status: 'sent'`

**重試：**
- 點擊「重試」按鈕 → `retryMessage(msg)`
- 從訊息列表移除失敗訊息，重新呼叫 `sendMessage(text)`

---

### 13. 字體大小控制（`src/components/Controls/FontSizeControl.jsx`）

- range slider，範圍 12–24px，**預設 16px**
- 即時更新 `ChatContext.fontSize`
- 顯示當前數值（如「16px」）
- 訊息氣泡文字透過 CSS 變數 `--msg-font-size` 套用

---

### 14. 確認彈窗（`src/components/Modals/ConfirmModal.jsx`）

**Props：**
- `title`：彈窗標題
- `message`：說明文字（支援 `\n` 換行，`white-space: pre-line` + 文字置中）
- `preview`（可選）：訊息預覽（最多 60 字，灰色背景框，置中）
- `onConfirm()`、`onCancel()`

**鍵盤快捷鍵：**
- `Enter` → onConfirm
- `Escape` → onCancel
- 透過 `useEffect` 監聽 `keydown`

**視覺：**
- 全螢幕遮罩（frosted glass：`backdrop-filter: blur`）
- 卡片最大寬度 380px，垂直置中
- 警告三角 icon（AlertTriangle，lucide-react）
- 確認按鈕：紅色；取消按鈕：灰色
- 手機版：卡片置中顯示（`align-items: center`）

**使用場景：**
- 刪除訊息（含訊息預覽）
- 隱藏用戶（無預覽）
- 登出（無預覽）

---

### 15. ActionSheet（`src/components/Modals/ActionSheet.jsx`）

- 行動裝置長按訊息觸發（`useLongPress`，500ms）
- 從螢幕底部滑入（spring animation：`cubic-bezier(0.34, 1.56, 0.64, 1)`）
- Overlay 為 frosted glass（`backdrop-filter: blur`）
- 點擊背景遮罩或取消按鈕關閉

**內容：**
- 拖拉 handle（36×5px 視覺提示）
- 用戶名稱 + 訊息預覽（最多 40 字）
- 操作按鈕（min-height: 44px）：
  - 釘選/取消釘選（直接執行）
  - 刪除訊息（非自己訊息，觸發 ConfirmModal）
  - 隱藏用戶（非自己訊息，觸發 ConfirmModal）
- 取消按鈕（min-height: 44px）

---

### 16. 訊息 Batching 機制（`src/context/ChatContext.jsx`）

- 使用滑動視窗（1 秒內）計算訊息流速
- 流速 > 5 則/秒 → 啟動 batching：訊息存入 `batchBuffer`，每 200ms flush 一次
- 流速 ≤ 5 則/秒 → 直接 `setMessages`（即時顯示）
- Flush 後 `batchBuffer` 清空，無訊息時停止 interval
- **`resetMessages()`**：重設為 `initialMessages`，清除 `pinnedMessage` 與 `adminLogs`（切換串流時使用）
- **預設 `fontSize`：16**

---

### 17. 主題系統（`src/index.css`）

**CSS 變數（深色模式預設）：**

| 變數 | 深色值 | 淺色值 | 用途 |
|------|--------|--------|------|
| `--bg-primary` | #0d0f18 | #f5f0e8 | 頁面背景 |
| `--bg-secondary` | #13151f | #faf7f0 | 卡片、Header |
| `--bg-secondary-rgb` | 未定義 | 250, 247, 240 | 手機版 frosted glass |
| `--bg-tertiary` | #1a1c2a | #ede8dc | 次要背景 |
| `--bg-hover` | #1e2030 | #e5dfd0 | hover 背景 |
| `--text-primary` | #e8eaf0 | #2c2416 | 主要文字 |
| `--text-secondary` | #8b8fa8 | #6b5f4a | 次要文字 |
| `--text-muted` | #4a4e68 | #a89880 | 灰階文字 |
| `--accent-streamer` | #0ea5e9 | #E8001C | 主色（深色：藍；淺色：品牌紅） |
| `--accent-admin` | #7c6af7 | #5b4de0 | 管理色（紫） |
| `--error-color` | #f87171 | — | 錯誤/刪除 |
| `--success-color` | #4ade80 | — | 成功/重連 |
| `--border` | #1e2235 | #d4c9b0 | 邊框 |
| `--sidebar-bg` | #10121e | #ede8dc | 側邊欄背景 |
| `--pinned-bg` | #1a1d30 | #f0ece0 | 釘選背景 |
| `--pinned-border` | #7c6af7 | #5b4de0 | 釘選左邊框 |
| `--scrollbar-thumb` | #2a2d3e | #c8bea8 | 捲軸 |

**淺色模式：**
- 透過 `[data-theme="light"]` selector 覆蓋 `:root` 變數
- 整體採**卡其暖色系**（米白 / 焦糖）
- `ThemeContext` 操作 `document.documentElement.dataset.theme`

---

### 18. Mock 資料結構（`src/data/mockData.js`）

**訊息工廠函式：**
```javascript
msg(id, userId, text, offsetMs = 0)
// timestamp = new Date(Date.now() - offsetMs)
```

**訊息集合：**
| 集合 | 數量 | 用途 |
|------|------|------|
| `initialMessages` | 18 則 | 頁面初始載入 |
| `historyMessages` | 5 則 | 往上捲到頂載入（距今 1 小時前） |
| `randomMessages` | 10 個工廠函式 | 每 3 秒模擬新訊息 |
| `reconnectMessages` | 3 則 | 網路重連後補發 |

**串流資料：**
```javascript
apps = [
  { id: 1, name: 'CMoney 投資直播' },
  { id: 2, name: 'CMoney 財經頻道' },
]
streams = {
  1: [{ id, live: true, title: '台股早盤解析' }, { id, live: false, title: '美股夜盤觀察' }],
  2: [{ id, live: true, title: '主力法人動向' }, { id, live: false, title: '期貨選擇權教學' }]
}
```

---

## 技術決策

| 決策 | 做法 | 原因 |
|------|------|------|
| 路由 | `loggedIn` state，不用 react-router-dom | 只有兩頁，不需要複雜路由 |
| 操作按鈕不跳動 | `visibility` 控制，永遠在 DOM | 避免條件渲染造成 flex reflow |
| hover 按鈕僅滑鼠裝置 | `@media (hover: hover)` 包裹 `.wrapper:hover .actions` | 觸控裝置 tap 後不誤觸 hover 效果 |
| 訊息不刪除 | 軟刪除（`removed: true`） | 保留歷史紀錄，避免 ID 衝突 |
| 隱藏用戶 | `hidden: true` + 渲染前 filter | 完全消失，不留痕跡 |
| 高流速效能 | Batching（每 200ms flush） | 防止每則訊息觸發 React re-render |
| DOM 回收 | 超過 500 則 trim 100 則 | 防止長時間直播記憶體暴漲 |
| 主題 | CSS 變數 + `data-theme` attribute | 無需 JS 邏輯，CSS 直接覆蓋 |
| 裝置偵測 | `usePointerMode`（media query + pointermove） | 支援 iPad 外接鍵盤動態切換 |
| 草稿 | `localStorage` | 重整頁面不遺失 |
| 送出按鈕顏色 | 硬寫 `#E8001C`（不走 CSS 變數） | 深淺模式統一品牌紅 |
| frosted glass 手機 Header | `rgba(var(--bg-secondary-rgb), 0.85)` | 需在淺色模式另外定義 RGB 值 |
| WSL HMR | `vite.config.js usePolling: true` | WSL 監聽 Windows 檔案系統無法用 fs events |
| iOS 縮放防止 | viewport `maximum-scale=1.0` + textarea `font-size: 16px` | iOS 會在 font-size < 16px 時自動 zoom |

---

## 資料結構

### 訊息物件
```javascript
{
  id: number,
  userId: number,
  text: string,
  timestamp: Date,
  status: 'pending' | 'sent' | 'failed',
  removed: boolean,   // true → 顯示「該訊息已被移除」
  pinned: boolean,
  hidden?: boolean    // true → 完全不渲染（隱藏用戶）
}
```

### 用戶物件
```javascript
CURRENT_USER_ID = 1  // 主播（目前登入者）
ROLES = { STREAMER: 'streamer', ADMIN: 'admin', USER: 'user' }
users = {
  1: { id: 1, name: '主播小明', role: 'streamer' },
  2: { id: 2, name: '幹部小華', role: 'admin' },
  3: { id: 3, name: '小美', role: 'user' },
  // ...
}
```

### Admin Log 物件
```javascript
{
  id: number,           // Date.now() + Math.random()
  timestamp: Date,
  actorName: string,    // 操作者名稱（預設主播名）
  action: 'remove' | 'hide',
  targetName: string,   // 被操作用戶名稱
  detail: string        // 刪除訊息時為訊息前 20 字；隱藏用戶時為空字串
}
```

---

## 檔案結構

```
/mnt/c/live_viewchat/
├── vite.config.js              # usePolling: true（WSL）、host: true（手機網路存取）
├── package.json                # React 19, lucide-react, Vite 7
├── index.html                  # viewport: maximum-scale=1.0（iOS 防縮放）
└── src/
    ├── main.jsx                # Root：loggedIn state、ThemeProvider、頁面切換
    ├── App.jsx                 # LiveApp：訊息模擬、鍵盤避讓、網路重連、串流切換、sidebar 狀態
    ├── App.module.css          # .app / .topBar / .body / .main 佈局；手機版 safe-area-inset-top
    ├── index.css               # CSS 變數定義、全域 reset、主題覆蓋（卡其淺色 / 深色）
    │
    ├── pages/
    │   ├── LoginPage.jsx       # CMoney 品牌登入頁（onLogin prop）
    │   └── LoginPage.module.css
    │
    ├── context/
    │   ├── ChatContext.jsx     # 全域：messages、moderation、adminLogs、batching、resetMessages、fontSize(預設16)
    │   └── ThemeContext.jsx    # theme state + toggleTheme() + data-theme DOM 操作
    │
    ├── data/
    │   └── mockData.js         # users、initialMessages、randomMessages、apps、streams
    │
    ├── hooks/
    │   ├── useLongPress.js     # touch start/end/move → 500ms callback
    │   ├── useNetworkStatus.js # online/offline/reconnected state
    │   ├── usePing.js          # performance.now() 延遲測量（每 5 秒）
    │   └── usePointerMode.js   # 'mouse' | 'touch'（media query + pointermove）
    │
    └── components/
        ├── Header/
        │   ├── Header.jsx          # Menu、ALargeSmall字體設定、主題切換、ScrollText管理日誌、登出
        │   ├── Header.module.css
        │   ├── NetworkStatus.jsx   # offline/reconnected 橫幅
        │   └── NetworkStatus.module.css
        │
        ├── Sidebar/
        │   ├── Sidebar.jsx         # hover debounce + sidebarHoveredRef競態修復、pin、touch overlay、footer登出
        │   ├── Sidebar.module.css
        │   ├── AppList.jsx         # 可展開的應用程式列表（LIVE badge、淺色模式視覺層次）
        │   ├── AppList.module.css
        │   ├── StreamList.jsx      # live（可點擊切換）/ offline（opacity 0.5）串流列表
        │   └── StreamList.module.css
        │
        ├── Chat/
        │   ├── ChatArea.jsx        # 自動捲動、未讀分隔線（session-based）、歷史載入、DOM 回收
        │   ├── ChatArea.module.css
        │   ├── MessageBubble.jsx   # 頭像、狀態、hover-only actions、retryBtn緊貼氣泡、ActionSheet長按
        │   ├── MessageBubble.module.css
        │   ├── PinnedMessage.jsx   # 釘選訊息橫幅（字體隨--font-scale縮放）
        │   └── PinnedMessage.module.css
        │
        ├── Controls/
        │   ├── MessageInput.jsx    # Enter送出、draft、offline停用、失敗提示（4s自動消失+X關閉）
        │   ├── MessageInput.module.css
        │   ├── FontSizeControl.jsx # range slider 12–24px，預設 16px
        │   └── FontSizeControl.module.css
        │
        ├── Modals/
        │   ├── ConfirmModal.jsx    # Enter/Esc鍵盤、訊息置中pre-line、preview欄位、frosted glass遮罩
        │   ├── ConfirmModal.module.css
        │   ├── ActionSheet.jsx     # 底部滑入spring、handle bar、44px按鈕、frosted glass
        │   └── ActionSheet.module.css
        │
        └── Admin/
            ├── LogsPanel.jsx       # 浮動面板、× 關閉、篩選 chips；手機版全螢幕
            ├── LogsPanel.module.css
            ├── AdminLogs.jsx       # 操作記錄列表（filter prop、detailRow、extra換行、--font-scale）
            └── AdminLogs.module.css
```

---

## 目前未實作（待後端串接）

| 功能 | 目前狀態 | 串接位置 |
|------|---------|---------|
| CMoney OIDC 登入 | 點擊直接進入，無驗證 | `LoginPage.jsx` `onLogin()` |
| 即時訊息 WebSocket | `setInterval` 每 3 秒模擬 | `App.jsx` useEffect |
| 隱藏用戶 API | 僅 frontend state（`hidden: true`） | `ChatContext.hideUser()` |
| 刪除訊息 API | 僅 frontend state（`removed: true`） | `ChatContext.removeMessage()` |
| 釘選訊息 API | 僅 frontend state | `ChatContext.pinMessage()` |
| 訊息歷史分頁 API | 靜態 `historyMessages` mock | `ChatArea.jsx` `loadHistory()` |
| 用戶資料 API | 靜態 `mockData.users` | `data/mockData.js` |
| 串流清單 API | 靜態 `mockData.streams` | `data/mockData.js` |

---

## ▶ 給 RD：Claude Code 啟動 Prompt

> **使用方式**：開啟 Claude Code（`claude` 指令），將下方灰色框內的文字**完整複製貼上**，即可讓 AI 快速理解專案並繼續開發。
> 最後一行 `我現在要做的事是：` 後面填入你的需求描述。

```
你現在要協助我繼續開發 CMoney 直播管理台（live_viewchat）。

專案路徑：/mnt/c/live_viewchat
技術棧：React 19 + Vite 7 + CSS Modules（無 TypeScript、無 react-router-dom）

【核心架構】
- main.jsx：Root component 持有 loggedIn state，false → LoginPage，true → App
- ThemeProvider 在 Root 最外層（App 內不重複包）
- ChatContext 提供全域：messages, removeMessage, hideUser, pinMessage, adminLogs, resetMessages, fontSize（預設16）等
- 訊息標記：removed（軟刪除，顯示「已被移除」）vs hidden（隱藏用戶，完全不渲染）
- 操作按鈕用 @media(hover:hover) + CSS `.wrapper:hover .actions` 控制（永遠在 DOM），觸控裝置不觸發
- Sidebar 依 usePointerMode（mouse/touch）有完全不同的開關行為；sidebarHoveredRef 修復 hover 競態

【樣式規範】
- 所有顏色用 CSS 變數：var(--bg-primary/secondary/tertiary)、var(--text-primary/secondary/muted)
- 深色主色：var(--accent-streamer)（#0ea5e9 藍）；淺色主色：#E8001C（品牌紅）
- 送出按鈕：硬寫 #E8001C，深淺模式統一
- 錯誤/刪除：var(--error-color)（#f87171 紅）
- 管理/釘選：var(--accent-admin)（#7c6af7 紫）
- 淺色模式：整體卡其暖色系，[data-theme="light"] 覆蓋 :root 變數
- 所有字體大小使用 calc(Xpx * var(--font-scale, 1))；--font-scale = fontSize/14，設在 .app root
- 每個 component 有獨立的 .module.css，禁止用全域 class

【環境設定】
- WSL 環境，專案在 /mnt/c/（Windows C 槽）
- vite.config.js 已設 usePolling: true（解決 WSL HMR）、host: true（手機網路存取）
- index.html viewport 已加 maximum-scale=1.0（iOS 防縮放）
- 每次改完程式碼：關閉舊分頁 → 開新分頁 → http://localhost:5173/
- Dev server 啟動指令：
  export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
  && nvm use v24.14.0 \
  && cd /mnt/c/live_viewchat && npm run dev -- --host

【開發規範】
- 遵循 CLAUDE.md 三步工作流：先提案 → 確認 → 實作
- 新增 component 須同時建立對應的 .module.css
- 使用 lucide-react 圖示庫
- 禁止使用 inline style（除非是動態 CSS 變數）
- 所有中文文字直接寫在 JSX，不另建 i18n

【未來串接點（目前為 mock）】
- 登入：LoginPage.jsx onLogin → CMoney OIDC redirect
- 即時訊息：App.jsx setInterval → WebSocket
- 隱藏用戶：ChatContext.hideUser() → 後端 API
- 刪除訊息：ChatContext.removeMessage() → 後端 API
- 訊息歷史：ChatArea loadHistory → 後端 API
- 用戶資料：mockData.users → 後端 API
- 串流清單：mockData.streams → 後端 API

我現在要做的事是：[在此描述你的需求]
```
