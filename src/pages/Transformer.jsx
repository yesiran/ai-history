import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Network,
  Zap,
  Lightbulb,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Layers,
  Cpu,
} from 'lucide-react';
import {
  transformerExplanation,
  transformerScenarios,
  transformerTechSpec,
  buildTransformerParallelTrace,
} from '../utils/transformer_data';

const TAB_ITEMS = [
  { id: 'business', label: '表层业务演示' },
  { id: 'principle', label: '技术原理示意' },
  { id: 'deep', label: '深度技术演示' },
];

const SPEED_OPTIONS = [0.2, 0.75, 1, 1.5, 2];

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

const DEEP_PHASES = [
  { id: 'qkv', title: 'Phase 1: Q/K/V 投影', desc: '所有 token 同时做线性变换，得到 Query / Key / Value。' },
  { id: 'score', title: 'Phase 2: 注意力分数', desc: '每个 query 对所有 key 计算相关性并做 softmax。' },
  { id: 'agg', title: 'Phase 3: 加权聚合', desc: '按权重聚合所有 Value，得到上下文向量。' },
  { id: 'cls', title: 'Phase 4: 句子级分类', desc: '用顶层句子表示接分类头，输出最终情感。' },
];

const ATTENTION_MODES = [
  { id: 'bidirectional', label: '双向注意力（句子分类）' },
  { id: 'causal', label: '因果掩码（自回归生成）' },
];

function getSentimentMeta(label) {
  if (!label) return SENTIMENT_META.中性;
  return SENTIMENT_META[label] || SENTIMENT_META.中性;
}

function applyAttentionMode(matrix, mode) {
  if (!matrix) return [];
  if (mode !== 'causal') return matrix;

  return matrix.map((row, rowIdx) => {
    const masked = row.map((w, colIdx) => (colIdx <= rowIdx ? w : 0));
    const sum = masked.reduce((a, b) => a + b, 0) || 1;
    return masked.map((w) => w / sum);
  });
}

function getTopTargets(layerData, queryIdx, limit = 3, mode = 'bidirectional') {
  if (!layerData) return [];
  const matrix = applyAttentionMode(layerData.attentionMatrix, mode);
  const row = matrix[queryIdx] || [];
  const pairs = row
    .map((weight, idx) => ({ idx, token: layerData.tokens[idx], weight }))
    .sort((a, b) => b.weight - a.weight);
  return pairs.slice(0, limit);
}

function formatPct(x) {
  return `${(x * 100).toFixed(1)}%`;
}

const Transformer = () => {
  const [activeScenarioId, setActiveScenarioId] = useState('sentiment_parallel');
  const [activeTab, setActiveTab] = useState('business');
  const [currentLayerIndex, setCurrentLayerIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(9);
  const [deepPhase, setDeepPhase] = useState(0);
  const [attentionMode, setAttentionMode] = useState('bidirectional');

  const playTimerRef = useRef(null);
  const deepTimerRef = useRef(null);

  const currentScenario =
    transformerScenarios.find((s) => s.id === activeScenarioId) || transformerScenarios[0];

  const trace = useMemo(
    () => buildTransformerParallelTrace(currentScenario.sentence),
    [currentScenario.sentence],
  );
  const totalLayers = trace.length;
  const currentLayerData = currentLayerIndex >= 0 ? trace[currentLayerIndex] : null;
  const finalLayerData = trace[totalLayers - 1];

  useEffect(() => {
    if (!isPlaying) return undefined;

    const intervalMs = Math.max(380, Math.round(1250 / speed));
    playTimerRef.current = setInterval(() => {
      setDeepPhase(0);
      setCurrentLayerIndex((prev) => {
        if (prev < totalLayers - 1) return prev + 1;
        setIsPlaying(false);
        return prev;
      });
    }, intervalMs);

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, speed, totalLayers]);

  useEffect(() => {
    if (deepTimerRef.current) clearInterval(deepTimerRef.current);
    if (activeTab !== 'deep' || currentLayerIndex < 0) return undefined;

    const phaseMs = Math.max(320, Math.round(900 / speed));
    deepTimerRef.current = setInterval(() => {
      setDeepPhase((prev) => (prev + 1) % DEEP_PHASES.length);
    }, phaseMs);

    return () => {
      if (deepTimerRef.current) clearInterval(deepTimerRef.current);
    };
  }, [activeTab, currentLayerIndex, speed]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentLayerIndex(-1);
    setDeepPhase(0);
    if (playTimerRef.current) clearInterval(playTimerRef.current);
    if (deepTimerRef.current) clearInterval(deepTimerRef.current);
  };

  const handleNextLayer = () => {
    setIsPlaying(false);
    setDeepPhase(0);
    setCurrentLayerIndex((prev) => {
      if (prev >= totalLayers - 1) return prev;
      return prev + 1;
    });
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (currentLayerIndex >= totalLayers - 1) {
      setCurrentLayerIndex(-1);
      setDeepPhase(0);
    }
    setIsPlaying(true);
  };

  const handleScenarioChange = (id) => {
    setActiveScenarioId(id);
    setSelectedTokenIndex(9);
    handleReset();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col font-sans text-slate-800">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-indigo-900 mb-2">Transformer (注意力机制)</h1>
        <p className="text-xl text-slate-600">
          用分布式并行计算理解同一句情感分析：不是一般的好看
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <div className="space-y-6 overflow-y-auto pr-4 h-[calc(100vh-200px)]">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-semibold mb-6 flex items-center text-indigo-700">
              <Network className="w-6 h-6 mr-2" />
              Transformer 的核心思路
            </h2>

            <div className="space-y-6">
              {transformerExplanation.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors"
                >
                  <h3 className="text-lg font-bold mb-2 flex items-center text-slate-800">
                    {idx === 0 && <Network className="w-5 h-5 mr-2 text-blue-500" />}
                    {idx === 1 && <Lightbulb className="w-5 h-5 mr-2 text-amber-500" />}
                    {idx === 2 && <Zap className="w-5 h-5 mr-2 text-purple-500" />}
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm text-justify whitespace-pre-line">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-indigo-50 p-4 rounded-lg border border-indigo-200 text-sm text-indigo-900">
              <strong>课堂主线：</strong> 每层都在并行更新 token 表示，最终句子情感判定使用顶层输出。
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 flex flex-col h-[calc(100vh-200px)]">
          <div className="space-y-3 mb-4">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <h2 className="text-xl font-bold text-slate-700">Transformer 三层动画演示</h2>
              <div className="flex flex-wrap gap-2">
                {transformerScenarios.map((s) => (
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

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">注意力模式</span>
              <div className="flex bg-slate-100 rounded-lg p-1">
                {ATTENTION_MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setAttentionMode(m.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                      attentionMode === m.id
                        ? 'bg-white text-indigo-700 shadow'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-4 md:p-5 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'business' && (
                <motion.div
                  key="tf-business"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="h-full"
                >
                  <BusinessTab
                    scenario={currentScenario}
                    currentLayerIndex={currentLayerIndex}
                    totalLayers={totalLayers}
                    currentLayerData={currentLayerData}
                    finalLayerData={finalLayerData}
                    selectedTokenIndex={selectedTokenIndex}
                    onSelectToken={setSelectedTokenIndex}
                    attentionMode={attentionMode}
                  />
                </motion.div>
              )}

              {activeTab === 'principle' && (
                <motion.div
                  key="tf-principle"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="h-full"
                >
                  <PrincipleTab
                    scenario={currentScenario}
                    currentLayerIndex={currentLayerIndex}
                    totalLayers={totalLayers}
                    currentLayerData={currentLayerData}
                    finalLayerData={finalLayerData}
                    selectedTokenIndex={selectedTokenIndex}
                    onSelectToken={setSelectedTokenIndex}
                    attentionMode={attentionMode}
                  />
                </motion.div>
              )}

              {activeTab === 'deep' && (
                <motion.div
                  key="tf-deep"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="h-full"
                >
                  <DeepTab
                    scenario={currentScenario}
                    currentLayerIndex={currentLayerIndex}
                    totalLayers={totalLayers}
                    currentLayerData={currentLayerData}
                    finalLayerData={finalLayerData}
                    selectedTokenIndex={selectedTokenIndex}
                    onSelectToken={setSelectedTokenIndex}
                    deepPhase={deepPhase}
                    attentionMode={attentionMode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="text-sm text-slate-500">
                层进度: {Math.max(0, currentLayerIndex + 1)} / {totalLayers}
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
                    {currentLayerIndex === -1 ? '开始演示' : '继续'}
                    <Play className="w-4 h-4 ml-2 fill-current" />
                  </>
                )}
              </button>

              <button
                onClick={handleNextLayer}
                disabled={isPlaying || currentLayerIndex >= totalLayers - 1}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors"
                title="下一层"
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

function BusinessTab({
  scenario,
  currentLayerIndex,
  totalLayers,
  currentLayerData,
  finalLayerData,
  selectedTokenIndex,
  onSelectToken,
  attentionMode,
}) {
  const selectedToken = scenario.sentence[selectedTokenIndex];
  const topTargets = currentLayerData
    ? getTopTargets(currentLayerData, selectedTokenIndex, 3, attentionMode)
    : [];
  const currentMeta = getSentimentMeta(currentLayerData?.predictionLabel);
  const finalMeta = getSentimentMeta(finalLayerData?.predictionLabel);
  const tokenCount = scenario.sentence.length;
  const serialPerLayer = tokenCount;
  const parallelPerLayer = 1;
  const speedup = serialPerLayer / parallelPerLayer;

  return (
    <div className="h-full flex flex-col overflow-y-auto pr-1">
      <div className="text-xs text-slate-500 mb-2">
        {attentionMode === 'bidirectional'
          ? '当前是双向注意力：每个词在同层可参考整句所有词。'
          : '当前是因果掩码：每个词只能参考自己和前文，不能看未来词。'}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-3 mb-3">
        <h3 className="text-sm font-bold text-slate-700 mb-2">串行 vs 分布式并行（同一层）</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs text-slate-500 mb-1">串行基线（逐 token 执行）</div>
            <div className="text-sm font-semibold text-slate-700 mb-1">
              需要 {serialPerLayer} 个微步
            </div>
            <div className="h-2 bg-white rounded-full border border-slate-200 overflow-hidden">
              <div className="h-full bg-slate-500" style={{ width: '100%' }} />
            </div>
          </div>
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
            <div className="text-xs text-indigo-600 mb-1">Transformer 并行（矩阵批处理）</div>
            <div className="text-sm font-semibold text-indigo-700 mb-1">
              1 个批次完成（约 {speedup.toFixed(0)}x 并行度）
            </div>
            <div className="h-2 bg-white rounded-full border border-indigo-200 overflow-hidden">
              <div className="h-full bg-indigo-500" style={{ width: `${Math.max(6, (parallelPerLayer / serialPerLayer) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {scenario.sentence.map((token, idx) => {
          const isSelected = idx === selectedTokenIndex;
          return (
            <button
              key={`${token}-${idx}`}
              onClick={() => onSelectToken(idx)}
              className={`px-2.5 py-1 rounded-full text-sm border transition-colors ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {token}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center">
            <Cpu className="w-4 h-4 mr-1 text-indigo-500" />
            分布式工作台（并行）
          </h3>
          {currentLayerData ? (
            <>
              <div className="text-xs text-slate-500 mb-2">
                Layer {currentLayerIndex + 1}/{totalLayers}：{currentLayerData.workerMetrics.workers} 个 token
                同时计算，关系任务总数{' '}
                {attentionMode === 'causal'
                  ? (scenario.sentence.length * (scenario.sentence.length + 1)) / 2
                  : currentLayerData.workerMetrics.pairTasks}
                。
              </div>
              <div className="grid grid-cols-4 gap-2">
                {scenario.sentence.map((token, idx) => {
                  const norm = currentLayerData.stateNorms[idx];
                  const isSelected = idx === selectedTokenIndex;
                  return (
                    <motion.div
                      key={`worker-${idx}`}
                      initial={{ opacity: 0.5, y: 6 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: isSelected ? 1.06 : 1,
                      }}
                      transition={{ duration: 0.25 }}
                      className={`rounded-lg border px-2 py-1.5 text-center ${
                        isSelected ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-semibold text-slate-700">{token}</div>
                      <div className="mt-1 h-1.5 bg-white rounded-full border border-slate-200 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(4, norm * 100)}%` }}
                          transition={{ duration: 0.35 }}
                          className="h-full bg-indigo-500"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-[140px] flex items-center justify-center text-sm text-slate-400">
              点击播放后查看每层并行计算过程。
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <h3 className="text-sm font-bold text-slate-700 mb-2">选中 Token 的关注对象</h3>
          <div className="text-xs text-slate-500 mb-2">
            Query token: <strong>{selectedToken}</strong>
          </div>
          {topTargets.length > 0 ? (
            <div className="space-y-2">
              {topTargets.map((item) => (
                <div key={`top-${item.idx}`} className="grid grid-cols-[32px_1fr_54px] items-center gap-2">
                  <span className="text-xs text-slate-600">{item.token}</span>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(6, item.weight * 100)}%` }}
                      transition={{ duration: 0.25 }}
                      className="h-full bg-indigo-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 text-right">{formatPct(item.weight)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400">播放后显示当前层注意力分配。</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <motion.div
          key={`probe-${currentLayerIndex}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg border p-3 ${currentMeta.soft}`}
        >
          <div className="text-xs text-slate-500 mb-2">中间层估计（Layer Probe）</div>
          {currentLayerData ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-600">Layer {currentLayerIndex + 1} 的估计</span>
                <span className={`text-xs px-2 py-1 rounded border font-semibold ${currentMeta.chip}`}>
                  {currentLayerData.predictionLabel}
                </span>
              </div>
              <div className="h-2 bg-white rounded-full border border-slate-200 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(4, currentLayerData.confidence * 100)}%` }}
                  transition={{ duration: 0.35 }}
                  className={`h-full ${currentMeta.bar}`}
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                置信度 {formatPct(currentLayerData.confidence)}
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-400">开始播放后显示每层估计。</div>
          )}
        </motion.div>

        <motion.div
          key={`final-${currentLayerIndex}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg border p-3 ${finalMeta.soft}`}
        >
          <div className="text-xs text-slate-500 mb-2">最终句子判定（行业标准）</div>
          {currentLayerIndex >= totalLayers - 1 ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-600">使用顶层句子表示</span>
                <span className={`text-xs px-2 py-1 rounded border font-semibold ${finalMeta.chip}`}>
                  {finalLayerData.predictionLabel}
                </span>
              </div>
              <div className="h-2 bg-white rounded-full border border-slate-200 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(4, finalLayerData.confidence * 100)}%` }}
                  transition={{ duration: 0.35 }}
                  className={`h-full ${finalMeta.bar}`}
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                最终置信度 {formatPct(finalLayerData.confidence)}
              </div>
            </>
          ) : (
            <>
              <div className="text-xs text-slate-500">尚未到达顶层，最终结果暂不锁定。</div>
              <div className="mt-2 h-2 bg-white rounded-full border border-slate-200 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.max(0, ((Math.max(0, currentLayerIndex + 1) / totalLayers) * 100))}%`,
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-indigo-400"
                />
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function PrincipleTab({
  scenario,
  currentLayerIndex,
  totalLayers,
  currentLayerData,
  finalLayerData,
  selectedTokenIndex,
  onSelectToken,
  attentionMode,
}) {
  const selectedToken = scenario.sentence[selectedTokenIndex];
  const currentMeta = getSentimentMeta(currentLayerData?.predictionLabel);
  const finalMeta = getSentimentMeta(finalLayerData?.predictionLabel);

  return (
    <div className="h-full flex flex-col overflow-y-auto pr-1">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center">
            <Layers className="w-4 h-4 mr-1 text-indigo-500" />
            并行层流水线
          </h3>
          <div className="space-y-2">
            <PipelineCard title="Input Embedding" desc="所有 token 一起进层" />
            <PipelineCard title="Q/K/V Projection" desc="矩阵乘法并行执行" />
            <PipelineCard title="Attention (N×N)" desc="全对全相关性计算" />
            <PipelineCard title="FFN + Residual" desc="同步更新每个 token 状态" />
          </div>
          <div className="mt-2 text-xs text-slate-500">
            当前层: {currentLayerIndex >= 0 ? currentLayerIndex + 1 : '-'} / {totalLayers}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 xl:col-span-2">
          <h3 className="text-sm font-bold text-slate-700 mb-2">注意力矩阵（并行关系图）</h3>
          <div className="text-xs text-slate-500 mb-2">
            Query: <strong>{selectedToken}</strong>
            （行=谁在读，列=读谁；点击 token 切换）
          </div>
          <div className="text-[11px] text-slate-500 mb-2">
            {attentionMode === 'bidirectional'
              ? '双向模式：行内所有列都可有权重（整句可见）。'
              : '因果模式：右上角（未来词）被掩码为 0，只能看前文。'}
          </div>
          {currentLayerData ? (
            <AttentionHeatmap
              layerData={currentLayerData}
              selectedTokenIndex={selectedTokenIndex}
              onSelectToken={onSelectToken}
              attentionMode={attentionMode}
            />
          ) : (
            <div className="h-[210px] flex items-center justify-center text-sm text-slate-400">
              点击播放后显示当前层注意力矩阵。
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 bg-white rounded-xl border border-slate-200 p-3">
        <h3 className="text-sm font-bold text-slate-700">情感判定机制（标准做法）</h3>
        <p className="text-xs text-slate-500 mt-1">
          每层可以观察中间估计，但最终业务判定使用顶层句子表示（例如 [CLS] 或池化向量）接分类头。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div className={`rounded-lg border p-3 ${currentMeta.soft}`}>
            <div className="text-xs text-slate-500 mb-2">中间层估计（解释用）</div>
            {currentLayerData ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-600">Layer {currentLayerIndex + 1}</span>
                  <span className={`text-xs px-2 py-1 rounded border font-semibold ${currentMeta.chip}`}>
                    {currentLayerData.predictionLabel}
                  </span>
                </div>
                <ProbBars probs={currentLayerData.probs} labels={transformerTechSpec.outputLabels} />
              </>
            ) : (
              <div className="text-xs text-slate-400">播放后显示。</div>
            )}
          </div>

          <div className={`rounded-lg border p-3 ${finalMeta.soft}`}>
            <div className="text-xs text-slate-500 mb-2">最终句子判定（上线输出）</div>
            {currentLayerIndex >= totalLayers - 1 ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-600">Top Layer Output</span>
                  <span className={`text-xs px-2 py-1 rounded border font-semibold ${finalMeta.chip}`}>
                    {finalLayerData.predictionLabel}
                  </span>
                </div>
                <ProbBars probs={finalLayerData.probs} labels={transformerTechSpec.outputLabels} />
              </>
            ) : (
              <div className="text-xs text-slate-500">
                尚未完成所有层，最终标签未锁定。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DeepTab({
  scenario,
  currentLayerIndex,
  totalLayers,
  currentLayerData,
  finalLayerData,
  selectedTokenIndex,
  onSelectToken,
  deepPhase,
  attentionMode,
}) {
  if (!currentLayerData) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-slate-400">
        点击播放后，这里会逐拍展示一层 Transformer 的矩阵计算过程。
      </div>
    );
  }

  const phase = DEEP_PHASES[deepPhase];
  const queryToken = scenario.sentence[selectedTokenIndex];
  const qVec = currentLayerData.qVectors[selectedTokenIndex];
  const ctxVec = currentLayerData.contextVectors[selectedTokenIndex];
  const topTargets = getTopTargets(currentLayerData, selectedTokenIndex, 4, attentionMode);

  return (
    <div className="h-full grid grid-cols-1 xl:grid-cols-2 gap-3">
      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-700">逐拍矩阵过程（当前层）</h3>
          <span className="text-xs text-slate-500">
            Layer {currentLayerIndex + 1}/{totalLayers}
          </span>
        </div>

        <div className="space-y-2">
          {DEEP_PHASES.map((item, idx) => {
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
                className={`rounded-lg border p-2.5 ${
                  isCurrent
                    ? 'border-indigo-300 bg-indigo-50'
                    : isPast
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="text-xs font-semibold text-slate-500">{item.title}</div>
                <div className="text-[11px] text-slate-600 mt-1">{item.desc}</div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 text-xs text-slate-500">
          选中 Query token（用于查看单行细节）：
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {scenario.sentence.map((token, idx) => (
            <button
              key={`deep-token-${idx}`}
              onClick={() => onSelectToken(idx)}
              className={`px-2 py-0.5 rounded border text-xs ${
                idx === selectedTokenIndex
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {token}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-3 overflow-y-auto">
        <h3 className="text-sm font-bold text-slate-700 mb-1">{phase.title}</h3>
        <p className="text-xs text-slate-500 mb-2">{phase.desc}</p>
        <div className="text-[11px] text-slate-500 mb-2">
          当前模式：{attentionMode === 'bidirectional' ? '双向注意力（可看全句）' : '因果掩码（仅看前文）'}
        </div>

        {deepPhase === 0 && (
          <div className="space-y-2">
            <VectorCard title={`Query 向量 q (${queryToken})`} values={qVec} tone="indigo" />
            <VectorCard title="Key 向量 k (当前选中 token)" values={currentLayerData.kVectors[selectedTokenIndex]} tone="slate" />
            <VectorCard title="Value 向量 v (当前选中 token)" values={currentLayerData.vVectors[selectedTokenIndex]} tone="emerald" />
          </div>
        )}

        {deepPhase === 1 && (
          <div className="space-y-2">
            <div className="text-xs text-slate-500">Query "{queryToken}" 对所有 token 的注意力权重：</div>
            {topTargets.map((t) => (
              <div key={`deep-score-${t.idx}`} className="grid grid-cols-[28px_1fr_56px] items-center gap-2">
                <span className="text-xs text-slate-600">{t.token}</span>
                <div className="h-2 bg-slate-100 rounded-full border border-slate-200 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(6, t.weight * 100)}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-indigo-500"
                  />
                </div>
                <span className="text-[11px] text-slate-500 text-right">{formatPct(t.weight)}</span>
              </div>
            ))}
          </div>
        )}

        {deepPhase === 2 && (
          <div className="space-y-2">
            <VectorCard title={`Context 向量 c (${queryToken})`} values={ctxVec} tone="amber" />
            <VectorCard
              title={`更新后状态 h (${queryToken})`}
              values={currentLayerData.states[selectedTokenIndex]}
              tone="emerald"
            />
          </div>
        )}

        {deepPhase === 3 && (
          <div className="space-y-2">
            <div className="text-xs text-slate-500">
              当前层估计（解释用） vs 顶层最终判定（标准输出）
            </div>
            <ProbCard
              title={`Layer ${currentLayerIndex + 1} Probe`}
              label={currentLayerData.predictionLabel}
              probs={currentLayerData.probs}
            />
            <ProbCard
              title="Top Layer Final"
              label={finalLayerData.predictionLabel}
              probs={finalLayerData.probs}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function PipelineCard({ title, desc }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
      <div className="text-xs font-semibold text-slate-700">{title}</div>
      <div className="text-[11px] text-slate-500 mt-1">{desc}</div>
    </div>
  );
}

function AttentionHeatmap({ layerData, selectedTokenIndex, onSelectToken, attentionMode }) {
  const tokens = layerData.tokens;
  const n = tokens.length;
  const matrix = applyAttentionMode(layerData.attentionMatrix, attentionMode);

  return (
    <div className="overflow-x-auto">
      <div
        className="grid gap-1 w-max"
        style={{ gridTemplateColumns: `28px repeat(${n}, 24px)` }}
      >
        <div />
        {tokens.map((t, idx) => (
          <button
            key={`col-${idx}`}
            onClick={() => onSelectToken(idx)}
            className={`text-[10px] h-6 rounded ${
              idx === selectedTokenIndex ? 'bg-indigo-600 text-white' : 'text-slate-500'
            }`}
          >
            {t}
          </button>
        ))}

        {tokens.map((rowToken, rowIdx) => (
          <React.Fragment key={`row-${rowIdx}`}>
            <button
              onClick={() => onSelectToken(rowIdx)}
              className={`text-[10px] h-6 rounded ${
                rowIdx === selectedTokenIndex ? 'bg-indigo-600 text-white' : 'text-slate-500'
              }`}
            >
              {rowToken}
            </button>
            {tokens.map((_, colIdx) => {
              const w = matrix[rowIdx][colIdx];
              const alpha = Math.min(0.92, 0.08 + w * 1.2);
              const isRowSelected = rowIdx === selectedTokenIndex;
              const isMasked = attentionMode === 'causal' && colIdx > rowIdx;
              return (
                <div
                  key={`cell-${rowIdx}-${colIdx}`}
                  className={`w-6 h-6 rounded border ${isRowSelected ? 'border-indigo-300' : 'border-slate-200'}`}
                  style={{
                    backgroundColor: isMasked
                      ? 'rgba(148, 163, 184, 0.18)'
                      : `rgba(79, 70, 229, ${alpha})`,
                  }}
                  title={
                    isMasked
                      ? `${rowToken} -> ${tokens[colIdx]}: masked`
                      : `${rowToken} -> ${tokens[colIdx]}: ${formatPct(w)}`
                  }
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function ProbBars({ probs, labels }) {
  return (
    <div className="space-y-2">
      {labels.map((label, idx) => {
        const meta = getSentimentMeta(label);
        return (
          <div key={`prob-${label}`} className="grid grid-cols-[40px_1fr_52px] items-center gap-2">
            <span className="text-[11px] text-slate-600">{label}</span>
            <div className="h-2 bg-white rounded-full border border-slate-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(4, probs[idx] * 100)}%` }}
                transition={{ duration: 0.3 }}
                className={`h-full ${meta.bar}`}
              />
            </div>
            <span className="text-[11px] text-slate-500 text-right">{formatPct(probs[idx])}</span>
          </div>
        );
      })}
    </div>
  );
}

function VectorCard({ title, values, tone = 'indigo' }) {
  const toneClass =
    tone === 'emerald'
      ? 'border-emerald-200 bg-emerald-50'
      : tone === 'amber'
        ? 'border-amber-200 bg-amber-50'
        : tone === 'slate'
          ? 'border-slate-200 bg-slate-50'
          : 'border-indigo-200 bg-indigo-50';

  return (
    <div className={`rounded-lg border p-2.5 ${toneClass}`}>
      <div className="text-xs font-semibold text-slate-700 mb-1">{title}</div>
      <div className="font-mono text-[11px] text-slate-600">[{values.map((x) => x.toFixed(3)).join(', ')}]</div>
    </div>
  );
}

function ProbCard({ title, label, probs }) {
  const meta = getSentimentMeta(label);
  return (
    <div className={`rounded-lg border p-2.5 ${meta.soft}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-600">{title}</span>
        <span className={`text-xs px-2 py-1 rounded border font-semibold ${meta.chip}`}>{label}</span>
      </div>
      <ProbBars probs={probs} labels={transformerTechSpec.outputLabels} />
    </div>
  );
}

export default Transformer;
