import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import {
  buildTransformerGenerationTrace,
  generationSentence,
  generationExplanations,
  vocabPrediction,
  predictionStorySteps,
} from '../utils/transformer_data';
import TransformerNav from '../components/TransformerNav';

const PREDICTION_STEPS = 4;

function formatPct(x) {
  return `${(x * 100).toFixed(1)}%`;
}

/* ══════════════════════════════════════
   Chapter 3: 生成与预测
   ══════════════════════════════════════ */
const TransformerCh3 = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      <TransformerNav />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel */}
        <div className="w-full md:w-[38%] h-full overflow-y-auto border-r border-slate-200 bg-white p-6 md:p-10">
          <div className="max-w-2xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div>
              <div className="text-xs text-amber-500 font-bold mb-1">Chapter 3</div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">生成与预测：Transformer 怎么写文章</h1>
              <p className="text-sm text-slate-500">模型怎么从"理解"走到"生成下一个词"？</p>
            </div>

            {/* Section 1: 从理解到生成 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-xs text-slate-600">1</span>
                从理解到生成
              </h2>
              <p className="text-sm text-slate-600">
                前两章我们看到 Transformer 如何通过多层注意力理解一句话。
                生成文本用的是<strong>完全相同的机制</strong>，只需要加一个小小的约束：
              </p>
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-3">
                <p className="text-xs text-amber-800">
                  <strong>因果掩码（Causal Mask）</strong>：每个词只能看到它前面的词，不能偷看后面。
                  这样，最后一个位置的输出就自然成了"对下一个词的预测"。
                </p>
              </div>
            </section>

            {/* Section 2: 因果掩码图解 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-xs text-slate-600">2</span>
                因果掩码：不能偷看
              </h2>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 w-6">我</span>
                    <span className="text-amber-500">能看到</span>
                    <span className="text-slate-400">→ 我</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 w-6">在</span>
                    <span className="text-amber-500">能看到</span>
                    <span className="text-slate-400">→ 我, 在</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 w-6">法</span>
                    <span className="text-amber-500">能看到</span>
                    <span className="text-slate-400">→ 我, 在, 法</span>
                  </div>
                  <div className="text-slate-300 text-center">...</div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 w-6">说</span>
                    <span className="text-amber-500">能看到</span>
                    <span className="text-slate-400">→ 我, 在, 法, 国, 长, 大, 所, 以, 我, 会, 说</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                "说"能看到所有前文，但看不到还没说出口的词。它的任务是：根据前文预测下一个词。
              </p>
            </section>

            {/* Section 3: 预测过程 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-xs text-slate-600">3</span>
                预测过程：三步完成
              </h2>
              <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold shrink-0 mt-0.5">1</span>
                  <div>
                    <p className="text-sm text-slate-700 font-medium">注意力聚合线索</p>
                    <p className="text-xs text-slate-500">"说"通过多层注意力，把"法国""长大"等关键信息聚拢到自己的向量里。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-600 text-xs font-bold shrink-0 mt-0.5">2</span>
                  <div>
                    <p className="text-sm text-slate-700 font-medium">投影到词汇表</p>
                    <p className="text-xs text-slate-500">"说"的最终向量乘以一个大矩阵，得到词汇表中每个词的分数。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs font-bold shrink-0 mt-0.5">3</span>
                  <div>
                    <p className="text-sm text-slate-700 font-medium">选概率最高的词</p>
                    <p className="text-xs text-slate-500">分数经过 softmax → 概率分布 → "法语" 62% 胜出。</p>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-xs text-amber-800">
                <strong>试试看 →</strong> 右侧点击播放，观察"说"如何通过 3 层注意力逐步聚合线索，最终预测出"法语"。
              </div>
            </section>

            {/* Section 4: 为什么改变了一切 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-xs text-slate-600">4</span>
                为什么 Transformer 改变了一切
              </h2>
              <div className="space-y-2">
                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                  <h3 className="font-bold text-slate-800 text-sm">并行计算</h3>
                  <p className="text-xs text-slate-600">不像 RNN 逐词串行，所有词同时计算，训练速度大幅提升。</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                  <h3 className="font-bold text-slate-800 text-sm">Scaling Law</h3>
                  <p className="text-xs text-slate-600">参数越多、数据越大 → 能力越强。这个规律让大模型成为可能。</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                  <h3 className="font-bold text-slate-800 text-sm">万物之基</h3>
                  <p className="text-xs text-slate-600">GPT、BERT、ChatGPT、Claude……几乎都建立在 Transformer 之上。</p>
                </div>
              </div>
            </section>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Link to="/transformer/layers" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-indigo-600 transition-colors">
                <ChevronLeft size={14} /> 上一章：多层推理
              </Link>
              <Link to="/rl" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-indigo-600 transition-colors">
                下一站：强化学习 →
              </Link>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-[62%] h-full bg-[#0f172a] text-white flex flex-col relative overflow-hidden">
          <PredictionMachine />
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   PredictionMachine (Right Panel)
   ══════════════════════════════════════ */
function PredictionMachine() {
  const [predStep, setPredStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const selectedWordIndex = generationSentence.length - 1; // "说"

  const playTimerRef = useRef(null);

  const trace = useMemo(
    () => buildTransformerGenerationTrace(generationSentence),
    [],
  );

  const tokens = generationSentence;

  const advanceStep = useCallback(() => {
    if (!started) setStarted(true);
    setPredStep((prev) => {
      if (prev < PREDICTION_STEPS - 1) return prev + 1;
      setIsPlaying(false);
      return prev;
    });
  }, [started]);

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = 3500;
    playTimerRef.current = setInterval(advanceStep, intervalMs);
    return () => clearInterval(playTimerRef.current);
  }, [isPlaying, advanceStep]);

  const handleReset = () => {
    setIsPlaying(false);
    setStarted(false);
    setPredStep(0);
    if (playTimerRef.current) clearInterval(playTimerRef.current);
  };

  const togglePlay = () => {
    if (isPlaying) { setIsPlaying(false); return; }
    if (predStep >= PREDICTION_STEPS - 1) { setPredStep(0); }
    if (!started) setStarted(true);
    setIsPlaying(true);
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    if (!started) setStarted(true);
    if (predStep >= PREDICTION_STEPS - 1) return;
    advanceStep();
  };

  const isLastStep = predStep >= PREDICTION_STEPS - 1 && started;

  // Attention row for arc visualization
  const attentionRow = (started && predStep < 3)
    ? trace[predStep].attentionMatrix[selectedWordIndex]
    : null;

  const explanation = started && predStep < 3 ? generationExplanations[predStep] : null;

  return (
    <div className="flex flex-col h-full">
      {/* TopBar */}
      <div className="flex items-center px-4 py-2 border-b border-slate-700/50 bg-slate-800/60 backdrop-blur shrink-0">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <Sparkles size={16} className="text-amber-400" />
          预测引擎
        </div>
      </div>

      {/* Step indicator */}
      {started && (
        <div className="px-4 py-1.5 border-b border-slate-700/30 shrink-0 flex items-center gap-3">
          <span className="text-xs text-amber-300 font-medium">{predictionStorySteps[predStep].title}</span>
          <span className="text-[10px] text-slate-500">{predictionStorySteps[predStep].focus}</span>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 relative overflow-y-auto flex flex-col min-h-0 px-4 py-3 gap-3">
        {/* Arc Visualization */}
        <div className="shrink-0">
          <PredictionArcViz
            tokens={tokens}
            attentionRow={attentionRow}
            selectedWordIndex={selectedWordIndex}
            phase={started && predStep < 3 ? 2 : -1}
          />
        </div>

        {/* Story Card */}
        <div className="shrink-0">
          <AnimatePresence mode="wait">
            {!started ? (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6 text-center">
                <p className="text-sm text-slate-500">
                  点击"开始演示"，观察模型如何一步步预测下一个词
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={`pred-${predStep}`}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3 }}
              >
                <PredictionStoryCard step={predStep} trace={trace} tokens={tokens} selectedWordIndex={selectedWordIndex} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress */}
        <div className="shrink-0">
          <PredictionProgress step={predStep} started={started} explanation={explanation} />
        </div>
      </div>

      {/* ControlBar */}
      <div className="px-4 py-2.5 bg-slate-800 border-t border-slate-700 shrink-0">
        <div className="flex gap-1 mb-2.5">
          {[0, 1, 2, 3].map((s) => (
            <div key={s} className="h-1.5 flex-1 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: started && s <= predStep
                  ? (s === predStep ? (s === 3 ? '#f59e0b' : '#818cf8') : '#6366f1')
                  : 'rgba(100,116,139,0.3)',
              }} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">{started ? `${predStep + 1} / ${PREDICTION_STEPS}` : `共 ${PREDICTION_STEPS} 步`}</div>
          <div className="flex items-center gap-3">
            <button onClick={handleReset} className="p-2 rounded-full hover:bg-slate-700 text-slate-400 transition-colors"><RotateCcw size={16} /></button>
            {!started && !isPlaying ? (
              <button onClick={togglePlay}
                className="flex items-center px-6 py-2 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition-all shadow-lg shadow-amber-600/30 active:scale-95">
                开始演示 <Play size={14} className="ml-2 fill-current" />
              </button>
            ) : (
              <button onClick={togglePlay}
                className={`flex items-center px-5 py-2 rounded-full text-white font-medium text-sm transition-all active:scale-95 ${
                  isPlaying ? 'bg-orange-500 hover:bg-orange-400 shadow-lg shadow-orange-500/30'
                  : 'bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/30'
                }`}>
                {isPlaying ? <><Pause size={14} className="mr-1.5" />暂停</> : <><Play size={14} className="mr-1.5 fill-current" />继续</>}
              </button>
            )}
            <button onClick={handleNextStep} disabled={isPlaying || isLastStep}
              className="p-2 rounded-full hover:bg-slate-700 text-slate-400 disabled:opacity-30 transition-colors"><ChevronRight size={18} /></button>
          </div>
          <div className="w-20" /> {/* spacer */}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   PredictionArcViz
   ══════════════════════════════════════ */
function PredictionArcViz({ tokens, attentionRow, selectedWordIndex, phase }) {
  const containerRef = useRef(null);
  const [svgWidth, setSvgWidth] = useState(600);

  useEffect(() => {
    const measure = () => { if (containerRef.current) setSvgWidth(containerRef.current.offsetWidth); };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const n = tokens.length;
  const svgHeight = 140;
  const sentenceY = svgHeight - 25;
  const wordX = (idx) => (svgWidth / (n + 1)) * (idx + 1);

  const arcs = useMemo(() => {
    if (phase >= 2 && attentionRow) {
      return attentionRow
        .map((weight, idx) => {
          if (idx === selectedWordIndex || weight < 0.04) return null;
          if (idx > selectedWordIndex) return null;
          const x1 = wordX(selectedWordIndex);
          const x2 = wordX(idx);
          const midX = (x1 + x2) / 2;
          const dist = Math.abs(x2 - x1);
          const height = Math.min(dist * 0.55, weight * 130 + 20);
          return {
            idx, value: weight,
            label: formatPct(weight),
            path: `M ${x1} ${sentenceY} Q ${midX} ${sentenceY - height} ${x2} ${sentenceY}`,
            strokeWidth: Math.max(1.5, weight * 8),
            opacity: Math.max(0.3, Math.min(0.95, weight * 2.5)),
            height,
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.value - b.value);
    }
    return [];
  }, [phase, attentionRow, selectedWordIndex, svgWidth, n]);

  return (
    <div ref={containerRef} className="w-full">
      <svg width={svgWidth} height={svgHeight} className="overflow-visible">
        <defs>
          <linearGradient id="arcGradCh3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        <AnimatePresence>
          {arcs.map((arc) => (
            <motion.path
              key={`arc-${arc.idx}`}
              d={arc.path} fill="none" stroke="url(#arcGradCh3)"
              strokeWidth={arc.strokeWidth} strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: arc.opacity }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </AnimatePresence>
        {arcs.filter((a) => a.value > 0.08).map((arc) => {
          const x1 = wordX(selectedWordIndex);
          const x2 = wordX(arc.idx);
          return (
            <text key={`lbl-${arc.idx}`} x={(x1 + x2) / 2} y={sentenceY - arc.height + 2}
              textAnchor="middle" className="fill-indigo-300 text-[9px] font-mono">{arc.label}</text>
          );
        })}
        {tokens.map((token, idx) => {
          const x = wordX(idx);
          const isSelected = idx === selectedWordIndex;
          const isMasked = idx > selectedWordIndex;
          const weight = attentionRow ? (attentionRow[idx] || 0) : 0;
          const isAttended = !isSelected && weight >= 0.04 && phase >= 2 && !isMasked;
          return (
            <g key={`w-${idx}`}>
              {isSelected && <rect x={x - 16} y={sentenceY - 12} width={32} height={28} rx={6} fill="rgba(99,102,241,0.3)" />}
              <text x={x} y={sentenceY + 5} textAnchor="middle"
                className={`text-sm select-none ${isSelected ? 'fill-white font-bold' : isMasked ? 'fill-slate-600' : isAttended ? 'fill-indigo-300' : 'fill-slate-400'}`}
                style={isAttended ? { opacity: Math.max(0.5, weight * 3) } : undefined}>
                {token}
              </text>
              {isSelected && <text x={x} y={sentenceY + 20} textAnchor="middle" className="fill-amber-400 text-[8px]">▲ 预测位</text>}
            </g>
          );
        })}
        <text x={wordX(tokens.length)} y={sentenceY + 5} textAnchor="middle"
          className="fill-amber-400/60 text-sm font-bold">___</text>
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════
   PredictionStoryCard
   ══════════════════════════════════════ */
function PredictionStoryCard({ step, trace, tokens, selectedWordIndex }) {
  const storyStep = predictionStorySteps[step];
  const isVocabStep = step === 3;
  const layerData = !isVocabStep ? trace[step] : null;
  const attentionRow = layerData ? layerData.attentionMatrix[selectedWordIndex] : null;

  const topWords = useMemo(() => {
    if (!attentionRow) return [];
    return attentionRow
      .map((w, idx) => ({ idx, token: tokens[idx], weight: w }))
      .filter((item) => item.idx !== selectedWordIndex && item.idx <= selectedWordIndex)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);
  }, [attentionRow, selectedWordIndex, tokens]);

  const colorMap = {
    indigo: { border: 'border-indigo-500/30', text: 'text-indigo-300', bar: 'bg-indigo-500', badge: 'bg-indigo-500/20 text-indigo-300' },
    purple: { border: 'border-purple-500/30', text: 'text-purple-300', bar: 'bg-purple-500', badge: 'bg-purple-500/20 text-purple-300' },
    violet: { border: 'border-violet-500/30', text: 'text-violet-300', bar: 'bg-violet-500', badge: 'bg-violet-500/20 text-violet-300' },
    amber: { border: 'border-amber-500/30', text: 'text-amber-300', bar: 'bg-amber-500', badge: 'bg-amber-500/20 text-amber-300' },
  };
  const colors = colorMap[storyStep.color];

  return (
    <div className={`bg-slate-800/60 rounded-xl border ${colors.border} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${colors.badge}`}>{step + 1}/{PREDICTION_STEPS}</span>
          <span className={`text-sm font-bold ${colors.text}`}>{storyStep.title}</span>
        </div>
        {!isVocabStep && <span className="text-[10px] text-slate-500">"说" 的注意力</span>}
      </div>

      <p className={`text-xs ${colors.text} mb-3 leading-relaxed`}>{storyStep.narrative}</p>

      {!isVocabStep && topWords.length > 0 && (
        <div className="space-y-1.5 mb-2">
          <div className="text-[10px] text-slate-500">"说" 关注了哪些词：</div>
          {topWords.map((item, i) => (
            <motion.div key={`tw-${item.idx}`} className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
              <span className="text-xs text-slate-400 w-5 text-center">{item.token}</span>
              <div className="flex-1 h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div className={`h-full ${colors.bar} rounded-full`}
                  initial={{ width: 0 }} animate={{ width: `${Math.max(4, item.weight * 100)}%` }}
                  transition={{ duration: 0.4, delay: i * 0.08 }} />
              </div>
              <span className="text-[10px] font-mono text-slate-500 w-10 text-right">{formatPct(item.weight)}</span>
              {i === 0 && <span className={`text-[9px] ${colors.text} ml-1`}>最高</span>}
            </motion.div>
          ))}
        </div>
      )}

      {isVocabStep && (
        <div className="space-y-2">
          <div className="text-[10px] text-slate-500 mb-1">最终向量 → 词汇概率：</div>
          {vocabPrediction.map((item, i) => (
            <motion.div key={item.word} className="flex items-center gap-2"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <span className={`text-xs w-6 text-right ${i === 0 ? 'text-amber-300 font-bold' : 'text-slate-400'}`}>{item.word}</span>
              <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div className={`h-full rounded-full ${i === 0 ? 'bg-amber-500' : 'bg-slate-500/50'}`}
                  initial={{ width: 0 }} animate={{ width: `${Math.max(3, item.prob * 100)}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1 }} />
              </div>
              <span className={`text-[10px] font-mono w-8 text-right ${i === 0 ? 'text-amber-300 font-bold' : 'text-slate-500'}`}>
                {(item.prob * 100).toFixed(0)}%
              </span>
              {i === 0 && <span className="text-[9px] text-amber-400 ml-1">预测!</span>}
            </motion.div>
          ))}
          <div className="mt-3 bg-amber-500/10 rounded-lg p-2.5 border border-amber-500/20">
            <p className="text-xs text-amber-200 leading-relaxed">
              <strong>为什么是"法语"？</strong>因为"说"在 3 层注意力中反复关注"法国"，
              把"法国"的信息聚合到了自己的向量里。当这个富含"法国"信息的向量投影到词汇表上时，
              "法语"自然获得了最高概率。<strong>注意力决定了信息流向，信息流向决定了预测结果</strong>。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   PredictionProgress
   ══════════════════════════════════════ */
function PredictionProgress({ step, started, explanation }) {
  const stepLabels = ['L1', 'L2', 'L3', '预测'];
  return (
    <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-3">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-[10px] text-slate-500 font-bold shrink-0">进度</span>
        <div className="flex items-center gap-1">
          {stepLabels.map((label, i) => {
            const isComplete = started && i < step;
            const isCurrent = started && i === step;
            return (
              <div key={i} className="flex items-center gap-1">
                <div className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all duration-300 ${
                  isCurrent ? 'bg-amber-500/30 text-amber-300 ring-1 ring-amber-400/30'
                  : isComplete ? 'bg-indigo-600/50 text-indigo-300'
                  : 'bg-slate-700/50 text-slate-600'
                }`}>{label}</div>
                {i < stepLabels.length - 1 && <span className={`text-[8px] ${isComplete ? 'text-indigo-500' : 'text-slate-700'}`}>→</span>}
              </div>
            );
          })}
        </div>
      </div>
      <AnimatePresence mode="wait">
        {explanation && started && (
          <motion.div key={explanation}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-amber-500/10 rounded-lg px-3 py-1.5 border border-amber-500/20">
            <p className="text-[11px] text-amber-200">{explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TransformerCh3;
