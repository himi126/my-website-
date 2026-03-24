import React, { useState } from 'react';
import { CheckSquare, FileText, Users } from 'lucide-react';
import { TaskModule } from '../components/Modules/TaskModule';
import { ReviewModule } from '../components/Modules/ReviewModule';
import { ContactModule } from '../components/Modules/ContactModule';
import { useApp } from '../context/AppContext';

type WorkTab = 'tasks' | 'review' | 'contacts';

const tabs = [
  { id: 'tasks' as WorkTab, label: '工作清单', icon: CheckSquare },
  { id: 'review' as WorkTab, label: '工作复盘', icon: FileText },
  { id: 'contacts' as WorkTab, label: '人脉管理', icon: Users },
];

export const WorkPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<WorkTab>('tasks');
  const { settings } = useApp();

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return <TaskModule />;
      case 'review':
        return <ReviewModule />;
      case 'contacts':
        return <ContactModule />;
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
            工作板块
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
