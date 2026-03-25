import React, { useState, useEffect } from 'react';
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

  // 1. 加载数据：全部统一使用 appStorage
  const recipes = appStorage.get<Recipe[]>('recipes', []);
  const news = appStorage.get<NewsItem[]>('news', []);
  const tasks = appStorage.get<Task[]>('tasks', []);
  const healthRecords = appStorage.get<HealthRecord[]>('health-records', []);
  const reviews = appStorage.get<Review[]>('reviews', []);

  // 2. 逻辑处理：增加空值保护
  const todayRecipe = Array.isArray(recipes) ? recipes.find(r => r && formatDate(r.createdAt) === formatDate(new Date())) : null;
  const pendingTasks = Array.isArray(tasks) ? tasks.filter(t => t && t.status !== 'completed') : [];
  const highPriorityTasks = pendingTasks.filter(t => t && t.priority === 'high');
  const todayNews = Array.isArray(news) ? news.filter(n => n && !n.isRead).slice(0, 3) : [];
  const todayHealth = Array.isArray(healthRecords) ? healthRecords.find(r => r && r.date === formatDate(new Date())) : null;

  const weekReviews = Array.isArray(reviews) ? reviews.filter(r => {
    if (!r || !r.date) return false;
    const reviewDate = new Date(r.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
   // 在 HomePage.tsx 的 return 部分进行如下替换：

  return (
    <div className="p-6 space-y-8">
      <header className="text-center animate-in fade-in duration-700">
        {/* 这里就是新增的欢迎语 */}
        <p className="text-accent font-medium mb-2 tracking-widest uppercase text-sm">
          Welcome to himi's cabin
        </p>
        
        <h1 className="text-4xl font-bold text-primary tracking-tight">
          欢迎来到 himi 的小屋
        </h1>
        
        {!settings?.minimalMode && (
          <p className="text-gray-400 mt-3 text-lg font-light">
            生活与工作一体化管理 · 专注实用
          </p>
        )}
      </header>

      {/* 剩下的内容保持不变... */}

  // 3. 模块卡片定义：修正了这里的 storage -> appStorage 错误
  const moduleCards = [
    {
      id: 'recipe',
      title: '私人定制食谱',
      icon: ChefHat,
      link: '/life',
      category: 'life',
      summary: todayRecipe ? `今日推荐：${todayRecipe.name}` : `当前节气：${currentSolarTerm.name}`,
      highlight: todayRecipe?.name,
    },
    {
      id: 'news',
      title: '新闻聚合',
      icon: Newspaper,
      link: '/life',
      category: 'life',
      summary: `${todayNews.length} 条未读新闻`,
      highlight: todayNews.length > 0 ? String(todayNews.length) : undefined,
    },
    {
      id: 'health',
      title: '健康追踪',
      icon: Activity,
      link: '/life',
      category: 'life',
      summary: todayHealth?.weight ? `今日体重：${todayHealth.weight}kg` : '今日尚未记录',
      highlight: todayHealth?.weight ? `${todayHealth.weight}kg` : undefined,
    },
    {
      id: 'inspiration',
      title: '灵感创意库',
      icon: Lightbulb,
      link: '/life',
      category: 'life',
      summary: `共收藏 ${appStorage.get('inspirations', []).length} 条灵感`, // 已修正
    },
    {
      id: 'tasks',
      title: '工作清单',
      icon: CheckSquare,
      link: '/work',
      category: 'work',
      summary: `${pendingTasks.length} 项待办任务`,
      highlight: highPriorityTasks.length > 0 ? `${highPriorityTasks.length} 项高优先级` : undefined,
      urgent: highPriorityTasks.length > 0,
    },
    {
      id: 'review',
      title: '工作复盘',
      icon: FileText,
      link: '/work',
      category: 'work',
      summary: `本周完成 ${weekReviews.length} 次复盘`,
      highlight: weekReviews.length > 0 ? String(weekReviews.length) : undefined,
    },
    {
      id: 'contacts',
      title: '人脉管理',
      icon: Users,
      link: '/work',
      category: 'work',
      summary: `共 ${appStorage.get('contacts', []).length} 位联系人`, // 已修正
    },
  ];

  // 4. 排序逻辑：增加 settings 存在的保护
  const moduleOrder = settings?.moduleOrder || [];
  
  const sortedModules = [...moduleCards].sort((a, b) => {
    const orderA = moduleOrder.find(m => m.id === a.id)?.order ?? 99;
    const orderB = moduleOrder.find(m => m.id === b.id)?.order ?? 99;
    return orderA - orderB;
  });

  const visibleModules = sortedModules.filter(m => {
    const moduleConfig = moduleOrder.find(mo => mo.id === m.id);
    return moduleConfig?.visible !== false;
  });

  const lifeModules = visibleModules.filter(m => m.category === 'life');
  const workModules = visibleModules.filter(m => m.category === 'work');

  return (
    <div className="space-y-8 p-4">
      <div className={`text-center py-8 ${settings?.minimalMode ? 'py-4' : ''}`}>
        <h1 className="text-3xl font-bold text-primary">himi的小屋🛖</h1>
        {!settings?.minimalMode && (
          <p className="text-gray-500 mt-2">生活与工作一体化管理 · 专注实用</p>
        )}
      </div>

      {!settings?.minimalMode && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center bg-blue-50/50 p-4">
            <Calendar className="mx-auto text-primary mb-2" size={24} />
            <p className="text-sm text-gray-500">当前节气</p>
            <p className="text-lg font-bold text-primary">{currentSolarTerm.name}</p>
          </Card>
          <Card className="text-center bg-orange-50/50 p-4">
            <CheckSquare className="mx-auto text-accent mb-2" size={24} />
            <p className="text-sm text-gray-500">待办任务</p>
            <p className="text-lg font-bold text-accent">{pendingTasks.length}</p>
          </Card>
          <Card className="text-center bg-indigo-50/50 p-4">
            <Newspaper className="mx-auto text-blue-500 mb-2" size={24} />
            <p className="text-sm text-gray-500">未读新闻</p>
            <p className="text-lg font-bold text-blue-500">{todayNews.length}</p>
          </Card>
          <Card className="text-center bg-green-50/50 p-4">
            <TrendingUp className="mx-auto text-green-500 mb-2" size={24} />
            <p className="text-sm text-gray-500">本周复盘</p>
            <p className="text-lg font-bold text-green-500">{weekReviews.length}</p>
          </Card>
        </div>
      )}

      <section>
        <h2 className="text-xl font-bold text-primary mb-4">生活板块</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {lifeModules.map(module => (
            <Link key={module.id} to={module.link}>
              <Card hover className="h-full p-4 transition-all">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <module.icon size={24} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{module.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 truncate">{module.summary}</p>
                    {module.highlight && <p className="text-sm text-accent font-bold mt-1">{module.highlight}</p>}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-primary mb-4">工作板块</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workModules.map(module => (
            <Link key={module.id} to={module.link}>
              <Card hover className={`h-full p-4 ${module.urgent ? 'border-accent ring-1 ring-accent/20' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${module.urgent ? 'bg-accent/20' : 'bg-primary/10'}`}>
                    <module.icon size={24} className={module.urgent ? 'text-accent' : 'text-primary'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{module.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 truncate">{module.summary}</p>
                    {module.highlight && (
                      <p className={`text-sm font-bold mt-1 ${module.urgent ? 'text-red-500' : 'text-accent'}`}>
                        {module.highlight}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
