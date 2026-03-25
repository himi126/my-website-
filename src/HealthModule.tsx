import React, { useState, useEffect } from 'react';
import { Activity, Plus, TrendingUp, TrendingDown, AlertTriangle, Droplets, Moon, Footprints } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader } from '../UI/Card';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';
import { Input } from '../UI/Input';
import { storage, generateId, formatDate } from '../../lib/storage';
import type { HealthRecord } from '../../types';

export const HealthModule: React.FC = () => {
  const [records, setRecords] = useState<HealthRecord[]>(() => storage.get('health-records', []));
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

  useEffect(() => {
    storage.set('health-records', records);
  }, [records]);

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

    // 检查是否已有同日记录，有则更新
    const existingIndex = records.findIndex(r => r.date === form.date);
    if (existingIndex >= 0) {
      const updated = [...records];
      updated[existingIndex] = { ...updated[existingIndex], ...newRecord, id: updated[existingIndex].id };
      setRecords(updated);
    } else {
      setRecords([newRecord, ...records].sort((a, b) => b.date.localeCompare(a.date)));
    }

    setShowModal(false);
    setForm({
      date: formatDate(new Date()),
      weight: '',
      systolic: '',
      diastolic: '',
      bloodSugar: '',
      sleepHours: '',
      waterIntake: '',
      exerciseMinutes: '',
    });
  };

  // 获取时间范围内的数据
  const getFilteredData = () => {
    const now = new Date();
    const cutoff = new Date();
    if (viewRange === 'week') {
      cutoff.setDate(now.getDate() - 7);
    } else {
      cutoff.setMonth(now.getMonth() - 1);
    }
    return records
      .filter(r => new Date(r.date) >= cutoff)
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const filteredData = getFilteredData();

  // 计算趋势和异常
  const getStats = () => {
    if (filteredData.length < 2) return null;

    const latestWeight = filteredData.filter(r => r.weight).slice(-1)[0]?.weight;
    const previousWeight = filteredData.filter(r => r.weight).slice(-2, -1)[0]?.weight;
    const weightTrend = latestWeight && previousWeight ? latestWeight - previousWeight : 0;

    const latestBP = filteredData.filter(r => r.bloodPressure).slice(-1)[0]?.bloodPressure;
    const bpWarning = latestBP && (latestBP.systolic >= 140 || latestBP.diastolic >= 90);

    const avgSleep = filteredData.filter(r => r.sleepHours).reduce((sum, r) => sum + (r.sleepHours || 0), 0) /
      (filteredData.filter(r => r.sleepHours).length || 1);

    const avgWater = filteredData.filter(r => r.waterIntake).reduce((sum, r) => sum + (r.waterIntake || 0), 0) /
      (filteredData.filter(r => r.waterIntake).length || 1);

    return { latestWeight, weightTrend, latestBP, bpWarning, avgSleep, avgWater };
  };

  const stats = getStats();

  // 图表数据
  const chartData = filteredData.map(r => ({
    date: r.date.substring(5),
    weight: r.weight,
    systolic: r.bloodPressure?.systolic,
    diastolic: r.bloodPressure?.diastolic,
    bloodSugar: r.bloodSugar,
    sleep: r.sleepHours,
    water: r.waterIntake,
    exercise: r.exerciseMinutes,
  }));

  // 找出峰值和谷值
  const findPeakValley = (data: number[]) => {
    if (data.length === 0) return { peak: null, valley: null };
    const valid = data.filter(d => d !== undefined && d !== null) as number[];
    if (valid.length === 0) return { peak: null, valley: null };
    return {
      peak: Math.max(...valid),
      valley: Math.min(...valid),
    };
  };

  const weightStats = findPeakValley(chartData.map(d => d.weight).filter(Boolean) as number[]);

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Activity className="text-accent" />
            健康数据追踪
          </h2>
          <p className="text-gray-500 mt-1">记录并可视化你的健康数据</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewRange('week')}
              className={`px-3 py-1.5 text-sm ${viewRange === 'week' ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}
            >
              周视图
            </button>
            <button
              onClick={() => setViewRange('month')}
              className={`px-3 py-1.5 text-sm ${viewRange === 'month' ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}
            >
              月视图
            </button>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} className="mr-1" /> 记录数据
          </Button>
        </div>
      </div>

      {/* 今日概览 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">体重</p>
                <p className="text-xl font-bold">
                  {stats.latestWeight ? <span className="text-accent">{stats.latestWeight}</span> : '-'} kg
                </p>
                {stats.weightTrend !== 0 && (
                  <p className={`text-xs flex items-center gap-1 ${stats.weightTrend > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {stats.weightTrend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {stats.weightTrend > 0 ? '+' : ''}{stats.weightTrend.toFixed(1)} kg
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card className={stats.bpWarning ? 'border-red-300 bg-red-50' : ''}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats.bpWarning ? 'bg-red-100' : 'bg-primary/10'}`}>
                {stats.bpWarning && <AlertTriangle size={24} className="text-red-500" />}
                {!stats.bpWarning && <Activity size={24} className="text-primary" />}
              </div>
              <div>
                <p className="text-sm text-gray-500">血压</p>
                <p className="text-xl font-bold">
                  {stats.latestBP
                    ? <><span className="text-accent">{stats.latestBP.systolic}</span>/<span className="text-accent">{stats.latestBP.diastolic}</span></>
                    : '-/-'
                  } mmHg
                </p>
                {stats.bpWarning && <p className="text-xs text-red-500">血压偏高，请注意</p>}
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Moon size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">平均睡眠</p>
                <p className="text-xl font-bold">
                  <span className="text-accent">{stats.avgSleep.toFixed(1)}</span> 小时
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Droplets size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">平均饮水</p>
                <p className="text-xl font-bold">
                  <span className="text-accent">{stats.avgWater.toFixed(0)}</span> ml
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 体重趋势图 */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader
            title="体重趋势"
            subtitle={weightStats.peak ? `峰值: ${weightStats.peak}kg / 谷值: ${weightStats.valley}kg` : undefined}
          />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#7B2CBF"
                  strokeWidth={2}
                  dot={{ fill: '#7B2CBF', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#FFD700' }}
                  name="体重(kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* 血压趋势图 */}
      {chartData.some(d => d.systolic) && (
        <Card>
          <CardHeader title="血压趋势" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[60, 160]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  stroke="#7B2CBF"
                  strokeWidth={2}
                  name="收缩压"
                  dot={{ fill: '#7B2CBF' }}
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  stroke="#FFD700"
                  strokeWidth={2}
                  name="舒张压"
                  dot={{ fill: '#FFD700' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* 生活指标 */}
      {chartData.some(d => d.sleep || d.water || d.exercise) && (
        <Card>
          <CardHeader title="生活指标" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sleep"
                  stroke="#7B2CBF"
                  strokeWidth={2}
                  name="睡眠(小时)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="exercise"
                  stroke="#FFD700"
                  strokeWidth={2}
                  name="运动(分钟)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {records.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Activity size={48} className="mx-auto mb-4 opacity-50" />
          <p>暂无健康数据，开始记录吧</p>
        </div>
      )}

      {/* 记录数据弹窗 */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="记录健康数据" size="md">
        <div className="space-y-4">
          <Input
            label="日期"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <Input
            label="体重 (kg)"
            type="number"
            step="0.1"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
            placeholder="如：65.5"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="收缩压 (mmHg)"
              type="number"
              value={form.systolic}
              onChange={(e) => setForm({ ...form, systolic: e.target.value })}
              placeholder="如：120"
            />
            <Input
              label="舒张压 (mmHg)"
              type="number"
              value={form.diastolic}
              onChange={(e) => setForm({ ...form, diastolic: e.target.value })}
              placeholder="如：80"
            />
          </div>
          <Input
            label="空腹血糖 (mmol/L)"
            type="number"
            step="0.1"
            value={form.bloodSugar}
            onChange={(e) => setForm({ ...form, bloodSugar: e.target.value })}
            placeholder="如：5.5"
          />
          <Input
            label="睡眠时长 (小时)"
            type="number"
            step="0.5"
            value={form.sleepHours}
            onChange={(e) => setForm({ ...form, sleepHours: e.target.value })}
            placeholder="如：7.5"
          />
          <Input
            label="饮水量 (ml)"
            type="number"
            value={form.waterIntake}
            onChange={(e) => setForm({ ...form, waterIntake: e.target.value })}
            placeholder="如：2000"
          />
          <Input
            label="运动时长 (分钟)"
            type="number"
            value={form.exerciseMinutes}
            onChange={(e) => setForm({ ...form, exerciseMinutes: e.target.value })}
            placeholder="如：30"
          />
          <Button onClick={handleSaveRecord} className="w-full">
            保存记录
          </Button>
        </div>
      </Modal>
    </div>
  );
};
