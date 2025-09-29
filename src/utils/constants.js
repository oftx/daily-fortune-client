export const FORTUNE_TYPES = {
  S_KICHI: '諭吉', // Super Good Fortune
  DAI_KICHI: '大吉', // Great Good Fortune
  KICHI: '吉', // Good Fortune
  CHU_KICHI: '中吉', // Middle Good Fortune
  SHO_KICHI: '小吉', // Small Good Fortune
  KYO: '凶', // Bad Fortune
  DAI_KYO: '大凶', // Great Bad Fortune
};

export const FORTUNE_COLORS = {
  [FORTUNE_TYPES.S_KICHI]: { background: '#eec54bff', text: '#FFFFFF' },
  [FORTUNE_TYPES.DAI_KICHI]: { background: '#C73E3A', text: '#FFFFFF' },
  [FORTUNE_TYPES.KICHI]: { background: '#9cca26ff', text: '#FFFFFF' },
  [FORTUNE_TYPES.CHU_KICHI]: { background: '#eaaa66ff', text: '#FFFFFF' },
  [FORTUNE_TYPES.SHO_KICHI]: { background: '#4cd3cfff', text: '#FFFFFF' },
  [FORTUNE_TYPES.KYO]: { background: '#67278F', text: '#FFFFFF' },
  [FORTUNE_TYPES.DAI_KYO]: { background: '#1A297E', text: '#FFFFFF' },
};

// 用于热力图的颜色等级
export const HEATMAP_COLOR_LEVELS = {
  [FORTUNE_TYPES.DAI_KYO]: 1,
  [FORTUNE_TYPES.KYO]: 2,
  [FORTUNE_TYPES.SHO_KICHI]: 3,
  [FORTUNE_TYPES.CHU_KICHI]: 4,
  [FORTUNE_TYPES.KICHI]: 5,
  [FORTUNE_TYPES.DAI_KICHI]: 6,
  [FORTUNE_TYPES.S_KICHI]: 7,
};