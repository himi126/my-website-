import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Home, Heart, Briefcase, Settings, MessageSquare, Send } from 'lucide-react';
import { useApp } from './AppContext';

export const Layout: React.FC = () => {
  const { settings, setSettings } = useApp();
  const location = useLocation();
  const [showMessageBar, setShowMessageBar] = useState(false);

  const isMinimal = settings?.minimalMode || false;

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. 浅紫色 Banner 栏 */}
      <nav className="bg-[#f8f6ff] border-b border-purple-100 sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-purple-400 rounded-2xl flex items-center justify-center text-white shadow-sm">
              <Home size={20} />
            </div>
            <span className="text-xl font-bold text-purple-900 tracking-tight">himi's cabin</span>
          </Link>

          <div className="hidden md:flex bg-white/50 p-1 rounded-2xl border border-purple-50">
            {[
              { path: '/', label: '首页', icon: Home },
              { path: '/life', label: '生活', icon: Heart },
              { path: '/work', label: '工作', icon: Briefcase },
              { path: '/settings', label: '设置', icon: Settings },
            ].map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === item.path 
                  ? 'bg-purple-400 text-white shadow-md' 
                  : 'text-purple-400 hover:bg-purple-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <button 
            onClick={() => setShowMessageBar(!showMessageBar)}
            className="p-2 bg-purple-100 text-purple-500 rounded-xl hover:bg-purple-200 transition-colors"
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </nav>

      <div className="flex flex-1 max-w-7xl mx-auto w-full relative">
        {/* 2. 主内容区 */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>

        {/* 3. 留言边栏 (留下你的痕迹) */}
        <aside className={`fixed right-0 top-20 bottom-0 w-80 bg-white shadow-2xl border-l border-purple-50 transition-transform duration-500 z-40 p-6 ${showMessageBar ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col">
            <div className="mb-6 text-center">
              <h3 className="text-lg font-bold text-purple-900">留下你的痕迹吧～</h3>
              <p className="text-xs text-gray-400">所有相遇都有意义 ✨</p>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {/* 这里模拟几条留言 */}
              <div className="bg-purple-50 p-3 rounded-2xl text-sm border border-purple-100">
                <p className="text-purple-800 font-medium">路人甲:</p>
                <p className="text-gray-600">这个小屋太温馨啦！加油～</p>
              </div>
            </div>

            <div className="mt-auto">
              <textarea 
                placeholder="想对 himi 说点什么..."
                className="w-full h-24 p-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-purple-200 resize-none mb-2"
              />
              <button className="w-full py-3 bg-purple-400 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-500 transition-all">
                <Send size={16} /> 发送
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
