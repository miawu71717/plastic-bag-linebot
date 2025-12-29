// 訂單管理工具
const moment = require('moment');

class OrderManager {
  constructor() {
    // 在實際應用中，這應該連接到資料庫
    this.orders = new Map();
    this.orderCounter = 1000;
  }

  // 生成訂單編號
  generateOrderNumber() {
    const timestamp = moment().format('YYYYMMDD');
    const counter = String(this.orderCounter++).padStart(4, '0');
    return `PB${timestamp}${counter}`;
  }

  // 創建新訂單
  createOrder(userId) {
    const orderId = this.generateOrderNumber();
    const order = {
      orderId,
      userId,
      status: 'draft',
      step: 'company_info',
      companyInfo: {},
      productSelection: {},
      customRequirements: '',
      deliveryDate: null,
      totalPrice: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.orders.set(userId, order);
    return order;
  }

  // 獲取用戶訂單
  getOrder(userId) {
    return this.orders.get(userId);
  }

  // 更新訂單資訊
  updateOrder(userId, updates) {
    const order = this.orders.get(userId);
    if (order) {
      Object.assign(order, updates, { updatedAt: new Date() });
      this.orders.set(userId, order);
      return order;
    }
    return null;
  }

  // 更新公司資訊
  updateCompanyInfo(userId, companyInfo) {
    const order = this.getOrder(userId);
    if (order) {
      order.companyInfo = { ...order.companyInfo, ...companyInfo };
      order.step = 'product_selection';
      order.updatedAt = new Date();
      this.orders.set(userId, order);
      return order;
    }
    return null;
  }

  // 更新產品選擇
  updateProductSelection(userId, productData) {
    const order = this.getOrder(userId);
    if (order) {
      order.productSelection = { ...order.productSelection, ...productData };
      order.updatedAt = new Date();
      this.orders.set(userId, order);
      return order;
    }
    return null;
  }

  // 設定出貨日期
  setDeliveryDate(userId, date) {
    const order = this.getOrder(userId);
    if (order) {
      order.deliveryDate = date;
      order.step = 'confirmation';
      order.updatedAt = new Date();
      this.orders.set(userId, order);
      return order;
    }
    return null;
  }

  // 確認訂單
  confirmOrder(userId) {
    const order = this.getOrder(userId);
    if (order) {
      order.status = 'confirmed';
      order.confirmedAt = new Date();
      order.updatedAt = new Date();
      this.orders.set(userId, order);
      
      // 這裡可以加入發送確認郵件、通知管理員等邏輯
      this.notifyOrderConfirmed(order);
      
      return order;
    }
    return null;
  }

  // 計算訂單總價
  calculateTotalPrice(productSelection, quantity = 1000) {
    let basePrice = 0;
    
    // 這裡應該根據實際的產品配置計算價格
    // 暫時使用簡單的計算邏輯
    if (productSelection.size) basePrice += 0.5;
    if (productSelection.thickness) basePrice += 0.1;
    if (productSelection.material) basePrice += 0.2;
    if (productSelection.color) basePrice += 0.05;
    
    return basePrice * quantity;
  }

  // 獲取可用的出貨日期
  getAvailableDeliveryDates() {
    const dates = [];
    const startDate = moment().add(7, 'days'); // 7天後開始
    
    for (let i = 0; i < 8; i++) { // 提供8個可選日期
      const date = startDate.clone().add(i, 'days');
      // 跳過週日（可根據實際營業日調整）
      if (date.day() !== 0) {
        dates.push({
          date: date.format('YYYY-MM-DD'),
          display: date.format('MM/DD (ddd)'),
          available: true
        });
      }
    }
    
    return dates;
  }

  // 驗證訂單完整性
  validateOrder(order) {
    const errors = [];
    
    // 檢查公司資訊
    if (!order.companyInfo.name) errors.push('缺少公司名稱');
    if (!order.companyInfo.contact) errors.push('缺少負責人姓名');
    if (!order.companyInfo.phone) errors.push('缺少聯絡電話');
    
    // 檢查產品選擇
    if (!order.productSelection.size) errors.push('未選擇尺寸');
    if (!order.productSelection.thickness) errors.push('未選擇厚度');
    if (!order.productSelection.material) errors.push('未選擇材質');
    if (!order.productSelection.color) errors.push('未選擇顏色');
    
    // 檢查出貨日期
    if (!order.deliveryDate) errors.push('未選擇出貨日期');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 格式化訂單顯示
  formatOrderSummary(order) {
    const { companyInfo, productSelection, deliveryDate } = order;
    
    let summary = '📋 訂單摘要\n\n';
    
    // 公司資訊
    summary += '🏢 公司資訊\n';
    summary += `公司名稱：${companyInfo.name || '未填寫'}\n`;
    summary += `負責人：${companyInfo.contact || '未填寫'}\n`;
    summary += `聯絡電話：${companyInfo.phone || '未填寫'}\n`;
    summary += `統一發票：${companyInfo.invoice || '未填寫'}\n\n`;
    
    // 產品規格
    summary += '📦 產品規格\n';
    summary += `尺寸：${productSelection.sizeName || '未選擇'}\n`;
    summary += `厚度：${productSelection.thicknessName || '未選擇'}\n`;
    summary += `材質：${productSelection.materialName || '未選擇'}\n`;
    summary += `顏色：${productSelection.colorName || '未選擇'}\n`;
    
    if (productSelection.quantity) {
      summary += `數量：${productSelection.quantity.toLocaleString()} 個\n`;
    }
    
    if (order.customRequirements) {
      summary += `客製化需求：${order.customRequirements}\n`;
    }
    
    summary += '\n';
    
    // 出貨資訊
    summary += '🚚 出貨資訊\n';
    summary += `預計出貨日：${deliveryDate ? moment(deliveryDate).format('YYYY/MM/DD (ddd)') : '未選擇'}\n\n`;
    
    // 訂單資訊
    summary += '📄 訂單資訊\n';
    summary += `訂單編號：${order.orderId}\n`;
    summary += `建立時間：${moment(order.createdAt).format('YYYY/MM/DD HH:mm')}\n`;
    
    return summary;
  }

  // 通知訂單確認（可擴展為發送郵件等）
  notifyOrderConfirmed(order) {
    console.log(`訂單 ${order.orderId} 已確認`);
    // 這裡可以加入發送郵件、Slack通知等邏輯
  }

  // 獲取所有訂單（管理員功能）
  getAllOrders() {
    return Array.from(this.orders.values());
  }

  // 根據狀態獲取訂單
  getOrdersByStatus(status) {
    return Array.from(this.orders.values()).filter(order => order.status === status);
  }
}

module.exports = OrderManager;