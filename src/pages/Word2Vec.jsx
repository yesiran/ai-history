import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Info, Network, Calculator, Target, Search, ArrowRight, Play, Pause, RotateCcw, ChevronRight, Zap } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { wordVectors, categories, findNearest, vectorArithmetic, trainingSteps, generateRandomPositions } from '../utils/word2vec_data';

const S = 0.1; // Scale: data coordinates → 3D scene units

export default function Word2Vec() {
  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-slate-50">
      {/* Left Panel: Theory */}
      <div className="w-full md:w-[38%] h-full overflow-y-auto border-r border-slate-200 bg-white p-6 md:p-10">
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
              比喻：语言的"超市货架"
            </h2>
            <p className="text-slate-600">
               如果我们要把字典里的词整理好，最好的办法不是按拼音排序，而是按<strong>"意思"</strong>分类。
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
               其实机器并没有谁教它"苹果是水果"。它只是在做一个疯狂的<strong>"完形填空"</strong>游戏。
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
                        <div className="text-xs text-slate-500">经常出现在这里 → <strong>拉近</strong>它们与"喝/汁"的距离。</div>
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
                  <strong>结论：</strong> 因为"苹果"和"橙子"总是在相同的上下文中出现（都是被喝的），机器就认为它们是"同类"，把它们的坐标画在了一起。
               </div>
            </div>
          </section>

          <section className="space-y-4">
             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-sm text-slate-600">3</span>
              神奇的"词语算数"
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
                (国王 - 男人) 的向量方向，就代表了"皇室身份"；<br/>
                (北京 - 中国) 的向量方向，就代表了"是...的首都"。
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
              N-gram 只懂"死记硬背"，Word2Vec 则拥有了"举一反三"的能力，这是从统计到理解的关键一步。
            </p>
            <NgramVsWord2Vec />
          </section>
        </div>
      </div>

      {/* Right Panel: Interactive Galaxy */}
      <div className="w-full md:w-[62%] h-full bg-slate-900 text-white flex flex-col relative overflow-hidden">
        <VectorGalaxy />
      </div>
    </div>
  );
}

// ============================================================
// 3D Semantic Galaxy
// ============================================================

function VectorGalaxy() {
  const [mode, setMode] = useState('explore');
  const [selectedWord, setSelectedWord] = useState(null);
  const [hoveredWord, setHoveredWord] = useState(null);

  // Calculation state
  const [calcA, setCalcA] = useState('国王');
  const [calcB, setCalcB] = useState('男人');
  const [calcC, setCalcC] = useState('女人');

  // Training state
  const [trainingStepIndex, setTrainingStepIndex] = useState(-1);
  const [isTrainingPlaying, setIsTrainingPlaying] = useState(false);
  const [trainingPositions, setTrainingPositions] = useState(() => generateRandomPositions());
  const [trainingSubPhase, setTrainingSubPhase] = useState('predict'); // 'predict' | 'update'
  const [initialLoss, setInitialLoss] = useState(null);

  const resultVector = vectorArithmetic(calcA, calcB, calcC);
  const nearestToResult = resultVector ? findNearest(resultVector, 1)[0] : null;

  // Nearest neighbors for selected word (explore mode)
  const nearestNeighbors = useMemo(() => {
    if (!selectedWord || mode !== 'explore') return [];
    const v = wordVectors[selectedWord];
    return findNearest(v, 5, selectedWord);
  }, [selectedWord, mode]);

  // Cluster bounding spheres
  const clusterData = useMemo(() => {
    const groups = {};
    Object.entries(wordVectors).forEach(([, v]) => {
      if (!groups[v.category]) groups[v.category] = [];
      groups[v.category].push(v);
    });

    return Object.entries(groups).map(([cat, words]) => {
      const cx = words.reduce((s, w) => s + w.x, 0) / words.length;
      const cy = words.reduce((s, w) => s + w.y, 0) / words.length;
      const cz = words.reduce((s, w) => s + w.z, 0) / words.length;
      const maxDist = Math.max(
        ...words.map(w => Math.sqrt((w.x - cx) ** 2 + (w.y - cy) ** 2 + (w.z - cz) ** 2))
      );
      return {
        category: cat,
        center: [cx * S, cy * S, cz * S],
        radius: (maxDist + 8) * S,
        color: categories[cat].color,
      };
    });
  }, []);

  // --- Training logic ---

  const currentStep = trainingStepIndex >= 0 && trainingStepIndex <= 6 ? trainingSteps[trainingStepIndex] : null;
  const currentHighlightWords = currentStep ? currentStep.targetWords : [];
  const showClusters = mode !== 'training' || trainingStepIndex === 7;

  // Dynamic wrong guess: closest non-target word to target centroid
  const wrongGuess = useMemo(() => {
    if (mode !== 'training' || !currentStep) return null;
    const targetWords = currentStep.targetWords;
    const cx = targetWords.reduce((s, w) => s + trainingPositions[w].x, 0) / targetWords.length;
    const cy = targetWords.reduce((s, w) => s + trainingPositions[w].y, 0) / targetWords.length;
    const cz = targetWords.reduce((s, w) => s + trainingPositions[w].z, 0) / targetWords.length;

    let minDist = Infinity;
    let closest = null;
    Object.keys(wordVectors).forEach(word => {
      if (targetWords.includes(word)) return;
      const p = trainingPositions[word];
      const dist = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2 + (p.z - cz) ** 2);
      if (dist < minDist) {
        minDist = dist;
        closest = word;
      }
    });
    return closest;
  }, [mode, currentStep, trainingPositions]);

  // Overall loss: average distance of all words to final positions
  const overallLoss = useMemo(() => {
    if (mode !== 'training') return 0;
    let totalDist = 0;
    const words = Object.keys(wordVectors);
    words.forEach(word => {
      const p = trainingPositions[word];
      const f = wordVectors[word];
      totalDist += Math.sqrt((p.x - f.x) ** 2 + (p.y - f.y) ** 2 + (p.z - f.z) ** 2);
    });
    return totalDist / words.length;
  }, [mode, trainingPositions]);

  const lossPercent = initialLoss ? Math.max(0, Math.min(1, overallLoss / initialLoss)) : 1;

  const advanceTraining = useCallback(() => {
    setTrainingSubPhase(prev => {
      if (prev === 'predict') {
        return 'update';
      } else {
        setTrainingStepIndex(prevIdx => Math.min(prevIdx + 1, 7));
        return 'predict';
      }
    });
  }, []);

  // Apply position changes when entering update sub-phase
  useEffect(() => {
    if (mode !== 'training') return;

    if (trainingSubPhase === 'update' && trainingStepIndex >= 0 && trainingStepIndex <= 6) {
      const step = trainingSteps[trainingStepIndex];
      setTrainingPositions(current => {
        const updated = { ...current };
        step.targetWords.forEach(word => {
          const final = wordVectors[word];
          const cur = updated[word];
          updated[word] = {
            x: cur.x + 0.4 * (final.x - cur.x),
            y: cur.y + 0.4 * (final.y - cur.y),
            z: cur.z + 0.4 * (final.z - cur.z),
          };
        });
        return updated;
      });
    } else if (trainingStepIndex === 7) {
      // Final convergence: snap all words to their final positions
      const finalPositions = {};
      Object.keys(wordVectors).forEach(word => {
        const v = wordVectors[word];
        finalPositions[word] = { x: v.x, y: v.y, z: v.z };
      });
      setTrainingPositions(finalPositions);
      setIsTrainingPlaying(false);
    }
  }, [trainingStepIndex, trainingSubPhase, mode]);

  // Auto-switch to explore mode 2.5s after final convergence
  useEffect(() => {
    if (mode !== 'training' || trainingStepIndex !== 7) return;
    const timer = setTimeout(() => {
      setMode('explore');
      setTrainingStepIndex(-1);
    }, 2500);
    return () => clearTimeout(timer);
  }, [trainingStepIndex, mode]);

  // Auto-play timer: 2s per sub-phase
  useEffect(() => {
    if (!isTrainingPlaying || trainingStepIndex >= 7 || trainingStepIndex === -1) return;
    const timer = setTimeout(() => {
      advanceTraining();
    }, 2000);
    return () => clearTimeout(timer);
  }, [isTrainingPlaying, trainingStepIndex, trainingSubPhase, advanceTraining]);

  const resetTraining = useCallback(() => {
    setTrainingStepIndex(-1);
    setIsTrainingPlaying(false);
    setTrainingSubPhase('predict');
    setTrainingPositions(generateRandomPositions());
    setInitialLoss(null);
  }, []);

  const startTraining = useCallback(() => {
    // Compute initial loss before training starts
    let totalDist = 0;
    const words = Object.keys(wordVectors);
    words.forEach(word => {
      const p = trainingPositions[word];
      const f = wordVectors[word];
      totalDist += Math.sqrt((p.x - f.x) ** 2 + (p.y - f.y) ** 2 + (p.z - f.z) ** 2);
    });
    setInitialLoss(totalDist / words.length);

    setTrainingStepIndex(0);
    setTrainingSubPhase('predict');
    setIsTrainingPlaying(true);
  }, [trainingPositions]);

  const enterTrainingMode = useCallback(() => {
    setMode('training');
    setSelectedWord(null);
    setTrainingStepIndex(-1);
    setIsTrainingPlaying(false);
    setTrainingSubPhase('predict');
    setTrainingPositions(generateRandomPositions());
    setInitialLoss(null);
  }, []);

  // Compute word position based on current mode
  const getWordPosition = useCallback((word) => {
    if (mode === 'training') {
      const p = trainingPositions[word];
      return [p.x * S, p.y * S, p.z * S];
    }
    const v = wordVectors[word];
    return [v.x * S, v.y * S, v.z * S];
  }, [mode, trainingPositions]);

  const handleWordClick = useCallback((word) => {
    if (mode === 'explore') {
      setSelectedWord(prev => prev === word ? null : word);
    }
  }, [mode]);

  const displayWord = selectedWord || hoveredWord;

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
            onClick={() => { setMode('explore'); setIsTrainingPlaying(false); }}
            className={`px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-2 ${mode === 'explore' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Search size={14} /> 漫游模式
          </button>
          <button
            onClick={() => { setMode('calculate'); setSelectedWord(null); setIsTrainingPlaying(false); }}
            className={`px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-2 ${mode === 'calculate' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Calculator size={14} /> 计算模式
          </button>
          <button
            onClick={enterTrainingMode}
            className={`px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-2 ${mode === 'training' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Zap size={14} /> 训练模式
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-grow relative overflow-hidden">
        {/* Training overlay card — Predict phase */}
        {mode === 'training' && currentStep && trainingSubPhase === 'predict' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-800/90 backdrop-blur border border-amber-500/30 rounded-xl p-4 max-w-md w-[90%]">
            <div className="text-amber-400/70 text-xs text-center mb-2">
              第 {trainingStepIndex + 1}/7 步 · 完形填空
            </div>
            <div className="text-lg font-mono text-white text-center mb-3">
              {currentStep.sentence}
            </div>
            {/* Model prediction (wrong guess) */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-slate-400 text-sm">模型预测 →</span>
              <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-lg text-sm border border-red-500/30 font-bold">
                {wrongGuess}
              </span>
              <span className="text-red-400 text-sm font-bold">✗ 猜错了!</span>
            </div>
            {/* Correct answers */}
            <div className="flex items-center justify-center gap-1 mb-1 flex-wrap">
              <span className="text-slate-400 text-sm mr-1">正确答案 →</span>
              {currentStep.targetWords.map(w => (
                <span key={w} className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-xs border border-amber-500/30 font-medium">
                  {w}
                </span>
              ))}
            </div>
            {/* Loss bar */}
            <div className="mt-3 pt-2 border-t border-slate-600/30">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 shrink-0">Loss</span>
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${lossPercent * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-amber-400 shrink-0 w-8 text-right">{lossPercent.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Training overlay card — Update phase */}
        {mode === 'training' && currentStep && trainingSubPhase === 'update' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-800/90 backdrop-blur border border-amber-500/30 rounded-xl p-4 max-w-md w-[90%]">
            <div className="text-amber-400/70 text-xs text-center mb-2">
              第 {trainingStepIndex + 1}/7 步 · 梯度下降
            </div>
            <div className="text-lg font-mono text-white text-center mb-3">
              {currentStep.sentence}
            </div>
            {/* Gradient info */}
            <div className="space-y-1 mb-2 text-center">
              <div className="text-slate-300 text-sm">→ 计算梯度：正确词应更接近上下文</div>
              <div className="flex items-center justify-center gap-1 flex-wrap">
                <span className="text-slate-300 text-sm">→ 更新向量：</span>
                {currentStep.targetWords.map(w => (
                  <span key={w} className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-xs border border-amber-500/30 font-medium">
                    {w}
                  </span>
                ))}
                <span className="text-slate-300 text-sm">被拉近</span>
              </div>
            </div>
            {/* Loss bar */}
            <div className="mt-3 pt-2 border-t border-slate-600/30">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 shrink-0">Loss</span>
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${lossPercent * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-green-400 shrink-0 w-12 text-right">{lossPercent.toFixed(2)} ↓</span>
              </div>
            </div>
          </div>
        )}

        {/* Training complete overlay */}
        {mode === 'training' && trainingStepIndex === 7 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-800/90 backdrop-blur border border-green-500/30 rounded-xl p-4 max-w-md w-[90%] text-center">
            <div className="text-green-400 text-lg font-bold">训练完成!</div>
            <div className="text-slate-400 text-sm mt-1">所有词已收敛到最终位置，即将进入漫游模式...</div>
          </div>
        )}

        <Canvas
          camera={{ position: [0, 2, 25], fov: 50 }}
          onPointerMissed={() => setSelectedWord(null)}
        >
          <color attach="background" args={['#0f172a']} />
          <ambientLight intensity={0.4} />
          <pointLight position={[15, 15, 15]} intensity={0.8} />
          <pointLight position={[-15, -10, -15]} intensity={0.3} />

          <Stars radius={80} depth={60} count={3000} factor={4} saturation={0} fade speed={0.5} />

          <OrbitControls
            autoRotate
            autoRotateSpeed={0.3}
            enablePan
            minDistance={8}
            maxDistance={45}
            enableDamping
            dampingFactor={0.05}
          />

          {/* Cluster clouds — hidden during training, shown on convergence or in other modes */}
          {showClusters && clusterData.map(c => (
            <ClusterCloud key={c.category} center={c.center} radius={c.radius} color={c.color} />
          ))}

          {/* Word points */}
          {Object.entries(wordVectors).map(([word, v]) => {
            const pos = getWordPosition(word);
            const color = categories[v.category].color;
            const isCalcSelected = mode === 'calculate' && [calcA, calcB, calcC].includes(word);
            const isCalcTarget = mode === 'calculate' && nearestToResult?.word === word;
            const isDimmed = mode === 'calculate' && !isCalcSelected && !isCalcTarget;
            const isTrainingHighlight = mode === 'training' && currentHighlightWords.includes(word);
            const isWrongGuess = mode === 'training' && trainingSubPhase === 'predict' && wrongGuess === word;

            return (
              <WordPoint
                key={word}
                word={word}
                position={pos}
                color={color}
                isSelected={selectedWord === word || isCalcSelected}
                isTarget={isCalcTarget}
                isDimmed={isDimmed}
                isTrainingHighlight={isTrainingHighlight}
                isWrongGuess={isWrongGuess}
                onClick={handleWordClick}
                onHover={setHoveredWord}
                onUnhover={() => setHoveredWord(null)}
              />
            );
          })}

          {/* Nearest-neighbor lines (explore mode) */}
          {mode === 'explore' && selectedWord && nearestNeighbors.map((n, i) => {
            const sv = wordVectors[selectedWord];
            const nv = wordVectors[n.word];
            return (
              <group key={n.word}>
                <Line
                  points={[
                    [sv.x * S, sv.y * S, sv.z * S],
                    [nv.x * S, nv.y * S, nv.z * S],
                  ]}
                  color="#67e8f9"
                  lineWidth={Math.max(1, 3 - i * 0.5)}
                  transparent
                  opacity={0.8 - i * 0.12}
                />
                {/* Distance label at midpoint */}
                <Html
                  position={[
                    (sv.x + nv.x) / 2 * S,
                    (sv.y + nv.y) / 2 * S + 0.3,
                    (sv.z + nv.z) / 2 * S,
                  ]}
                  center
                  style={{ pointerEvents: 'none' }}
                >
                  <span className="text-[10px] text-cyan-300/70 font-mono bg-slate-900/60 px-1 rounded">
                    {n.dist.toFixed(1)}
                  </span>
                </Html>
              </group>
            );
          })}

          {/* Calculation arrows */}
          {mode === 'calculate' && resultVector && (
            <CalcArrows calcA={calcA} calcB={calcB} calcC={calcC} resultVector={resultVector} />
          )}

          {/* Training attraction lines — only in update sub-phase (gradient direction) */}
          {mode === 'training' && trainingSubPhase === 'update' && currentHighlightWords.length > 0 && (
            <TrainingAttractionLines words={currentHighlightWords} trainingPositions={trainingPositions} />
          )}

          {/* Wrong guess line — only in predict sub-phase */}
          {mode === 'training' && trainingSubPhase === 'predict' && wrongGuess && currentHighlightWords.length > 0 && (
            <WrongGuessLine wrongGuess={wrongGuess} targetWords={currentHighlightWords} trainingPositions={trainingPositions} />
          )}
        </Canvas>

        {/* Legend overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-800/80 p-3 rounded-lg backdrop-blur text-xs border border-slate-700 z-10">
          <div className="font-bold mb-2 text-slate-400">词性分类</div>
          <div className="space-y-1">
            {Object.entries(categories).map(([key, cat]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                <span className="text-white">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info panel overlay */}
        <div className="absolute bottom-4 right-4 bg-slate-800/90 p-4 rounded-lg backdrop-blur border border-slate-700 font-mono shadow-xl w-[220px] z-10">
          <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Vector Data</div>
          <div className="text-lg font-bold text-white mb-2">
            {displayWord || <span className="text-slate-600 italic">...</span>}
          </div>
          {displayWord && wordVectors[displayWord] ? (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-green-400">
                <span className="text-slate-500">x:</span>
                <span>{wordVectors[displayWord].x.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-green-400">
                <span className="text-slate-500">y:</span>
                <span>{wordVectors[displayWord].y.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-green-400">
                <span className="text-slate-500">z:</span>
                <span>{wordVectors[displayWord].z.toFixed(1)}</span>
              </div>

              {/* Nearest neighbors (explore mode, selected word) */}
              {mode === 'explore' && selectedWord === displayWord && nearestNeighbors.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-700">
                  <div className="text-slate-500 mb-1.5 font-sans font-bold">最近邻</div>
                  {nearestNeighbors.map((n, i) => (
                    <div key={n.word} className="flex justify-between py-0.5">
                      <span className="text-slate-300 font-sans">{i + 1}. {n.word}</span>
                      <span className="text-cyan-400">{n.dist.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-600">
              点击或悬停词点查看向量信息
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Panel (Calculate Mode) */}
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
          <div className="flex justify-center gap-2 flex-wrap">
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

      {/* Bottom Control Panel (Training Mode) */}
      {mode === 'training' && (
        <div className="bg-slate-800 border-t border-slate-700 p-4 z-10">
          {/* Progress bar — 7 segments with half-fill support */}
          <div className="flex items-center gap-1.5 mb-4">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="flex-1 h-2 rounded-full overflow-hidden bg-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    i < trainingStepIndex
                      ? 'bg-amber-500'
                      : i === trainingStepIndex && trainingSubPhase === 'update'
                        ? 'bg-amber-500'
                        : i === trainingStepIndex && trainingSubPhase === 'predict'
                          ? 'bg-amber-400'
                          : ''
                  }`}
                  style={{
                    width: i < trainingStepIndex
                      ? '100%'
                      : i === trainingStepIndex && trainingSubPhase === 'update'
                        ? '100%'
                        : i === trainingStepIndex && trainingSubPhase === 'predict'
                          ? '50%'
                          : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Control buttons */}
          <div className="flex justify-center gap-3">
            <button
              onClick={resetTraining}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
            >
              <RotateCcw size={14} /> 重置
            </button>

            {trainingStepIndex === -1 ? (
              <button
                onClick={startTraining}
                className="flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm text-white font-bold transition-colors shadow-lg shadow-amber-900/30"
              >
                <Zap size={14} /> 开始训练
              </button>
            ) : trainingStepIndex <= 6 ? (
              <>
                <button
                  onClick={() => setIsTrainingPlaying(p => !p)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
                >
                  {isTrainingPlaying ? <><Pause size={14} /> 暂停</> : <><Play size={14} /> 继续</>}
                </button>
                <button
                  onClick={() => { setIsTrainingPlaying(false); advanceTraining(); }}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm text-white transition-colors"
                >
                  <ChevronRight size={14} /> 下一步
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                收敛完成，即将进入漫游模式...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 3D Components
// ============================================================

function WordPoint({ word, position, color, isSelected, isTarget, isDimmed, isTrainingHighlight, isWrongGuess, onClick, onHover, onUnhover }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const [localHover, setLocalHover] = useState(false);
  const initialPos = useRef(position);
  const targetPosRef = useRef(new THREE.Vector3(position[0], position[1], position[2]));

  const highlighted = isSelected || isTarget || localHover || isTrainingHighlight || isWrongGuess;
  const baseRadius = highlighted ? 0.45 : 0.28;

  // Determine material color
  const materialColor = isWrongGuess ? '#ef4444' : isTrainingHighlight ? '#f59e0b' : color;

  // Update target position when prop changes
  targetPosRef.current.set(position[0], position[1], position[2]);

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return;

    // Smooth position lerp (~300ms transition)
    groupRef.current.position.lerp(targetPosRef.current, 1 - Math.exp(-10 * delta));

    // Scale animations
    if (isWrongGuess) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.35);
    } else if (isTarget) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.35);
    } else if (isTrainingHighlight) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.3);
    } else {
      meshRef.current.scale.setScalar(1);
    }
  });

  return (
    <group ref={groupRef} position={initialPos.current}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(word); }}
        onPointerEnter={(e) => { e.stopPropagation(); setLocalHover(true); onHover(word); }}
        onPointerLeave={() => { setLocalHover(false); onUnhover(); }}
      >
        <sphereGeometry args={[baseRadius, 16, 16]} />
        <meshStandardMaterial
          color={materialColor}
          emissive={materialColor}
          emissiveIntensity={highlighted ? 0.9 : 0.35}
          transparent
          opacity={isDimmed ? 0.15 : 1}
        />
      </mesh>
      <Html
        position={[0, baseRadius + 0.35, 0]}
        center
        distanceFactor={18}
        style={{
          color: isWrongGuess ? '#fca5a5' : 'white',
          fontSize: highlighted ? '14px' : '11px',
          fontWeight: highlighted ? 'bold' : 'normal',
          opacity: isDimmed ? 0.15 : 0.9,
          textShadow: '0 0 6px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          transition: 'all 0.2s ease',
        }}
      >
        {word}
      </Html>
    </group>
  );
}

function ClusterCloud({ center, radius, color }) {
  return (
    <mesh position={center}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.07}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function TrainingAttractionLines({ words, trainingPositions }) {
  // Star topology: lines from each word to the centroid
  const centroid = useMemo(() => {
    const cx = words.reduce((s, w) => s + trainingPositions[w].x, 0) / words.length;
    const cy = words.reduce((s, w) => s + trainingPositions[w].y, 0) / words.length;
    const cz = words.reduce((s, w) => s + trainingPositions[w].z, 0) / words.length;
    return [cx * S, cy * S, cz * S];
  }, [words, trainingPositions]);

  return (
    <>
      {words.map(word => {
        const p = trainingPositions[word];
        return (
          <Line
            key={word}
            points={[[p.x * S, p.y * S, p.z * S], centroid]}
            color="#f59e0b"
            lineWidth={1.5}
            dashed
            dashScale={6}
            dashSize={0.3}
            gapSize={0.2}
            transparent
            opacity={0.6}
          />
        );
      })}
    </>
  );
}

function WrongGuessLine({ wrongGuess, targetWords, trainingPositions }) {
  // Red dashed line from wrong guess to target centroid
  const centroid = useMemo(() => {
    const cx = targetWords.reduce((s, w) => s + trainingPositions[w].x, 0) / targetWords.length;
    const cy = targetWords.reduce((s, w) => s + trainingPositions[w].y, 0) / targetWords.length;
    const cz = targetWords.reduce((s, w) => s + trainingPositions[w].z, 0) / targetWords.length;
    return [cx * S, cy * S, cz * S];
  }, [targetWords, trainingPositions]);

  const wrongPos = trainingPositions[wrongGuess];
  if (!wrongPos) return null;

  return (
    <Line
      points={[[wrongPos.x * S, wrongPos.y * S, wrongPos.z * S], centroid]}
      color="#ef4444"
      lineWidth={2}
      dashed
      dashScale={6}
      dashSize={0.3}
      gapSize={0.2}
      transparent
      opacity={0.7}
    />
  );
}

function CalcArrows({ calcA, calcB, calcC, resultVector }) {
  const pulseRef = useRef();
  const vA = wordVectors[calcA];
  const vB = wordVectors[calcB];

  // Intermediate point: A - B (in scene coords)
  const pointA = [vA.x * S, vA.y * S, vA.z * S];
  const pointInter = [(vA.x - vB.x) * S, (vA.y - vB.y) * S, (vA.z - vB.z) * S];
  const pointResult = [resultVector.x * S, resultVector.y * S, resultVector.z * S];

  // Midpoints for labels
  const midSub = [
    (pointA[0] + pointInter[0]) / 2,
    (pointA[1] + pointInter[1]) / 2 + 0.4,
    (pointA[2] + pointInter[2]) / 2,
  ];
  const midAdd = [
    (pointInter[0] + pointResult[0]) / 2,
    (pointInter[1] + pointResult[1]) / 2 + 0.4,
    (pointInter[2] + pointResult[2]) / 2,
  ];

  useFrame((state) => {
    if (pulseRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.4;
      pulseRef.current.scale.setScalar(scale);
    }
  });

  return (
    <>
      {/* Subtraction arrow: A → (A-B) */}
      <Line
        points={[pointA, pointInter]}
        color="#ef4444"
        lineWidth={2}
        dashed
        dashScale={8}
        dashSize={0.4}
        gapSize={0.2}
      />
      <Html position={midSub} center style={{ pointerEvents: 'none' }}>
        <span className="text-xs font-bold text-red-400 bg-slate-900/70 px-1.5 py-0.5 rounded whitespace-nowrap">
          −{calcB}
        </span>
      </Html>

      {/* Addition arrow: (A-B) → Result */}
      <Line
        points={[pointInter, pointResult]}
        color="#a855f7"
        lineWidth={3}
      />
      <Html position={midAdd} center style={{ pointerEvents: 'none' }}>
        <span className="text-xs font-bold text-purple-400 bg-slate-900/70 px-1.5 py-0.5 rounded whitespace-nowrap">
          +{calcC}
        </span>
      </Html>

      {/* Pulsing result indicator */}
      <mesh ref={pulseRef} position={pointResult}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.35} />
      </mesh>
    </>
  );
}

// ============================================================
// HTML Helper Components
// ============================================================

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

      {/* Vector Math — 3D coordinates */}
      <div className="font-mono text-[10px] md:text-xs text-slate-500 bg-white/50 p-2 rounded border border-purple-100/50 overflow-x-auto whitespace-nowrap flex items-center gap-1">
        <span className="opacity-70">[{va.x}, {va.y}, {va.z}]</span>
        <span>{sign1}</span>
        <span className="opacity-70">[{vb.x}, {vb.y}, {vb.z}]</span>
        <span>{sign2}</span>
        <span className="opacity-70">[{vc.x}, {vc.y}, {vc.z}]</span>
        <span>=</span>
        <span className="text-purple-700 font-bold">[{vr.x}, {vr.y}, {vr.z}]</span>
      </div>
    </div>
  );
}
