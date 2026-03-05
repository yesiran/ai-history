import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  BrainCircuit,
  Play,
  RotateCcw,
  ChevronRight,
  Pause,
  MessageSquareText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  rnnScenarios,
  rnnTechSpec,
  buildRnnTechnicalTrace,
} from '../utils/rnn_data';

/* ── helpers ── */
const getEmoji = (score) => {
  if (score === 0) return '😐';
  if (score > 5) return '🤩';
  if (score > 0) return '🙂';
  if (score < -5) return '😡';
  if (score < 0) return '😟';
  return '🤖';
};

const SPEED_OPTIONS = [0.5, 1, 1.5, 2];

// Map hidden state value → color
function cellColor(v) {
  if (v > 0.4) return 'rgba(56,189,248,0.65)';
  if (v > 0.1) return 'rgba(99,102,241,0.45)';
  if (v > -0.1) return 'rgba(100,116,139,0.3)';
  if (v > -0.4) return 'rgba(251,146,60,0.45)';
  return 'rgba(239,68,68,0.55)';
}

function glowColor(h_t) {
  if (!h_t) return 'rgba(99,102,241,0.1)';
  const avg = h_t.reduce((a, b) => a + b, 0) / h_t.length;
  if (avg > 0.2) return 'rgba(56,189,248,0.25)';
  if (avg > 0) return 'rgba(99,102,241,0.2)';
  if (avg > -0.2) return 'rgba(251,146,60,0.2)';
  return 'rgba(239,68,68,0.2)';
}

/* ── main page ── */
export default function RNN() {
  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-slate-50">
      {/* Left Panel: Theory */}
      <div className="w-full md:w-[38%] h-full overflow-y-auto border-r border-slate-200 bg-white p-6 md:p-10">
        <Link to="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-6 transition-colors text-sm font-medium">
          <ChevronLeft size={16} className="mr-1" /> 返回首页
        </Link>
        <div className="max-w-2xl mx-auto space-y-12 pb-20">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <BrainCircuit size={24} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 m-0">RNN 循环神经网络</h1>
            </div>
            <p className="text-lg text-slate-500">理解顺序，压缩记忆，让机器读懂一句话</p>
          </div>

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-sm text-slate-600">1</span>
              从词到句：为什么顺序很重要
            </h2>
            <p className="text-slate-600">
              Word2Vec 给每个词一个坐标，但光知道词不够。<strong>"我不开心"</strong>和<strong>"我很开心"</strong>用的几乎是同一批词——只有理解<strong>顺序</strong>，才能区分含义。
            </p>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white rounded-lg p-3 border border-rose-200">
                  <div className="text-lg font-bold text-slate-800 mb-1">我 不 开心</div>
                  <div className="text-2xl">😟</div>
                  <div className="text-xs text-rose-600 mt-1 font-medium">负面情感</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-emerald-200">
                  <div className="text-lg font-bold text-slate-800 mb-1">我 很 开心</div>
                  <div className="text-2xl">😊</div>
                  <div className="text-xs text-emerald-600 mt-1 font-medium">正面情感</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center mt-3">同样的词，不同的顺序 → 完全相反的含义</p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-sm text-slate-600">2</span>
              RNN 的做法：逐词阅读，不断更新记忆
            </h2>
            <p className="text-slate-600">
              RNN 一个词一个词地读，每读一个就更新"记忆"（隐藏状态 h_t）。读完整句后，这个记忆就是全句的<strong>压缩表示</strong>。
            </p>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 flex items-center justify-center gap-2 text-sm">
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-center">
                  <div className="text-[10px] text-blue-500 font-bold">输入</div>
                  <div className="font-bold text-blue-700">x_t</div>
                </div>
                <ArrowRight size={16} className="text-slate-400" />
                <div className="bg-indigo-50 border border-indigo-300 rounded-lg px-4 py-2 text-center">
                  <div className="text-[10px] text-indigo-500 font-bold">RNN Cell</div>
                  <div className="font-mono text-xs text-indigo-700 mt-0.5">h_t = tanh(W·x + W·h + b)</div>
                </div>
                <ArrowRight size={16} className="text-slate-400" />
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-center">
                  <div className="text-[10px] text-emerald-500 font-bold">输出</div>
                  <div className="font-bold text-emerald-700">y_t</div>
                </div>
              </div>
              <div className="bg-amber-50 p-3 text-xs text-amber-800 border-t border-amber-100 text-center">
                <strong>关键：</strong> 隐藏状态 h_t 不断更新，携带着之前所有词的"记忆"传递给下一步。
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-sm text-slate-600">3</span>
              RNN 能做什么
            </h2>
            <p className="text-slate-600">读完一句话后，RNN 的记忆可以用来做两件事：</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquareText size={18} className="text-rose-500" />
                  <h3 className="font-bold text-slate-800 text-sm">情感分析（理解）</h3>
                </div>
                <p className="text-xs text-slate-600">压缩整句话的记忆 → 判断正面 or 负面</p>
                <div className="text-center text-2xl">😟 → 🤩</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  <h3 className="font-bold text-slate-800 text-sm">文本生成（生成）</h3>
                </div>
                <p className="text-xs text-slate-600">压缩前文的记忆 → 预测下一个最可能的词</p>
                <div className="text-center text-sm font-mono text-indigo-600">"我在法国长大..." → "法语"</div>
              </div>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 text-sm text-indigo-800">
              <strong>试试看 →</strong> 在右侧面板切换模式，亲自观察 RNN 如何"边读边思考"。
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-sm text-slate-600">4</span>
              局限性：记忆有限 → Transformer 铺垫
            </h2>
            <p className="text-slate-600">
              RNN 的记忆是"压缩"的——句子越长，早期的信息越容易被"挤丢"（<strong>梯度消失</strong>）。
            </p>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500 mb-2 text-center">记忆衰减示意</div>
              <div className="flex items-end justify-center gap-1 h-16">
                {[1, 0.92, 0.8, 0.65, 0.48, 0.32, 0.2, 0.12, 0.07, 0.03].map((v, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className="w-5 rounded-t"
                      style={{
                        height: `${Math.max(4, v * 56)}px`,
                        backgroundColor: `rgba(99,102,241,${0.2 + v * 0.8})`,
                      }}
                    />
                    <span className="text-[9px] text-slate-400">t-{9 - i}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 text-center mt-2">越早的词，记忆越弱——关键信息可能丢失</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 text-sm text-purple-800">
              <strong>如果能让模型直接"回头看"任意位置呢？</strong>
              <br />这就是 <strong>Attention</strong> 和 <strong>Transformer</strong> 的思路——不再压缩到一个记忆，而是允许每一步直接查阅全文。
            </div>
          </section>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-[62%] h-full bg-[#0f172a] text-white flex flex-col relative overflow-hidden">
        <RNNMachine />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   RNN Machine
   ════════════════════════════════════════════════════════ */

function RNNMachine() {
  const [mode, setMode] = useState('sentiment');
  const [scenarioId, setScenarioId] = useState(1);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const playTimerRef = useRef(null);

  const scenario = rnnScenarios.find(s => s.id === scenarioId) || rnnScenarios[0];
  const totalSteps = scenario.steps.length;
  const technicalTrace = useMemo(
    () => buildRnnTechnicalTrace(scenario.sentence),
    [scenario.sentence],
  );

  const stepData = stepIndex >= 0 ? scenario.steps[stepIndex] : null;
  const techStep = stepIndex >= 0 ? technicalTrace[stepIndex] : null;
  const isFinished = stepIndex >= totalSteps - 1 && stepIndex >= 0;

  const sentimentScenarios = rnnScenarios.filter(s => s.type === 'sentiment');
  const generationScenarios = rnnScenarios.filter(s => s.type === 'generation');
  const currentModeScenarios = mode === 'sentiment' ? sentimentScenarios : generationScenarios;

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(400, Math.round(1500 / speed));
    playTimerRef.current = setInterval(() => {
      setStepIndex(prev => {
        if (prev < totalSteps - 1) return prev + 1;
        setIsPlaying(false);
        return prev;
      });
    }, intervalMs);
    return () => { if (playTimerRef.current) clearInterval(playTimerRef.current); };
  }, [isPlaying, speed, totalSteps]);

  const handleReset = () => {
    setIsPlaying(false);
    setStepIndex(-1);
    if (playTimerRef.current) clearInterval(playTimerRef.current);
  };

  const handleModeChange = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    handleReset();
    if (newMode === 'sentiment') setScenarioId(sentimentScenarios[0]?.id || 1);
    else setScenarioId(generationScenarios[0]?.id || 2);
  };

  const handleScenarioChange = (id) => {
    setScenarioId(id);
    handleReset();
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    setStepIndex(prev => (prev >= totalSteps - 1 ? prev : prev + 1));
  };

  const togglePlay = () => {
    if (isPlaying) { setIsPlaying(false); return; }
    if (stepIndex >= totalSteps - 1) setStepIndex(-1);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* TopBar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/50 bg-slate-800/60 backdrop-blur shrink-0">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <BrainCircuit size={18} className="text-indigo-400" />
          RNN 记忆机器
        </div>
        <div className="flex items-center gap-1 bg-slate-700/60 rounded-lg p-0.5">
          <button
            onClick={() => handleModeChange('sentiment')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === 'sentiment' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquareText size={12} className="inline mr-1 -mt-0.5" />
            情感分析
          </button>
          <button
            onClick={() => handleModeChange('generation')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === 'generation' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={12} className="inline mr-1 -mt-0.5" />
            文本生成
          </button>
        </div>
      </div>

      {/* Scenario selector */}
      {currentModeScenarios.length > 1 && (
        <div className="px-4 py-1.5 flex gap-2 shrink-0 border-b border-slate-700/30">
          {currentModeScenarios.map(s => (
            <button
              key={s.id}
              onClick={() => handleScenarioChange(s.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                scenarioId === s.id
                  ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      {/* Main Area — takes all available space */}
      <div className="flex-1 relative overflow-hidden flex flex-col min-h-0">

        {/* Sentence display — TOP, prominent, the narrative anchor */}
        <div className="px-5 pt-4 pb-1 shrink-0">
          <SentenceDisplay
            sentence={scenario.sentence}
            stepIndex={stepIndex}
            stepData={stepData}
            mode={mode}
            isFinished={isFinished}
          />
        </div>

        {/* ProcessFlow — the star: takes most vertical space */}
        <div className="flex-1 flex items-center justify-center px-3 min-h-0">
          <ProcessFlow
            stepIndex={stepIndex}
            stepData={stepData}
            techStep={techStep}
            mode={mode}
            scenario={scenario}
            isFinished={isFinished}
            technicalTrace={technicalTrace}
          />
        </div>

        {/* MemoryTimeline */}
        <div className="px-4 pb-1 shrink-0">
          <MemoryTimeline technicalTrace={technicalTrace} stepIndex={stepIndex} />
        </div>

        {/* Info Panel (bottom-right) */}
        <InfoPanel techStep={techStep} stepIndex={stepIndex} />
      </div>

      {/* ControlBar */}
      <div className="px-4 py-2.5 bg-slate-800 border-t border-slate-700 shrink-0">
        {/* Progress segments */}
        <div className="flex gap-0.5 mb-2.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-colors duration-300"
              style={{
                backgroundColor:
                  i <= stepIndex
                    ? i === stepIndex ? '#818cf8' : '#6366f1'
                    : 'rgba(100,116,139,0.3)',
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {stepIndex >= 0 ? `${stepIndex + 1} / ${totalSteps}` : `共 ${totalSteps} 步`}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleReset} className="p-2 rounded-full hover:bg-slate-700 text-slate-400 transition-colors" title="重置">
              <RotateCcw size={16} />
            </button>

            {stepIndex === -1 && !isPlaying ? (
              <button
                onClick={togglePlay}
                className="flex items-center px-6 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 active:scale-95"
              >
                开始演示
                <Play size={14} className="ml-2 fill-current" />
              </button>
            ) : (
              <button
                onClick={togglePlay}
                className={`flex items-center px-5 py-2 rounded-full text-white font-medium text-sm transition-all active:scale-95 ${
                  isPlaying
                    ? 'bg-orange-500 hover:bg-orange-400 shadow-lg shadow-orange-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30'
                }`}
              >
                {isPlaying ? <><Pause size={14} className="mr-1.5" />暂停</> : <><Play size={14} className="mr-1.5 fill-current" />继续</>}
              </button>
            )}

            <button
              onClick={handleNextStep}
              disabled={isPlaying || isFinished}
              className="p-2 rounded-full hover:bg-slate-700 text-slate-400 disabled:opacity-30 transition-colors"
              title="下一步"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 mr-1">速度</span>
            {SPEED_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  speed === s ? 'bg-indigo-500/30 text-indigo-300' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── ProcessFlow: three columns ── */
function ProcessFlow({ stepIndex, stepData, techStep, mode, scenario, isFinished, technicalTrace }) {
  const hasData = stepIndex >= 0 && techStep;
  const h_t = techStep?.h_t || [0, 0, 0, 0];
  const h_prev = techStep?.h_prev || [0, 0, 0, 0];
  const memoryStrength = techStep?.memoryStrength || 0;

  return (
    <div className="w-full max-w-3xl flex flex-col items-center gap-3">
      {/* Three columns */}
      <div className="flex items-stretch justify-center gap-3 md:gap-5 w-full">
        {/* Input Panel */}
        <div className="bg-slate-800/80 border border-blue-500/20 rounded-xl p-3 md:p-4 flex-[0.9] min-w-[100px] flex flex-col justify-center">
          <div className="text-[10px] text-blue-400 font-bold mb-2">输入 x_t</div>
          {hasData ? (
            <motion.div key={stepIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <div className="text-2xl font-bold text-white mb-2 text-center">{techStep.token}</div>
              <div className="font-mono text-[10px] text-slate-500 break-all leading-relaxed">
                [{techStep.x_t.map(v => v.toFixed(2)).join(', ')}]
              </div>
            </motion.div>
          ) : (
            <div className="text-slate-600 text-xs text-center py-6">等待输入...</div>
          )}
        </div>

        {/* Arrow */}
        <div className="flex items-center"><ArrowRight size={18} className="text-slate-600 shrink-0" /></div>

        {/* Hidden State Panel — MAIN VISUAL FOCUS */}
        <div
          className="bg-slate-800/80 border border-indigo-500/30 rounded-xl p-3 md:p-4 flex-[1.6] min-w-[180px] flex flex-col"
          style={{ boxShadow: `0 0 40px ${glowColor(hasData ? h_t : null)}` }}
        >
          <div className="text-[10px] text-indigo-400 font-bold mb-2">隐藏状态 h_t</div>

          {/* 2×2 grid with deltas */}
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            {['h₁', 'h₂', 'h₃', 'h₄'].map((label, i) => {
              const val = h_t[i] || 0;
              const prev = h_prev[i] || 0;
              const delta = hasData ? val - prev : 0;
              const absDelta = Math.abs(delta);

              return (
                <motion.div
                  key={label}
                  className="rounded-lg p-2 text-center transition-colors duration-500 relative"
                  animate={{ backgroundColor: cellColor(val) }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-[9px] text-slate-300/60 mb-0.5">{label}</div>
                  <motion.div
                    className="font-mono text-base font-bold text-white"
                    key={`${stepIndex}-${i}`}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                  >
                    {val.toFixed(3)}
                  </motion.div>
                  {/* Delta indicator */}
                  {hasData && absDelta > 0.005 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`text-[9px] font-bold mt-0.5 ${
                        delta > 0 ? 'text-cyan-300' : 'text-orange-300'
                      }`}
                    >
                      {delta > 0 ? '↑' : '↓'}{absDelta > 0.1 ? (delta > 0 ? '↑' : '↓') : ''} {Math.abs(delta).toFixed(2)}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* State interpretation — THE KEY INSIGHT */}
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-slate-900/60 rounded-lg px-3 py-2 mt-auto"
            >
              {hasData && stepData?.stateDesc ? (
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="text-indigo-400 font-bold mr-1">当前理解:</span>
                  {stepData.stateDesc}
                </div>
              ) : (
                <div className="text-[10px] text-slate-600 text-center">隐藏状态将随每个词的输入而变化</div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="text-[10px] text-slate-500 text-center mt-1.5">
            记忆强度: <span className="text-indigo-300 font-mono">{memoryStrength.toFixed(2)}</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center"><ArrowRight size={18} className="text-slate-600 shrink-0" /></div>

        {/* Output Panel */}
        <div className="bg-slate-800/80 border border-emerald-500/20 rounded-xl p-3 md:p-4 flex-[0.9] min-w-[100px] flex flex-col justify-center">
          <div className="text-[10px] text-emerald-400 font-bold mb-2">
            {mode === 'sentiment' ? '情感输出' : '生成输出'}
          </div>
          {mode === 'sentiment' ? (
            <SentimentOutput stepData={stepData} techStep={techStep} stepIndex={stepIndex} isFinished={isFinished} />
          ) : (
            <GenerationOutput stepData={stepData} techStep={techStep} stepIndex={stepIndex} isFinished={isFinished} totalSteps={totalStepsOf(scenario)} />
          )}
        </div>
      </div>

      {/* Finished summary — prominent overlay when done */}
      <AnimatePresence>
        {isFinished && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-slate-800/90 backdrop-blur border border-indigo-500/40 rounded-xl px-5 py-3 shadow-xl max-w-md text-center"
          >
            {mode === 'sentiment' ? (
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">{getEmoji(stepData.score)}</span>
                <div className="text-left">
                  <div className="text-xs text-slate-400">RNN 读完全句，最终理解为</div>
                  <div className={`text-sm font-bold ${stepData.score > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stepData.score > 0 ? '正面' : '负面'}评价 (score: {stepData.score > 0 ? '+' : ''}{stepData.score})
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <Sparkles size={24} className="text-amber-400" />
                <div className="text-left">
                  <div className="text-xs text-slate-400">RNN 结合全部记忆，预测下一个词</div>
                  <div className="text-lg font-bold text-amber-300">{stepData.prediction}</div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function totalStepsOf(scenario) {
  return scenario.steps.length;
}

/* ── Sentiment Output ── */
function SentimentOutput({ stepData, techStep, stepIndex, isFinished }) {
  if (!stepData || !techStep) {
    return <div className="text-slate-600 text-xs text-center py-6">等待输出...</div>;
  }

  const score = stepData.score;
  const gaugePercent = Math.max(2, Math.min(98, ((score + 10) / 20) * 100));

  return (
    <motion.div key={stepIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="text-center text-3xl mb-2">{getEmoji(score)}</div>

      {/* Sentiment label */}
      <div className="text-center mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
          score > 3 ? 'bg-emerald-500/20 text-emerald-300'
          : score < -3 ? 'bg-rose-500/20 text-rose-300'
          : 'bg-slate-600/30 text-slate-400'
        }`}>
          {score > 3 ? '正面' : score < -3 ? '负面' : '中性'} ({score > 0 ? '+' : ''}{score})
        </span>
      </div>

      {/* Gauge */}
      <div className="relative h-2 rounded-full overflow-visible mb-1">
        <div className="absolute inset-0 rounded-full" style={{
          background: 'linear-gradient(to right, #f43f5e, #94a3b8, #10b981)',
        }} />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow border-2 border-slate-900"
          animate={{ left: `${gaugePercent}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{ marginLeft: '-6px' }}
        />
      </div>
      <div className="flex justify-between text-[8px] text-slate-600 mb-2">
        <span>-10</span><span>0</span><span>+10</span>
      </div>

      {/* Softmax bars */}
      <div className="space-y-0.5">
        {rnnTechSpec.outputLabels.map((label, i) => {
          const prob = techStep.y_t[i];
          const colors = ['#f43f5e', '#94a3b8', '#10b981'];
          return (
            <div key={label} className="flex items-center gap-1 text-[9px]">
              <span className="w-5 text-slate-500">{label}</span>
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: colors[i] }}
                  animate={{ width: `${Math.max(2, prob * 100)}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>
              <span className="font-mono text-slate-500 w-7 text-right">{(prob * 100).toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── Generation Output ── */
function GenerationOutput({ stepData, techStep, stepIndex, isFinished, totalSteps }) {
  if (!stepData || !techStep) {
    return <div className="text-slate-600 text-xs text-center py-6">等待输出...</div>;
  }

  // Only show the prediction at the final step
  if (isFinished && stepData.prediction) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, type: 'spring' }}
        className="text-center"
      >
        <div className="text-[10px] text-amber-400 font-bold mb-1">预测下一个词</div>
        <div className="text-2xl font-bold text-amber-300 bg-amber-500/15 rounded-lg px-3 py-2">
          {stepData.prediction}
        </div>
        <div className="text-[10px] text-slate-500 mt-2">
          置信度: {(Math.max(...techStep.y_t) * 100).toFixed(1)}%
        </div>
      </motion.div>
    );
  }

  // For non-final steps: show context accumulation
  return (
    <motion.div key={stepIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2">
      <div className="text-slate-500 text-xs mb-2">积累上下文中...</div>
      {/* Progress indicator */}
      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mb-2">
        <motion.div
          className="h-full bg-indigo-500/50 rounded-full"
          animate={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="flex justify-center gap-1">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1 h-1 bg-slate-600 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, delay: i * 0.3, repeat: Infinity }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ── Word Timeline ── */
/* ── Sentence Display — top of visual, large & prominent ── */
function SentenceDisplay({ sentence, stepIndex, stepData, mode, isFinished }) {
  return (
    <div className="text-center">
      {/* Sentence with word highlighting */}
      <div className="flex items-center justify-center flex-wrap gap-0.5 mb-2">
        {sentence.map((word, idx) => (
          <motion.span
            key={idx}
            className={`text-lg md:text-xl transition-all duration-200 ${
              idx === stepIndex
                ? 'text-white font-bold bg-indigo-500/30 rounded-md px-2 py-0.5 shadow-lg shadow-indigo-500/20'
                : idx < stepIndex
                  ? 'text-slate-300'
                  : 'text-slate-600'
            }`}
            animate={{
              scale: idx === stepIndex ? 1.2 : 1,
              y: idx === stepIndex ? -3 : 0,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {word}
          </motion.span>
        ))}
      </div>

      {/* Step reason — below the sentence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="h-6"
        >
          {stepIndex === -1 ? (
            <span className="text-slate-500 text-xs">
              {mode === 'sentiment'
                ? '点击"开始演示"，观察 RNN 如何逐词理解情感'
                : '点击"开始演示"，观察 RNN 如何记忆关键信息并预测下一个词'
              }
            </span>
          ) : (
            <span className="text-sm text-slate-400">{stepData?.reason}</span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Memory Timeline ── */
function MemoryTimeline({ technicalTrace, stepIndex }) {
  if (stepIndex < 0) {
    return <div className="h-8 flex items-center justify-center text-[10px] text-slate-600">记忆强度时间线</div>;
  }

  return (
    <div className="flex items-end justify-center gap-[3px] h-10 px-2">
      {technicalTrace.map((step, idx) => {
        if (idx > stepIndex) return null;
        const height = Math.max(3, step.memoryStrength * 32);
        const isCurrent = idx === stepIndex;
        const fadeFactor = 0.3 + 0.7 * ((idx + 1) / (stepIndex + 1));

        return (
          <motion.div
            key={idx}
            className="flex flex-col items-center gap-0.5"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 0.2 }}
            style={{ originY: 1 }}
          >
            <motion.div
              className="w-2.5 md:w-3 rounded-t"
              initial={{ height: 0 }}
              animate={{ height }}
              transition={{ duration: 0.3 }}
              style={{
                backgroundColor: isCurrent ? 'rgb(129,140,248)' : `rgba(99,102,241,${fadeFactor * 0.7})`,
              }}
            />
            <span className={`text-[7px] ${isCurrent ? 'text-indigo-300' : 'text-slate-600'}`}>
              {step.token}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Info Panel ── */
function InfoPanel({ techStep, stepIndex }) {
  return (
    <div className="absolute bottom-14 right-3 z-10 w-44">
      <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-lg p-2.5 text-[10px]">
        <div className="text-slate-500 font-bold mb-1 flex items-center gap-1">
          <BrainCircuit size={10} /> 技术详情
        </div>
        {techStep && stepIndex >= 0 ? (
          <div className="space-y-1 font-mono text-slate-500">
            <div><span className="text-slate-600">h_t:</span> [{techStep.h_t.map(v => v.toFixed(3)).join(', ')}]</div>
            <div><span className="text-slate-600">y_t:</span> [{techStep.y_t.map(v => v.toFixed(3)).join(', ')}]</div>
            <div>
              <span className="text-slate-600">判定:</span>{' '}
              <span className="text-indigo-300">{techStep.predictionLabel}</span> ({(Math.max(...techStep.y_t) * 100).toFixed(1)}%)
            </div>
            <div><span className="text-slate-600">记忆:</span> {techStep.memoryStrength.toFixed(3)}</div>
          </div>
        ) : (
          <div className="text-slate-600">点击播放查看</div>
        )}
      </div>
    </div>
  );
}
