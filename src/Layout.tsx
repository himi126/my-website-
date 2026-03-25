import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useApp } from '../../context/AppContext';

export const Layout: React.FC = () => {
  const { settings } = useApp();

  return (
    <div className={`min-h-screen bg-gray-50 ${settings.minimalMode ? 'minimal-mode' : ''}`}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      {!settings.minimalMode && (
        <footer className="bg-white border-t py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            我的个人工具站 - 生活与工作一体化管理
          </div>
        </footer>
      )}
    </div>
  );
};
