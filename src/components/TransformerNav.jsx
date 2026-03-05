import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, BrainCircuit } from 'lucide-react';

const chapters = [
  { path: '/transformer', label: '1 注意力机制' },
  { path: '/transformer/layers', label: '2 多层推理' },
  { path: '/transformer/prediction', label: '3 生成与预测' },
];

export default function TransformerNav() {
  const location = useLocation();

  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-white border-b border-slate-200 shrink-0">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-slate-400 hover:text-blue-600 transition-colors">
          <ChevronLeft size={16} />
        </Link>
        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
          <BrainCircuit size={16} className="text-indigo-500" />
          <span className="hidden sm:inline">Transformer 深度解析</span>
        </div>
      </div>
      <div className="flex items-center gap-0.5">
        {chapters.map((ch) => {
          const isActive = location.pathname === ch.path;
          return (
            <Link
              key={ch.path}
              to={ch.path}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {ch.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
