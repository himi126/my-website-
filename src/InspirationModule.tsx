import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb, Plus, Trash2, Search, Tag, Image, FileText, Mic, X } from 'lucide-react';
import { Card, CardHeader } from './Card';
import { Button } from './Button';
import { Modal } from './Modal';
import { Input, Textarea, Select } from './Input';
import { storage, generateId, formatDateTime } from './appStorage';
import type { Inspiration } from './index.ts';

const tagColors: Record<string, string> = {
  '设计灵感': 'bg-purple-100 text-purple-700',
  '文案金句': 'bg-blue-100 text-blue-700',
  '工作思路': 'bg-green-100 text-green-700',
  '生活灵感': 'bg-yellow-100 text-yellow-700',
  '学习笔记': 'bg-pink-100 text-pink-700',
};

export const InspirationModule: React.FC = () => {
  const [inspirations, setInspirations] = useState<Inspiration[]>(() => storage.get('inspirations', []));
  const [showModal, setShowModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [selectedInspiration, setSelectedInspiration] = useState<Inspiration | null>(null);

  const [form, setForm] = useState({
    type: 'text' as Inspiration['type'],
    content: '',
    tags: [] as string[],
    newTag: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    storage.set('inspirations', inspirations);
  }, [inspirations]);

  const resetForm = () => {
    setForm({ type: 'text', content: '', tags: [], newTag: '' });
  };

  const handleSaveInspiration = () => {
    if (!form.content.trim()) return;

    const newInspiration: Inspiration = {
      id: generateId(),
      type: form.type,
      content: form.content,
      tags: form.tags,
      createdAt: new Date().toISOString(),
    };

    setInspirations([newInspiration, ...inspirations]);
    setShowModal(false);
    resetForm();
  };

  const handleDeleteInspiration = (id: string) => {
    setInspirations(inspirations.filter(i => i.id !== id));
    if (selectedInspiration?.id === id) setSelectedInspiration(null);
  };

  const handleAddTag = () => {
    if (form.newTag.trim() && !form.tags.includes(form.newTag.trim())) {
      setForm({
        ...form,
        tags: [...form.tags, form.newTag.trim()],
        newTag: '',
      });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setForm({
      ...form,
      tags: form.tags.filter(t => t !== tag),
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setForm({
          ...form,
          type: 'image',
          content: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // 获取所有标签
  const allTags = Array.from(new Set(inspirations.flatMap(i => i.tags)));

  // 筛选
  const filteredInspirations = inspirations.filter(item => {
    if (filterTag !== 'all' && !item.tags.includes(filterTag)) return false;
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      if (!item.content.toLowerCase().includes(keyword) &&
          !item.tags.some(t => t.toLowerCase().includes(keyword))) {
        return false;
      }
    }
    return true;
  });

  // 按类型统计
  const stats = {
    text: inspirations.filter(i => i.type === 'text').length,
    image: inspirations.filter(i => i.type === 'image').length,
    audio: inspirations.filter(i => i.type === 'audio').length,
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Lightbulb className="text-accent" />
            灵感创意库
          </h2>
          <p className="text-gray-500 mt-1">
            文字 <span className="text-accent font-bold">{stats.text}</span> 条，
            图片 <span className="text-accent font-bold">{stats.image}</span> 张
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} className="mr-1" /> 添加灵感
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={16} className="text-gray-400" />
          <Input
            placeholder="搜索内容或标签..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="flex-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-gray-400" />
          <Select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            options={[
              { value: 'all', label: '全部标签' },
              ...allTags.map(t => ({ value: t, label: t })),
            ]}
            className="w-36"
          />
        </div>
      </div>

      {/* 灵感列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInspirations.map(item => (
          <Card
            key={item.id}
            hover
            onClick={() => setSelectedInspiration(item)}
            className="group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {item.type === 'text' && <FileText size={16} className="text-gray-400" />}
                {item.type === 'image' && <Image size={16} className="text-gray-400" />}
                {item.type === 'audio' && <Mic size={16} className="text-gray-400" />}
                <span className="text-xs text-gray-400">{formatDateTime(item.createdAt)}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteInspiration(item.id); }}
                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {item.type === 'text' && (
              <p className="text-gray-700 line-clamp-4">{item.content}</p>
            )}

            {item.type === 'image' && (
              <img
                src={item.content}
                alt="灵感图片"
                className="w-full h-40 object-cover rounded-lg"
              />
            )}

            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {item.tags.map(tag => (
                  <span
                    key={tag}
                    className={`text-xs px-2 py-0.5 rounded ${tagColors[tag] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredInspirations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Lightbulb size={48} className="mx-auto mb-4 opacity-50" />
          <p>暂无灵感记录，捕捉你的创意吧</p>
        </div>
      )}

      {/* 添加灵感弹窗 */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title="添加灵感" size="md">
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setForm({ ...form, type: 'text', content: '' })}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                form.type === 'text' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <FileText size={18} /> 文字
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                form.type === 'image' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Image size={18} /> 图片
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {form.type === 'text' && (
            <Textarea
              label="灵感内容"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="记录你的灵感..."
              rows={5}
            />
          )}

          {form.type === 'image' && form.content && (
            <div className="relative">
              <img
                src={form.content}
                alt="预览"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => setForm({ ...form, content: '', type: 'text' })}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.tags.map(tag => (
                <span
                  key={tag}
                  className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1"
                >
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={form.newTag}
                onChange={(e) => setForm({ ...form, newTag: e.target.value })}
                placeholder="输入标签"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={handleAddTag}>
                添加
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.keys(tagColors).map(tag => (
                <button
                  key={tag}
                  onClick={() => !form.tags.includes(tag) && setForm({ ...form, tags: [...form.tags, tag] })}
                  className={`text-xs px-2 py-1 rounded ${tagColors[tag]} ${form.tags.includes(tag) ? 'opacity-50' : 'hover:opacity-80'}`}
                  disabled={form.tags.includes(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSaveInspiration} className="w-full" disabled={!form.content.trim()}>
            保存灵感
          </Button>
        </div>
      </Modal>

      {/* 灵感详情弹窗 */}
      <Modal
        isOpen={!!selectedInspiration}
        onClose={() => setSelectedInspiration(null)}
        title="灵感详情"
        size="md"
      >
        {selectedInspiration && (
          <div className="space-y-4">
            <p className="text-xs text-gray-400">{formatDateTime(selectedInspiration.createdAt)}</p>

            {selectedInspiration.type === 'text' && (
              <p className="text-gray-700 whitespace-pre-wrap">{selectedInspiration.content}</p>
            )}

            {selectedInspiration.type === 'image' && (
              <img
                src={selectedInspiration.content}
                alt="灵感图片"
                className="w-full rounded-lg"
              />
            )}

            {selectedInspiration.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedInspiration.tags.map(tag => (
                  <span
                    key={tag}
                    className={`text-sm px-3 py-1 rounded-full ${tagColors[tag] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <Button
              variant="danger"
              onClick={() => { handleDeleteInspiration(selectedInspiration.id); setSelectedInspiration(null); }}
              className="w-full"
            >
              <Trash2 size={16} className="mr-1" /> 删除
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
