import React, { useState, useEffect } from 'react';
import { ChefHat, Heart, Trash2, Edit, Plus, Filter, Calendar } from 'lucide-react';
import { Card, CardHeader } from './Card';
import { Button } from './Button';
import { Modal } from './Modal';
import { Input, Textarea, Select } from './Input';
import { storage, generateId, formatDate } from './appStorage';
import { getCurrentSolarTerm, getAllSolarTerms } from './solarTerms';
import type { Recipe, HealthProfile } from './index.ts';

const defaultProfile: HealthProfile = {
  height: 170,
  weight: 65,
  bloodPressure: { systolic: 120, diastolic: 80 },
  bloodSugar: 5.5,
  bodyType: '平和质',
  allergies: [],
};

const bodyTypes = [
  { value: '平和质', label: '平和质 - 阴阳平和' },
  { value: '气虚质', label: '气虚质 - 元气不足' },
  { value: '阳虚质', label: '阳虚质 - 阳气虚弱' },
  { value: '阴虚质', label: '阴虚质 - 阴液亏损' },
  { value: '痰湿质', label: '痰湿质 - 痰湿内蕴' },
  { value: '湿热质', label: '湿热质 - 湿热内蕴' },
  { value: '血瘀质', label: '血瘀质 - 血行不畅' },
  { value: '气郁质', label: '气郁质 - 气机郁滞' },
  { value: '特禀质', label: '特禀质 - 先天特禀' },
];

// 根据体质和节气生成食谱
const generateRecipe = (profile: HealthProfile, solarTerm: ReturnType<typeof getCurrentSolarTerm>): Recipe => {
  const recipes: Record<string, { name: string; ingredients: { name: string; amount: string; alternative?: string }[]; steps: string[] }[]> = {
    '平和质': [
      { name: '时蔬炒鸡蛋', ingredients: [{ name: '鸡蛋', amount: '2个' }, { name: '时令蔬菜', amount: '200g' }, { name: '葱姜蒜', amount: '适量' }], steps: ['鸡蛋打散备用', '热锅凉油，炒散鸡蛋', '放入蔬菜翻炒', '调味出锅'] },
      { name: '清蒸鲈鱼', ingredients: [{ name: '鲈鱼', amount: '1条' }, { name: '姜丝', amount: '适量' }, { name: '蒸鱼豉油', amount: '2勺' }], steps: ['鱼洗净切花刀', '铺姜丝蒸8分钟', '淋热油和豉油'] },
    ],
    '气虚质': [
      { name: '黄芪炖鸡汤', ingredients: [{ name: '鸡肉', amount: '500g' }, { name: '黄芪', amount: '15g' }, { name: '红枣', amount: '5颗' }], steps: ['鸡肉焯水', '放入所有材料', '小火炖1.5小时', '加盐调味'] },
      { name: '山药排骨汤', ingredients: [{ name: '排骨', amount: '400g' }, { name: '山药', amount: '200g' }, { name: '枸杞', amount: '少许' }], steps: ['排骨焯水', '加山药炖煮', '出锅加枸杞'] },
    ],
    '阳虚质': [
      { name: '羊肉萝卜汤', ingredients: [{ name: '羊肉', amount: '300g' }, { name: '白萝卜', amount: '200g' }, { name: '生姜', amount: '3片' }], steps: ['羊肉焯水去膻', '加萝卜姜片炖煮', '小火慢炖1小时'] },
    ],
    '阴虚质': [
      { name: '银耳雪梨羹', ingredients: [{ name: '银耳', amount: '半朵' }, { name: '雪梨', amount: '1个' }, { name: '冰糖', amount: '适量' }], steps: ['银耳泡发撕小朵', '雪梨切块', '小火慢炖1小时'] },
    ],
  };

  const typeRecipes = recipes[profile.bodyType] || recipes['平和质'];
  const selectedRecipe = typeRecipes[Math.floor(Math.random() * typeRecipes.length)];

  // 过滤过敏食材
  const filteredIngredients = selectedRecipe.ingredients.map(ing => {
    if (profile.allergies.some(a => ing.name.includes(a))) {
      return { ...ing, alternative: '请咨询医生替代方案' };
    }
    return ing;
  });

  return {
    id: generateId(),
    name: selectedRecipe.name,
    solarTerm: solarTerm.name,
    solarTermReason: `${solarTerm.name}时节，${solarTerm.description}。${solarTerm.dietTips.join('，')}。`,
    ingredients: filteredIngredients,
    steps: selectedRecipe.steps,
    nutrition: {
      calories: Math.floor(300 + Math.random() * 200),
      protein: Math.floor(15 + Math.random() * 20),
      fat: Math.floor(10 + Math.random() * 15),
      carbs: Math.floor(30 + Math.random() * 30),
      fiber: Math.floor(3 + Math.random() * 5),
    },
    isFavorite: false,
    createdAt: new Date().toISOString(),
  };
};

export const RecipeModule: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>(() => storage.get('recipes', []));
  const [profile, setProfile] = useState<HealthProfile>(() => storage.get('health-profile', defaultProfile));
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [filterTerm, setFilterTerm] = useState<string>('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const currentSolarTerm = getCurrentSolarTerm();
  const allSolarTerms = getAllSolarTerms();

  useEffect(() => {
    storage.set('recipes', recipes);
  }, [recipes]);

  useEffect(() => {
    storage.set('health-profile', profile);
  }, [profile]);

  const handleGenerateRecipe = () => {
    const newRecipe = generateRecipe(profile, currentSolarTerm);
    setRecipes([newRecipe, ...recipes]);
    setSelectedRecipe(newRecipe);
  };

  const handleToggleFavorite = (id: string) => {
    setRecipes(recipes.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(recipes.filter(r => r.id !== id));
    if (selectedRecipe?.id === id) setSelectedRecipe(null);
  };

  const filteredRecipes = recipes.filter(r => {
    if (filterTerm !== 'all' && r.solarTerm !== filterTerm) return false;
    if (showOnlyFavorites && !r.isFavorite) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 头部操作区 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <ChefHat className="text-accent" />
            私人定制食谱
          </h2>
          <p className="text-gray-500 mt-1">当前节气：<span className="text-primary font-semibold">{currentSolarTerm.name}</span></p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setShowProfileModal(true)}>
            <Edit size={16} className="mr-1" /> 身体指标
          </Button>
          <Button onClick={handleGenerateRecipe}>
            <Plus size={16} className="mr-1" /> 生成今日食谱
          </Button>
        </div>
      </div>

      {/* 节气推荐 */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-primary mb-2">{currentSolarTerm.name}养生提示</h3>
            <p className="text-gray-600 text-sm">{currentSolarTerm.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {currentSolarTerm.dietTips.map((tip, i) => (
                <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{tip}</span>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-700 mb-2">推荐食材</h4>
            <div className="flex flex-wrap gap-1">
              {currentSolarTerm.recommendedFoods.map((food, i) => (
                <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{food}</span>
              ))}
            </div>
            <h4 className="text-sm font-medium text-gray-700 mt-3 mb-2">忌食</h4>
            <div className="flex flex-wrap gap-1">
              {currentSolarTerm.avoidFoods.map((food, i) => (
                <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">{food}</span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 筛选 */}
      <div className="flex gap-4 flex-wrap items-center">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <Select
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            options={[
              { value: 'all', label: '全部节气' },
              ...allSolarTerms.map(t => ({ value: t.name, label: t.name }))
            ]}
            className="w-32"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyFavorites}
            onChange={(e) => setShowOnlyFavorites(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-600">仅显示收藏</span>
        </label>
      </div>

      {/* 食谱列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecipes.map(recipe => (
          <Card key={recipe.id} hover onClick={() => setSelectedRecipe(recipe)}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-lg">{recipe.name}</h4>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Calendar size={14} /> {recipe.solarTerm} · {formatDate(recipe.createdAt)}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleFavorite(recipe.id); }}
                  className={`p-1 rounded hover:bg-gray-100 ${recipe.isFavorite ? 'text-red-500' : 'text-gray-400'}`}
                >
                  <Heart size={18} fill={recipe.isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteRecipe(recipe.id); }}
                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="mt-3 flex gap-2 text-xs">
              <span className="bg-accent/20 text-accent px-2 py-0.5 rounded font-medium">{recipe.nutrition.calories} kcal</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">蛋白质 {recipe.nutrition.protein}g</span>
            </div>
          </Card>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <ChefHat size={48} className="mx-auto mb-4 opacity-50" />
          <p>暂无食谱，点击"生成今日食谱"开始吧</p>
        </div>
      )}

      {/* 食谱详情弹窗 */}
      <Modal isOpen={!!selectedRecipe} onClose={() => setSelectedRecipe(null)} title={selectedRecipe?.name || ''} size="lg">
        {selectedRecipe && (
          <div className="space-y-4">
            <div className="bg-primary/5 p-4 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">节气适配</h4>
              <p className="text-sm text-gray-600">{selectedRecipe.solarTermReason}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">食材清单</h4>
              <div className="space-y-2">
                {selectedRecipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex justify-between text-sm border-b pb-2">
                    <span>{ing.name}</span>
                    <span className="text-gray-500">{ing.amount}</span>
                    {ing.alternative && <span className="text-red-500 text-xs">{ing.alternative}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">烹饪步骤</h4>
              <ol className="space-y-2">
                {selectedRecipe.steps.map((step, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-accent/10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">营养成分</h4>
              <div className="grid grid-cols-5 gap-2 text-center text-sm">
                <div><p className="text-accent font-bold">{selectedRecipe.nutrition.calories}</p><p className="text-xs text-gray-500">热量(kcal)</p></div>
                <div><p className="font-semibold">{selectedRecipe.nutrition.protein}g</p><p className="text-xs text-gray-500">蛋白质</p></div>
                <div><p className="font-semibold">{selectedRecipe.nutrition.fat}g</p><p className="text-xs text-gray-500">脂肪</p></div>
                <div><p className="font-semibold">{selectedRecipe.nutrition.carbs}g</p><p className="text-xs text-gray-500">碳水</p></div>
                <div><p className="font-semibold">{selectedRecipe.nutrition.fiber}g</p><p className="text-xs text-gray-500">纤维</p></div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 身体指标弹窗 */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="身体指标设置" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="身高 (cm)"
              type="number"
              value={profile.height}
              onChange={(e) => setProfile({ ...profile, height: Number(e.target.value) })}
            />
            <Input
              label="体重 (kg)"
              type="number"
              value={profile.weight}
              onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="收缩压 (mmHg)"
              type="number"
              value={profile.bloodPressure.systolic}
              onChange={(e) => setProfile({ ...profile, bloodPressure: { ...profile.bloodPressure, systolic: Number(e.target.value) } })}
            />
            <Input
              label="舒张压 (mmHg)"
              type="number"
              value={profile.bloodPressure.diastolic}
              onChange={(e) => setProfile({ ...profile, bloodPressure: { ...profile.bloodPressure, diastolic: Number(e.target.value) } })}
            />
          </div>
          <Input
            label="空腹血糖 (mmol/L)"
            type="number"
            step="0.1"
            value={profile.bloodSugar}
            onChange={(e) => setProfile({ ...profile, bloodSugar: Number(e.target.value) })}
          />
          <Select
            label="体质类型"
            value={profile.bodyType}
            onChange={(e) => setProfile({ ...profile, bodyType: e.target.value as HealthProfile['bodyType'] })}
            options={bodyTypes}
          />
          <Input
            label="过敏食材 (用逗号分隔)"
            value={profile.allergies.join(', ')}
            onChange={(e) => setProfile({ ...profile, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            placeholder="如：虾、花生、牛奶"
          />
          <Button onClick={() => setShowProfileModal(false)} className="w-full">保存设置</Button>
        </div>
      </Modal>
    </div>
  );
};
