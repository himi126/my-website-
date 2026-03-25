import React, { useState } from 'react';
import { Settings, Download, Upload, Moon, Sun, GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Card, CardHeader } from './Card';
import { Button } from './Button';
import { useApp } from './AppContext';
import { appStorage } from './appStorage';
import type { ModuleOrder } from './index.ts';

export const SettingsPage: React.FC = () => {
  const { settings, toggleMinimalMode, updateModuleOrder } = useApp();
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 导出数据
  const handleExport = () => {
    const data = appStorage.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal-toolkit-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入数据
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storage.importData(content);
      setImportStatus(success ? 'success' : 'error');
      if (success) {
        setTimeout(() => window.location.reload(), 1000);
      }
    };
    reader.readAsText(file);
  };

  // 清除所有数据
  const handleClearData = () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // 模块排序
  const handleMoveModule = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...settings.moduleOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index].order;
    newOrder[index].order = newOrder[targetIndex].order;
    newOrder[targetIndex].order = temp;

    updateModuleOrder(newOrder.sort((a, b) => a.order - b.order));
  };

  // 切换模块可见性
  const handleToggleVisibility = (id: string) => {
    const newOrder = settings.moduleOrder.map(m =>
      m.id === id ? { ...m, visible: !m.visible } : m
    );
    updateModuleOrder(newOrder);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
        <Settings className="text-accent" />
        个人设置
      </h1>

      {/* 显示模式 */}
      <Card>
        <CardHeader title="显示模式" subtitle="切换页面显示风格" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.minimalMode ? <Moon size={24} className="text-primary" /> : <Sun size={24} className="text-accent" />}
            <div>
              <p className="font-medium">{settings.minimalMode ? '极简模式' : '标准模式'}</p>
              <p className="text-sm text-gray-500">
                {settings.minimalMode ? '隐藏装饰元素，仅保留核心功能' : '完整显示所有界面元素'}
              </p>
            </div>
          </div>
          <Button variant={settings.minimalMode ? 'secondary' : 'outline'} onClick={toggleMinimalMode}>
            {settings.minimalMode ? '关闭极简模式' : '开启极简模式'}
          </Button>
        </div>
      </Card>

      {/* 模块排序 */}
      <Card>
        <CardHeader title="模块排序" subtitle="拖动调整首页模块显示顺序，点击眼睛图标隐藏/显示模块" />
        <div className="space-y-2">
          {settings.moduleOrder
            .sort((a, b) => a.order - b.order)
            .map((module, index) => (
              <div
                key={module.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  module.visible ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
                }`}
              >
                <GripVertical size={18} className="text-gray-400" />
                <span className={`flex-1 ${module.visible ? '' : 'text-gray-400'}`}>{module.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveModule(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-primary disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveModule(index, 'down')}
                    disabled={index === settings.moduleOrder.length - 1}
                    className="p-1 text-gray-400 hover:text-primary disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => handleToggleVisibility(module.id)}
                    className={`p-1 ${module.visible ? 'text-primary' : 'text-gray-400'}`}
                  >
                    {module.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* 数据管理 */}
      <Card>
        <CardHeader title="数据管理" subtitle="导出备份或导入已有数据" />
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExport}>
              <Download size={16} className="mr-1" /> 导出数据备份
            </Button>
            <label>
              <Button variant="outline" as="span">
                <Upload size={16} className="mr-1" /> 导入数据
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
          {importStatus === 'success' && (
            <p className="text-sm text-green-500">数据导入成功，正在刷新页面...</p>
          )}
          {importStatus === 'error' && (
            <p className="text-sm text-red-500">数据导入失败，请检查文件格式</p>
          )}
        </div>
      </Card>

      {/* 危险操作 */}
      <Card className="border-red-200">
        <CardHeader title="危险操作" subtitle="以下操作不可恢复，请谨慎操作" />
        <Button variant="danger" onClick={handleClearData}>
          <Trash2 size={16} className="mr-1" /> 清除所有数据
        </Button>
      </Card>

      {/* 关于 */}
      <Card>
        <CardHeader title="关于" />
        <div className="text-sm text-gray-500 space-y-1">
          <p>我的个人工具站 - 生活与工作一体化管理</p>
          <p>版本：1.0.0</p>
          <p>所有数据存储在本地浏览器中，无需联网即可使用</p>
        </div>
      </Card>
    </div>
  );
};
