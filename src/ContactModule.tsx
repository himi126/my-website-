import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit, Search, Bell, Phone, Mail, Briefcase, Calendar, Link2 } from 'lucide-react';
import { Card, CardHeader } from './Card';
import { Button } from './Button';
import { Modal } from './Modal';
import { Input, Textarea, Select } from './Input';
import { appStorage, generateId, formatDate } from './appStorage';
import type { Contact, Task } from './index.ts';

export const ContactModule: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>(() => appStorage.get('contacts', []));
  const [tasks, setTasks] = useState<Task[]>(() => appStorage.get('tasks', []));
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');

  const [form, setForm] = useState({
    name: '',
    position: '',
    phone: '',
    email: '',
    industry: '',
    firstMeetScene: '',
    preferences: '',
    pendingFollowUp: '',
    lastContactDate: '',
    reminders: [] as { date: string; note: string }[],
    newReminderDate: '',
    newReminderNote: '',
  });

  useEffect(() => {
    storage.set('contacts', contacts);
  }, [contacts]);

  const resetForm = () => {
    setForm({
      name: '',
      position: '',
      phone: '',
      email: '',
      industry: '',
      firstMeetScene: '',
      preferences: '',
      pendingFollowUp: '',
      lastContactDate: '',
      reminders: [],
      newReminderDate: '',
      newReminderNote: '',
    });
    setEditingContact(null);
  };

  const handleOpenModal = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setForm({
        name: contact.name,
        position: contact.position || '',
        phone: contact.phone || '',
        email: contact.email || '',
        industry: contact.industry || '',
        firstMeetScene: contact.firstMeetScene || '',
        preferences: contact.preferences || '',
        pendingFollowUp: contact.pendingFollowUp || '',
        lastContactDate: contact.lastContactDate || '',
        reminders: contact.reminders || [],
        newReminderDate: '',
        newReminderNote: '',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSaveContact = () => {
    if (!form.name.trim()) return;

    if (editingContact) {
      setContacts(contacts.map(c =>
        c.id === editingContact.id
          ? { ...c, ...form, reminders: form.reminders }
          : c
      ));
    } else {
      const newContact: Contact = {
        id: generateId(),
        name: form.name,
        position: form.position,
        phone: form.phone,
        email: form.email,
        industry: form.industry,
        firstMeetScene: form.firstMeetScene,
        preferences: form.preferences,
        pendingFollowUp: form.pendingFollowUp,
        lastContactDate: form.lastContactDate,
        reminders: form.reminders,
        linkedTasks: [],
        createdAt: new Date().toISOString(),
      };
      setContacts([newContact, ...contacts]);
    }
    setShowModal(false);
    resetForm();
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
    if (selectedContact?.id === id) setSelectedContact(null);
  };

  const handleAddReminder = () => {
    if (form.newReminderDate && form.newReminderNote) {
      setForm({
        ...form,
        reminders: [...form.reminders, { date: form.newReminderDate, note: form.newReminderNote }],
        newReminderDate: '',
        newReminderNote: '',
      });
    }
  };

  const handleRemoveReminder = (index: number) => {
    setForm({
      ...form,
      reminders: form.reminders.filter((_, i) => i !== index),
    });
  };

  const handleCreateLinkedTask = (contact: Contact) => {
    const taskTitle = `跟进：${contact.name}`;
    const newTask: Task = {
      id: generateId(),
      title: taskTitle,
      description: contact.pendingFollowUp || `与${contact.name}沟通`,
      priority: 'medium',
      status: 'todo',
      createdAt: new Date().toISOString(),
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    storage.set('tasks', updatedTasks);

    // 关联任务
    setContacts(contacts.map(c =>
      c.id === contact.id
        ? { ...c, linkedTasks: [...(c.linkedTasks || []), newTask.id] }
        : c
    ));
  };

  // 获取所有行业
  const allIndustries = Array.from(new Set(contacts.map(c => c.industry).filter(Boolean)));

  // 筛选
  const filteredContacts = contacts.filter(contact => {
    if (filterIndustry !== 'all' && contact.industry !== filterIndustry) return false;
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      if (!contact.name.toLowerCase().includes(keyword) &&
          !contact.position?.toLowerCase().includes(keyword) &&
          !contact.industry?.toLowerCase().includes(keyword)) {
        return false;
      }
    }
    return true;
  });

  // 获取即将到期的提醒
  const getUpcomingReminders = () => {
    const today = formatDate(new Date());
    const reminders: { contact: Contact; reminder: { date: string; note: string } }[] = [];
    contacts.forEach(contact => {
      contact.reminders?.forEach(reminder => {
        if (reminder.date >= today) {
          reminders.push({ contact, reminder });
        }
      });
    });
    return reminders.sort((a, b) => a.reminder.date.localeCompare(b.reminder.date)).slice(0, 5);
  };

  const upcomingReminders = getUpcomingReminders();

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Users className="text-accent" />
            人脉管理
          </h2>
          <p className="text-gray-500 mt-1">
            共 <span className="text-accent font-bold">{contacts.length}</span> 位联系人
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={16} className="mr-1" /> 添加联系人
        </Button>
      </div>

      {/* 即将到期的提醒 */}
      {upcomingReminders.length > 0 && (
        <Card className="bg-accent/10 border-accent/30">
          <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <Bell size={18} className="text-accent" /> 待跟进提醒
          </h3>
          <div className="space-y-2">
            {upcomingReminders.map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <span className="text-accent font-medium">{item.reminder.date}</span>
                <span className="text-gray-700">{item.contact.name}</span>
                <span className="text-gray-500">{item.reminder.note}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 搜索和筛选 */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={16} className="text-gray-400" />
          <Input
            placeholder="搜索姓名、职位或行业..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="flex-1"
          />
        </div>
        <Select
          value={filterIndustry}
          onChange={(e) => setFilterIndustry(e.target.value)}
          options={[
            { value: 'all', label: '全部行业' },
            ...allIndustries.map(i => ({ value: i!, label: i! })),
          ]}
          className="w-36"
        />
      </div>

      {/* 联系人列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map(contact => (
          <Card
            key={contact.id}
            hover
            onClick={() => setSelectedContact(contact)}
            className="group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold">{contact.name}</h4>
                  <p className="text-sm text-gray-500">{contact.position}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); handleOpenModal(contact); }}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-primary"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteContact(contact.id); }}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {contact.industry && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                {contact.industry}
              </span>
            )}

            <div className="mt-3 space-y-1 text-sm text-gray-500">
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} /> {contact.phone}
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-2">
                  <Mail size={14} /> {contact.email}
                </div>
              )}
            </div>

            {contact.reminders && contact.reminders.length > 0 && (
              <div className="mt-3 flex items-center gap-1 text-accent text-xs">
                <Bell size={12} />
                <span>{contact.reminders.length} 个待提醒</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p>暂无联系人，开始建立你的人脉网络吧</p>
        </div>
      )}

      {/* 添加/编辑联系人弹窗 */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingContact ? '编辑联系人' : '添加联系人'}
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <Input
            label="姓名 *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="联系人姓名"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="职位"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              placeholder="如：产品经理"
            />
            <Input
              label="所属行业"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              placeholder="如：互联网"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="电话"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="联系电话"
            />
            <Input
              label="邮箱"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="邮箱地址"
            />
          </div>
          <Textarea
            label="初次接触场景"
            value={form.firstMeetScene}
            onChange={(e) => setForm({ ...form, firstMeetScene: e.target.value })}
            placeholder="记录你们是如何认识的"
            rows={2}
          />
          <Textarea
            label="对方偏好"
            value={form.preferences}
            onChange={(e) => setForm({ ...form, preferences: e.target.value })}
            placeholder="记录对方的兴趣爱好、沟通偏好等"
            rows={2}
          />
          <Textarea
            label="待跟进事项"
            value={form.pendingFollowUp}
            onChange={(e) => setForm({ ...form, pendingFollowUp: e.target.value })}
            placeholder="需要跟进的事项"
            rows={2}
          />
          <Input
            label="上次沟通时间"
            type="date"
            value={form.lastContactDate}
            onChange={(e) => setForm({ ...form, lastContactDate: e.target.value })}
          />

          {/* 沟通提醒 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">沟通提醒</label>
            {form.reminders.map((reminder, index) => (
              <div key={index} className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded">
                <Bell size={14} className="text-accent" />
                <span className="text-sm">{reminder.date}</span>
                <span className="text-sm text-gray-600 flex-1">{reminder.note}</span>
                <button
                  onClick={() => handleRemoveReminder(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                type="date"
                value={form.newReminderDate}
                onChange={(e) => setForm({ ...form, newReminderDate: e.target.value })}
                className="w-40"
              />
              <Input
                value={form.newReminderNote}
                onChange={(e) => setForm({ ...form, newReminderNote: e.target.value })}
                placeholder="提醒内容"
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={handleAddReminder}>
                添加
              </Button>
            </div>
          </div>

          <Button onClick={handleSaveContact} className="w-full" disabled={!form.name.trim()}>
            {editingContact ? '保存修改' : '添加联系人'}
          </Button>
        </div>
      </Modal>

      {/* 联系人详情弹窗 */}
      <Modal
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        title={selectedContact?.name || ''}
        size="md"
      >
        {selectedContact && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-2xl">
                {selectedContact.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{selectedContact.name}</h3>
                <p className="text-gray-500">{selectedContact.position}</p>
                {selectedContact.industry && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded mt-1 inline-block">
                    {selectedContact.industry}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {selectedContact.phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone size={16} className="text-primary" /> {selectedContact.phone}
                </div>
              )}
              {selectedContact.email && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail size={16} className="text-primary" /> {selectedContact.email}
                </div>
              )}
              {selectedContact.lastContactDate && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar size={16} className="text-primary" /> 上次沟通：{selectedContact.lastContactDate}
                </div>
              )}
            </div>

            {selectedContact.firstMeetScene && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">初次接触</h4>
                <p className="text-sm text-gray-600">{selectedContact.firstMeetScene}</p>
              </div>
            )}

            {selectedContact.preferences && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">对方偏好</h4>
                <p className="text-sm text-gray-600">{selectedContact.preferences}</p>
              </div>
            )}

            {selectedContact.pendingFollowUp && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">待跟进事项</h4>
                <p className="text-sm text-gray-600">{selectedContact.pendingFollowUp}</p>
              </div>
            )}

            {selectedContact.reminders && selectedContact.reminders.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">沟通提醒</h4>
                {selectedContact.reminders.map((reminder, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm bg-accent/10 p-2 rounded mb-1">
                    <Bell size={14} className="text-accent" />
                    <span className="font-medium text-accent">{reminder.date}</span>
                    <span className="text-gray-600">{reminder.note}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => handleCreateLinkedTask(selectedContact)}>
                <Link2 size={16} className="mr-1" /> 创建关联任务
              </Button>
              <Button variant="outline" onClick={() => { handleOpenModal(selectedContact); setSelectedContact(null); }}>
                <Edit size={16} className="mr-1" /> 编辑
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
