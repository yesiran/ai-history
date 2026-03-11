import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Network, Layers, Activity, ArrowRight, Sparkles } from 'lucide-react';

const modules = [
  {
    id: 'ngram',
    title: 'N-gram 语言模型',
    year: '1948',
    description: '统计与概率的暴力美学',
    detail: '用"数数"的方式理解语言，一切智能的起点',
    icon: Activity,
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200 hover:border-amber-400',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    id: 'word2vec',
    title: 'Word2Vec',
    year: '2013',
    description: '词向量与语义空间',
    detail: '让计算机第一次"理解"词语之间的关系',
    icon: Network,
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200 hover:border-emerald-400',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    id: 'rnn',
    title: 'RNN 循环神经网络',
    year: '2014',
    description: '拥有记忆的神经网络',
    detail: '像人一样逐字阅读，记住上下文语境',
    icon: Brain,
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200 hover:border-violet-400',
    iconBg: 'bg-violet-100 text-violet-600',
  },
  {
    id: 'transformer',
    title: 'Transformer',
    year: '2017',
    description: '注意力机制的革命',
    detail: 'GPT 的基石，开启大模型时代的关键突破',
    icon: Layers,
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200 hover:border-blue-400',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'transformer-v2',
    title: 'Transformer 原理动画展示',
    year: '3D',
    description: '3D 阅卷大楼沉浸式体验',
    detail: '用 5 层阅卷大楼的比喻，直观理解多层注意力机制如何逐层积累理解',
    icon: Sparkles,
    color: 'from-indigo-500 to-purple-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200 hover:border-indigo-400',
    iconBg: 'bg-indigo-100 text-indigo-600',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col items-center justify-center px-6 py-12">
      {/* Header */}
      <header className="text-center mb-12">
        <p className="text-sm font-semibold tracking-widest text-blue-600 uppercase mb-3">Interactive Course</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          AI 历史揭秘：从统计到智能
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          四个里程碑，一条演进之路 —— 通过交互式演示，理解 AI 如何从简单的统计模型走向 GPT
        </p>
      </header>

      {/* Timeline indicator */}
      <div className="hidden md:flex items-center gap-2 mb-10 text-sm font-medium">
        {modules.map((m, i) => (
          <React.Fragment key={m.id}>
            <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${m.color} text-white`}>
              {m.year}
            </span>
            {i < modules.length - 1 && (
              <ArrowRight size={16} className="text-slate-300" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl w-full">
        {modules.map((m, index) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.id}
              to={`/${m.id}`}
              className={`group relative p-6 rounded-2xl border-2 ${m.border} ${m.bg} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
            >
              {/* Step number */}
              <span className="absolute top-4 right-4 text-5xl font-black text-slate-900/5 select-none">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${m.iconBg} shrink-0`}>
                  <Icon size={28} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-400 md:hidden">{m.year}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{m.title}</h3>
                  <p className="text-sm text-slate-500 mb-2">{m.description}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{m.detail}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center text-sm font-semibold text-slate-400 group-hover:text-slate-700 transition-colors">
                开始学习
                <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <p className="mt-12 text-xs text-slate-300">
        点击任意模块，开始交互式学习之旅
      </p>
    </div>
  );
}
