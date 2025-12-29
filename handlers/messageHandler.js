// 訊息處理器
const OrderManager = require('../utils/orderManager');
const productConfig = require('../config/products');

class MessageHandler {
  constructor(client) {
    this.client = client;
    this.orderManager = new OrderManager();
  }

  // 處理文字訊息
  async handleTextMessage(event, userId) {
    const text = event.message.text.trim();
    const order = this.orderManager.getOrder(userId);

    // 檢查是否為公司資訊填寫階段
    if (order && order.step === 'company_info') {
      return this.handleCompanyInfoInput(event, userId, text);
    }

    // 檢查是否為數量輸入階段
    if (order && order.step === 'quantity_input') {
      return this.handleQuantityInput(event, userId, text);
    }

    // 檢查是否為客製化需求輸入階段
    if (order && order.step === 'custom_input') {
      return this.handleCustomRequirementInput(event, userId, text);
    }

    // 處理一般指令
    return this.handleGeneralCommands(event, userId, text);
  }

  // 處理一般指令
  async handleGeneralCommands(event, userId, text) {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('開始') || lowerText.includes('訂購') || lowerText === 'start') {
      return this.showMainMenu(event.replyToken, userId);
    }

    if (lowerText.includes('查看') || lowerText.includes('訂單') || lowerText.includes('狀態')) {
      return this.showOrderStatus(event.replyToken, userId);
    }

    if (lowerText.includes('幫助') || lowerText.includes('說明') || lowerText === 'help') {
      return this.showHelp(event.replyToken);
    }

    // 預設回應
    return this.client.replyMessage(event.replyToken, {
      type: 'text',
      text: '👋 歡迎來到塑膠袋訂購系統！\n\n請輸入以下指令：\n• 「開始訂購」- 開始新的訂購流程\n• 「查看訂單」- 查看現有訂單狀態\n• 「說明」- 查看使用說明'
    });
  }

  // 顯示主選單
  async showMainMenu(replyToken, userId) {
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
            },
            {
              type: 'button',
              style: 'secondary',
              height: 'sm',
              action: {
                type: 'postback',
                label: '❓ 使用說明',
                data: 'action=show_help'
              }
            }
          ]
        }
      }
    };

    return this.client.replyMessage(replyToken, flexMessage);
  }

  // 處理公司資訊輸入
  async handleCompanyInfoInput(event, userId, text) {
    const companyInfo = this.parseCompanyInfo(text);
    
    if (!companyInfo.name || !companyInfo.contact || !companyInfo.phone) {
      return this.client.replyMessage(event.replyToken, {
        type: 'text',
        text: '❌ 資訊格式不正確，請按照以下格式填寫：\n\n公司名稱：ABC公司\n負責人：王小明\n電話：02-12345678\n統編：需要/不需要'
      });
    }

    // 更新訂單資訊
    this.orderManager.updateCompanyInfo(userId, companyInfo);

    // 顯示產品選擇介面
    return this.showProductSelection(event.replyToken, userId);
  }

  // 解析公司資訊
  parseCompanyInfo(text) {
    const info = {};
    const lines = text.split('\n');

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.includes('公司') || trimmedLine.includes('名稱')) {
        info.name = trimmedLine.split('：')[1] || trimmedLine.split(':')[1];
      } else if (trimmedLine.includes('負責人') || trimmedLine.includes('聯絡人')) {
        info.contact = trimmedLine.split('：')[1] || trimmedLine.split(':')[1];
      } else if (trimmedLine.includes('電話') || trimmedLine.includes('手機')) {
        info.phone = trimmedLine.split('：')[1] || trimmedLine.split(':')[1];
      } else if (trimmedLine.includes('統編') || trimmedLine.includes('發票')) {
        const invoiceText = trimmedLine.split('：')[1] || trimmedLine.split(':')[1];
        info.invoice = invoiceText && invoiceText.includes('需要') ? '需要統一發票' : '不需要統一發票';
      }
    });

    return info;
  }

  // 顯示產品選擇介面
  async showProductSelection(replyToken, userId) {
    const flexMessage = {
      type: 'flex',
      altText: '選擇產品規格',
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '步驟 2/4：產品規格選擇',
              weight: 'bold',
              size: 'lg',
              color: '#1DB446'
            }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '請依序選擇產品規格：',
              wrap: true,
              margin: 'md'
            },
            {
              type: 'separator',
              margin: 'md'
            },
            {
              type: 'text',
              text: '📏 尺寸 → 📐 厚度 → 🧪 材質 → 🎨 顏色',
              size: 'sm',
              color: '#666666',
              margin: 'md'
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
              action: {
                type: 'postback',
                label: '📏 選擇尺寸',
                data: 'action=select_size'
              }
            }
          ]
        }
      }
    };

    return this.client.replyMessage(replyToken, flexMessage);
  }

  // 顯示訂單狀態
  async showOrderStatus(replyToken, userId) {
    const order = this.orderManager.getOrder(userId);
    
    if (!order) {
      return this.client.replyMessage(replyToken, {
        type: 'text',
        text: '❌ 找不到您的訂單資訊。\n請先開始新的訂購流程。'
      });
    }

    const summary = this.orderManager.formatOrderSummary(order);
    
    return this.client.replyMessage(replyToken, {
      type: 'text',
      text: summary
    });
  }

  // 顯示使用說明
  async showHelp(replyToken) {
    const helpText = `📖 使用說明

🔸 開始訂購流程：
1️⃣ 填寫公司基本資料
2️⃣ 選擇產品規格（尺寸、厚度、材質、顏色）
3️⃣ 選擇出貨日期（7天後開始）
4️⃣ 確認訂單資訊

🔸 可用指令：
• 「開始訂購」- 開始新訂單
• 「查看訂單」- 查看目前訂單狀態
• 「說明」- 顯示此說明

🔸 注意事項：
• 出貨日期最快為下單後7天
• 所有規格選擇完成後才能進入下一步
• 如有特殊需求請在客製化選項中說明

如有任何問題，歡迎隨時聯絡我們！`;

    return this.client.replyMessage(replyToken, {
      type: 'text',
      text: helpText
    });
  }

  // 處理數量輸入
  async handleQuantityInput(event, userId, text) {
    const quantity = parseInt(text.replace(/[^\d]/g, ''));
    
    if (isNaN(quantity) || quantity < 100) {
      return this.client.replyMessage(event.replyToken, {
        type: 'text',
        text: '❌ 請輸入有效的數量（最少100個）\n\n例如：1000'
      });
    }

    // 更新訂單數量
    this.orderManager.updateProductSelection(userId, { quantity });

    // 詢問是否有客製化需求
    return this.askForCustomRequirements(event.replyToken, userId);
  }

  // 詢問客製化需求
  async askForCustomRequirements(replyToken, userId) {
    const flexMessage = {
      type: 'flex',
      altText: '客製化需求',
      contents: {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '是否有客製化需求？',
              weight: 'bold',
              size: 'lg'
            },
            {
              type: 'text',
              text: '例如：印刷、特殊尺寸、提把等',
              size: 'sm',
              color: '#666666',
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
              action: {
                type: 'postback',
                label: '有客製化需求',
                data: 'action=has_custom'
              }
            },
            {
              type: 'button',
              style: 'secondary',
              action: {
                type: 'postback',
                label: '沒有，直接下一步',
                data: 'action=no_custom'
              }
            }
          ]
        }
      }
    };

    return this.client.replyMessage(replyToken, flexMessage);
  }

  // 處理客製化需求輸入
  async handleCustomRequirementInput(event, userId, text) {
    // 更新客製化需求
    this.orderManager.updateOrder(userId, { 
      customRequirements: text,
      step: 'delivery_date'
    });

    // 顯示出貨日期選擇
    return this.showDeliveryDateSelection(event.replyToken, userId);
  }

  // 顯示出貨日期選擇
  async showDeliveryDateSelection(replyToken, userId) {
    const availableDates = this.orderManager.getAvailableDeliveryDates();

    const flexMessage = {
      type: 'flex',
      altText: '選擇出貨日期',
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '步驟 3/4：選擇出貨日期',
              weight: 'bold',
              size: 'lg',
              color: '#1DB446'
            }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '請選擇預計出貨日期：',
              wrap: true,
              margin: 'md'
            },
            {
              type: 'text',
              text: '⚠️ 最快出貨時間為下單後7天',
              size: 'sm',
              color: '#FF6B6B',
              margin: 'sm'
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: availableDates.slice(0, 4).map(dateInfo => ({
            type: 'button',
            style: 'secondary',
            action: {
              type: 'postback',
              label: `🗓️ ${dateInfo.display}`,
              data: `action=select_date&date=${dateInfo.date}`
            }
          }))
        }
      }
    };

    return this.client.replyMessage(replyToken, flexMessage);
  }
}

module.exports = MessageHandler;