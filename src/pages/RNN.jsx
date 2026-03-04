import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  BrainCircuit,
  ArrowRightLeft,
  Play,
  RotateCcw,
  ChevronRight,
  Pause,
} from 'lucide-react';
import {
  rnnScenarios,
  explanationData,
  rnnTechSpec,
  buildRnnTechnicalTrace,
} from '../utils/rnn_data';

const TAB_ITEMS = [
  { id: 'business', label: '表层业务演示' },
  { id: 'principle', label: '技术原理示意' },
  { id: 'deep', label: '深度技术演示' },
];

const FORMULA_STEPS = [
  { id: 'ax', formula: 'a_x = W_xh · x_t', desc: '把当前输入映射到隐藏空间' },
  { id: 'ah', formula: 'a_h = W_hh · h_{t-1}', desc: '把上一时刻记忆映射到隐藏空间' },
  { id: 'sum', formula: 'z_t = a_x + a_h + b_h', desc: '融合“新输入 + 旧记忆”' },
  { id: 'hidden', formula: 'h_t = tanh(z_t)', desc: '得到新的隐藏状态' },
  { id: 'output', formula: 'y_t = softmax(W_hy · h_t + b_y)', desc: '输出当前时刻预测分布' },
];

const SPEED_OPTIONS = [0.2, 0.75, 1, 1.5, 2];

const getBallColor = (stepData) => {
  if (!stepData) return '#e2e8f0';
  if (stepData.memory) return '#3b82f6';
  const score = stepData.score;
  if (score === 0) return '#9ca3af';
  if (score > 0) return score > 5 ? '#16a34a' : '#4ade80';
  return score < -5 ? '#dc2626' : '#f87171';
};

const getEmoji = (score) => {
  if (score === 0) return '😐';
  if (score > 5) return '🤩';
  if (score > 0) return '🙂';
  if (score < -5) return '😡';
  if (score < 0) return '😟';
  return '🤖';
};

const SENTIMENT_META = {
  负面: {
    chip: 'bg-rose-100 text-rose-700 border-rose-200',
    bar: 'bg-rose-500',
    soft: 'bg-rose-50 border-rose-200',
  },
  中性: {
    chip: 'bg-slate-100 text-slate-700 border-slate-200',
    bar: 'bg-slate-500',
    soft: 'bg-slate-50 border-slate-200',
  },
  正面: {
    chip: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    bar: 'bg-emerald-500',
    soft: 'bg-emerald-50 border-emerald-200',
  },
};

function getSentimentMeta(label) {
  if (!label) return SENTIMENT_META.中性;
  return SENTIMENT_META[label] || SENTIMENT_META.中性;
}

const RNN = () => {
  const [activeScenarioId, setActiveScenarioId] = useState(1);
  const [activeTab, setActiveTab] = useState('business');
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [deepPhase, setDeepPhase] = useState(0);

  const playTimerRef = useRef(null);
  const deepTimerRef = useRef(null);

  const currentScenario =
    rnnScenarios.find((s) => s.id === activeScenarioId) || rnnScenarios[0];
  const totalSteps = currentScenario.steps.length;
  const technicalTrace = useMemo(
    () => buildRnnTechnicalTrace(currentScenario.sentence),
    [currentScenario.sentence],
  );

  const currentStepData =
    currentStepIndex >= 0 ? currentScenario.steps[currentStepIndex] : null;
  const currentTechStep =
    currentStepIndex >= 0 ? technicalTrace[currentStepIndex] : null;

  useEffect(() => {
    if (!isPlaying) return undefined;

    const intervalMs = Math.max(350, Math.round(1300 / speed));
    playTimerRef.current = setInterval(() => {
      setDeepPhase(0);
      setCurrentStepIndex((prev) => {
        if (prev < totalSteps - 1) return prev + 1;
        setIsPlaying(false);
        return prev;
      });
    }, intervalMs);

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, speed, totalSteps]);

  useEffect(() => {
    if (deepTimerRef.current) clearInterval(deepTimerRef.current);

    if (activeTab !== 'deep' || currentStepIndex < 0) return undefined;

    const phaseMs = Math.max(320, Math.round(900 / speed));
    deepTimerRef.current = setInterval(() => {
      setDeepPhase((prev) => (prev + 1) % FORMULA_STEPS.length);
    }, phaseMs);

    return () => {
      if (deepTimerRef.current) clearInterval(deepTimerRef.current);
    };
  }, [activeTab, currentStepIndex, speed]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(-1);
    setDeepPhase(0);
    if (playTimerRef.current) clearInterval(playTimerRef.current);
    if (deepTimerRef.current) clearInterval(deepTimerRef.current);
  };

  const handleScenarioChange = (scenarioId) => {
    setActiveScenarioId(scenarioId);
    handleReset();
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    setDeepPhase(0);
    setCurrentStepIndex((prev) => {
      if (prev >= totalSteps - 1) return prev;
      return prev + 1;
    });
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    if (currentStepIndex >= totalSteps - 1) {
      setCurrentStepIndex(-1);
      setDeepPhase(0);
    }

    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col font-sans text-slate-800">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-indigo-900 mb-2">RNN (循环神经网络)</h1>
        <p className="text-xl text-slate-600">
          从“业务直觉”到“公式执行”：用三层动画看懂 RNN 如何逐步更新记忆
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <div className="space-y-6 overflow-y-auto pr-4 h-[calc(100vh-200px)]">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-semibold mb-6 flex items-center text-indigo-700">
              <BookOpen className="w-6 h-6 mr-2" />
              RNN 是如何工作的？
            </h2>

            <div className="space-y-6">
              {explanationData.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors"
                >
                  <h3 className="text-lg font-bold mb-2 flex items-center text-slate-800">
                    {idx === 0 && <BookOpen className="w-5 h-5 mr-2 text-blue-500" />}
                    {idx === 1 && <BrainCircuit className="w-5 h-5 mr-2 text-purple-500" />}
                    {idx === 2 && <ArrowRightLeft className="w-5 h-5 mr-2 text-orange-500" />}
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm text-justify">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-indigo-50 p-4 rounded-lg border border-indigo-200 text-sm text-indigo-900">
              <strong>课堂主线：</strong> 参数矩阵是固定的（规则不变），每一步更新的是隐藏状态{' '}
              <code>h_t</code>（记忆在变）。
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 flex flex-col h-[calc(100vh-200px)]">
          <div className="space-y-3 mb-4">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <h2 className="text-xl font-bold text-slate-700">RNN 三层动画演示</h2>
              <div className="flex flex-wrap gap-2">
                {rnnScenarios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleScenarioChange(s.id)}
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

            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
              {TAB_ITEMS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setDeepPhase(0);
                  }}
                  className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white shadow text-indigo-700'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-4 md:p-5 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'business' && (
                <motion.div
                  key="tab-business"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="h-full"
                >
                  <BusinessTab
                    scenario={currentScenario}
                    currentStepIndex={currentStepIndex}
                    currentStepData={currentStepData}
                  />
                </motion.div>
              )}

              {activeTab === 'principle' && (
                <motion.div
                  key="tab-principle"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="h-full"
                >
                  <PrincipleTab
                    scenario={currentScenario}
                    currentStepIndex={currentStepIndex}
                    technicalTrace={technicalTrace}
                    currentTechStep={currentTechStep}
                  />
                </motion.div>
              )}

              {activeTab === 'deep' && (
                <motion.div
                  key="tab-deep"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="h-full"
                >
                  <DeepTab
                    scenario={currentScenario}
                    currentStepIndex={currentStepIndex}
                    currentTechStep={currentTechStep}
                    deepPhase={deepPhase}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="text-sm text-slate-500">
                进度: {Math.max(0, currentStepIndex + 1)} / {totalSteps}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">速度</span>
                {SPEED_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                      speed === s
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={handleReset}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                title="重置"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className={`flex items-center px-6 py-2 rounded-full text-white font-medium transition-all shadow-md active:scale-95 ${
                  isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isPlaying ? (
                  <>
                    暂停
                    <Pause className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    {currentStepIndex === -1 ? '开始演示' : '继续'}
                    <Play className="w-4 h-4 ml-2 fill-current" />
                  </>
                )}
              </button>

              <button
                onClick={handleNextStep}
                disabled={isPlaying || currentStepIndex >= totalSteps - 1}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors"
                title="下一步"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function BusinessTab({ scenario, currentStepIndex, currentStepData }) {
  const currentEmoji = currentStepData ? getEmoji(currentStepData.score) : '🤖';

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
        <span>Input: Word Sequence</span>
        <span>Output: {scenario.type === 'generation' ? 'Prediction' : 'Sentiment'}</span>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="mb-8 bg-white px-6 py-4 rounded-2xl shadow-lg border border-slate-200 text-center min-h-[100px] flex flex-col items-center justify-center w-full max-w-sm"
          >
            {currentStepIndex === -1 ? (
              <span className="text-slate-400">点击播放，观察 RNN 如何边读边更新判断...</span>
            ) : (
              <>
                {currentStepData.prediction ? (
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-indigo-500 font-bold uppercase mb-1">Prediction Output</span>
                    <span className="text-3xl font-bold text-indigo-700 bg-indigo-50 px-4 py-1 rounded-lg border border-indigo-100">
                      {currentStepData.prediction}
                    </span>
                  </div>
                ) : (
                  <span className="text-4xl mb-2">{currentEmoji}</span>
                )}
                <span className="text-slate-600 font-medium text-sm mt-2">{currentStepData.reason}</span>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="relative mb-8">
          <motion.div
            animate={{
              backgroundColor: getBallColor(currentStepData),
              scale: [1, 1.05, 1],
              boxShadow: currentStepData?.memory ? '0 0 20px rgba(59, 130, 246, 0.5)' : '0 0 0 rgba(0,0,0,0)',
            }}
            transition={{ duration: 0.5 }}
            className="w-32 h-32 rounded-full shadow-xl flex items-center justify-center border-4 border-white relative z-20 transition-colors duration-500"
          >
            <span className="text-white font-bold text-xl">RNN</span>
          </motion.div>

          <AnimatePresence>
            {currentStepData?.memory && (
              <motion.div
                initial={{ opacity: 0, scale: 0, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute -right-28 top-0 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg border border-blue-200 text-xs font-bold shadow-sm z-30 flex items-center"
              >
                <BrainCircuit className="w-3 h-3 mr-1" />
                Memory: {currentStepData.memory}
              </motion.div>
            )}
          </AnimatePresence>

          <svg className="absolute top-0 -right-16 w-32 h-32 z-10 pointer-events-none opacity-50" viewBox="0 0 100 100">
            <motion.path
              d="M 50 50 C 80 10, 100 50, 80 90"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-indigo-300"
              animate={{
                pathLength: [0, 1],
                opacity: [0.3, 1, 0.3],
                stroke: currentStepData?.memory ? '#3b82f6' : '#a5b4fc',
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <path
              d="M 78 85 L 80 90 L 85 87"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className={currentStepData?.memory ? 'text-blue-500' : 'text-indigo-300'}
            />
          </svg>
        </div>

        <div className="h-16 flex items-center justify-center flex-wrap px-4 gap-1 w-full overflow-hidden">
          {scenario.sentence.map((word, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0.3, scale: 0.8 }}
              animate={{
                opacity: idx === currentStepIndex ? 1 : idx < currentStepIndex ? 0.4 : 0.2,
                scale: idx === currentStepIndex ? 1.3 : 1,
                y: idx === currentStepIndex ? -5 : 0,
                color: idx === currentStepIndex ? '#4f46e5' : '#64748b',
                fontWeight: idx === currentStepIndex ? 800 : 400,
              }}
              className="text-lg transition-all duration-300 min-w-[20px] text-center"
            >
              {word}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrincipleTab({ scenario, currentStepIndex, technicalTrace, currentTechStep }) {
  const isSentiment = scenario.type === 'sentiment';
  const lastIdx = technicalTrace.length - 1;
  const finalTechStep = technicalTrace[lastIdx];
  const finalConfidence = finalTechStep ? Math.max(...finalTechStep.y_t) : 0;
  const currentConfidence = currentTechStep ? Math.max(...currentTechStep.y_t) : 0;
  const readProgress =
    currentStepIndex >= 0 && technicalTrace.length > 0
      ? ((currentStepIndex + 1) / technicalTrace.length) * 100
      : 0;

  const currentMeta = getSentimentMeta(currentTechStep?.predictionLabel);
  const finalMeta = getSentimentMeta(finalTechStep?.predictionLabel);

  return (
    <div className="h-full flex flex-col overflow-y-auto pr-1">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">固定参数矩阵（共享）</h3>
          <div className="space-y-3">
            <MatrixPreview label="W_xh (4x3)" matrix={rnnTechSpec.W_xh} />
            <MatrixPreview label="W_hh (4x4)" matrix={rnnTechSpec.W_hh} />
            <MatrixPreview label="W_hy (3x4)" matrix={rnnTechSpec.W_hy} />
          </div>
          <div className="mt-3 text-xs text-slate-500">
            这些参数在整个句子中保持不变，变化的是每一步的 <code>h_t</code>。
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 xl:col-span-2">
          <h3 className="text-sm font-bold text-slate-700 mb-3">当前时间步计算流（x_t + h_{"{t-1}"} -&gt; h_t）</h3>
          {currentTechStep ? (
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="text-xs text-slate-500">
                Step {currentStepIndex + 1} / {scenario.sentence.length} | 当前 token:
                <span className="ml-1 px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold">
                  {currentTechStep.token}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                <FlowBlock title="输入向量 x_t" value={currentTechStep.x_t} tone="blue" />
                <FlowBlock title="上一步记忆 h_{t-1}" value={currentTechStep.h_prev} tone="amber" />
                <FlowCell title="RNN Cell" subtitle="tanh(W_xh x_t + W_hh h_{t-1} + b_h)" />
                <FlowBlock title="新记忆 h_t" value={currentTechStep.h_t} tone="emerald" />
              </div>
            </motion.div>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-sm text-slate-400">
              点击播放后，这里会展示每一步“输入 + 旧记忆 -&gt; 新记忆”的更新过程。
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4 shrink-0">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-700">隐藏状态时间轴 h_t（记忆强度）</h3>
          {currentStepIndex >= 0 && (
            <span className="text-xs text-slate-500">
              当前词：<strong>{scenario.sentence[currentStepIndex]}</strong>
            </span>
          )}
        </div>

        <div className="mt-3 flex items-end gap-2 overflow-x-auto pb-2 h-[160px]">
          {technicalTrace.map((step, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isPast = idx < currentStepIndex;
            const height = 22 + step.memoryStrength * 96;

            return (
              <div key={idx} className="min-w-[34px] flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 16 }}
                  animate={{ height }}
                  transition={{ duration: 0.35 }}
                  className={`w-6 rounded-t-md ${
                    isCurrent ? 'bg-indigo-500' : isPast ? 'bg-indigo-300' : 'bg-slate-200'
                  }`}
                />
                <span
                  className={`text-xs ${
                    isCurrent ? 'text-indigo-700 font-bold' : 'text-slate-500'
                  }`}
                >
                  {step.token}
                </span>
                <span className="text-[10px] text-slate-400">{step.memoryStrength.toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        {isSentiment && (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <h3 className="text-sm font-bold text-slate-700">情感判定机制（动画）</h3>
            <p className="text-xs text-slate-500 mt-1">
              每一步都会生成即时估计 <code>y_t</code>，但句子级情感分类通常使用最后一步{' '}
              <code>h_T</code> 对应的 <code>y_T</code> 作为最终结果。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <motion.div
                key={`instant-${currentStepIndex}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg border p-3 ${currentMeta.soft}`}
              >
                <div className="text-xs text-slate-500 mb-2">逐步即时估计（每一步都算）</div>
                {currentTechStep ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-600">当前 token: {currentTechStep.token}</span>
                      <span className={`text-xs px-2 py-1 rounded border font-semibold ${currentMeta.chip}`}>
                        {currentTechStep.predictionLabel}
                      </span>
                    </div>
                    <div className="h-2 bg-white rounded-full border border-slate-200 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(4, currentConfidence * 100)}%` }}
                        transition={{ duration: 0.35 }}
                        className={`h-full ${currentMeta.bar}`}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      置信度 {(currentConfidence * 100).toFixed(1)}%
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-slate-400">开始播放后显示即时估计。</div>
                )}
              </motion.div>

              <motion.div
                key={`final-${currentStepIndex}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg border p-3 ${finalMeta.soft}`}
              >
                <div className="text-xs text-slate-500 mb-2">最终句子判定（读完整句后锁定）</div>
                {currentStepIndex >= lastIdx && finalTechStep ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-600">使用最后状态 h_T</span>
                      <span className={`text-xs px-2 py-1 rounded border font-semibold ${finalMeta.chip}`}>
                        {finalTechStep.predictionLabel}
                      </span>
                    </div>
                    <div className="h-2 bg-white rounded-full border border-slate-200 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(4, finalConfidence * 100)}%` }}
                        transition={{ duration: 0.45 }}
                        className={`h-full ${finalMeta.bar}`}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      最终置信度 {(finalConfidence * 100).toFixed(1)}%
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xs text-slate-500">
                      仍在读取上下文，暂不锁定最终情感。
                    </div>
                    <div className="mt-2 h-2 bg-white rounded-full border border-slate-200 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, readProgress)}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-indigo-400"
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      已读取 {(readProgress || 0).toFixed(0)}%
                    </div>
                  </>
                )}
              </motion.div>
            </div>

            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-600 mb-2">逐步估计轨迹（y_t）</div>
              <div className="flex items-end gap-2 overflow-x-auto pb-2">
                {technicalTrace.map((step, idx) => {
                  const visible = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const meta = getSentimentMeta(step.predictionLabel);
                  const confidence = Math.max(...step.y_t);
                  return (
                    <div key={`pred-${idx}`} className="min-w-[44px] flex flex-col items-center gap-1">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{
                          scale: isCurrent ? 1.08 : 1,
                          opacity: visible ? 1 : 0.25,
                          y: isCurrent ? -3 : 0,
                        }}
                        className={`w-8 h-8 rounded-full border text-[10px] font-bold flex items-center justify-center ${
                          visible ? meta.chip : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        {visible ? step.predictionLabel : '?'}
                      </motion.div>
                      <div className="text-[10px] text-slate-500">{step.token}</div>
                      <div className="w-8 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: visible ? `${Math.max(6, confidence * 100)}%` : '0%' }}
                          transition={{ duration: 0.25 }}
                          className={`h-full ${meta.bar}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DeepTab({ scenario, currentStepIndex, currentTechStep, deepPhase }) {
  if (!currentTechStep) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-slate-400">
        点击播放后，这里会逐拍展示 RNN 单步公式是如何执行的。
      </div>
    );
  }

  const phasePanels = [
    {
      title: 'Phase 1: 输入映射',
      desc: '把当前词向量投影到隐藏空间',
      vectors: [{ title: 'x_t', values: currentTechStep.x_t }, { title: 'a_x', values: currentTechStep.ax }],
    },
    {
      title: 'Phase 2: 记忆映射',
      desc: '把上一步隐藏状态映射到当前空间',
      vectors: [
        { title: 'h_{t-1}', values: currentTechStep.h_prev },
        { title: 'a_h', values: currentTechStep.ah },
      ],
    },
    {
      title: 'Phase 3: 融合',
      desc: '把新输入和旧记忆加权合并',
      vectors: [{ title: 'z_t', values: currentTechStep.z_t }],
    },
    {
      title: 'Phase 4: 激活',
      desc: '通过 tanh 压缩，得到新记忆状态',
      vectors: [{ title: 'h_t', values: currentTechStep.h_t }],
    },
    {
      title: 'Phase 5: 输出',
      desc: '对类别得分做 softmax，得到概率分布',
      vectors: [
        { title: 'logits', values: currentTechStep.logits },
        {
          title: 'y_t (prob)',
          values: currentTechStep.y_t,
          labels: rnnTechSpec.outputLabels,
          prob: true,
        },
      ],
    },
  ];

  const currentPanel = phasePanels[deepPhase];

  return (
    <div className="h-full grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700">单步公式分解（自动逐拍）</h3>
          <span className="text-xs text-slate-500">
            Step {currentStepIndex + 1} / {scenario.sentence.length}
          </span>
        </div>

        <div className="text-xs text-slate-500 mb-3">
          当前 token:
          <span className="ml-1 px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold">
            {currentTechStep.token}
          </span>
        </div>

        <div className="space-y-2">
          {FORMULA_STEPS.map((item, idx) => {
            const isCurrent = idx === deepPhase;
            const isPast = idx < deepPhase;

            return (
              <motion.div
                key={item.id}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.01 : 1,
                  opacity: isCurrent || isPast ? 1 : 0.55,
                }}
                className={`rounded-lg border p-3 transition-colors ${
                  isCurrent
                    ? 'border-indigo-300 bg-indigo-50'
                    : isPast
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="text-xs font-semibold text-slate-500 mb-1">Phase {idx + 1}</div>
                <div className="font-mono text-sm text-slate-800">{item.formula}</div>
                <div className="text-xs text-slate-500 mt-1">{item.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 overflow-y-auto">
        <h3 className="text-sm font-bold text-slate-700 mb-1">{currentPanel.title}</h3>
        <p className="text-xs text-slate-500 mb-3">{currentPanel.desc}</p>

        <div className="space-y-3">
          {currentPanel.vectors.map((v) => (
            <VectorBars
              key={v.title}
              title={v.title}
              values={v.values}
              labels={v.labels}
              prob={Boolean(v.prob)}
            />
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg border border-indigo-100 bg-indigo-50">
          <div className="text-xs text-indigo-600 mb-1">当前输出类别</div>
          <div className="flex items-center gap-2">
            {rnnTechSpec.outputLabels.map((label, idx) => (
              <span
                key={label}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  idx === currentTechStep.predictionIdx
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-500 border border-slate-200'
                }`}
              >
                {label}: {(currentTechStep.y_t[idx] * 100).toFixed(1)}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowCell({ title, subtitle }) {
  return (
    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-center">
      <div className="text-xs font-semibold text-indigo-600">{title}</div>
      <div className="text-[11px] text-indigo-700 mt-1 font-mono">{subtitle}</div>
    </div>
  );
}

function FlowBlock({ title, value, tone = 'blue' }) {
  const toneClass =
    tone === 'amber'
      ? 'bg-amber-50 border-amber-200 text-amber-700'
      : tone === 'emerald'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
        : 'bg-blue-50 border-blue-200 text-blue-700';

  return (
    <div className={`rounded-lg border p-3 ${toneClass}`}>
      <div className="text-xs font-semibold mb-1">{title}</div>
      <div className="font-mono text-[11px] break-all">
        [{value.map((v) => v.toFixed(3)).join(', ')}]
      </div>
    </div>
  );
}

function MatrixPreview({ label, matrix }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-semibold text-slate-600 mb-1">{label}</div>
      <div className="font-mono text-[10px] text-slate-500 space-y-0.5 max-h-[88px] overflow-auto">
        {matrix.map((row, idx) => (
          <div key={idx}>[{row.map((v) => v.toFixed(2)).join(', ')}]</div>
        ))}
      </div>
    </div>
  );
}

function VectorBars({ title, values, labels, prob = false }) {
  const maxAbs = prob
    ? 1
    : Math.max(
        0.001,
        ...values.map((v) => Math.abs(v)),
      );

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-semibold text-slate-600 mb-2">{title}</div>
      <div className="space-y-2">
        {values.map((v, idx) => {
          const label = labels?.[idx] || `d${idx + 1}`;
          const widthPct = prob ? Math.max(4, v * 100) : Math.max(2, (Math.abs(v) / maxAbs) * 50);

          return (
            <div key={`${title}-${idx}`} className="grid grid-cols-[40px_1fr_58px] items-center gap-2">
              <span className="text-[11px] text-slate-500">{label}</span>

              <div className="relative h-5 bg-white border border-slate-200 rounded overflow-hidden">
                {!prob && <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300" />}
                {prob ? (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.35 }}
                    className="h-full bg-emerald-500"
                  />
                ) : (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.35 }}
                    className={`absolute top-0 h-full ${v >= 0 ? 'left-1/2 bg-indigo-500' : 'right-1/2 bg-rose-500'}`}
                  />
                )}
              </div>

              <span className="text-[11px] font-mono text-slate-600 text-right">{v.toFixed(3)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RNN;
