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
  // 1. 初始化状态：增加 Array.isArray 检查，确保 records 永远是数组
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

  // 自动保存
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

    // 使用防御性编程，防止 records 为空
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

  // 获取时间范围内的数据（增加空数组保护）
  const getFilteredData = () => {
    const safeRecords = Array.isArray(records) ? records : [];
    const now = new Date();
    const cutoff = new Date();
  if (viewRange === 'week') {  // ⬅️ 检查这里是否有引号闭合和括号
      cutoff.setDate(now.getDate() - 7);
    } else {
      cutoff.setMonth(now.getMonth() - 1);
    }
