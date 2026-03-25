import React, { createContext, useContext, useState, ReactNode } from 'react';
// 注意：这里我们强制指向当前目录下的 storage 文件
import { appStorage } from './appStorage';

export const AppContext = createContext<any>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState({ minimalMode: false });

  return (
    <AppContext.Provider value={{ settings, setSettings, appStorage }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
