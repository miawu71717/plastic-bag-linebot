const express = require('express');
const line = require('@line/bot-sdk');
const bodyParser = require('body-parser');
const moment = require('moment');
require('dotenv').config();

const app = express();

// LINE Bot 設定
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// 檢查環境變數
if (!config.channelAccessToken || !config.channelSecret) {
  console.error('❌ 請在 .env 檔案中設定 CHANNEL_ACCESS_TOKEN 和 CHANNEL_SECRET');
  console.log('📝 請參考 quick-setup.md 完成 LINE Bot 設定');
  process.exit(1);
}

const client = new line.Client(config);

// 儲存用戶訂單狀態
const userOrders = new Map();

app.use(bodyParser.json());

// 健康檢查端點
app.get('/', (req, res) => {
  res.send('🛍️ 塑膠袋訂購 LINE Bot 正在運行中！');
});

// Webhook 端點
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error('❌ Webhook 錯誤:', err);
      res.status(500).end();
    });
});

// 處理 LINE 事件
async function handleEvent(event) {
  console.log('📨 收到事件:', event.type);
  
  if (event.type !== 'message' && event.type !== 'postback') {
    return Promise.resolve(null);
  }

  const userId = event.source.userId;

  try {
    if (event.type === 'message' && event.message.type === 'text') {
      return await handleTextMessage(event, userId);
    }

    if (event.type === 'postback') {
      return await handlePostback(event, userId);
    }
  } catch (error) {
    console.error('❌ 處理事件錯誤:', error);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '抱歉，系統發生錯誤，請稍後再試。'
    });
  }
}

// 處理文字訊息
async function handleTextMessage(event, userId) {
  const text = event.message.text.trim();
  console.log('💬 收到訊息:', text);

  if (text === '開始訂購' || text === 'start' || text === '訂購') {
    return showMainMenu(event.replyToken);
  }

  if (text === '查看訂單' || text === '訂單狀態') {
    return showOrderStatus(event.replyToken, userId);
  }

  // 預設回應
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: '👋 歡迎來到塑膠袋訂購系統！\n\n請輸入「開始訂購」開始您的訂購流程。\n或輸入「查看訂單」查看現有訂單。'
  });
}

// 處理 Postback 事件
async function handlePostback(event, userId) {
  const data = new URLSearchParams(event.postback.data);
  const action = data.get('action');
  console.log('🔄 Postback 動作:', action);

  switch (action) {
    case 'start_order':
      return startOrderProcess(userId, event.replyToken);
    case 'view_order':
      return showOrderStatus(event.replyToken, userId);
    default:
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '功能開發中，敬請期待！'
      });
  }
}

// 顯示主選單
async function showMainMenu(replyToken) {
  const flexMessage = {
    type: 'flex',
    altText: '塑膠袋訂購系統',
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '🛍️ 塑膠袋訂購系統',
            weight: 'bold',
            size: 'xl',
            color: '#1DB446',
            align: 'center'
          }
        ],
        paddingAll: 'lg'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '歡迎使用我們的訂購系統！',
            size: 'md',
            align: 'center',
            margin: 'md'
          },
          {
            type: 'text',
            text: '請選擇您要進行的操作：',
            size: 'sm',
            color: '#666666',
            align: 'center',
            margin: 'sm'
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'postback',
              label: '🆕 開始新訂單',
              data: 'action=start_order'
            }
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'postback',
              label: '📋 查看現有訂單',
              data: 'action=view_order'
            }
          }
        ]
      }
    }
  };

  return client.replyMessage(replyToken, flexMessage);
}

// 開始訂購流程
async function startOrderProcess(userId, replyToken) {
  // 初始化用戶訂單
  userOrders.set(userId, {
    step: 'company_info',
    companyInfo: {},
    productSelection: {},
    deliveryDate: null,
    createdAt: new Date()
  });

  const message = {
    type: 'text',
    text: '📝 步驟 1/4：請提供公司資訊\n\n請按照以下格式填寫：\n\n公司名稱：ABC塑膠公司\n負責人：王小明\n電話：02-12345678\n統編：需要/不需要\n\n請直接回覆上述資訊。'
  };

  return client.replyMessage(replyToken, message);
}

// 顯示訂單狀態
async function showOrderStatus(replyToken, userId) {
  const order = userOrders.get(userId);
  
  if (!order) {
    return client.replyMessage(replyToken, {
      type: 'text',
      text: '❌ 找不到您的訂單資訊。\n請先輸入「開始訂購」建立新訂單。'
    });
  }

  let statusText = '📋 您的訂單狀態\n\n';
  statusText += `建立時間：${moment(order.createdAt).format('YYYY/MM/DD HH:mm')}\n`;
  statusText += `目前步驟：${getStepName(order.step)}\n\n`;
  
  if (order.companyInfo.name) {
    statusText += `公司名稱：${order.companyInfo.name}\n`;
  }
  
  statusText += '\n如需繼續訂購流程，請輸入「開始訂購」。';

  return client.replyMessage(replyToken, {
    type: 'text',
    text: statusText
  });
}

// 取得步驟名稱
function getStepName(step) {
  const stepNames = {
    'company_info': '填寫公司資訊',
    'product_selection': '選擇產品規格',
    'delivery_date': '選擇出貨日期',
    'confirmation': '確認訂單',
    'completed': '訂單完成'
  };
  return stepNames[step] || '未知步驟';
}

// 錯誤處理
app.use((error, req, res, next) => {
  console.error('❌ 應用程式錯誤:', error);
  res.status(500).send('Internal Server Error');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 塑膠袋訂購 LINE Bot 服務器啟動成功！');
  console.log(`📡 服務器運行在端口 ${PORT}`);
  console.log('🔗 Webhook URL: http://localhost:' + PORT + '/webhook');
  
  if (!process.env.CHANNEL_ACCESS_TOKEN || process.env.CHANNEL_ACCESS_TOKEN === '請在這裡填入你的Channel Access Token') {
    console.log('\n⚠️  請記得在 .env 檔案中設定正確的 LINE Bot 憑證！');
    console.log('📖 參考 quick-setup.md 完成設定');
  }
});