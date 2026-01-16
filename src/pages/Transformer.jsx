import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Footprints, Network, Zap, Lightbulb, Search, ArrowRight } from 'lucide-react';
import { transformerExplanation, transformerScenarios } from '../utils/transformer_data';

const Transformer = () => {
  const [activeScenarioId, setActiveScenarioId] = useState('coreference');
  const [hoveredWord, setHoveredWord] = useState(null); // 存储当前悬停的词 { word: string, index: number }
  const wordRefs = useRef([]);
  const containerRef = useRef(null);
  const [svgLines, setSvgLines] = useState([]);

  const currentScenario = transformerScenarios.find(s => s.id === activeScenarioId);

  // 颜色配置
  const typeColors = {
    ref: '#3b82f6', // blue-500 (指代)
    adj: '#a855f7', // purple-500 (修饰)
    subj: '#22c55e', // green-500 (主谓)
    obj: '#ef4444', // red-500 (动宾)
    verb: '#f59e0b', // amber-500 (动作链)
    mod: '#6366f1', // indigo-500 (修饰)
    self: '#94a3b8', // slate-400 (自身)
  };

  // 计算连线
  useEffect(() => {
    if (!hoveredWord || !containerRef.current) {
      setSvgLines([]);
      return;
    }

    const sourceWordChar = currentScenario.sentence[hoveredWord.index];
    // 查找当前词的 attention 数据
    // 注意：数据里的 key 可能是单个字，也可能是单词。为了简单，我们假设 key 匹配 sentence[index]
    // 但对于中文，sentence 是单字数组，key 也是单字。
    
    // 我们的数据结构是 key -> targets
    // 我们需要遍历 attention 数据，找到当前 hover 词作为 key 的条目
    const attentionData = currentScenario.attention[sourceWordChar];

    if (!attentionData) {
      setSvgLines([]);
      return;
    }

    const lines = [];
    const containerRect = containerRef.current.getBoundingClientRect();
    const sourceEl = wordRefs.current[hoveredWord.index];
    
    if (!sourceEl) return;

    const sourceRect = sourceEl.getBoundingClientRect();
    const startX = sourceRect.left - containerRect.left + sourceRect.width / 2;
    const startY = sourceRect.top - containerRect.top; // 从单词顶部发出

    attentionData.forEach(attn => {
      // 找到目标词在句子中的索引（可能有多个，简单的处理是找所有匹配的）
      currentScenario.sentence.forEach((char, idx) => {
        if (char === attn.target) {
            // 排除自己指向自己（如果不需要显示的话，或者用特殊的环线）
            if (idx === hoveredWord.index && attn.type !== 'self') return;

            const targetEl = wordRefs.current[idx];
            if (targetEl) {
                const targetRect = targetEl.getBoundingClientRect();
                const endX = targetRect.left - containerRect.left + targetRect.width / 2;
                const endY = targetRect.top - containerRect.top;
                
                // 计算贝塞尔曲线控制点
                // 距离越远，弧度越高
                const dist = Math.abs(endX - startX);
                const controlHeight = Math.max(50, dist * 0.5); 
                const controlY = startY - controlHeight;
                const midX = (startX + endX) / 2;

                lines.push({
                    id: `${hoveredWord.index}-${idx}`,
                    path: `M ${startX} ${startY} Q ${midX} ${controlY} ${endX} ${endY}`,
                    color: typeColors[attn.type] || '#cbd5e1',
                    weight: attn.weight,
                    targetIdx: idx
                });
            }
        }
      });
    });

    setSvgLines(lines);

  }, [hoveredWord, currentScenario]);


  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col font-sans text-slate-800">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-indigo-900 mb-2">Transformer (注意力机制)</h1>
        <p className="text-xl text-slate-600">拥有“上帝视角”的关系构建者，打破线性限制</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* 左侧：原理讲解 */}
        <div className="space-y-6 overflow-y-auto pr-4 h-[calc(100vh-200px)]">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-semibold mb-6 flex items-center text-indigo-700">
              <Network className="w-6 h-6 mr-2" />
              为什么它是革命性的？
            </h2>
            
            <div className="space-y-6">
              {transformerExplanation.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors">
                  <h3 className="text-lg font-bold mb-2 flex items-center text-slate-800">
                    {idx === 0 && <Footprints className="w-5 h-5 mr-2 text-slate-500" />}
                    {idx === 1 && <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />}
                    {idx === 2 && <Zap className="w-5 h-5 mr-2 text-purple-500" />}
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm text-justify whitespace-pre-line">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：交互演示 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 flex flex-col h-[calc(100vh-200px)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-700">Self-Attention 可视化</h2>
            <div className="flex space-x-2">
              {transformerScenarios.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setActiveScenarioId(s.id); setHoveredWord(null); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    activeScenarioId === s.id 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-slate-50 rounded-xl p-8 relative flex flex-col items-center justify-center overflow-hidden">
            
            <div className="absolute top-4 left-4 right-4 text-center text-slate-400 text-sm">
                将鼠标悬停在单词上，观察它如何“关注”其他词
            </div>

            {/* 句子容器 */}
            <div 
                ref={containerRef}
                className="relative flex flex-wrap justify-center gap-x-3 gap-y-8 px-8 py-12 w-full max-w-2xl z-20"
            >
                {/* SVG 连线层 (位于单词下方，但在背景上方) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                        </marker>
                    </defs>
                    <AnimatePresence>
                        {svgLines.map((line) => (
                            <motion.path
                                key={line.id}
                                d={line.path}
                                fill="none"
                                stroke={line.color}
                                strokeWidth={line.weight * 4 + 1}
                                strokeLinecap="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: line.weight }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            />
                        ))}
                    </AnimatePresence>
                </svg>

                {currentScenario.sentence.map((word, idx) => {
                    // 判断该词是否是当前 hover 词关注的目标
                    const isTarget = svgLines.some(l => l.targetIdx === idx);
                    const targetLine = svgLines.find(l => l.targetIdx === idx);
                    
                    return (
                        <motion.div
                            key={idx}
                            ref={el => wordRefs.current[idx] = el}
                            onMouseEnter={() => setHoveredWord({ word, index: idx })}
                            onMouseLeave={() => setHoveredWord(null)}
                            className={`relative px-3 py-2 rounded-lg cursor-pointer text-lg font-medium transition-all duration-300 z-20 select-none
                                ${hoveredWord?.index === idx 
                                    ? 'bg-indigo-600 text-white shadow-lg scale-110' 
                                    : (isTarget 
                                        ? 'bg-white shadow-md scale-105 border-2' 
                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300')
                                }
                            `}
                            style={{
                                borderColor: isTarget ? targetLine?.color : undefined,
                                color: isTarget ? targetLine?.color : undefined
                            }}
                        >
                            {word}
                            
                            {/* 目标词上方显示关联类型 */}
                            {isTarget && hoveredWord?.index !== idx && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: -25 }}
                                    className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-white whitespace-nowrap z-30"
                                >
                                    {(targetLine.weight * 100).toFixed(0)}%
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* 底部解释栏 */}
            <div className="h-16 mt-8 w-full flex items-center justify-center">
                <AnimatePresence mode='wait'>
                    {hoveredWord ? (
                        <motion.div 
                            key="expl"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-indigo-50 px-6 py-2 rounded-full border border-indigo-100 flex items-center space-x-2 text-indigo-800 text-sm"
                        >
                            <Search className="w-4 h-4" />
                            <span>
                                <strong>"{hoveredWord.word}"</strong> 正在关注 {svgLines.length} 个相关词汇以确定自身含义
                            </span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-slate-400 text-sm flex items-center"
                        >
                            <Network className="w-4 h-4 mr-2" />
                            Transformer 在并行计算所有词之间的关系
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

          </div>

          {/* 图例 */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 justify-center text-xs text-slate-500">
             <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>主谓关系</div>
             <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>动宾关系</div>
             <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-purple-500 mr-1"></span>修饰关系</div>
             <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>指代关系</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Transformer;
