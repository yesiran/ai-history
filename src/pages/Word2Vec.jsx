import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Info, Network, Calculator, Target, Search, ArrowRight } from 'lucide-react';
import { wordVectors, categories, findNearest, vectorArithmetic } from '../utils/word2vec_data';

export default function Word2Vec() {
  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-slate-50">
      {/* Left Panel: Theory */}
      <div className="w-full md:w-1/2 h-full overflow-y-auto border-r border-slate-200 bg-white p-6 md:p-10">
        <Link to="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-6 transition-colors text-sm font-medium">
          <ChevronLeft size={16} className="mr-1" /> 返回首页
        </Link>

        <div className="max-w-2xl mx-auto space-y-12 pb-20">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Network size={24} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 m-0">Word2Vec 词向量</h1>
            </div>
            <p className="text-lg text-slate-500">词语的意义，是它在空间中的位置</p>
          </div>

          <section className="space-y-4">
             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-sm text-slate-600">1</span>
              比喻：语言的“超市货架”
            </h2>
            <p className="text-slate-600">
               如果我们要把字典里的词整理好，最好的办法不是按拼音排序，而是按<strong>“意思”</strong>分类。
            </p>
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
               <div className="flex justify-around text-center text-sm">
                  <div className="bg-white p-3 rounded shadow-sm w-24">
                     <div className="text-2xl mb-1">🍎</div>
                     <div className="text-slate-600 font-bold">水果区</div>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm w-24">
                     <div className="text-2xl mb-1">🦁</div>
                     <div className="text-slate-600 font-bold">动物区</div>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm w-24">
                     <div className="text-2xl mb-1">👑</div>
                     <div className="text-slate-600 font-bold">皇室区</div>
                  </div>
               </div>
               <p className="text-xs text-slate-500 text-center mt-3">Word2Vec 就是把每个词通过计算，摆放到这个巨大的多维空间里。</p>
            </div>
          </section>

          <section className="space-y-4">
             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-sm text-slate-600">2</span>
              它怎么学会的？(训练揭秘)
            </h2>
            <p className="text-slate-600">
               其实机器并没有谁教它“苹果是水果”。它只是在做一个疯狂的<strong>“完形填空”</strong>游戏。
            </p>
            
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
               <div className="p-4 bg-slate-50 border-b border-slate-200 text-center">
                  <span className="text-slate-400 text-sm">训练题目：</span>
                  <div className="text-lg font-mono mt-1 text-slate-800">
                    我爱喝 <span className="bg-slate-300 px-2 rounded text-transparent relative select-none">??
                      <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-bold text-xs">MASK</div>
                    </span> 汁
                  </div>
               </div>
               <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                     <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-xs font-bold">√</span>
                     <div className="text-sm">
                        <span className="font-bold text-green-700">苹果</span>、<span className="font-bold text-green-700">橙子</span>、<span className="font-bold text-green-700">葡萄</span>
                        <div className="text-xs text-slate-500">经常出现在这里 → <strong>拉近</strong>它们与“喝/汁”的距离。</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold">×</span>
                     <div className="text-sm">
                        <span className="font-bold text-slate-400 line-through">卡车</span>、<span className="font-bold text-slate-400 line-through">电脑</span>
                        <div className="text-xs text-slate-500">几乎不出现在这里 → <strong>推远</strong>距离。</div>
                     </div>
                  </div>
               </div>
               <div className="bg-yellow-50 p-3 text-xs text-yellow-800 border-t border-yellow-100">
                  <strong>结论：</strong> 因为“苹果”和“橙子”总是在相同的上下文中出现（都是被喝的），机器就认为它们是“同类”，把它们的坐标画在了一起。
               </div>
            </div>
          </section>

          <section className="space-y-4">
             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-sm text-slate-600">3</span>
              神奇的“词语算数”
            </h2>
            <p className="text-slate-600">
               最让人震惊的发现是，这些数字不仅仅代表位置，还隐含了<strong>逻辑关系</strong>。机器通过坐标运算，展现出了类似人类的类比推理能力。
            </p>
            
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 space-y-6">
              <EquationBox a="国王" sign1="-" b="男人" sign2="+" c="女人" result="女王" desc="性别关系的迁移" />
              <div className="w-full h-px bg-purple-200"></div>
              <EquationBox a="北京" sign1="-" b="中国" sign2="+" c="法国" result="巴黎" desc="首都与国家的关系" />
              <div className="w-full h-px bg-purple-200"></div>
              <EquationBox a="医生" sign1="-" b="医院" sign2="+" c="学校" result="老师" desc="职业与工作场所" />

              <p className="text-xs text-purple-800 text-center pt-2">
                <strong>核心原理：</strong> 语义关系 = 向量差值。<br/>
                (国王 - 男人) 的向量方向，就代表了“皇室身份”；<br/>
                (北京 - 中国) 的向量方向，就代表了“是...的首都”。
              </p>
            </div>
          </section>

          {/* Section 4: Why is this a leap? (VS N-gram) */}
          <section className="space-y-4">
             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-sm text-slate-600">4</span>
              为什么这是一次飞跃？(VS N-gram)
            </h2>
            <p className="text-slate-600 mb-4">
              N-gram 只懂“死记硬背”，Word2Vec 则拥有了“举一反三”的能力，这是从统计到理解的关键一步。
            </p>
            <NgramVsWord2Vec />
          </section>
        </div>
      </div>

      {/* Right Panel: Interactive Galaxy */}
      <div className="w-full md:w-1/2 h-full bg-slate-900 text-white flex flex-col relative overflow-hidden">
        <VectorGalaxy />
      </div>
    </div>
  );
}

function VectorGalaxy() {
  const [mode, setMode] = useState('explore'); // 'explore' | 'calculate'
  const [hoveredWord, setHoveredWord] = useState(null);
  
  // Calculation State
  const [calcA, setCalcA] = useState('国王');
  const [calcB, setCalcB] = useState('男人');
  const [calcC, setCalcC] = useState('女人');

  // Galaxy Viewport Settings
  const width = 600;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 2.5; 

  const resultVector = vectorArithmetic(calcA, calcB, calcC);
  const nearestToResult = resultVector ? findNearest(resultVector, 1)[0] : null;

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
           <Network className="text-purple-400" />
           <span className="font-bold">语义星空 (Semantic Space)</span>
        </div>
        
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
           <button 
             onClick={() => setMode('explore')}
             className={`px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-2 ${mode === 'explore' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
           >
             <Search size={14} /> 漫游模式
           </button>
           <button 
             onClick={() => setMode('calculate')}
             className={`px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-2 ${mode === 'calculate' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
           >
             <Calculator size={14} /> 计算模式
           </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-grow relative overflow-hidden flex items-center justify-center cursor-move bg-slate-900">
         {/* Grid Background */}
         <div className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
              }}>
         </div>

         {/* SVG Visualization */}
         <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full max-w-[800px]">
            {/* 1. Draw Axis Lines (Optional) */}
            <line x1={0} y1={centerY} x2={width} y2={centerY} stroke="#334155" strokeWidth="1" />
            <line x1={centerX} y1={0} x2={centerX} y2={height} stroke="#334155" strokeWidth="1" />

            {/* 2. Draw Calculation Arrows (Only in Calculate Mode) */}
            {mode === 'calculate' && resultVector && (
              <>
                 {/* Vector A (Origin -> A) - Not drawn to keep clean, or maybe draw faint */}
                 
                 {/* Vector A-B (Red Arrow): Showing subtraction */}
                 <line 
                   x1={centerX + wordVectors[calcA].x * scale} 
                   y1={centerY - wordVectors[calcA].y * scale} 
                   x2={centerX + (wordVectors[calcA].x - wordVectors[calcB].x) * scale} 
                   y2={centerY - (wordVectors[calcA].y - wordVectors[calcB].y) * scale} 
                   stroke="#ef4444" 
                   strokeWidth="2" 
                   strokeDasharray="4"
                   opacity="0.6"
                 />

                 {/* Vector Result (Purple Arrow pointing to result) */}
                 <line 
                   x1={centerX + (wordVectors[calcA].x - wordVectors[calcB].x) * scale} 
                   y1={centerY - (wordVectors[calcA].y - wordVectors[calcB].y) * scale} 
                   x2={centerX + resultVector.x * scale} 
                   y2={centerY - resultVector.y * scale} 
                   stroke="#a855f7" 
                   strokeWidth="3" 
                   markerEnd="url(#arrowhead)"
                 />
                 
                 {/* Target Spot */}
                 <circle 
                   cx={centerX + resultVector.x * scale} 
                   cy={centerY - resultVector.y * scale} 
                   r="6" 
                   fill="none" 
                   stroke="#a855f7" 
                   className="animate-ping"
                 />
              </>
            )}

            {/* Definitions for markers */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#a855f7" />
              </marker>
            </defs>

            {/* 3. Draw Word Points */}
            {Object.entries(wordVectors).map(([word, pos]) => {
               const x = centerX + pos.x * scale;
               const y = centerY - pos.y * scale;
               const isSelected = mode === 'calculate' && [calcA, calcB, calcC].includes(word);
               const isTarget = mode === 'calculate' && nearestToResult && nearestToResult.word === word;
               const isHovered = hoveredWord === word;
               const categoryColor = categories[pos.category].color;

               return (
                 <g 
                   key={word} 
                   onClick={() => {
                     // Simple interaction: if in calc mode, cycle through A, B, C selection? 
                     // For now, simple console log or set hovered
                   }}
                   onMouseEnter={() => setHoveredWord(word)}
                   onMouseLeave={() => setHoveredWord(null)}
                   style={{ transition: 'all 0.3s ease' }}
                   className="cursor-pointer"
                 >
                   <circle 
                     cx={x} 
                     cy={y} 
                     r={isSelected || isTarget || isHovered ? 8 : 5} 
                     fill={categoryColor}
                     opacity={mode === 'calculate' && !isSelected && !isTarget ? 0.3 : 1}
                     className="transition-all duration-300"
                   />
                   <text 
                     x={x} 
                     y={y - 12} 
                     textAnchor="middle" 
                     fill="white" 
                     fontSize={isSelected || isTarget || isHovered ? "14" : "10"}
                     fontWeight={isSelected || isTarget ? "bold" : "normal"}
                     opacity={mode === 'calculate' && !isSelected && !isTarget ? 0.3 : 0.8}
                     className="pointer-events-none select-none transition-all duration-300 shadow-black drop-shadow-md"
                   >
                     {word}
                   </text>
                 </g>
               );
            })}
         </svg>

         {/* Legend */}
         <div className="absolute bottom-4 left-4 bg-slate-800/80 p-3 rounded-lg backdrop-blur text-xs border border-slate-700">
            <div className="font-bold mb-2 text-slate-400">词性分类</div>
            <div className="space-y-1">
              {Object.entries(categories).map(([key, cat]) => (
                <div key={key} className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                   <span>{cat.label}</span>
                </div>
              ))}
            </div>
         </div>

         {/* Vector Data Inspector */}
         <div className="absolute bottom-4 right-4 bg-slate-800/90 p-4 rounded-lg backdrop-blur border border-slate-700 font-mono shadow-xl max-w-[200px]">
            <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Vector Data</div>
            <div className="text-lg font-bold text-white mb-2">
              {hoveredWord || <span className="text-slate-600 italic">...</span>}
            </div>
            {hoveredWord && wordVectors[hoveredWord] ? (
              <div className="space-y-1 text-xs text-green-400">
                <div className="flex justify-between">
                  <span className="text-slate-500">x:</span> 
                  <span>{wordVectors[hoveredWord].x.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">y:</span> 
                  <span>{wordVectors[hoveredWord].y.toFixed(4)}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-600">
                Hover over a point to reveal its numerical representation.
              </div>
            )}
         </div>
      </div>

      {/* Bottom Control Panel (Calculate Mode Only) */}
      {mode === 'calculate' && (
        <div className="bg-slate-800 border-t border-slate-700 p-4 md:p-6 z-10">
           <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-700">
                 <Select value={calcA} onChange={setCalcA} />
                 <span className="text-slate-500 font-mono">-</span>
                 <Select value={calcB} onChange={setCalcB} />
                 <span className="text-slate-500 font-mono">+</span>
                 <Select value={calcC} onChange={setCalcC} />
              </div>
              
              <ArrowRight className="text-slate-500 hidden md:block" />
              <div className="hidden md:flex text-slate-500 transform rotate-90 md:rotate-0">
                 <ArrowRight />
              </div>

              <div className="flex items-center gap-3">
                 <div className="text-sm text-slate-400">结果最接近:</div>
                 <div className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg shadow-purple-900/50 animate-pulse">
                    {nearestToResult ? nearestToResult.word : "?"}
                 </div>
              </div>
           </div>
           <p className="text-center text-slate-500 text-xs mt-4 mb-2">
             尝试组合：
           </p>
           <div className="flex justify-center gap-2">
              <button 
                onClick={() => { setCalcA('国王'); setCalcB('男人'); setCalcC('女人'); }}
                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition-colors"
              >
                [国王]-[男人]+[女人]
              </button>
              <button 
                onClick={() => { setCalcA('北京'); setCalcB('中国'); setCalcC('法国'); }}
                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition-colors"
              >
                [北京]-[中国]+[法国]
              </button>
              <button 
                onClick={() => { setCalcA('爸爸'); setCalcB('男人'); setCalcC('女人'); }}
                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition-colors"
              >
                [爸爸]-[男人]+[女人]
              </button>
              <button 
                onClick={() => { setCalcA('医生'); setCalcB('医院'); setCalcC('学校'); }}
                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition-colors"
              >
                [医生]-[医院]+[学校]
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

// Helper Select Component
function Select({ value, onChange }) {
  return (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-700 text-white border-none rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer hover:bg-slate-600 transition-colors appearance-none"
    >
      {Object.keys(wordVectors).map(w => (
        <option key={w} value={w}>{w}</option>
      ))}
    </select>
  );
}

function NgramVsWord2Vec() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
      {/* N-gram Side */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0"><Target size={20} /></div>
          <h3 className="font-bold text-red-800 text-lg m-0">N-gram: 死记硬背</h3>
        </div>
        <p className="text-red-700 text-sm mb-3">
          它像一个只会查字典的孩子。如果语料库里从未出现过某个组合，它就无能为力。
        </p>
        <div className="bg-white p-3 rounded-lg border border-red-100 text-center font-mono text-sm shadow-sm">
          <p className="text-slate-700">语料库："我爱吃<span className="font-bold text-green-600">苹果</span>"</p>
          <div className="my-2 w-full h-px bg-slate-100"></div>
          <p className="text-slate-700">预测 "我爱吃 <span className="font-bold text-red-600">梨</span>"</p>
          <div className="flex items-center justify-center mt-3 gap-2 text-red-600 font-bold">
            <Info size={18} /> 未知组合！概率 <span className="text-xl">0%</span>
          </div>
        </div>
        <p className="text-xs text-red-600 mt-3">
          N-gram 认为 "苹果" 和 "梨" 是两个完全独立的符号，没有任何关联。
        </p>
      </div>

      {/* Word2Vec Side */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-green-100 text-green-600 rounded-lg shrink-0"><Network size={20} /></div>
          <h3 className="font-bold text-green-800 text-lg m-0">Word2Vec: 举一反三</h3>
        </div>
        <p className="text-green-700 text-sm mb-3">
          它将词映射到语义空间，"梨" 离 "苹果" 很近，即使未见过也能推理。
        </p>
        <div className="bg-white p-3 rounded-lg border border-green-100 text-center font-mono text-sm shadow-sm">
          <p className="text-slate-700">语料库："我爱吃<span className="font-bold text-green-600">苹果</span>"</p>
          <div className="my-2 w-full h-px bg-slate-100"></div>
          <p className="text-slate-700">预测 "我爱吃 <span className="font-bold text-blue-600">梨</span>"</p>
          <div className="flex items-center justify-center mt-3 gap-2 text-green-600 font-bold">
            <ArrowRight size={18} /> 距离很近！概率 <span className="text-xl">高</span>
          </div>
        </div>
        <p className="text-xs text-green-600 mt-3">
          Word2Vec 理解 "苹果" 和 "梨" 都是水果，在语义空间中位置相近。
        </p>
      </div>
    </div>
  );
}

function EquationBox({ a, b, c, result, sign1, sign2, desc }) {
  const va = wordVectors[a];
  const vb = wordVectors[b];
  const vc = wordVectors[c];
  const vr = wordVectors[result];

  return (
    <div>
      <div className="text-xs font-bold text-purple-600 mb-2 uppercase tracking-wide">{desc}</div>
      <div className="flex flex-wrap items-center gap-1.5 font-bold text-slate-700 mb-2 text-sm md:text-base">
         <span className="bg-white px-2 py-1 rounded shadow-sm border border-purple-100">{a}</span>
         <span className="text-purple-400 font-mono">{sign1}</span>
         <span className="bg-white px-2 py-1 rounded shadow-sm border border-purple-100">{b}</span>
         <span className="text-purple-400 font-mono">{sign2}</span>
         <span className="bg-white px-2 py-1 rounded shadow-sm border border-purple-100">{c}</span>
         <span className="text-purple-400 font-mono">=</span>
         <span className="bg-purple-600 text-white px-2 py-1 rounded shadow-md border border-purple-600">{result}</span>
      </div>
      
      {/* Vector Math */}
      <div className="font-mono text-[10px] md:text-xs text-slate-500 bg-white/50 p-2 rounded border border-purple-100/50 overflow-x-auto whitespace-nowrap flex items-center gap-1">
        <span className="opacity-70">[{va.x}, {va.y}]</span>
        <span>{sign1}</span>
        <span className="opacity-70">[{vb.x}, {vb.y}]</span>
        <span>{sign2}</span>
        <span className="opacity-70">[{vc.x}, {vc.y}]</span>
        <span>=</span>
        <span className="text-purple-700 font-bold">[{vr.x}, {vr.y}]</span>
      </div>
    </div>
  );
}
