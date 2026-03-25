import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../lib/storage';
import type { AppSettings, ModuleOrder } from '../types';

interface AppContextType {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  toggleMinimalMode: () => void;
  updateModuleOrder: (modules: ModuleOrder[]) => void;
}

const defaultModules: ModuleOrder[] = [
  { id: 'recipe', name: '私人定制食谱', visible: true, order: 1 },
  { id: 'news', name: '个性化新闻', visible: true, order: 2 },
  { id: 'tasks', name: '每日工作清单', visible: true, order: 3 },
  { id: 'review', name: '工作复盘', visible: true, order: 4 },
  { id: 'health', name: '健康数据追踪', visible: true, order: 5 },
  { id: 'inspiration', name: '灵感创意库', visible: true, order: 6 },
  { id: 'contacts', name: '人脉管理', visible: true, order: 7 },
];

const defaultSettings: AppSettings = {
  minimalMode: false,
  moduleOrder: defaultModules,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() =>
    storage.get('app-settings', defaultSettings)
  );

  useEffect(() => {
    storage.set('app-settings', settings);
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleMinimalMode = () => {
    setSettings(prev => ({ ...prev, minimalMode: !prev.minimalMode }));
  };

  const updateModuleOrder = (modules: ModuleOrder[]) => {
    setSettings(prev => ({ ...prev, moduleOrder: modules }));
  };

  return (
    <AppContext.Provider value={{ settings, updateSettings, toggleMinimalMode, updateModuleOrder }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
