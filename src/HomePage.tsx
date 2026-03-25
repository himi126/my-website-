import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Newspaper, CheckSquare, FileText, Activity, Lightbulb, Users, ArrowRight, Calendar, TrendingUp } from 'lucide-react';
import { Card } from './Card';
import { useApp } from './AppContext';
import { appStorage, formatDate } from './appStorage';
import { getCurrentSolarTerm } from './solarTerms';
import type { Recipe, NewsItem, Task, HealthRecord, Review } from './index.ts';

export const HomePage: React.FC = () => {
  const { settings } = useApp();
  const currentSolarTerm = getCurrentSolarTerm();

  // 安全加载数据
  const recipes = appStorage.get<Recipe[]>('recipes', []);
  const news = appStorage.get<NewsItem[]>('news', []);
  const tasks = appStorage.get<Task[]>('tasks', []);
  const healthRecords = appStorage.get<HealthRecord[]>('health-records', []);
  const reviews = appStorage.get<Review[]>('reviews', []);

  // 简单逻辑处理
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const todayNews = news.filter(n => !n.isRead).slice(0, 3);
  const weekReviews = reviews.filter(r => {
    const reviewDate = new Date(r.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return reviewDate >= weekAgo;
  });

  const moduleCards = [
    { id: 'recipe', title: '私人定制食谱', icon: ChefHat, link: '/life', category: 'life', summary: `当前节气：${currentSolarTerm.name}` },
    { id: 'news', title: '新闻聚合', icon: Newspaper, link: '/life', category: 'life', summary: `${todayNews.length} 条未读新闻` },
    { id: 'health', title: '健康追踪', icon: Activity, link: '/life', category: 'life', summary: '点击记录今日数据' },
    { id: 'inspiration', title: '灵感创意库', icon: Lightbulb, link: '/life', category: 'life', summary: '捕捉转瞬即逝的想法' },
    { id: 'tasks', title: '工作清单', icon: CheckSquare, link: '/work', category: 'work', summary: `${pendingTasks.length} 项待办任务` },
    { id: 'review', title: '工作复盘', icon: FileText, link: '/work', category: 'work', summary: `本周已完成 ${weekReviews.length} 次` },
    { id: 'contacts', title: '人脉管理', icon: Users, link: '/work', category: 'work', summary: '管理你的社交网络' },
  ];

  const lifeModules = moduleCards.filter(m => m.category === 'life');
  const workModules = moduleCards.filter(m => m.category === 'work');

  return (
    <div className="p-6 space-y-10">
      {/* --- 重点：欢迎语区域 --- */}
      <header className="text-center py-10 space-y-4">
        <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full">
          <p className="text-primary font-medium tracking-widest text-sm uppercase">
            ✨ Welcome to himi's cabin
          </p>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          欢迎来到 <span className="text-primary">himi 的小屋</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          生活与工作一体化管理 · 这里的每一处细节都为你量身打造
        </p>
      </header>
      {/* ----------------------- */}

      {/* 今日数据概览 */}
      {!settings?.minimalMode && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center bg-blue-50/40 p-4 border-none shadow-sm">
            <Calendar className="mx-auto text-blue-500 mb-2" size={20} />
            <p className="text-xs text-gray-400">当前节气</p>
            <p className="text-base font-bold text-gray-800">{currentSolarTerm.name}</p>
          </Card>
          <Card className="text-center bg-orange-50/40 p-4 border-none shadow-sm">
            <CheckSquare className="mx-auto text-orange-500 mb-2" size={20} />
            <p className="text-xs text-gray-400">待办任务</p>
            <p className="text-base font-bold text-gray-800">{pendingTasks.length}</p>
          </Card>
          <Card className="text-center bg-indigo-50/40 p-4 border-none shadow-sm">
            <Newspaper className="mx-auto text-indigo-500 mb-2" size={20} />
            <p className="text-xs text-gray-400">未读新闻</p>
            <p className="text-base font-bold text-gray-800">{todayNews.length}</p>
          </Card>
          <Card className="text-center bg-green-50/40 p-4 border-none shadow-sm">
            <TrendingUp className="mx-auto text-green-500 mb-2" size={20} />
            <p className="text-xs text-gray-400">本周复盘</p>
            <p className="text-base font-bold text-gray-800">{weekReviews.length}</p>
          </Card>
        </div>
      )}

      {/* 板块列表 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary rounded-full"></span> 生活板块
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {lifeModules.map(m => (
            <Link key={m.id} to={m.link}>
              <Card hover className="p-5 h-full border-gray-100 hover:border-primary/30 transition-all">
                <m.icon className="text-primary mb-3" size={28} />
                <h3 className="font-bold text-gray-900">{m.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{m.summary}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-accent rounded-full"></span> 工作板块
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workModules.map(m => (
            <Link key={m.id} to={m.link}>
              <Card hover className="p-5 h-full border-gray-100 hover:border-accent/30 transition-all">
                <m.icon className="text-accent mb-3" size={28} />
                <h3 className="font-bold text-gray-900">{m.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{m.summary}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
