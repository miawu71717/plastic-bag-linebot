# 塑膠袋工廠 LINE Bot 訂購系統

這是一個專為塑膠袋工廠設計的 LINE Bot 訂購系統，透過系統化選單減少溝通成本，提升訂購效率。

## 功能特色

### 1. 訂購資訊填寫
- 公司名稱
- 負責人姓名
- 聯絡電話
- 統一發票需求

### 2. 產品規格選擇
- **尺寸選項**：小型、中型、大型、特大
- **厚度選項**：薄型、中厚、厚型
- **材質選項**：PE塑膠、生物可分解、回收材質
- **顏色選項**：透明、白色、黑色、客製化顏色
- **客製化選項**：特殊需求輸入

### 3. 出貨時間限制
- 限制只能選擇當日開始算七天後的日期
- 提供一週的可選擇日期範圍

### 4. 訂單確認與顯示
- 完整訂單資訊確認
- 訂單編號生成
- 訂單狀態追蹤

## 安裝與設定

### 1. 安裝依賴
```bash
npm install
```

### 2. 環境變數設定
複製 `.env.example` 為 `.env` 並填入您的 LINE Bot 資訊：

```env
CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
CHANNEL_SECRET=your_channel_secret_here
PORT=3000
WEBHOOK_URL=https://your-domain.com/webhook
```

### 3. 啟動服務
```bash
# 開發模式
npm run dev

# 生產模式
npm start
```

## LINE Bot 設定

### 1. 建立 LINE Bot
1. 前往 [LINE Developers Console](https://developers.line.biz/)
2. 建立新的 Provider 和 Channel
3. 取得 Channel Access Token 和 Channel Secret

### 2. 設定 Webhook
1. 在 LINE Developers Console 中設定 Webhook URL
2. 啟用 Webhook
3. 設定允許的事件類型：Message events, Postback events

### 3. 設定 Rich Menu（可選）
可以設定 Rich Menu 提供快速訪問功能。

## 使用流程

### 用戶操作流程
1. **開始訂購**：用戶輸入「開始訂購」或點擊選單
2. **填寫公司資訊**：按格式填寫公司基本資料
3. **選擇產品規格**：透過選單選擇尺寸、厚度、材質、顏色
4. **選擇出貨日期**：從可用日期中選擇（7天後開始）
5. **確認訂單**：檢視並確認所有訂購資訊
6. **完成訂購**：取得訂單編號

### 管理員功能
- 查看所有訂單
- 修改產品規格選項
- 設定價格
- 訂單狀態管理

## 技術架構

- **後端框架**：Node.js + Express
- **LINE SDK**：@line/bot-sdk
- **日期處理**：Moment.js
- **資料儲存**：記憶體儲存（建議升級為資料庫）

## 擴展建議

### 短期改進
1. **資料庫整合**：使用 MongoDB 或 PostgreSQL 儲存訂單
2. **管理後台**：建立網頁管理介面
3. **通知系統**：訂單狀態變更通知
4. **報價功能**：自動計算價格

### 長期規劃
1. **庫存管理**：即時庫存查詢
2. **生產排程**：與生產系統整合
3. **客戶管理**：CRM 功能
4. **數據分析**：訂單統計與分析

## 部署建議

### 開發環境
- 使用 ngrok 建立本地 tunnel 進行測試

### 生產環境
- 建議使用 Heroku、AWS、或 Google Cloud Platform
- 設定 HTTPS 憑證
- 配置負載平衡
- 設定監控與日誌

## 支援與維護

如需客製化功能或技術支援，請聯絡開發團隊。

## 授權

此專案為客製化開發，版權歸屬於委託方。