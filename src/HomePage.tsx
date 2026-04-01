import React from 'react';
import { Card } from './Card';
import { getRealTimeSolarTerm } from './solarTerms';

export const HomePage: React.FC = () => {
  const currentTerm = getRealTimeSolarTerm();

  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-1000">
      {/* 1. 顶部欢迎寄语 - 娃娃体 */}
      <header className="text-center py-12 space-y-4">
        <h1 className="font-baby text-4xl text-purple-500 mb-2 drop-shadow-sm">
          每天都要好好吃饭，对自己笑一笑哦 🌸
        </h1>
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-purple-50 rounded-full border border-purple-100 shadow-sm">
          <span className="text-purple-600 font-bold text-lg">当前节气：{currentTerm.name}</span>
          <span className="text-purple-300">|</span>
          <p className="text-purple-500/80 font-medium">{currentTerm.desc}</p>
        </div>
      </header>

      {/* 2. 节气深度养生区 - 每个模块10道 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 建议饮食卡片 */}
        <Card className="bg-gradient-to-br from-green-50/50 to-white border-green-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center text-white font-bold">🍵</div>
            <h2 className="text-xl font-bold text-green-800">建议食材 (10种)</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentTerm.foods.map(food => (
              <span key={food} className="px-3 py-1.5 bg-white border border-green-100 text-green-700 rounded-xl text-sm font-medium shadow-sm hover:scale-105 transition-transform cursor-default">
                {food}
              </span>
            ))}
          </div>
        </Card>

        {/* 推荐食谱卡片 */}
        <Card className="bg-gradient-to-br from-orange-50/50 to-white border-orange-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center text-white font-bold">🍳</div>
            <h2 className="text-xl font-bold text-orange-800">推荐菜系 (10道)</h2>
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            {currentTerm.recipes.map((recipe, idx) => (
              <div key={recipe} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-orange-300 font-bold">{idx + 1}.</span>
                <span className="truncate">{recipe}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 健康生活卡片 */}
        <Card className="bg-gradient-to-br from-blue-50/50 to-white border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center text-white font-bold">🧘</div>
            <h2 className="text-xl font-bold text-blue-800">时令建议</h2>
          </div>
          <div className="space-y-4">
             {currentTerm.tips.map(tip => (
               <div key={tip} className="flex items-start gap-3 bg-white/60 p-3 rounded-2xl border border-blue-50">
                 <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                 <p className="text-sm text-blue-900/70 font-medium">{tip}</p>
               </div>
             ))}
             <p className="text-[10px] text-gray-300 italic text-center pt-2">
               * 顺应自然，四时皆安
             </p>
          </div>
        </Card>
      </div>

        {!settings?.minimalMode && (
          <p className="text-gray-400 text-sm font-light tracking-widest">
            生活与工作一体化管理 · 专注每一天的确幸
          </p>
        )}
      </header>
      {/* ----------------------- */}

      {/* 今日数据概览 */}
      {!settings?.minimalMode && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center bg-blue-50/40 p-4 border-none shadow-sm">
            <Calendar className="mx-auto text-blue-500 mb-2" size={20} />
            <p className="text-xs text-gray-400">当前节气</p>
            <p className="text-base font-bold text-gray-800">{currentSolarTerm.name}</p>
          </Card>
          <Card className="text-center bg-orange-50/40 p-4 border-none shadow-sm">
            <CheckSquare className="mx-auto text-orange-500 mb-2" size={20} />
            <p className="text-xs text-gray-400">待办任务</p>
            <p className="text-base font-bold text-gray-800">{pendingTasks.length}</p>
          </Card>
          <Card className="text-center bg-indigo-50/40 p-4 border-none shadow-sm">
            <Newspaper className="mx-auto text-indigo-500 mb-2" size={20} />
            <p className="text-xs text-gray-400">未读新闻</p>
            <p className="text-base font-bold text-gray-800">{todayNews.length}</p>
          </Card>
          <Card className="text-center bg-green-50/40 p-4 border-none shadow-sm">
            <TrendingUp className="mx-auto text-green-500 mb-2" size={20} />
            <p className="text-xs text-gray-400">本周复盘</p>
            <p className="text-base font-bold text-gray-800">{weekReviews.length}</p>
          </Card>
        </div>
      )}

      {/* 板块列表 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary rounded-full"></span> 生活板块
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {lifeModules.map(m => (
            <Link key={m.id} to={m.link}>
              <Card hover className="p-5 h-full border-gray-100 hover:border-primary/30 transition-all">
                <m.icon className="text-primary mb-3" size={28} />
                <h3 className="font-bold text-gray-900">{m.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{m.summary}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-accent rounded-full"></span> 工作板块
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workModules.map(m => (
            <Link key={m.id} to={m.link}>
              <Card hover className="p-5 h-full border-gray-100 hover:border-accent/30 transition-all">
                <m.icon className="text-accent mb-3" size={28} />
                <h3 className="font-bold text-gray-900">{m.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{m.summary}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
