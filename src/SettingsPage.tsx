import React from 'react';
import { Save, RefreshCw, Download, Upload, Trash2, Layout } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { useApp } from './AppContext';
import { appStorage } from './appStorage';

export const SettingsPage: React.FC = () => {
  const { settings, setSettings } = useApp();

  // 1. 安全获取配置，如果 settings 为空则提供默认值
  const safeSettings = settings || { minimalMode: false, moduleOrder: [] };
  const moduleOrder = Array.isArray(safeSettings.moduleOrder) ? safeSettings.moduleOrder : [];

  const handleToggleMinimal = () => {
    setSettings({ ...safeSettings, minimalMode: !safeSettings.minimalMode });
  };

  const handleExport = () => {
    const data = appStorage.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-tools-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleClearData = () => {
    if (window.confirm('确定要清空所有数据吗？此操作不可撤销！')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  // 定义所有可用模块，用于排序管理
  const allModules = [
    { id: 'recipe', name: '私人定制食谱' },
    { id: 'news', name: '新闻聚合' },
    { id: 'health', name: '健康追踪' },
    { id: 'inspiration', name: '灵感创意库' },
    { id: 'tasks', name: '工作清单' },
    { id: 'review', name: '工作复盘' },
    { id: 'contacts', name: '人脉管理' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
        <Layout className="text-accent" /> 个人设置
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 常规设置 */}
        <Card title="常规设置" className="p-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">极简模式</p>
              <p className="text-xs text-gray-500">隐藏首页装饰元素，仅保留核心模块</p>
            </div>
            <button
              onClick={handleToggleMinimal}
              className={`w-12 h-6 rounded-full transition-colors ${safeSettings.minimalMode ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${safeSettings.minimalMode ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        </Card>

        {/* 数据管理 */}
        <Card title="数据管理" className="p-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={handleExport} className="flex-1 text-sm py-2">
                <Download size={14} className="mr-1" /> 导出备份
              </Button>
              <Button variant="outline" onClick={() => document.getElementById('import-input')?.click()} className="flex-1 text-sm py-2">
                <Upload size={14} className="mr-1" /> 导入数据
              </Button>
              <input
                id="import-input"
                type="file"
                className="hidden"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      if (appStorage.importData(content)) {
                        alert('导入成功！页面即将刷新');
                        window.location.reload();
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </div>
            <Button variant="danger" onClick={handleClearData} className="w-full text-sm py-2 bg-red-50 text-red-600 hover:bg-red-100 border-red-200">
              <Trash2 size={14} className="mr-1" /> 清空本地所有数据
            </Button>
          </div>
        </Card>
      </div>

      {/* 模块可见性管理 */}
      <Card title="模块显示管理" className="p-4">
        <div className="space-y-2">
          {allModules.map(mod => {
            // 安全查找配置
            const config = moduleOrder.find(o => o && o.id === mod.id);
            const isVisible = config ? config.visible !== false : true;

            return (
              <div key={mod.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{mod.name}</span>
                <button
                  onClick={() => {
                    let newOrder = [...moduleOrder];
                    const idx = newOrder.findIndex(o => o && o.id === mod.id);
                    if (idx >= 0) {
                      newOrder[idx] = { ...newOrder[idx], visible: !isVisible };
                    } else {
                      newOrder.push({ id: mod.id, order: 99, visible: !isVisible });
                    }
                    setSettings({ ...safeSettings, moduleOrder: newOrder });
                  }}
                  className={`px-3 py-1 rounded text-xs font-bold ${isVisible ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
                >
                  {isVisible ? '显示中' : '已隐藏'}
                </button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
