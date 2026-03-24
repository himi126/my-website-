// 食谱模块类型
export interface HealthProfile {
  height: number;
  weight: number;
  bloodPressure: { systolic: number; diastolic: number };
  bloodSugar: number;
  bodyType: '平和质' | '气虚质' | '阳虚质' | '阴虚质' | '痰湿质' | '湿热质' | '血瘀质' | '气郁质' | '特禀质';
  allergies: string[];
}

export interface Recipe {
  id: string;
  name: string;
  solarTerm: string;
  solarTermReason: string;
  ingredients: { name: string; amount: string; alternative?: string }[];
  steps: string[];
  nutrition: { calories: number; protein: number; fat: number; carbs: number; fiber: number };
  isFavorite: boolean;
  createdAt: string;
}

// 新闻模块类型
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: 'design' | 'finance' | 'health';
  url: string;
  publishedAt: string;
  isRead: boolean;
  isFavorite: boolean;
  isImportant: boolean;
}

// 任务清单类型
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'inProgress' | 'completed';
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

// 工作复盘类型
export interface Review {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  date: string;
  completedTasks: string;
  unfinishedReasons: string;
  improvements: string;
  nextPlan: string;
  customFields: { label: string; value: string }[];
  createdAt: string;
}

// 健康数据类型
export interface HealthRecord {
  id: string;
  date: string;
  weight?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  bloodSugar?: number;
  sleepHours?: number;
  waterIntake?: number;
  exerciseMinutes?: number;
}

// 灵感库类型
export interface Inspiration {
  id: string;
  type: 'text' | 'image' | 'audio';
  content: string;
  tags: string[];
  createdAt: string;
}

// 人脉管理类型
export interface Contact {
  id: string;
  name: string;
  position?: string;
  phone?: string;
  email?: string;
  industry?: string;
  firstMeetScene?: string;
  preferences?: string;
  pendingFollowUp?: string;
  lastContactDate?: string;
  reminders: { date: string; note: string }[];
  linkedTasks: string[];
  createdAt: string;
}

// 模块排序配置
export interface ModuleOrder {
  id: string;
  name: string;
  visible: boolean;
  order: number;
}

// 应用设置
export interface AppSettings {
  minimalMode: boolean;
  moduleOrder: ModuleOrder[];
}
