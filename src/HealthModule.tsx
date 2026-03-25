import React, { useState, useEffect } from 'react';
import { Activity, Plus, TrendingUp, TrendingDown, AlertTriangle, Droplets, Moon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader } from './Card';
import { Button } from './Button';
import { Modal } from './Modal';
import { Input } from './Input';
import { appStorage, generateId, formatDate } from './appStorage';
import type { HealthRecord } from './index.ts';

export const HealthModule: React.FC = () => {
  // 初始化状态：确保 records 永远是数组，防止出现 "reading find" 错误
  const [records, setRecords] = useState<HealthRecord[]>(() => {
    const saved = appStorage.get('health-records', []);
    return Array.isArray(saved) ? saved : [];
  });
  
  const [showModal, setShowModal] = useState(false);
  const [viewRange, setViewRange] = useState<'week' | 'month'>('week');

  const [form, setForm] = useState({
    date: formatDate(new Date()),
    weight: '',
    systolic: '',
    diastolic: '',
    bloodSugar: '',
    sleepHours: '',
    waterIntake: '',
    exerciseMinutes: '',
  });

  // 自动保存到本地存储
  useEffect(() => {
    appStorage.set('health-records', records || []);
  }, [records]);

  // 保存记录逻辑
  const handleSaveRecord = () => {
    const newRecord: HealthRecord = {
      id: generateId(),
      date: form.date,
      weight: form.weight ? Number(form.weight) : undefined,
      bloodPressure: form.systolic && form.diastolic
        ? { systolic: Number(form.systolic), diastolic: Number(form.diastolic) }
        : undefined,
      bloodSugar: form.bloodSugar ? Number(form.bloodSugar) : undefined,
      sleepHours: form.sleepHours ? Number(form.sleepHours) : undefined,
      waterIntake: form.waterIntake ? Number(form.waterIntake) : undefined,
      exerciseMinutes: form.exerciseMinutes ? Number(form.exerciseMinutes) : undefined,
    };

    const currentRecords = Array.isArray(records) ? records : [];
    const existingIndex = currentRecords.findIndex(r => r && r.date === form.date);
    
    if (existingIndex >= 0) {
      const updated = [...currentRecords];
      updated[existingIndex] = { ...updated[existingIndex], ...newRecord, id: updated[existingIndex].id };
      setRecords(updated);
    } else {
      setRecords([newRecord, ...currentRecords].sort((a, b) => (b.date || '').localeCompare(a.date || '')));
    }

    setShowModal(false);
    setForm({
      date: formatDate(new Date()),
      weight: '', systolic: '', diastolic: '', bloodSugar: '',
      sleepHours: '', waterIntake: '', exerciseMinutes: '',
    });
  };

  // 获取过滤后的数据
  const getFilteredData = () => {
    const safeRecords = Array.isArray(records) ? records : [];
    const now = new Date();
    const cutoff = new Date();
    
    // 修正了之前报错的字符串未闭合问题
    if (viewRange === 'week') {
      cutoff.setDate(now.getDate() - 7);
    } else {
      cutoff.setMonth(now.getMonth() - 1);
    }
    
    return safeRecords
      .filter(r => r && r.date && new Date(r.date) >= cutoff)
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  };

  const filteredData = getFilteredData();

  // 计算健康统计数据
  const getStats = () => {
    if (!filteredData || filteredData.length < 2) return null;

    const weightRecords = filteredData.filter(r => r?.weight);
    const latestWeight = weightRecords[weightRecords.length - 1]?.weight;
    const previousWeight = weightRecords[weightRecords.length - 2]?.weight;
    const weightTrend = latestWeight && previousWeight ? latestWeight - previousWeight : 0;

    const bpRecords = filteredData.filter(r => r?.bloodPressure);
    const latestBP = bpRecords[bpRecords.length - 1]?.bloodPressure;
    const bpWarning = latestBP && (latestBP.systolic >= 140 || latestBP.diastolic >= 90);

    const sleepRecords = filteredData.filter(r => r?.sleepHours !== undefined);
    const avgSleep = sleepRecords.reduce((sum, r) => sum + (r.sleepHours || 0), 0) / (sleepRecords.length || 1);

    const waterRecords = filteredData.filter(r => r?.waterIntake !== undefined);
    const avgWater = waterRecords.reduce((sum, r) => sum + (r.waterIntake || 0), 0) / (waterRecords.length || 1);

    return { latestWeight, weightTrend, latestBP, bpWarning, avgSleep, avgWater };
  };

  const stats = getStats();

  // 图表数据转换
  const chartData = (filteredData || []).map(r => ({
    date: r.date ? r.date.substring(5) : '',
    weight: r.weight,
    systolic: r.bloodPressure?.systolic,
    diastolic: r.bloodPressure?.diastolic,
    bloodSugar: r.bloodSugar,
    sleep: r.sleepHours,
    water: r.waterIntake,
    exercise: r.exerciseMinutes,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Activity className="text-accent" /> 健康数据追踪
          </h2>
          <p className="text-gray-500 mt-1">可视化你的每日健康指标</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewRange('week')}
              className={`px-3 py-1.5 text-sm ${viewRange === 'week' ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}
            >周视图</button>
            <button
              onClick={() => setViewRange('month')}
              className={`px-3 py-1.5 text-sm ${viewRange === 'month' ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}
            >月视图</button>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} className="mr-1" /> 记录数据
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <div className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><Activity className="text-primary" /></div>
              <div>
                <p className="text-xs text-gray-500">最新体重</p>
                <p className="text-lg font-bold">{stats.latestWeight || '-'} kg</p>
                {stats.weightTrend !== 0 && (
                  <p className={`text-xs flex items-center ${stats.weightTrend > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {stats.weightTrend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(stats.weightTrend).toFixed(1)} kg
                  </p>
                )}
              </div>
            </div>
          </Card>
          <Card className={stats.bpWarning ? 'border-red-300 bg-red-50' : ''}>
            <div className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><AlertTriangle className={stats.bpWarning ? "text-red-500" : "text-primary"} /></div>
              <div>
                <p className="text-xs text-gray-500">最新血压</p>
                <p className="text-lg font-bold">
                  {stats.latestBP ? `${stats.latestBP.systolic}/${stats.latestBP.diastolic}` : '-/-'}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><Moon className="text-primary" /></div>
              <div>
                <p className="text-xs text-gray-500">平均睡眠</p>
                <p className="text-lg font-bold">{stats.avgSleep.toFixed(1)} h</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><Droplets className="text-primary" /></div>
              <div>
                <p className="text-xs text-gray-500">平均饮水</p>
                <p className="text-lg font-bold">{stats.avgWater.toFixed(0)} ml</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader title="健康趋势分析" />
        <div className="h-72 p-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="weight" stroke="#7B2CBF" strokeWidth={2} name="体重" />
                <Line type="monotone" dataKey="systolic" stroke="#FFD700" strokeWidth={2} name="收缩压" />
                <Line type="monotone" dataKey="sleep" stroke="#4CC9F0" strokeWidth={2} name="睡眠" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">暂无图表数据，请添加记录</div>
          )}
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="添加健康数据">
        <div className="space-y-4">
          <Input label="记录日期" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="体重 (kg)" type="number" step="0.1" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} />
            <Input label="空腹血糖" type="number" step="0.1" value={form.bloodSugar} onChange={e => setForm({...form, bloodSugar: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="收缩压 (高压)" type="number" value={form.systolic} onChange={e => setForm({...form, systolic: e.target.value})} />
            <Input label="舒张压 (低压)" type="number" value={form.diastolic} onChange={e => setForm({...form, diastolic: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="睡眠时长 (h)" type="number" step="0.5" value={form.sleepHours} onChange={e => setForm({...form, sleepHours: e.target.value})} />
            <Input label="饮水量 (ml)" type="number" value={form.waterIntake} onChange={e => setForm({...form, waterIntake: e.target.value})} />
          </div>
          <Button onClick={handleSaveRecord} className="w-full mt-2">保存记录</Button>
        </div>
      </Modal>
    </div>
  );
}; // 补全了之前缺失的闭合括号
