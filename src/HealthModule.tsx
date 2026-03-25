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
      .sort((a, b) => (a.date || '').localeCompare(b
