import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Plus, TrendingUp, TrendingDown, AlertTriangle, Droplets, Moon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader } from './Card';
import { Button } from './Button';
import { Modal } from './Modal';
import { Input } from './Input';
import { appStorage, generateId, formatDate } from './appStorage';
import type { HealthRecord } from './index.ts';

export const HealthModule: React.FC = () => {
  // 1. 初始化：极其严格的空值保护
  const [records, setRecords] = useState<HealthRecord[]>(() => {
    try {
      const saved = appStorage.get('health-records', []);
      return Array.isArray(saved) ? saved.filter(r => r && typeof r === 'object' && r.date) : [];
    } catch {
      return [];
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [viewRange, setViewRange] = useState<'week' | 'month'>('week');
  const [form, setForm] = useState({
    date: formatDate(new Date()),
    weight: '', systolic: '', diastolic: '', bloodSugar: '',
    sleepHours: '', waterIntake: '', exerciseMinutes: '',
  });

  // 2. 自动保存
  useEffect(() => {
    appStorage.set('health-records', records || []);
  }, [records]);

  // 3. 过滤数据：确保返回的一定是数组
  const filteredData = useMemo(() => {
    const safeRecords = Array.isArray(records) ? records : [];
    const cutoff = new Date();
    viewRange === 'week' ? cutoff.setDate(cutoff.getDate() - 7) : cutoff.setMonth(cutoff.getMonth() - 1);
    
    return safeRecords
      .filter(r => r && r.date && new Date(r.date) >= cutoff)
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }, [records, viewRange]);

  // 4. 计算统计：全方位检查 undefined
  const stats = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;

    const weightRecords = filteredData.filter(r => r && typeof r.weight === 'number');
    const latestWeight = weightRecords.length > 0 ? weightRecords[weightRecords.length - 1].weight : null;
    const previousWeight = weightRecords.length > 1 ? weightRecords[weightRecords.length - 2].weight : null;

    const bpRecords = filteredData.filter(r => r && r.bloodPressure && typeof r.bloodPressure.systolic === 'number');
    const latestBP = bpRecords.length > 0 ? bpRecords[bpRecords.length - 1].bloodPressure : null;

    const sleepRecords = filteredData.filter(r => r && typeof r.sleepHours === 'number');
    const avgSleep = sleepRecords.length > 0 ? sleepRecords.reduce((s, r) => s + (r.sleepHours || 0), 0) / sleepRecords.length : 0;

    return { 
      latestWeight, 
      weightTrend: (latestWeight && previousWeight) ? latestWeight - previousWeight : 0,
      latestBP,
      bpWarning: latestBP ? (latestBP.systolic >= 140 || latestBP.diastolic >= 90) : false,
      avgSleep
    };
  }, [filteredData]);

  // 5. 保存逻辑
  const handleSaveRecord = () => {
    const newRecord: HealthRecord = {
      id: generateId(),
      date: form.date,
      weight: form.weight ? Number(form.weight) : undefined,
      bloodPressure: (form.systolic && form.diastolic) ? { systolic: Number(form.systolic), diastolic: Number(form.diastolic) } : undefined,
      bloodSugar: form.bloodSugar ? Number(form.bloodSugar) : undefined,
      sleepHours: form.sleepHours ? Number(form.sleepHours) : undefined,
    };

    setRecords(prev => {
      const current = Array.isArray(prev) ? prev : [];
      const idx = current.findIndex(r => r && r.date === form.date);
      if (idx >= 0) {
        const up = [...current];
        up[idx] = { ...up[idx], ...newRecord };
        return up;
      }
      return [newRecord, ...current].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    });

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Activity /> 健康看板</h2>
        <Button onClick={() => setShowModal(true)}><Plus size={16} /> 记录</Button>
      </div>

      {stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-xs text-gray-500">体重</p>
            <p className="text-lg font-bold">{stats.latestWeight || '--'} kg</p>
          </Card>
          <Card className={`p-4 ${stats.bpWarning ? 'bg-red-50' : ''}`}>
            <p className="text-xs text-gray-500">血压</p>
            <p className="text-lg font-bold">{stats.latestBP ? `${stats.latestBP.systolic}/${stats.latestBP.diastolic}` : '--/--'}</p>
          </Card>
        </div>
      ) : (
        <div className="p-8 text-center border-2 border-dashed rounded-xl text-gray-400">
          还没有数据，请点击右上角添加第一条记录
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="记录健康数据">
        <div className="space-y-4">
          <Input label="日期" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          <Input label="体重 (kg)" type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="高压" type="number" value={form.systolic} onChange={e => setForm({...form, systolic: e.target.value})} />
            <Input label="低压" type="number" value={form.diastolic} onChange={e => setForm({...form, diastolic: e.target.value})} />
          </div>
          <Button onClick={handleSaveRecord} className="w-full">保存</Button>
        </div>
      </Modal>
    </div>
  );
};
