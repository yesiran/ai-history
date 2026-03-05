import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  ChevronLeft,
  Layers,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  ch2Sentence,
  buildCh2Trace,
  embeddingCategories,
  ch2LayerDiscoveries,
} from '../utils/transformer_data';
import TransformerNav from '../components/TransformerNav';

function formatPct(x) {
  return `${(x * 100).toFixed(1)}%`;
}

/* ══════════════════════════════════════
   Chapter 2: 多层推理
   ══════════════════════════════════════ */
const TransformerCh2 = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      <TransformerNav />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel */}
        <div className="w-full md:w-[38%] h-full overflow-y-auto border-r border-slate-200 bg-white p-6 md:p-10">
          <div className="max-w-2xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div>
              <div className="text-xs text-purple-500 font-bold mb-1">Chapter 2</div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">多层推理：理解是如何涌现的</h1>
              <p className="text-sm text-slate-500">为什么需要多层？每一层到底在干什么？</p>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-xs text-slate-600">1</span>
                一层注意力远远不够
              </h2>
              <p className="text-sm text-slate-600">
                想象你读这句话：<strong>"他在乔布斯创办的公司工作了十年"</strong>
              </p>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-slate-400 shrink-0 mt-0.5">第一遍</span>
                  <p className="text-xs text-slate-600">看到 15 个字——"乔""布""斯"只是三个独立的字符</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-indigo-400 shrink-0 mt-0.5">第二遍</span>
                  <p className="text-xs text-slate-600">发现结构——"乔布斯创办的"是一个定语，修饰"公司"</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-purple-500 shrink-0 mt-0.5">第三遍</span>
                  <p className="text-xs text-slate-600">推理出含义——这家公司是苹果，"他"是一位资深员工</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                Transformer 的多层架构就是在做同样的事——每一层都是一次"重读"，理解逐步加深。
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-xs text-slate-600">2</span>
                每层学到了什么？看注意力就知道
              </h2>
              <p className="text-sm text-slate-600">
                注意力权重揭示了模型在"关注"什么。权重越高，信息流动越多。随着层数增加，关注的范围从<strong>相邻字</strong>扩展到<strong>跨句结构</strong>，最终达到<strong>语义推理</strong>。
              </p>
              <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200 text-xs text-purple-800">
                <strong>试试看 →</strong> 右侧逐层播放，观察每一层的注意力如何变化、模型如何一步步"理解"这句话。
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-xs text-slate-600">3</span>
                向量空间的隐藏结构
              </h2>
              <p className="text-sm text-slate-600">
                3Blue1Brown 在深度学习系列中展示了一个惊人的发现：
              </p>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">语法树从向量中浮现</h3>
                  <p className="text-xs text-slate-600">
                    研究者对 Transformer 内部的词向量做低维投影，发现——语法结构<strong>自动浮现</strong>。
                    没有人教模型语法，但它自己学会了。
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">世界地图从文字中涌现</h3>
                  <p className="text-xs text-slate-600">
                    纯文字训练的模型，在向量空间中自发形成了地理位置的空间关系。
                    这暗示 Transformer 不只是在做"统计匹配"——它在构建<strong>内部世界模型</strong>。
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-xs text-slate-600">4</span>
                为什么这很重要
              </h2>
              <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-14 text-slate-400 font-bold">浅层</span>
                  <span className="text-slate-600">字符配对、相邻词组识别</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-14 text-indigo-400 font-bold">中间层</span>
                  <span className="text-slate-600">语法结构、定语/状语关系</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-14 text-purple-500 font-bold">深层</span>
                  <span className="text-slate-600">语义推理、隐含知识、身份推断</span>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                GPT-4 有 120+ 层，每一层都在已有理解的基础上继续深化。更多层 = 更强的理解能力。
              </p>
            </section>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Link to="/transformer" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-indigo-600 transition-colors">
                <ChevronLeft size={14} /> 上一章：注意力机制
              </Link>
              <Link to="/transformer/prediction" className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                下一章：生成与预测 <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-[62%] h-full bg-[#0f172a] text-white flex flex-col relative overflow-hidden">
          <LayerExplorer />
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   LayerExplorer (Right Panel)
   ══════════════════════════════════════ */
function LayerExplorer() {
  const [layerIdx, setLayerIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  const playTimerRef = useRef(null);
  const tokens = ch2Sentence;
  const trace = useMemo(() => buildCh2Trace(tokens), [tokens]);

  const currentDiscoveryData = ch2LayerDiscoveries[started ? layerIdx : 0];

  // Collect all connections for the current layer (for arcs)
  const allConnections = useMemo(() => {
    if (!started || !currentDiscoveryData.discoveries.length) return [];
    return currentDiscoveryData.discoveries.flatMap((d) => d.connections);
  }, [started, currentDiscoveryData]);

  // Collect all highlighted token indices
  const allHighlights = useMemo(() => {
    if (!started || !currentDiscoveryData.discoveries.length) return new Set();
    const s = new Set();
    currentDiscoveryData.discoveries.forEach((d) => d.highlight.forEach((i) => s.add(i)));
    return s;
  }, [started, currentDiscoveryData]);

  // Get attention matrix for the current layer
  const currentAttention = layerIdx > 0 ? trace[layerIdx - 1].attentionMatrix : null;
  // Get previous layer attention for delta computation
  const prevAttention = layerIdx > 1 ? trace[layerIdx - 2].attentionMatrix : null;

  const advanceLayer = useCallback(() => {
    if (!started) setStarted(true);
    setLayerIdx((prev) => {
      if (prev < 3) return prev + 1;
      setIsPlaying(false);
      return prev;
    });
  }, [started]);

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = 4000;
    playTimerRef.current = setInterval(advanceLayer, intervalMs);
    return () => clearInterval(playTimerRef.current);
  }, [isPlaying, advanceLayer]);

  const handleReset = () => {
    setIsPlaying(false);
    setStarted(false);
    setLayerIdx(0);
    if (playTimerRef.current) clearInterval(playTimerRef.current);
  };

  const togglePlay = () => {
    if (isPlaying) { setIsPlaying(false); return; }
    if (layerIdx >= 3) { setLayerIdx(0); }
    if (!started) setStarted(true);
    setIsPlaying(true);
  };

  const goToLayer = (idx) => {
    setIsPlaying(false);
    if (!started) setStarted(true);
    setLayerIdx(idx);
  };

  return (
    <div className="flex flex-col h-full">
      {/* TopBar */}
      <div className="flex items-center px-4 py-2 border-b border-slate-700/50 bg-slate-800/60 backdrop-blur shrink-0">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <Layers size={16} className="text-purple-400" />
          逐层理解引擎
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 relative overflow-y-auto flex flex-col min-h-0 px-4 py-3 gap-3">
        {/* Sentence with arcs */}
        <div className="shrink-0">
          <SentenceWithArcs
            tokens={tokens}
            connections={allConnections}
            highlights={allHighlights}
            attentionMatrix={currentAttention}
            started={started}
          />
        </div>

        {/* Layer Header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`header-${started ? layerIdx : -1}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="shrink-0"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                !started || layerIdx === 0 ? 'bg-slate-500/20 text-slate-300'
                : layerIdx === 1 ? 'bg-indigo-500/20 text-indigo-300'
                : layerIdx === 2 ? 'bg-purple-500/20 text-purple-300'
                : 'bg-violet-500/20 text-violet-300'
              }`}>
                {!started ? '等待开始' : layerIdx === 0 ? '初始' : `Layer ${layerIdx}`}
              </span>
              <span className="text-sm font-bold text-slate-200">
                {started ? currentDiscoveryData.title : '点击"开始演示"逐层探索'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {started ? currentDiscoveryData.summary : '观察模型如何从"15个独立字符"逐步理解出"他是苹果公司的资深员工"。'}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Discovery Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`discoveries-${started ? layerIdx : -1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 shrink-0"
          >
            {started && currentDiscoveryData.discoveries.length > 0 ? (
              currentDiscoveryData.discoveries.map((discovery, i) => (
                <DiscoveryCard
                  key={`${layerIdx}-${i}`}
                  discovery={discovery}
                  index={i}
                  tokens={tokens}
                  attentionMatrix={currentAttention}
                  prevAttention={prevAttention}
                  layerIdx={layerIdx}
                />
              ))
            ) : started ? (
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6 text-center">
                <div className="text-2xl mb-2 opacity-40">📝</div>
                <p className="text-sm text-slate-500">
                  每个字只有自己的嵌入向量，互不关联。
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  "乔""布""斯"只是三个独立字符——模型还不知道它们是一个名字。
                </p>
              </div>
            ) : (
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6 text-center">
                <p className="text-sm text-slate-500">
                  点击下方"开始演示"，逐层观察模型如何理解这句话
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Control Bar */}
      <div className="px-4 py-2.5 bg-slate-800 border-t border-slate-700 shrink-0">
        <div className="flex gap-1 mb-2.5">
          {[0, 1, 2, 3].map((l) => (
            <div key={l} className="h-1.5 flex-1 rounded-full transition-colors duration-300 cursor-pointer"
              onClick={() => goToLayer(l)}
              style={{
                backgroundColor: l <= layerIdx && started
                  ? (l === layerIdx ? '#a78bfa' : '#7c3aed')
                  : 'rgba(100,116,139,0.3)',
              }} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {['初始', 'L1', 'L2', 'L3'].map((label, i) => (
              <button key={i} onClick={() => goToLayer(i)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  layerIdx === i && started
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-500 hover:text-white hover:bg-slate-700'
                }`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleReset} className="p-1.5 rounded-full hover:bg-slate-700 text-slate-400 transition-colors text-xs">
              重置
            </button>
            {!started && !isPlaying ? (
              <button onClick={togglePlay}
                className="flex items-center px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all shadow-lg shadow-purple-600/30 active:scale-95">
                开始演示 <Play size={14} className="ml-2 fill-current" />
              </button>
            ) : (
              <button onClick={togglePlay}
                className={`flex items-center px-4 py-2 rounded-full text-white font-medium text-sm transition-all active:scale-95 ${
                  isPlaying ? 'bg-orange-500 hover:bg-orange-400 shadow-lg shadow-orange-500/30'
                  : 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30'
                }`}>
                {isPlaying ? <><Pause size={14} className="mr-1.5" />暂停</> : <><Play size={14} className="mr-1.5 fill-current" />继续</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   SentenceWithArcs — 句子 + 注意力弧线
   ══════════════════════════════════════ */
function SentenceWithArcs({ tokens, connections, highlights, attentionMatrix, started }) {
  const containerRef = useRef(null);
  const [svgWidth, setSvgWidth] = useState(600);

  useEffect(() => {
    const measure = () => { if (containerRef.current) setSvgWidth(containerRef.current.offsetWidth); };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const n = tokens.length;
  const arcAreaHeight = 90;
  const sentenceY = arcAreaHeight + 5;
  const chipHeight = 32;
  const totalHeight = sentenceY + chipHeight + 10;
  const wordX = (idx) => (svgWidth / (n + 1)) * (idx + 1);

  // Build arcs from connections with actual attention weights
  const arcs = useMemo(() => {
    if (!attentionMatrix || !connections.length) return [];
    return connections.map((conn) => {
      const weight = attentionMatrix[conn.from][conn.to];
      const x1 = wordX(conn.from);
      const x2 = wordX(conn.to);
      const midX = (x1 + x2) / 2;
      const dist = Math.abs(x2 - x1);
      const height = Math.min(dist * 0.5, Math.max(30, weight * 120 + 20));
      return {
        ...conn,
        weight,
        path: `M ${x1} ${sentenceY - 2} Q ${midX} ${sentenceY - 2 - height} ${x2} ${sentenceY - 2}`,
        strokeWidth: Math.max(1.5, weight * 7),
        opacity: Math.max(0.35, Math.min(0.9, weight * 2.5)),
      };
    }).sort((a, b) => a.weight - b.weight);
  }, [connections, attentionMatrix, svgWidth, n]);

  return (
    <div ref={containerRef} className="w-full bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden p-2">
      <svg width={svgWidth - 16} height={totalHeight} className="overflow-visible">
        <defs>
          <linearGradient id="arcGradCh2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>

        {/* Arcs */}
        <AnimatePresence>
          {arcs.map((arc, i) => (
            <motion.g key={`arc-${arc.from}-${arc.to}`}>
              <motion.path
                d={arc.path} fill="none" stroke="url(#arcGradCh2)"
                strokeWidth={arc.strokeWidth} strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: arc.opacity }}
                exit={{ pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              />
              {/* Weight label on arc */}
              {arc.weight >= 0.06 && (
                <motion.text
                  x={(wordX(arc.from) + wordX(arc.to)) / 2}
                  y={sentenceY - 2 - Math.min(Math.abs(wordX(arc.to) - wordX(arc.from)) * 0.5, Math.max(30, arc.weight * 120 + 20)) + 14}
                  textAnchor="middle"
                  className="fill-purple-300 text-[8px] font-mono"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
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
          const isHighlighted = started && highlights.has(idx);
          const cat = embeddingCategories[token];
          return (
            <g key={`chip-${idx}`}>
              {/* Chip background */}
              <rect
                x={x - 13} y={sentenceY}
                width={26} height={chipHeight}
                rx={6}
                fill={isHighlighted ? cat.color : 'rgba(51,65,85,0.5)'}
                fillOpacity={isHighlighted ? 0.25 : 0.5}
                stroke={isHighlighted ? cat.color : 'rgba(71,85,105,0.4)'}
                strokeWidth={isHighlighted ? 1.5 : 0.5}
                strokeOpacity={isHighlighted ? 0.7 : 0.5}
              />
              {/* Token text */}
              <text
                x={x} y={sentenceY + chipHeight / 2 + 5}
                textAnchor="middle"
                className={`text-sm select-none ${isHighlighted ? 'fill-white font-bold' : 'fill-slate-500'}`}
              >
                {token}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════
   DiscoveryCard — 单个发现
   ══════════════════════════════════════ */
function DiscoveryCard({ discovery, index, tokens, attentionMatrix, prevAttention, layerIdx }) {
  const borderColors = ['border-indigo-500/30', 'border-purple-500/30', 'border-violet-500/30'];
  const badgeColors = ['bg-indigo-500/20 text-indigo-300', 'bg-purple-500/20 text-purple-300', 'bg-violet-500/20 text-violet-300'];
  const barColors = ['bg-indigo-500', 'bg-purple-500', 'bg-violet-500'];

  const bIdx = Math.min(index, borderColors.length - 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.15 }}
      className={`bg-slate-800/60 rounded-xl border ${borderColors[bIdx]} p-4`}
    >
      {/* Title */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeColors[bIdx]}`}>
          发现 {index + 1}
        </span>
        <span className="text-sm font-bold text-slate-200">{discovery.title}</span>
      </div>

      {/* Attention Evidence */}
      <div className="space-y-2 mb-3">
        <div className="text-[10px] text-slate-500 font-bold">注意力证据</div>
        {discovery.connections.map((conn, ci) => {
          const weight = attentionMatrix ? attentionMatrix[conn.from][conn.to] : 0;
          const prevWeight = prevAttention ? prevAttention[conn.from][conn.to] : 0;
          const delta = weight - prevWeight;
          const maxWeight = 0.4; // normalize bar to this max

          return (
            <motion.div
              key={`ev-${ci}`}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 + ci * 0.08 }}
            >
              {/* Label */}
              <span className="text-[11px] text-slate-300 font-mono w-12 shrink-0">{conn.label}</span>
              {/* Bar */}
              <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${barColors[bIdx]}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(4, (weight / maxWeight) * 100)}%` }}
                  transition={{ duration: 0.5, delay: index * 0.15 + ci * 0.08 }}
                />
              </div>
              {/* Percentage */}
              <span className="text-[11px] font-mono text-slate-300 w-10 text-right font-bold">
                {formatPct(weight)}
              </span>
              {/* Delta */}
              {layerIdx > 1 && Math.abs(delta) > 0.005 && (
                <span className={`text-[9px] font-mono w-10 text-right flex items-center justify-end gap-0.5 ${
                  delta > 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {delta > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {Math.abs(delta * 100).toFixed(0)}%
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Explanation */}
      <motion.p
        className="text-xs text-slate-400 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.15 + 0.3 }}
      >
        {discovery.explanation}
      </motion.p>
    </motion.div>
  );
}

export default TransformerCh2;
