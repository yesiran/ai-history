import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Network, Cpu, Layers, Activity } from 'lucide-react';

const modules = [
  { id: 'ngram', title: '1. N-gram 语言模型', description: '统计与概率的暴力美学', icon: Activity, active: true },
  { id: 'word2vec', title: '2. Word2Vec', description: '词向量与语义空间', icon: Network, active: true },
  { id: 'rnn', title: '3. RNN 循环神经网络', description: '拥有记忆的神经网络', icon: Brain, active: true },
  { id: 'transformer', title: '4. Transformer', description: '注意力机制的革命', icon: Layers, active: true },
  { id: 'rl', title: '5. 强化学习', description: '通过试错进化', icon: Cpu, active: true },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-4">
      <header className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">AI 历史揭秘：从统计到智能</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          探索人工智能发展的关键里程碑，通过交互式演示理解核心原理。
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
        {modules.map((m) => (
          <div 
            key={m.id}
            className={`p-6 rounded-xl border-2 transition-all duration-300 ${
              m.active 
                ? 'border-blue-500 bg-white shadow-lg hover:shadow-xl cursor-pointer' 
                : 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
            }`}
          >
            {m.active ? (
              <Link to={`/${m.id}`} className="block h-full">
                 <Content module={m} />
              </Link>
            ) : (
              <div className="h-full">
                <Content module={m} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Content({ module }) {
  const Icon = module.icon;
  return (
    <div className="flex flex-col h-full items-start">
      <div className={`p-3 rounded-lg mb-4 ${module.active ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold mb-2">{module.title}</h3>
      <p className="text-slate-500 text-sm flex-grow">{module.description}</p>
      {module.active && (
        <div className="mt-4 text-blue-600 font-semibold text-sm flex items-center">
          开始学习 &rarr;
        </div>
      )}
    </div>
  );
}
