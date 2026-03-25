import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Download, Calendar, ChevronRight } from 'lucide-react';
import { Card, CardHeader } from '../UI/Card';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';
import { Input, Textarea, Select } from '../UI/Input';
import { storage, generateId, formatDate, formatDateTime } from '../../lib/storage';
import type { Review } from '../../types';

const reviewTypeConfig = {
  daily: { label: '日复盘', color: 'bg-green-100 text-green-700' },
  weekly: { label: '周复盘', color: 'bg-blue-100 text-blue-700' },
  monthly: { label: '月复盘', color: 'bg-purple-100 text-purple-700' },
};

export const ReviewModule: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(() => storage.get('reviews', []));
  const [showModal, setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [filterType, setFilterType] = useState<'all' | Review['type']>('all');

  const [form, setForm] = useState<Omit<Review, 'id' | 'createdAt'>>({
    type: 'daily',
    date: formatDate(new Date()),
    completedTasks: '',
    unfinishedReasons: '',
    improvements: '',
    nextPlan: '',
    customFields: [],
  });

  useEffect(() => {
    storage.set('reviews', reviews);
  }, [reviews]);

  const resetForm = () => {
    setForm({
      type: 'daily',
      date: formatDate(new Date()),
      completedTasks: '',
      unfinishedReasons: '',
      improvements: '',
      nextPlan: '',
      customFields: [],
    });
  };

  const handleSaveReview = () => {
    if (!form.completedTasks.trim()) return;

    const newReview: Review = {
      id: generateId(),
      ...form,
      createdAt: new Date().toISOString(),
    };
    setReviews([newReview, ...reviews]);
    setShowModal(false);
    resetForm();
  };

  const handleDeleteReview = (id: string) => {
    setReviews(reviews.filter(r => r.id !== id));
    if (selectedReview?.id === id) setSelectedReview(null);
  };

  const handleAddCustomField = () => {
    setForm({
      ...form,
      customFields: [...form.customFields, { label: '', value: '' }],
    });
  };

  const handleUpdateCustomField = (index: number, key: 'label' | 'value', value: string) => {
    const newFields = [...form.customFields];
    newFields[index] = { ...newFields[index], [key]: value };
    setForm({ ...form, customFields: newFields });
  };

  const handleRemoveCustomField = (index: number) => {
    setForm({
      ...form,
      customFields: form.customFields.filter((_, i) => i !== index),
    });
  };

  const handleExportPDF = (review: Review) => {
    const content = `
${reviewTypeConfig[review.type].label} - ${review.date}

【完成任务】
${review.completedTasks}

【未完成原因】
${review.unfinishedReasons}

【改进措施】
${review.improvements}

【下一步计划】
${review.nextPlan}

${review.customFields.map(f => `【${f.label}】\n${f.value}`).join('\n\n')}

---
生成时间：${formatDateTime(review.createdAt)}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `复盘_${review.type}_${review.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredReviews = filterType === 'all'
    ? reviews
    : reviews.filter(r => r.type === filterType);

  // 按月份分组
  const groupedReviews = filteredReviews.reduce((acc, review) => {
    const month = review.date.substring(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(review);
    return acc;
  }, {} as Record<string, Review[]>);

  // 统计
  const stats = {
    daily: reviews.filter(r => r.type === 'daily').length,
    weekly: reviews.filter(r => r.type === 'weekly').length,
    monthly: reviews.filter(r => r.type === 'monthly').length,
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <FileText className="text-accent" />
            工作复盘
          </h2>
          <p className="text-gray-500 mt-1">
            日复盘 <span className="text-accent font-bold">{stats.daily}</span> 篇，
            周复盘 <span className="text-accent font-bold">{stats.weekly}</span> 篇，
            月复盘 <span className="text-accent font-bold">{stats.monthly}</span> 篇
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} className="mr-1" /> 新建复盘
        </Button>
      </div>

      {/* 筛选 */}
      <div className="flex gap-2">
        {(['all', 'daily', 'weekly', 'monthly'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filterType === type
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? '全部' : reviewTypeConfig[type].label}
          </button>
        ))}
      </div>

      {/* 复盘列表（时间轴） */}
      <div className="space-y-8">
        {Object.entries(groupedReviews)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([month, monthReviews]) => (
            <div key={month}>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                {month.replace('-', '年')}月
              </h3>
              <div className="space-y-3 border-l-2 border-primary/20 pl-4">
                {monthReviews.map(review => (
                  <Card
                    key={review.id}
                    hover
                    onClick={() => setSelectedReview(review)}
                    className="relative before:absolute before:left-[-1.125rem] before:top-4 before:w-2 before:h-2 before:bg-primary before:rounded-full"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${reviewTypeConfig[review.type].color}`}>
                            {reviewTypeConfig[review.type].label}
                          </span>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <p className="mt-2 text-gray-700 line-clamp-2">{review.completedTasks}</p>
                      </div>
                      <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <p>暂无复盘记录，开始你的第一次复盘吧</p>
        </div>
      )}

      {/* 新建复盘弹窗 */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title="新建复盘" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="复盘类型"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as Review['type'] })}
              options={[
                { value: 'daily', label: '日复盘' },
                { value: 'weekly', label: '周复盘' },
                { value: 'monthly', label: '月复盘' },
              ]}
            />
            <Input
              label="复盘日期"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <Textarea
            label="完成任务"
            value={form.completedTasks}
            onChange={(e) => setForm({ ...form, completedTasks: e.target.value })}
            placeholder="列出今日/本周/本月完成的主要任务"
            rows={3}
          />
          <Textarea
            label="未完成原因"
            value={form.unfinishedReasons}
            onChange={(e) => setForm({ ...form, unfinishedReasons: e.target.value })}
            placeholder="分析未完成任务的原因"
            rows={2}
          />
          <Textarea
            label="改进措施"
            value={form.improvements}
            onChange={(e) => setForm({ ...form, improvements: e.target.value })}
            placeholder="针对问题提出改进方案"
            rows={2}
          />
          <Textarea
            label={form.type === 'daily' ? '明日计划' : form.type === 'weekly' ? '下周计划' : '下月计划'}
            value={form.nextPlan}
            onChange={(e) => setForm({ ...form, nextPlan: e.target.value })}
            placeholder="规划下一阶段的重点任务"
            rows={2}
          />

          {/* 自定义字段 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">自定义复盘维度</span>
              <button
                onClick={handleAddCustomField}
                className="text-sm text-primary hover:underline"
              >
                + 添加维度
              </button>
            </div>
            {form.customFields.map((field, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  placeholder="维度名称"
                  value={field.label}
                  onChange={(e) => handleUpdateCustomField(index, 'label', e.target.value)}
                  className="w-1/3"
                />
                <Input
                  placeholder="内容"
                  value={field.value}
                  onChange={(e) => handleUpdateCustomField(index, 'value', e.target.value)}
                  className="flex-1"
                />
                <button
                  onClick={() => handleRemoveCustomField(index)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <Button onClick={handleSaveReview} className="w-full" disabled={!form.completedTasks.trim()}>
            保存复盘
          </Button>
        </div>
      </Modal>

      {/* 复盘详情弹窗 */}
      <Modal
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        title={selectedReview ? `${reviewTypeConfig[selectedReview.type].label} - ${selectedReview.date}` : ''}
        size="lg"
      >
        {selectedReview && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-primary mb-2">完成任务</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedReview.completedTasks}</p>
            </div>
            {selectedReview.unfinishedReasons && (
              <div>
                <h4 className="font-semibold text-primary mb-2">未完成原因</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedReview.unfinishedReasons}</p>
              </div>
            )}
            {selectedReview.improvements && (
              <div>
                <h4 className="font-semibold text-primary mb-2">改进措施</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedReview.improvements}</p>
              </div>
            )}
            {selectedReview.nextPlan && (
              <div>
                <h4 className="font-semibold text-primary mb-2">下一步计划</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedReview.nextPlan}</p>
              </div>
            )}
            {selectedReview.customFields.map((field, index) => (
              <div key={index}>
                <h4 className="font-semibold text-primary mb-2">{field.label}</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{field.value}</p>
              </div>
            ))}
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => handleExportPDF(selectedReview)}>
                <Download size={16} className="mr-1" /> 导出文本
              </Button>
              <Button variant="danger" onClick={() => { handleDeleteReview(selectedReview.id); setSelectedReview(null); }}>
                <Trash2 size={16} className="mr-1" /> 删除
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
