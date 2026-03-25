import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Home, Heart, Briefcase, Settings } from 'lucide-react';
import { useApp } from './AppContext';

export const Layout: React.FC = () => {
  const { settings, setSettings } = useApp();
  const location = useLocation();

  // 安全获取极简模式状态，默认关闭
  const isMinimal = settings?.minimalMode || false;

  const toggleMinimalMode = () => {
    // 确保 setSettings 存在并正确更新状态
    if (setSettings) {
      setSettings({
        ...settings,
        minimalMode: !isMinimal
      });
    }
  };

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/life', label: '生活板块', icon: Heart },
    { path: '/work', label: '工作板块', icon: Briefcase },
    { path: '/settings', label: '个人设置', icon: Settings },
  ];

  return (
    <div className={`min-h-screen transition-colors ${isMinimal ? 'bg-gray-50' : 'bg-white'}`}>
      {/* 顶部导航栏 */}
      <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link title="回到首页" to="/" className="text-xl font-bold flex items-center gap-2">
                我的个人工具站
              </Link>
              
              <div className="hidden md:flex gap-6">
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`hover:text-accent transition-colors pb-1 border-b-2 ${
                      location.pathname === item.path ? 'border-accent text-accent' : 'border-transparent'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* 极简模式切换按钮 */}
              <button
                onClick={toggleMinimalMode}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
                title={isMinimal ? "切换到完整模式" : "切换到极简模式"}
              >
                {isMinimal ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 移动端底部导航 - 仅在非极简模式下显示更明显 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 z-50">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 ${
              location.pathname === item.path ? 'text-primary' : 'text-gray-400'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* 主体内容 */}
      <main className={`max-w-7xl mx-auto pb-20 md:pb-8 ${isMinimal ? 'pt-4' : 'pt-6'}`}>
        <Outlet />
      </main>
    </div>
  );
};
