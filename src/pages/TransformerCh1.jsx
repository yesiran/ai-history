import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Play,
  Pause,
  ArrowRight,
} from 'lucide-react';
import {
  transformerScenarios,
  buildTransformerParallelTrace,
  ch1QkvDescriptions,
  ch1GuidedSteps,
} from '../utils/transformer_data';
import TransformerNav from '../components/TransformerNav';

function formatPct(x) {
  return `${(x * 100).toFixed(1)}%`;
}

/* ══════════════════════════════════════
   Chapter 1: 注意力机制
   ══════════════════════════════════════ */
const TransformerCh1 = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      <TransformerNav />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel */}
        <div className="w-full md:w-[38%] h-full overflow-y-auto border-r border-slate-200 bg-white p-6 md:p-10">
          <div className="max-w-2xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div>
              <div className="text-xs text-indigo-500 font-bold mb-1">Chapter 1</div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">注意力机制：词语间的直接对话</h1>
              <p className="text-sm text-slate-500">Transformer 怎么让词与词直接沟通？</p>
            </div>

            {/* Section 1: RNN 的瓶颈 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-xs text-slate-600">1</span>
                RNN 的瓶颈 → Attention 的解法
              </h2>
              <p className="text-sm text-slate-600">
                RNN 逐词阅读，把所有信息压缩到一个状态。句子越长，早期记忆越弱——就像传话游戏。
              </p>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg border border-slate-200 p-2.5">
                    <div className="text-[10px] text-slate-500 font-bold mb-1.5">RNN：逐词传递</div>
                    <div className="flex items-center gap-0.5 text-xs justify-center flex-wrap">
                      {['这', '→', '部', '→', '...', '→', '好'].map((t, i) => (
                        <span key={i} className={t === '→' ? 'text-slate-300 text-[10px]' : 'bg-slate-100 px-1 py-0.5 rounded text-slate-700'}
                          style={t !== '→' ? { opacity: Math.max(0.3, 1 - (i / 12) * 0.9) } : undefined}>{t}</span>
                      ))}
                    </div>
                    <p className="text-[9px] text-rose-500 text-center mt-1.5">信息逐步衰减</p>
                  </div>
                  <div className="bg-white rounded-lg border border-indigo-200 p-2.5">
                    <div className="text-[10px] text-indigo-600 font-bold mb-1.5">Transformer：直接连接</div>
                    <div className="flex items-center gap-1 text-xs justify-center flex-wrap">
                      {['好', '↔', '不', '↔', '看'].map((t, i) => (
                        <span key={i} className={t === '↔' ? 'text-indigo-400 text-[10px] font-bold' : 'bg-indigo-50 px-1 py-0.5 rounded text-indigo-700 font-bold'}>{t}</span>
                      ))}
                    </div>
                    <p className="text-[9px] text-indigo-500 text-center mt-1.5">任意词可直接交互</p>
                  </div>
                </div>
              </div>
              <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-200 text-xs text-indigo-800">
                <strong>核心思路：</strong>如果每个词能直接"看到"任意其他词，就不需要逐步传递了。这就是 Self-Attention。
              </div>
            </section>

            {/* Section 2: Q/K/V 搜索引擎类比 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-xs text-slate-600">2</span>
                Q / K / V：每个词的三个角色
              </h2>
              <p className="text-sm text-slate-600">
                怎么决定"看"哪个词？Transformer 给每个词分配三个角色，就像搜索引擎的工作方式：
              </p>

              <div className="space-y-2">
                <div className="rounded-xl border bg-blue-50 border-blue-200 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-200 text-blue-800">Q</span>
                    <span className="text-sm font-bold text-blue-700">Query — 我在找什么？</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-0.5">就像你在搜索框里输入的关键词</p>
                  <p className="text-xs text-slate-700">"好"的 Query："谁在修饰我？谁改变了我的含义？"</p>
                </div>

                <div className="rounded-xl border bg-amber-50 border-amber-200 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">K</span>
                    <span className="text-sm font-bold text-amber-700">Key — 我是什么？</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-0.5">就像每条搜索结果的标题标签</p>
                  <p className="text-xs text-slate-700">"不"的 Key："否定词——能改变别人的含义"</p>
                </div>

                <div className="rounded-xl border bg-emerald-50 border-emerald-200 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800">V</span>
                    <span className="text-sm font-bold text-emerald-700">Value — 我有什么信息？</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-0.5">就像搜索结果点进去后的实际内容</p>
                  <p className="text-xs text-slate-700">"不"的 Value：否定信号</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-xl border border-indigo-200">
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>匹配过程：</strong>
                  "好"的 Query（"谁修饰我？"）与每个词的 Key 对比 →
                  "不"的 Key（"否定词"）匹配度最高 → 注意力集中 →
                  "好"吸收"不"的 Value → <strong>理解自己处于"不是一般的"语境中 = 极好</strong>
                </p>
              </div>

              <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-200 text-xs text-indigo-800">
                <strong>试试看 →</strong> 右侧点击任意字，查看它的 Q/K/V 和注意力分配。或点击"跟随导览"自动体验。
              </div>
            </section>

            {/* Section 3: 为什么叫"注意力" */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-xs text-slate-600">3</span>
                为什么叫"注意力"？
              </h2>
              <p className="text-sm text-slate-600">
                就像人读文章一样——你的眼睛扫过整段话，但<strong>注意力</strong>会自动聚焦在最重要的词上。
              </p>
              <p className="text-sm text-slate-600">
                Transformer 做的是同样的事：每个词"看到"全句，但通过 Q 和 K 的匹配<strong>选择性地关注</strong>最相关的词，然后吸收它们的 Value。
              </p>
              <p className="text-sm text-slate-600">
                这就是为什么提示词中的措辞很重要——每个词的 Key 会影响其他词的注意力分配。<strong>清晰的表达 = 更准确的匹配 = 更好的理解。</strong>
              </p>
            </section>

            {/* Next chapter */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200">
              <p className="text-xs text-slate-500 mb-2">但只看一层注意力，模型只能发现表面关联。真正的理解需要多层叠加...</p>
              <Link to="/transformer/layers" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                下一章：多层推理 — 理解是如何涌现的 <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-[62%] h-full bg-[#0f172a] text-white flex flex-col relative overflow-hidden">
          <AttentionExplorer />
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   AttentionExplorer (Right Panel)
   ══════════════════════════════════════ */
function AttentionExplorer() {
  const [selectedWordIndex, setSelectedWordIndex] = useState(9); // "好"
  const [isGuided, setIsGuided] = useState(false);
  const [guidedStep, setGuidedStep] = useState(0);
  const [isGuidedPlaying, setIsGuidedPlaying] = useState(false);
  const guidedTimerRef = useRef(null);

  const tokens = transformerScenarios[0].sentence;
  const trace = useMemo(
    () => buildTransformerParallelTrace(tokens),
    [tokens],
  );
  // Use last layer's attention for the "final" weights
  const attentionMatrix = trace[2].attentionMatrix;
  const attentionRow = attentionMatrix[selectedWordIndex];

  const selectedToken = tokens[selectedWordIndex];
  const qkvDesc = ch1QkvDescriptions[selectedToken];

  // Top attention matches (excluding self)
  const attentionItems = useMemo(() => {
    return tokens
      .map((token, idx) => ({ token, idx, weight: attentionRow[idx] }))
      .filter((item) => item.idx !== selectedWordIndex && item.weight > 0.01)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 6);
  }, [attentionRow, selectedWordIndex, tokens]);

  // Guided tour: sync selected word
  useEffect(() => {
    if (isGuided) {
      setSelectedWordIndex(ch1GuidedSteps[guidedStep].wordIndex);
    }
  }, [isGuided, guidedStep]);

  // Guided tour: auto-advance timer
  useEffect(() => {
    if (!isGuidedPlaying) return;
    guidedTimerRef.current = setInterval(() => {
      setGuidedStep((prev) => {
        if (prev >= ch1GuidedSteps.length - 1) {
          setIsGuidedPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 6000);
    return () => clearInterval(guidedTimerRef.current);
  }, [isGuidedPlaying]);

  const startGuidedTour = () => {
    setIsGuided(true);
    setGuidedStep(0);
    setIsGuidedPlaying(true);
  };

  const exitGuidedTour = () => {
    setIsGuided(false);
    setIsGuidedPlaying(false);
    if (guidedTimerRef.current) clearInterval(guidedTimerRef.current);
  };

  const handleSelectWord = (idx) => {
    if (isGuided) exitGuidedTour();
    setSelectedWordIndex(idx);
  };

  const currentGuidedStep = isGuided ? ch1GuidedSteps[guidedStep] : null;

  return (
    <div className="flex flex-col h-full">
      {/* TopBar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-800/60 backdrop-blur shrink-0">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <Search size={16} className="text-indigo-400" />
          注意力探索器
        </div>
        <span className="text-[10px] text-slate-500">点击任意字查看它的 Q / K / V</span>
      </div>

      {/* Main Area */}
      <div className="flex-1 relative overflow-y-auto flex flex-col min-h-0 px-4 py-3 gap-3">
        {/* Sentence with arcs */}
        <div className="shrink-0">
          <SentenceArcs
            tokens={tokens}
            attentionRow={attentionRow}
            selectedWordIndex={selectedWordIndex}
            onSelectWord={handleSelectWord}
          />
        </div>

        {/* Guided tour narrative */}
        <AnimatePresence mode="wait">
          {isGuided && currentGuidedStep && (
            <motion.div
              key={`guided-${guidedStep}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="shrink-0 bg-indigo-500/10 rounded-xl border border-indigo-500/20 p-3"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  导览 {guidedStep + 1}/{ch1GuidedSteps.length}
                </span>
                <span className="text-sm font-bold text-indigo-200">{currentGuidedStep.title}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {currentGuidedStep.narrative}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* QKV Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`qkv-${selectedWordIndex}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
            className="shrink-0"
          >
            <QkvPanel token={selectedToken} desc={qkvDesc} />
          </motion.div>
        </AnimatePresence>

        {/* Attention Bars */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`bars-${selectedWordIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="shrink-0"
          >
            <AttentionBars
              token={selectedToken}
              items={attentionItems}
            />
          </motion.div>
        </AnimatePresence>

        {/* Result Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`result-${selectedWordIndex}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="shrink-0"
          >
            <ResultCard token={selectedToken} result={qkvDesc.result} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Control Bar */}
      <div className="px-4 py-2.5 bg-slate-800 border-t border-slate-700 shrink-0">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            当前查看：<span className="text-indigo-300 font-bold">"{selectedToken}"</span>
          </div>
          <div className="flex items-center gap-2">
            {isGuided ? (
              <>
                <div className="flex items-center gap-1.5">
                  {ch1GuidedSteps.map((step, i) => (
                    <button
                      key={i}
                      onClick={() => { setGuidedStep(i); setIsGuidedPlaying(false); }}
                      className={`w-6 h-6 rounded-full text-[10px] font-bold transition-all ${
                        i === guidedStep
                          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                          : i < guidedStep
                            ? 'bg-indigo-600/50 text-indigo-300'
                            : 'bg-slate-700 text-slate-500'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setIsGuidedPlaying(!isGuidedPlaying)}
                  className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isGuidedPlaying
                      ? 'bg-orange-500 hover:bg-orange-400 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {isGuidedPlaying
                    ? <><Pause size={12} className="mr-1" />暂停</>
                    : <><Play size={12} className="mr-1 fill-current" />继续</>
                  }
                </button>
                <button
                  onClick={exitGuidedTour}
                  className="px-3 py-1.5 rounded-full text-xs text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                >
                  自由探索
                </button>
              </>
            ) : (
              <button
                onClick={startGuidedTour}
                className="flex items-center px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 active:scale-95"
              >
                <Play size={14} className="mr-1.5 fill-current" />
                跟随导览
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   SentenceArcs — 句子 + 注意力弧线
   ══════════════════════════════════════ */
function SentenceArcs({ tokens, attentionRow, selectedWordIndex, onSelectWord }) {
  const containerRef = useRef(null);
  const [svgWidth, setSvgWidth] = useState(600);

  useEffect(() => {
    const measure = () => { if (containerRef.current) setSvgWidth(containerRef.current.offsetWidth); };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const n = tokens.length;
  const arcAreaHeight = 80;
  const sentenceY = arcAreaHeight;
  const chipHeight = 32;
  const totalHeight = sentenceY + chipHeight + 10;
  const innerW = svgWidth - 16;
  const wordX = (idx) => (innerW / (n + 1)) * (idx + 1);

  const arcs = useMemo(() => {
    return attentionRow
      .map((weight, idx) => {
        if (idx === selectedWordIndex || weight < 0.04) return null;
        const x1 = wordX(selectedWordIndex);
        const x2 = wordX(idx);
        const midX = (x1 + x2) / 2;
        const dist = Math.abs(x2 - x1);
        const height = Math.min(dist * 0.55, weight * 130 + 20);
        return {
          idx, weight, height,
          path: `M ${x1} ${sentenceY - 2} Q ${midX} ${sentenceY - 2 - height} ${x2} ${sentenceY - 2}`,
          strokeWidth: Math.max(1.5, weight * 8),
          opacity: Math.max(0.3, Math.min(0.95, weight * 2.5)),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.weight - b.weight);
  }, [attentionRow, selectedWordIndex, innerW, n]);

  return (
    <div ref={containerRef} className="w-full bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden p-2">
      <svg width={innerW} height={totalHeight} className="overflow-visible">
        <defs>
          <linearGradient id="arcGradCh1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>

        {/* Arcs */}
        <AnimatePresence>
          {arcs.map((arc, i) => (
            <motion.g key={`arc-${arc.idx}`}>
              <motion.path
                d={arc.path} fill="none" stroke="url(#arcGradCh1)"
                strokeWidth={arc.strokeWidth} strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: arc.opacity }}
                exit={{ pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              />
              {arc.weight >= 0.06 && (
                <motion.text
                  x={(wordX(selectedWordIndex) + wordX(arc.idx)) / 2}
                  y={sentenceY - 2 - arc.height + 14}
                  textAnchor="middle"
                  className="fill-indigo-300 text-[8px] font-mono"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  {formatPct(arc.weight)}
                </motion.text>
              )}
            </motion.g>
          ))}
        </AnimatePresence>

        {/* Token chips */}
        {tokens.map((token, idx) => {
          const x = wordX(idx);
          const isSelected = idx === selectedWordIndex;
          const weight = attentionRow[idx] || 0;
          const isAttended = !isSelected && weight >= 0.04;
          return (
            <g key={`w-${idx}`} onClick={() => onSelectWord(idx)} className="cursor-pointer">
              <rect
                x={x - 14} y={sentenceY}
                width={28} height={chipHeight}
                rx={6}
                fill={isSelected ? 'rgba(99,102,241,0.3)' : 'rgba(51,65,85,0.5)'}
                fillOpacity={isSelected ? 1 : 0.5}
                stroke={isSelected ? '#818cf8' : 'rgba(71,85,105,0.4)'}
                strokeWidth={isSelected ? 1.5 : 0.5}
              />
              <text
                x={x} y={sentenceY + chipHeight / 2 + 5}
                textAnchor="middle"
                className={`text-sm select-none ${
                  isSelected ? 'fill-white font-bold'
                  : isAttended ? 'fill-indigo-300' : 'fill-slate-500'
                }`}
                style={isAttended ? { opacity: Math.max(0.5, weight * 3) } : undefined}
              >
                {token}
              </text>
              {isSelected && (
                <text x={x} y={sentenceY + chipHeight + 10} textAnchor="middle" className="fill-indigo-400 text-[8px]">
                  ▲ 选中
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════
   QkvPanel — 三个概念卡片
   ══════════════════════════════════════ */
function QkvPanel({ token, desc }) {
  const cards = [
    {
      badge: 'Q', role: 'Query',
      slogan: '我在找什么？',
      content: desc.query,
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
      label: 'bg-blue-500/20 text-blue-300',
      sloganColor: 'text-blue-300',
    },
    {
      badge: 'K', role: 'Key',
      slogan: '我是什么？',
      content: desc.key,
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      label: 'bg-amber-500/20 text-amber-300',
      sloganColor: 'text-amber-300',
    },
    {
      badge: 'V', role: 'Value',
      slogan: '我有什么信息？',
      content: desc.value,
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      label: 'bg-emerald-500/20 text-emerald-300',
      sloganColor: 'text-emerald-300',
    },
  ];

  return (
    <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-bold text-white bg-indigo-500/20 px-2 py-0.5 rounded">"{token}"</span>
        <span className="text-sm text-slate-300">的内心世界</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {cards.map((card, i) => (
          <motion.div
            key={card.badge}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-lg border ${card.border} ${card.bg} p-2.5`}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${card.label}`}>
                {card.badge}
              </span>
              <span className="text-[10px] text-slate-400">{card.role}</span>
            </div>
            <div className={`text-[10px] ${card.sloganColor} font-bold mb-1`}>{card.slogan}</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{card.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   AttentionBars — 匹配结果
   ══════════════════════════════════════ */
function AttentionBars({ token, items }) {
  const maxWeight = items.length > 0 ? Math.max(...items.map((i) => i.weight)) : 1;

  return (
    <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">匹配结果</span>
        <span className="text-sm text-slate-300">"{token}" 最关注谁？</span>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => {
          const keyDesc = ch1QkvDescriptions[item.token]?.key || '';
          return (
            <motion.div
              key={`bar-${item.idx}`}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <span className="text-sm text-white font-bold w-5 text-center shrink-0">{item.token}</span>
              <div className="flex-1 h-3.5 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(4, (item.weight / maxWeight) * 100)}%` }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                />
              </div>
              <span className="text-[11px] font-mono text-indigo-300 w-10 text-right font-bold shrink-0">
                {formatPct(item.weight)}
              </span>
              {keyDesc && (
                <span className="text-[10px] text-slate-500 ml-1 hidden sm:inline truncate" style={{ maxWidth: '120px' }}>
                  {keyDesc}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-500 mt-2">
        Q 和 K 越匹配 → 注意力权重越高 → 吸收的 V 信息越多
      </p>
    </div>
  );
}

/* ══════════════════════════════════════
   ResultCard — 注意力之后的理解
   ══════════════════════════════════════ */
function ResultCard({ token, result }) {
  return (
    <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">结论</span>
        <span className="text-sm text-slate-300">"{token}" 注意力之后的理解</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">{result}</p>
    </div>
  );
}

export default TransformerCh1;
