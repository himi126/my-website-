import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Newspaper, CheckSquare, FileText, Activity, Lightbulb, Users, ArrowRight, Calendar, TrendingUp } from 'lucide-react';
import { Card } from './UI/Card';
import { useApp } from './AppContext';
import { appStorage, formatDate } from './appStorage';
import { getCurrentSolarTerm } from './solarTerms';
import type { Recipe, NewsItem, Task, HealthRecord, Review } from './types';

export const HomePage: React.FC = () => {
  const { settings } = useApp();
  const currentSolarTerm = getCurrentSolarTerm();

  // 加载各模块数据
  const recipes = storage.get<Recipe[]>('recipes', []);
  const news = storage.get<NewsItem[]>('news', []);
  const tasks = storage.get<Task[]>('tasks', []);
  const healthRecords = storage.get<HealthRecord[]>('health-records', []);
  const reviews = storage.get<Review[]>('reviews', []);

  // 今日食谱
  const todayRecipe = recipes.find(r => formatDate(r.createdAt) === formatDate(new Date()));

  // 未完成任务
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const highPriorityTasks = pendingTasks.filter(t => t.priority === 'high');

  // 今日新闻
  const todayNews = news.filter(n => !n.isRead).slice(0, 3);

  // 今日健康数据
  const todayHealth = healthRecords.find(r => r.date === formatDate(new Date()));

  // 本周复盘完成率
  const weekReviews = reviews.filter(r => {
    const reviewDate = new Date(r.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return reviewDate >= weekAgo;
  });

  const moduleCards = [
    {
      id: 'recipe',
      title: '私人定制食谱',
      icon: ChefHat,
      link: '/life',
      category: 'life',
      summary: todayRecipe
        ? `今日推荐：${todayRecipe.name}`
        : `当前节气：${currentSolarTerm.name}`,
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
      summary: todayHealth?.weight
        ? `今日体重：${todayHealth.weight}kg`
        : '今日尚未记录',
      highlight: todayHealth?.weight ? `${todayHealth.weight}kg` : undefined,
    },
    {
      id: 'inspiration',
      title: '灵感创意库',
      icon: Lightbulb,
      link: '/life',
      category: 'life',
      summary: `共收藏 ${storage.get('inspirations', []).length} 条灵感`,
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
      summary: `共 ${storage.get('contacts', []).length} 位联系人`,
    },
  ];

  // 根据用户设置排序模块
  const sortedModules = [...moduleCards].sort((a, b) => {
    const orderA = settings.moduleOrder.find(m => m.id === a.id)?.order || 99;
    const orderB = settings.moduleOrder.find(m => m.id === b.id)?.order || 99;
    return orderA - orderB;
  });

  const visibleModules = sortedModules.filter(m => {
    const moduleConfig = settings.moduleOrder.find(mo => mo.id === m.id);
    return moduleConfig?.visible !== false;
  });

  const lifeModules = visibleModules.filter(m => m.category === 'life');
  const workModules = visibleModules.filter(m => m.category === 'work');

  return (
    <div className="space-y-8">
      {/* Logo区域 */}
      <div className={`text-center py-8 ${settings.minimalMode ? 'py-4' : ''}`}>
        <h1 className="text-3xl font-bold text-primary">我的个人工具站</h1>
        {!settings.minimalMode && (
          <p className="text-gray-500 mt-2">生活与工作一体化管理 · 专注实用</p>
        )}
      </div>

      {/* 今日概览 */}
      {!settings.minimalMode && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center bg-gradient-to-br from-primary/5 to-primary/10">
            <Calendar className="mx-auto text-primary mb-2" size={24} />
            <p className="text-sm text-gray-500">当前节气</p>
            <p className="text-lg font-bold text-primary">{currentSolarTerm.name}</p>
          </Card>
          <Card className="text-center bg-gradient-to-br from-accent/5 to-accent/10">
            <CheckSquare className="mx-auto text-accent mb-2" size={24} />
            <p className="text-sm text-gray-500">待办任务</p>
            <p className="text-lg font-bold text-accent">{pendingTasks.length}</p>
          </Card>
          <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100">
            <Newspaper className="mx-auto text-blue-500 mb-2" size={24} />
            <p className="text-sm text-gray-500">未读新闻</p>
            <p className="text-lg font-bold text-blue-500">{todayNews.length}</p>
          </Card>
          <Card className="text-center bg-gradient-to-br from-green-50 to-green-100">
            <TrendingUp className="mx-auto text-green-500 mb-2" size={24} />
            <p className="text-sm text-gray-500">本周复盘</p>
            <p className="text-lg font-bold text-green-500">{weekReviews.length}</p>
          </Card>
        </div>
      )}

      {/* 生活板块 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-primary">生活板块</h2>
          <Link to="/life" className="text-sm text-primary hover:text-accent flex items-center gap-1">
            查看全部 <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {lifeModules.map(module => (
            <Link key={module.id} to={module.link}>
              <Card hover className="h-full">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <module.icon size={24} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{module.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 truncate">{module.summary}</p>
                    {module.highlight && (
                      <p className="text-sm text-accent font-bold mt-1">{module.highlight}</p>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 工作板块 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-primary">工作板块</h2>
          <Link to="/work" className="text-sm text-primary hover:text-accent flex items-center gap-1">
            查看全部 <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workModules.map(module => (
            <Link key={module.id} to={module.link}>
              <Card hover className={`h-full ${module.urgent ? 'border-accent' : ''}`}>
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

      {/* 快捷操作提示 */}
      {!settings.minimalMode && (
        <div className="text-center text-sm text-gray-400 py-4">
          提示：点击右上角 <span className="inline-block w-4 h-4 align-text-bottom">🌙</span> 可切换极简模式
        </div>
      )}
    </div>
  );
};
