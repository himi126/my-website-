import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Home, Heart, Briefcase, Settings, MessageSquare, Send, X, Trash2 } from 'lucide-react';
import { useApp } from './AppContext';
import { appStorage, generateId, formatDateTime } from './appStorage';

// 定义留言类型
interface Message {
  id: string;
  content: string;
  time: string;
  nickname: string;
}

export const Layout: React.FC = () => {
  const { settings, setSettings } = useApp();
  const location = useLocation();
  const [showMessageBar, setShowMessageBar] = useState(false);
  
  // 留言相关状态
  const [messages, setMessages] = useState<Message[]>(() => appStorage.get('guest-messages', []));
  const [inputValue, setInputValue] = useState('');
  const [nickname, setNickname] = useState('');

  // 极简模式状态
  const isMinimal = settings?.minimalMode || false;

  // 自动保存留言
  useEffect(() => {
    appStorage.set('guest-messages', messages);
  }, [messages]);

  // 发送留言逻辑
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: generateId(),
      content: inputValue,
      time: formatDateTime(new Date()),
      nickname: nickname.trim() || '神秘房客'
    };

    setMessages([newMessage, ...messages]);
    setInputValue(''); // 清空输入框
  };

  return (
    <div className="min-h-screen flex flex-col font-rounded">
      {/* 浅紫色 Banner */}
      <nav className="bg-[#f8f6ff] border-b border-purple-100 sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-purple-400 rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:rotate-12 transition-transform">
              <Home size={20} />
            </div>
            <span className="text-xl font-bold text-purple-900 tracking-tight">himi's cabin</span>
          </Link>

          {/* 导航按钮 */}
          <div className="hidden md:flex bg-white/60 p-1 rounded-2xl border border-purple-50">
            {[
              { path: '/', label: '首页' },
              { path: '/life', label: '生活' },
              { path: '/work', label: '工作' },
              { path: '/settings', label: '设置' },
            ].map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === item.path 
                  ? 'bg-purple-400 text-white shadow-sm' 
                  : 'text-purple-400 hover:bg-purple-100/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* 留言触发按钮 */}
          <button 
            onClick={() => setShowMessageBar(true)}
            className="relative p-2 bg-purple-100 text-purple-500 rounded-xl hover:bg-purple-200 transition-colors group"
          >
            <MessageSquare size={20} />
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-400 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                {messages.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="flex flex-1 max-w-7xl mx-auto w-full relative">
        <main className="flex-1 p-6">
          <Outlet />
        </main>

        {/* --- 留言侧边栏 --- */}
        <div className={`fixed inset-0 z-50 transition-visibility ${showMessageBar ? 'visible' : 'invisible'}`}>
          {/* 背景遮罩 */}
          <div className={`absolute inset-0 bg-purple-900/10 backdrop-blur-sm transition-opacity ${showMessageBar ? 'opacity-100' : 'opacity-0'}`} onClick={() => setShowMessageBar(false)} />
          
          <aside className={`absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl transition-transform duration-500 flex flex-col ${showMessageBar ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* 头部 */}
            <div className="p-6 border-b border-purple-50 flex justify-between items-center bg-[#fcfaff]">
              <div>
                <h3 className="text-lg font-bold text-purple-900 leading-none">留下你的痕迹吧～</h3>
                <p className="text-[10px] text-purple-300 mt-2 tracking-widest uppercase font-bold">Trace of visits</p>
              </div>
              <button onClick={() => setShowMessageBar(false)} className="p-2 hover:bg-purple-50 rounded-full text-purple-300 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* 留言列表区 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2">
                  <MessageSquare size={40} strokeWidth={1} />
                  <p className="text-sm italic">还没有人留言哦...</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="group relative bg-[#f9f8ff] p-4 rounded-2xl border border-purple-50 hover:border-purple-200 transition-all">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-purple-400">@{msg.nickname}</span>
                      <span className="text-[10px] text-gray-300">{msg.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{msg.content}</p>
                    {/* 删除按钮 */}
                    <button 
                      onClick={() => setMessages(messages.filter(m => m.id !== msg.id))}
                      className="absolute -top-2 -left-2 w-6 h-6 bg-white shadow-sm border border-red-50 text-red-300 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* 输入区 */}
            <div className="p-6 bg-[#fcfaff] border-t border-purple-50 space-y-3">
              <input 
                type="text" 
                placeholder="你的昵称 (选填)" 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-purple-50 rounded-xl text-sm focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              />
              <textarea 
                placeholder="想说点什么..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full h-24 px-4 py-3 bg-white border border-purple-50 rounded-2xl text-sm focus:ring-2 focus:ring-purple-200 outline-none resize-none transition-all"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="w-full py-3 bg-purple-400 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-500 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
              >
                <Send size={16} /> 发送痕迹
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
