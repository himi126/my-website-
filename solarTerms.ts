// 二十四节气工具
export interface SolarTerm {
  name: string;
  date: string;
  description: string;
  dietTips: string[];
  recommendedFoods: string[];
  avoidFoods: string[];
}

// 2024-2025年二十四节气日期（简化版）
const solarTermsData: Record<string, SolarTerm> = {
  '立春': {
    name: '立春',
    date: '02-04',
    description: '春季开始，万物复苏',
    dietTips: ['宜养肝护肝', '多吃春季时令蔬菜', '少吃油腻食物'],
    recommendedFoods: ['韭菜', '菠菜', '豆芽', '春笋', '荠菜', '香椿'],
    avoidFoods: ['生冷食物', '辛辣刺激']
  },
  '雨水': {
    name: '雨水',
    date: '02-19',
    description: '降雨开始，雨量渐增',
    dietTips: ['健脾祛湿', '少酸多甘', '清淡饮食'],
    recommendedFoods: ['山药', '红枣', '蜂蜜', '百合', '莲子'],
    avoidFoods: ['酸性食物过多', '生冷寒凉']
  },
  '惊蛰': {
    name: '惊蛰',
    date: '03-05',
    description: '春雷始鸣，惊醒蛰虫',
    dietTips: ['清肝降火', '增强免疫力', '预防感冒'],
    recommendedFoods: ['梨', '银耳', '菊花茶', '枸杞', '芹菜'],
    avoidFoods: ['油炸食品', '辛辣过度']
  },
  '春分': {
    name: '春分',
    date: '03-20',
    description: '昼夜平分，阴阳调和',
    dietTips: ['阴阳平衡', '不寒不热', '适量进补'],
    recommendedFoods: ['香椿', '春笋', '豆腐', '鸡蛋', '菠菜'],
    avoidFoods: ['大热大寒食物']
  },
  '清明': {
    name: '清明',
    date: '04-04',
    description: '天清地明，春和景明',
    dietTips: ['养肝明目', '清热解毒', '踏青养生'],
    recommendedFoods: ['艾草', '青团', '荠菜', '马兰头', '枸杞叶'],
    avoidFoods: ['发物', '热性食物']
  },
  '谷雨': {
    name: '谷雨',
    date: '04-20',
    description: '雨生百谷，春耕播种',
    dietTips: ['健脾除湿', '养肝护肝', '补益脾胃'],
    recommendedFoods: ['茶叶', '香椿', '菠萝', '樱桃', '薏米'],
    avoidFoods: ['湿热食物', '肥甘厚味']
  },
  '立夏': {
    name: '立夏',
    date: '05-05',
    description: '夏季开始，万物繁茂',
    dietTips: ['养心安神', '清热解暑', '增酸减苦'],
    recommendedFoods: ['苦瓜', '绿豆', '西瓜', '番茄', '黄瓜'],
    avoidFoods: ['温热食物', '油腻厚味']
  },
  '小满': {
    name: '小满',
    date: '05-21',
    description: '麦类等夏熟作物籽粒开始饱满',
    dietTips: ['清热利湿', '健脾养胃', '清淡饮食'],
    recommendedFoods: ['冬瓜', '丝瓜', '苦瓜', '绿豆汤', '薏仁'],
    avoidFoods: ['甜腻食物', '辛辣刺激']
  },
  '芒种': {
    name: '芒种',
    date: '06-05',
    description: '忙于播种，有芒作物播种',
    dietTips: ['清热降火', '生津止渴', '防暑降温'],
    recommendedFoods: ['杨梅', '李子', '桑葚', '绿茶', '荷叶茶'],
    avoidFoods: ['热性水果过多', '冰镇饮品过量']
  },
  '夏至': {
    name: '夏至',
    date: '06-21',
    description: '一年中白昼最长的一天',
    dietTips: ['养心护阳', '清热解暑', '多饮水'],
    recommendedFoods: ['绿豆', '莲子', '百合', '银耳', '西瓜'],
    avoidFoods: ['温补食物', '辛辣油腻']
  },
  '小暑': {
    name: '小暑',
    date: '07-07',
    description: '暑热开始，天气炎热',
    dietTips: ['清热解暑', '健脾利湿', '养心安神'],
    recommendedFoods: ['莲藕', '绿豆', '冬瓜', '西瓜', '荷叶'],
    avoidFoods: ['大量冷饮', '肥腻食物']
  },
  '大暑': {
    name: '大暑',
    date: '07-22',
    description: '一年中最热的时期',
    dietTips: ['清热消暑', '益气养阴', '补充水分'],
    recommendedFoods: ['绿豆汤', '酸梅汤', '西瓜', '苦瓜', '莲子'],
    avoidFoods: ['温热燥烈食物', '辛辣刺激']
  },
  '立秋': {
    name: '立秋',
    date: '08-07',
    description: '秋季开始，暑去凉来',
    dietTips: ['润肺养阴', '防燥润燥', '适当进补'],
    recommendedFoods: ['梨', '银耳', '蜂蜜', '百合', '莲藕'],
    avoidFoods: ['辛辣刺激', '烧烤煎炸']
  },
  '处暑': {
    name: '处暑',
    date: '08-23',
    description: '暑气渐消，秋意渐浓',
    dietTips: ['滋阴润燥', '养肺护肤', '早睡早起'],
    recommendedFoods: ['银耳', '雪梨', '芝麻', '核桃', '百合'],
    avoidFoods: ['寒凉食物', '辛辣燥热']
  },
  '白露': {
    name: '白露',
    date: '09-07',
    description: '天气转凉，露水凝结',
    dietTips: ['滋阴润肺', '防秋燥', '增强免疫'],
    recommendedFoods: ['梨', '蜂蜜', '银耳', '百合', '山药'],
    avoidFoods: ['生冷瓜果', '辛辣刺激']
  },
  '秋分': {
    name: '秋分',
    date: '09-23',
    description: '昼夜等长，秋季中分',
    dietTips: ['阴阳调和', '润肺生津', '适度进补'],
    recommendedFoods: ['银耳', '百合', '芝麻', '核桃', '柿子'],
    avoidFoods: ['寒凉食物', '辛辣燥热']
  },
  '寒露': {
    name: '寒露',
    date: '10-08',
    description: '露水已寒，将要结霜',
    dietTips: ['润肺养阴', '温补脾胃', '防寒保暖'],
    recommendedFoods: ['山药', '莲藕', '栗子', '柿子', '梨'],
    avoidFoods: ['生冷食物', '辛辣刺激']
  },
  '霜降': {
    name: '霜降',
    date: '10-23',
    description: '初霜出现，天气转寒',
    dietTips: ['润肺固表', '温补脾胃', '滋阴润燥'],
    recommendedFoods: ['柿子', '栗子', '萝卜', '山药', '银耳'],
    avoidFoods: ['寒凉伤胃', '辛辣过度']
  },
  '立冬': {
    name: '立冬',
    date: '11-07',
    description: '冬季开始，万物收藏',
    dietTips: ['温补肾阳', '滋阴润燥', '进补调养'],
    recommendedFoods: ['羊肉', '牛肉', '核桃', '栗子', '红枣'],
    avoidFoods: ['寒凉食物', '生冷瓜果']
  },
  '小雪': {
    name: '小雪',
    date: '11-22',
    description: '开始降雪，雪量尚小',
    dietTips: ['温补肾阳', '养阴润燥', '驱寒保暖'],
    recommendedFoods: ['羊肉', '牛肉', '鸡肉', '红枣', '桂圆'],
    avoidFoods: ['寒凉生冷', '油腻厚味']
  },
  '大雪': {
    name: '大雪',
    date: '12-07',
    description: '雪量增大，天寒地冻',
    dietTips: ['温补肾阳', '滋阴养血', '驱寒暖身'],
    recommendedFoods: ['羊肉', '狗肉', '鹿肉', '核桃', '栗子'],
    avoidFoods: ['寒凉食物', '反季节蔬果']
  },
  '冬至': {
    name: '冬至',
    date: '12-21',
    description: '一年中白昼最短的一天',
    dietTips: ['温补肾阳', '滋阴养血', '进补佳期'],
    recommendedFoods: ['饺子', '羊肉', '狗肉', '牛肉', '核桃'],
    avoidFoods: ['生冷食物', '寒凉瓜果']
  },
  '小寒': {
    name: '小寒',
    date: '01-05',
    description: '开始进入寒冷时期',
    dietTips: ['温阳散寒', '滋阴润燥', '强身健体'],
    recommendedFoods: ['羊肉', '牛肉', '鸡肉', '红枣', '枸杞'],
    avoidFoods: ['寒凉食物', '生冷瓜果']
  },
  '大寒': {
    name: '大寒',
    date: '01-20',
    description: '一年中最寒冷的时期',
    dietTips: ['温阳散寒', '滋阴养血', '调养身心'],
    recommendedFoods: ['羊肉', '牛肉', '桂圆', '红枣', '枸杞'],
    avoidFoods: ['寒凉食物', '冷饮冰品']
  }
};

// 获取当前节气
export const getCurrentSolarTerm = (): SolarTerm => {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate();

  const terms = Object.values(solarTermsData);
  let currentTerm = terms[0];

  for (const term of terms) {
    const [termMonth, termDay] = term.date.split('-').map(Number);
    const termMonthStr = termMonth.toString().padStart(2, '0');

    if (month > termMonthStr || (month === termMonthStr && day >= termDay)) {
      currentTerm = term;
    }
  }

  return currentTerm;
};

// 获取所有节气
export const getAllSolarTerms = (): SolarTerm[] => {
  return Object.values(solarTermsData);
};

// 根据名称获取节气
export const getSolarTermByName = (name: string): SolarTerm | undefined => {
  return solarTermsData[name];
};
