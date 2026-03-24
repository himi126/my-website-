import React, { useState } from 'react';
import { ChefHat, Newspaper, Activity, Lightbulb } from 'lucide-react';
import { RecipeModule } from '../components/Modules/RecipeModule';
import { NewsModule } from '../components/Modules/NewsModule';
import { HealthModule } from '../components/Modules/HealthModule';
import { InspirationModule } from '../components/Modules/InspirationModule';
import { useApp } from '../context/AppContext';

type LifeTab = 'recipe' | 'news' | 'health' | 'inspiration';

const tabs = [
  { id: 'recipe' as LifeTab, label: '私人食谱', icon: ChefHat },
  { id: 'news' as LifeTab, label: '新闻聚合', icon: Newspaper },
  { id: 'health' as LifeTab, label: '健康追踪', icon: Activity },
  { id: 'inspiration' as LifeTab, label: '灵感创意库', icon: Lightbulb },
];

export const LifePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LifeTab>('recipe');
  const { settings } = useApp();

  const renderContent = () => {
    switch (activeTab) {
      case 'recipe':
        return <RecipeModule />;
      case 'news':
        return <NewsModule />;
      case 'health':
        return <HealthModule />;
      case 'inspiration':
        return <InspirationModule />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 侧边栏/标签栏 */}
      <div className="lg:w-48 flex-shrink-0">
        <div className="lg:sticky lg:top-24">
          <h2 className={`text-xl font-bold text-primary mb-4 ${settings.minimalMode ? 'hidden' : ''}`}>
            生活板块
          </h2>
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-primary/5 border border-gray-200'
                }`}
              >
                <tab.icon size={18} />
                <span className={settings.minimalMode ? 'hidden lg:inline' : ''}>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 min-w-0">
        {renderContent()}
      </div>
    </div>
  );
};
