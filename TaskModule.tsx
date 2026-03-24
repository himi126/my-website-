import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, Edit, Clock, AlertTriangle, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { Card, CardHeader } from '../UI/Card';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';
import { Input, Textarea, Select } from '../UI/Input';
import { storage, generateId, formatDate } from '../../lib/storage';
import type { Task } from '../../types';

const priorityConfig = {
  high: { label: '高优先级', color: 'bg-accent text-black', border: 'border-l-4 border-accent' },
  medium: { label: '中优先级', color: 'bg-blue-100 text-blue-700', border: 'border-l-4 border-blue-400' },
  low: { label: '低优先级', color: 'bg-gray-100 text-gray-600', border: 'border-l-4 border-gray-300' },
};

const statusConfig = {
  todo: { label: '待办', color: 'text-gray-500' },
  inProgress: { label: '进行中', color: 'text-blue-500' },
  completed: { label: '已完成', color: 'text-green-500' },
};

export const TaskModule: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => storage.get('tasks', []));
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    dueDate: '',
  });

  useEffect(() => {
    storage.set('tasks', tasks);
  }, [tasks]);

  const resetForm = () => {
    setForm({ title: '', description: '', priority: 'medium', dueDate: '' });
    setEditingTask(null);
  };

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setForm({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: task.dueDate || '',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSaveTask = () => {
    if (!form.title.trim()) return;

    if (editingTask) {
      setTasks(tasks.map(t =>
        t.id === editingTask.id
          ? { ...t, ...form }
          : t
      ));
    } else {
      const newTask: Task = {
        id: generateId(),
        title: form.title,
        description: form.description,
        priority: form.priority,
        status: 'todo',
        dueDate: form.dueDate,
        createdAt: new Date().toISOString(),
      };
      setTasks([newTask, ...tasks]);
    }
    setShowModal(false);
    resetForm();
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleStatusChange = (id: string, status: Task['status']) => {
    setTasks(tasks.map(t =>
      t.id === id
        ? { ...t, status, completedAt: status === 'completed' ? new Date().toISOString() : undefined }
        : t
    ));
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'completed') return false;
    return new Date(task.dueDate) < new Date();
  };

  const isDueSoon = (task: Task) => {
    if (!task.dueDate || task.status === 'completed') return false;
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    return diff > 0 && diff < 24 * 60 * 60 * 1000; // 24小时内
  };

  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const todoTasks = activeTasks.filter(t => t.status === 'todo');
  const inProgressTasks = activeTasks.filter(t => t.status === 'inProgress');

  // 按周统计
  const getWeekStats = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekTasks = tasks.filter(t => new Date(t.createdAt) >= weekStart);
    const completed = weekTasks.filter(t => t.status === 'completed').length;
    return { total: weekTasks.length, completed };
  };

  const weekStats = getWeekStats();

  const TaskItem: React.FC<{ task: Task }> = ({ task }) => (
    <Card className={`${priorityConfig[task.priority].border} ${task.status === 'completed' ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.status === 'completed'}
          onChange={() => handleStatusChange(task.id, task.status === 'completed' ? 'todo' : 'completed')}
          className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded ${priorityConfig[task.priority].color}`}>
              {priorityConfig[task.priority].label}
            </span>
            {task.status !== 'completed' && (
              <Select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                options={[
                  { value: 'todo', label: '待办' },
                  { value: 'inProgress', label: '进行中' },
                ]}
                className="text-xs py-0.5 px-1 h-auto w-auto"
              />
            )}
          </div>
          <h4 className={`font-medium mt-1 ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
          )}
          {task.dueDate && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              isOverdue(task) ? 'text-red-500' : isDueSoon(task) ? 'text-primary' : 'text-gray-400'
            }`}>
              {isOverdue(task) && <AlertTriangle size={12} />}
              <Clock size={12} />
              截止：{formatDate(task.dueDate)}
              {isOverdue(task) && <span className="font-medium">（已逾期）</span>}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => handleOpenModal(task)}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-primary"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <CheckSquare className="text-accent" />
            每日工作清单
          </h2>
          <p className="text-gray-500 mt-1">
            今日待办 <span className="text-accent font-bold">{activeTasks.length}</span> 项，
            本周完成 <span className="text-accent font-bold">{weekStats.completed}</span>/{weekStats.total} 项
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 text-sm ${viewMode === 'day' ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}
            >
              日视图
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-sm ${viewMode === 'week' ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}
            >
              周视图
            </button>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={16} className="mr-1" /> 添加任务
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-400">{todoTasks.length}</p>
          <p className="text-sm text-gray-500 mt-1">待办</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-500">{inProgressTasks.length}</p>
          <p className="text-sm text-gray-500 mt-1">进行中</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-accent">{completedTasks.length}</p>
          <p className="text-sm text-gray-500 mt-1">已完成</p>
        </Card>
      </div>

      {/* 任务列表 */}
      <div className="space-y-6">
        {/* 进行中 */}
        {inProgressTasks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-blue-500 mb-3 flex items-center gap-2">
              <Clock size={18} /> 进行中
            </h3>
            <div className="space-y-3">
              {inProgressTasks.map(task => <TaskItem key={task.id} task={task} />)}
            </div>
          </div>
        )}

        {/* 待办 */}
        {todoTasks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-500 mb-3 flex items-center gap-2">
              <Calendar size={18} /> 待办
            </h3>
            <div className="space-y-3">
              {todoTasks
                .sort((a, b) => {
                  const priorityOrder = { high: 0, medium: 1, low: 2 };
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                })
                .map(task => <TaskItem key={task.id} task={task} />)}
            </div>
          </div>
        )}

        {activeTasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <CheckSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p>暂无待办任务</p>
          </div>
        )}

        {/* 已完成 */}
        {completedTasks.length > 0 && (
          <div>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
            >
              {showArchived ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              <span className="font-medium">已完成（{completedTasks.length}）</span>
            </button>
            {showArchived && (
              <div className="space-y-3 mt-3">
                {completedTasks.map(task => <TaskItem key={task.id} task={task} />)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 添加/编辑任务弹窗 */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingTask ? '编辑任务' : '添加任务'}
      >
        <div className="space-y-4">
          <Input
            label="任务标题"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="输入任务标题"
          />
          <Textarea
            label="任务描述"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="可选的任务描述"
            rows={3}
          />
          <Select
            label="优先级"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as Task['priority'] })}
            options={[
              { value: 'high', label: '高优先级' },
              { value: 'medium', label: '中优先级' },
              { value: 'low', label: '低优先级' },
            ]}
          />
          <Input
            label="截止日期"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
          <Button onClick={handleSaveTask} className="w-full" disabled={!form.title.trim()}>
            {editingTask ? '保存修改' : '添加任务'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
