import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useApp } from './AppContext';

const navItems = [
  { path: '/', label: '首页' },
  { path: '/life', label: '生活板块' },
  { path: '/work', label: '工作板块' },
  { path: '/settings', label: '个人设置' },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { settings, toggleMinimalMode } = useApp();

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">我的个人工具站</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative py-2 transition-colors hover:text-accent ${
                  location.pathname === item.path ? 'text-white' : 'text-white/80'
                }`}
              >
                {item.label}
                {location.pathname === item.path && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent" />
                )}
              </Link>
            ))}
            <button
              onClick={toggleMinimalMode}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title={settings.minimalMode ? '退出极简模式' : '开启极简模式'}
            >
              {settings.minimalMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleMinimalMode}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              {settings.minimalMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-primary border-t border-white/10">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 border-b border-white/10 transition-colors hover:bg-white/10 ${
                location.pathname === item.path
                  ? 'text-accent border-l-4 border-l-accent'
                  : 'text-white/80'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};
