import React, { useState, useEffect } from 'react';
import { Newspaper, Star, Check, RefreshCw, Filter, ExternalLink, Bookmark, Search } from 'lucide-react';
import { Card, CardHeader } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { appStorage, generateId } from './appStorage';
import type { NewsItem } from './index.ts';

// 模拟新闻数据
const mockNewsData: Omit<NewsItem, 'id' | 'isRead' | 'isFavorite'>[] = [
  { title: '2024设计趋势：极简主义的回归', summary: '从扁平化到新拟态，设计风格的演变正在重新定义数字产品的视觉语言...', source: '设计邦', category: 'design', url: '#', publishedAt: new Date().toISOString(), isImportant: true },
  { title: 'AI辅助设计工具的崛起', summary: '人工智能正在改变设计师的工作流程，从素材生成到布局优化...', source: '视觉中国', category: 'design', url: '#', publishedAt: new Date(Date.now() - 3600000).toISOString(), isImportant: false },
  { title: '央行释放稳增长信号', summary: '货币政策将继续保持稳健，为实体经济提供有力支持...', source: '财新网', category: 'finance', url: '#', publishedAt: new Date(Date.now() - 7200000).toISOString(), isImportant: true },
  { title: '科技股走势分析', summary: '纳斯达克指数创新高，投资者情绪回暖，AI概念股持续领涨...', source: '第一财经', category: 'finance', url: '#', publishedAt: new Date(Date.now() - 10800000).toISOString(), isImportant: false },
  { title: '春季养生：顺应时令调理身体', summary: '春季是养肝护肝的最佳时节，合理饮食搭配可以事半功倍...', source: '丁香医生', category: 'health', url: '#', publishedAt: new Date(Date.now() - 14400000).toISOString(), isImportant: true },
  { title: '中医养生：节气与饮食', summary: '根据二十四节气调整饮食习惯，是传统养生智慧的精髓所在...', source: '中医养生网', category: 'health', url: '#', publishedAt: new Date(Date.now() - 18000000).toISOString(), isImportant: false },
  { title: 'UI/UX设计师必备工具盘点', summary: 'Figma、Sketch、Adobe XD等主流设计工具的优劣对比与选择建议...', source: '设计邦', category: 'design', url: '#', publishedAt: new Date(Date.now() - 21600000).toISOString(), isImportant: false },
  { title: '房地产市场政策解读', summary: '多地出台房产新政，市场预期逐步改善，购房者信心回升...', source: '财新网', category: 'finance', url: '#', publishedAt: new Date(Date.now() - 25200000).toISOString(), isImportant: true },
];

const categoryLabels = {
  design: { label: '艺术设计', color: 'bg-purple-100 text-purple-700' },
  finance: { label: '财经资讯', color: 'bg-blue-100 text-blue-700' },
  health: { label: '健康养生', color: 'bg-green-100 text-green-700' },
};

export const NewsModule: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>(() => {
    const stored = appStorage.get<NewsItem[]>('news', []);
    if (stored.length === 0) {
      return mockNewsData.map(item => ({
        ...item,
        id: generateId(),
        isRead: false,
        isFavorite: false,
      }));
    }
    return stored;
  });
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'design' | 'finance' | 'health'>('all');
  const [showOnlyImportant, setShowOnlyImportant] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    appStorage.set('news', news);
  }, [news]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newNews = mockNewsData.map(item => ({
        ...item,
        id: generateId(),
        isRead: false,
        isFavorite: false,
        publishedAt: new Date().toISOString(),
      }));
      setNews(newNews);
      setIsRefreshing(false);
    }, 1000);
  };

  const handleToggleRead = (id: string) => {
    setNews(news.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
  };

  const handleToggleFavorite = (id: string) => {
    setNews(news.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n));
  };

  const filteredNews = news.filter(item => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (showOnlyImportant && !item.isImportant) return false;
    if (showOnlyFavorites && !item.isFavorite) return false;
    if (searchKeyword && !item.title.toLowerCase().includes(searchKeyword.toLowerCase()) &&
        !item.summary.toLowerCase().includes(searchKeyword.toLowerCase())) return false;
    return true;
  });

  const categoryCounts = {
    design: news.filter(n => n.category === 'design' && !n.isRead).length,
    finance: news.filter(n => n.category === 'finance' && !n.isRead).length,
    health: news.filter(n => n.category === 'health' && !n.isRead).length,
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Newspaper className="text-accent" />
            个性化新闻聚合
          </h2>
          <p className="text-gray-500 mt-1">追踪艺术设计、财经、养生领域最新资讯</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw size={16} className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? '刷新中...' : '刷新新闻'}
        </Button>
      </div>

      {/* 分类标签 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            categoryFilter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
              categoryFilter === cat
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {categoryLabels[cat].label}
            {categoryCounts[cat] > 0 && (
              <span className={`${categoryFilter === cat ? 'bg-white/20' : 'bg-accent text-black'} text-xs px-1.5 py-0.5 rounded-full`}>
                {categoryCounts[cat]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 筛选和搜索 */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={16} className="text-gray-400" />
          <Input
            placeholder="搜索新闻标题或内容..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="flex-1"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyImportant}
            onChange={(e) => setShowOnlyImportant(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-600">仅重要新闻</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyFavorites}
            onChange={(e) => setShowOnlyFavorites(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-600">仅收藏</span>
        </label>
      </div>

      {/* 新闻列表 */}
      <div className="space-y-4">
        {filteredNews.map(item => (
          <Card key={item.id} className={`transition-all ${item.isRead ? 'opacity-60' : ''}`}>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${categoryLabels[item.category].color}`}>
                    {categoryLabels[item.category].label}
                  </span>
                  {item.isImportant && (
                    <span className="text-xs px-2 py-0.5 rounded bg-accent text-black font-medium">重要</span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">{item.source}</span>
                </div>
                <h3 className={`font-semibold text-lg ${item.isRead ? 'text-gray-500' : 'text-gray-900'}`}>
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.summary}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs text-gray-400">
                    {new Date(item.publishedAt).toLocaleString('zh-CN')}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleToggleRead(item.id)}
                  className={`p-2 rounded-full hover:bg-gray-100 ${item.isRead ? 'text-green-500' : 'text-gray-400'}`}
                  title={item.isRead ? '标记为未读' : '标记为已读'}
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => handleToggleFavorite(item.id)}
                  className={`p-2 rounded-full hover:bg-gray-100 ${item.isFavorite ? 'text-accent' : 'text-gray-400'}`}
                  title={item.isFavorite ? '取消收藏' : '收藏'}
                >
                  <Bookmark size={18} fill={item.isFavorite ? 'currentColor' : 'none'} />
                </button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-primary"
                  title="查看原文"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Newspaper size={48} className="mx-auto mb-4 opacity-50" />
          <p>暂无符合条件的新闻</p>
        </div>
      )}
    </div>
  );
};
