// 產品規格配置文件
// 可以根據實際需求修改這些選項

const productConfig = {
  // 尺寸選項
  sizes: [
    { 
      id: 'small', 
      name: '小型 (20x30cm)', 
      price: 0.5,
      description: '適合小物品包裝'
    },
    { 
      id: 'medium', 
      name: '中型 (30x40cm)', 
      price: 0.8,
      description: '一般商品包裝'
    },
    { 
      id: 'large', 
      name: '大型 (40x60cm)', 
      price: 1.2,
      description: '大件商品包裝'
    },
    { 
      id: 'xlarge', 
      name: '特大 (60x80cm)', 
      price: 1.8,
      description: '超大型商品包裝'
    }
  ],

  // 厚度選項
  thickness: [
    { 
      id: 'thin', 
      name: '薄型 (0.02mm)', 
      price: 0,
      description: '輕量包裝使用'
    },
    { 
      id: 'medium', 
      name: '中厚 (0.05mm)', 
      price: 0.1,
      description: '標準厚度，適合一般使用'
    },
    { 
      id: 'thick', 
      name: '厚型 (0.08mm)', 
      price: 0.2,
      description: '重物包裝，耐用性佳'
    }
  ],

  // 材質選項
  materials: [
    { 
      id: 'pe', 
      name: 'PE塑膠', 
      price: 0,
      description: '標準塑膠材質'
    },
    { 
      id: 'biodegradable', 
      name: '生物可分解', 
      price: 0.3,
      description: '環保材質，可自然分解'
    },
    { 
      id: 'recycled', 
      name: '回收材質', 
      price: 0.15,
      description: '回收塑膠製成，環保選擇'
    }
  ],

  // 顏色選項
  colors: [
    { 
      id: 'transparent', 
      name: '透明', 
      price: 0,
      description: '標準透明色'
    },
    { 
      id: 'white', 
      name: '白色', 
      price: 0.05,
      description: '不透明白色'
    },
    { 
      id: 'black', 
      name: '黑色', 
      price: 0.05,
      description: '不透明黑色'
    },
    { 
      id: 'custom', 
      name: '客製化顏色', 
      price: 0.2,
      description: '可指定特殊顏色（需額外確認）'
    }
  ],

  // 最小訂購數量
  minimumQuantity: {
    small: 1000,
    medium: 500,
    large: 300,
    xlarge: 200
  },

  // 交期設定
  deliverySettings: {
    minimumDays: 7,        // 最少需要7天
    maxSelectableDays: 14  // 最多可選擇14天內的日期
  },

  // 客製化選項
  customOptions: [
    {
      id: 'printing',
      name: '印刷服務',
      description: '可印製公司Logo或文字',
      priceCalculation: 'quote' // 需要報價
    },
    {
      id: 'special_size',
      name: '特殊尺寸',
      description: '非標準尺寸客製化',
      priceCalculation: 'quote'
    },
    {
      id: 'handle',
      name: '提把設計',
      description: '加裝提把',
      price: 0.3
    },
    {
      id: 'zipper',
      name: '拉鍊封口',
      description: '可重複使用拉鍊設計',
      price: 0.5
    }
  ]
};

module.exports = productConfig;