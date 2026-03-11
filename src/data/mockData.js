export const ROLES = {
  STREAMER: 'streamer',
  ADMIN: 'admin',
  USER: 'user',
};

export const users = {
  1: { id: 1, name: '主播小明', role: ROLES.STREAMER },
  2: { id: 2, name: '幹部小華', role: ROLES.ADMIN },
  3: { id: 3, name: '小美', role: ROLES.USER },
  4: { id: 4, name: 'Kevin', role: ROLES.USER },
  5: { id: 5, name: '阿宏', role: ROLES.USER },
  6: { id: 6, name: '台股達人', role: ROLES.USER },
};

export const CURRENT_USER_ID = 1;

let msgIdCounter = 100;
export const nextMsgId = () => ++msgIdCounter;

const msg = (id, userId, text, offsetMs = 0) => ({
  id,
  userId,
  text,
  timestamp: new Date(Date.now() - offsetMs),
  status: 'sent',
  removed: false,
  pinned: false,
});

export const initialMessages = [
  msg(1, 3, '主播好！今天直播什麼內容？', 300000),
  msg(2, 4, '666 衝啊', 280000),
  msg(3, 5, '大家好～', 260000),
  msg(4, 2, '歡迎各位，今天有精彩內容', 240000),
  msg(5, 6, '主播這波操作太猛了', 220000),
  msg(6, 3, '哈哈哈哈哈哈', 200000),
  msg(7, 4, '好厲害！', 180000),
  msg(8, 1, '大家好！今天來聊聊市場最新動態', 160000),
  msg(9, 5, '主播加油！！', 140000),
  msg(10, 6, '這個分析很有深度', 120000),
  msg(11, 3, '我也覺得', 100000),
  msg(12, 4, '太強了吧', 80000),
  msg(13, 2, '請大家遵守聊天室規則喔', 60000),
  msg(14, 5, '了解！', 50000),
  msg(15, 6, '今天重點在哪個版塊？', 40000),
  msg(16, 1, '主要看科技股的短期走勢', 30000),
  msg(17, 3, '感謝主播解說！', 20000),
  msg(18, 4, '學到了！', 10000),
];

export const historyMessages = [
  msg(51, 3, '（歷史）昨天的直播好精彩！', 3600000),
  msg(52, 4, '（歷史）期待今天', 3500000),
  msg(53, 5, '（歷史）大家早～', 3400000),
  msg(54, 2, '（歷史）直播即將開始，請準時收看', 3300000),
  msg(55, 6, '（歷史）期待！', 3200000),
];

export const randomMessages = [
  (id) => msg(id, 3, '哇！這個觀點很特別！'),
  (id) => msg(id, 4, '666'),
  (id) => msg(id, 5, '主播講得好清楚'),
  (id) => msg(id, 6, '學到新知識了！'),
  (id) => msg(id, 3, '繼續繼續！'),
  (id) => msg(id, 4, '這個我之前不知道'),
  (id) => msg(id, 5, '感謝主播分享'),
  (id) => msg(id, 6, '請問這個在哪裡查？'),
  (id) => msg(id, 3, '太猛了吧'),
  (id) => msg(id, 4, '今天收穫滿滿'),
];

export const reconnectMessages = [
  (id) => msg(id, 3, '（剛才斷線）主播剛說什麼？'),
  (id) => msg(id, 4, '（剛才斷線）網路好像有問題'),
  (id) => msg(id, 5, '（剛才斷線）666 衝衝衝'),
];

export const apps = [
  { id: 1, name: 'CMoney 投資直播' },
  { id: 2, name: 'CMoney 財經頻道' },
];

export const streams = {
  1: [
    { id: 1, title: '台股早盤解析', appId: 1, live: true },
    { id: 2, title: '美股夜盤觀察', appId: 1, live: false },
  ],
  2: [
    { id: 3, title: '主力法人動向', appId: 2, live: true },
    { id: 4, title: '期貨選擇權教學', appId: 2, live: false },
  ],
};
