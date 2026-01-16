import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, BrainCircuit, ArrowRightLeft, Play, RotateCcw, ChevronRight } from 'lucide-react';
import { rnnScenarios, explanationData } from '../utils/rnn_data';

const RNN = () => {
  const [activeScenarioId, setActiveScenarioId] = useState(1);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const currentScenario = rnnScenarios.find(s => s.id === activeScenarioId);
  const timerRef = useRef(null);

  // 颜色映射函数：分数 -> 颜色
  const getBallColor = (stepData) => {
    if (!stepData) return '#e2e8f0'; // 默认灰色

    // 如果有特殊记忆（生成模式），使用特殊的蓝色系
    if (stepData.memory) {
      return '#3b82f6'; // blue-500
    }

    const score = stepData.score;
    if (score === 0) return '#9ca3af'; // gray-400
    if (score > 0) {
      return score > 5 ? '#16a34a' : '#4ade80'; // green-600 : green-400
    } else {
      return score < -5 ? '#dc2626' : '#f87171'; // red-600 : red-400
    }
  };

  const getEmoji = (score) => {
    if (score === 0) return '😐';
    if (score > 5) return '🤩';
    if (score > 0) return '🙂';
    if (score < -5) return '😡';
    if (score < 0) return '😟';
  };

  const handleNextStep = () => {
    setCurrentStepIndex(prev => {
      if (prev < currentScenario.steps.length - 1) {
        return prev + 1;
      } else {
        setIsPlaying(false);
        return prev;
      }
    });
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(-1);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if (currentStepIndex >= currentScenario.steps.length - 1) {
        setCurrentStepIndex(-1);
      }
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < currentScenario.steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            clearInterval(timerRef.current);
            return prev;
          }
        });
      }, 1500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentScenario]);

  const currentStepData = currentStepIndex >= 0 ? currentScenario.steps[currentStepIndex] : null;
  const currentEmoji = currentStepData ? getEmoji(currentStepData.score) : '🤖';

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col font-sans text-slate-800">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-indigo-900 mb-2">RNN (循环神经网络)</h1>
        <p className="text-xl text-slate-600">自带“日记本”的阅读者，解决序列与记忆问题</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* 左侧：原理讲解 */}
        <div className="space-y-6 overflow-y-auto pr-4 h-[calc(100vh-200px)]">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-semibold mb-6 flex items-center text-indigo-700">
              <BookOpen className="w-6 h-6 mr-2" />
              RNN 是如何工作的？
            </h2>
            
            <div className="space-y-6">
              {explanationData.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors">
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
            
            <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800">
              <strong>💡 核心区别：</strong> 传统的模型（如 N-Gram）每读一个词都是“重新开始”，而 RNN 每一步的输出都包含了**上一步的记忆**。
            </div>
          </div>
        </div>

        {/* 右侧：交互演示 */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 flex flex-col h-[calc(100vh-200px)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-700">RNN 思维可视化演示</h2>
            <div className="flex space-x-2">
              {rnnScenarios.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setActiveScenarioId(s.id); handleReset(); }}
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

          <div className="flex-1 bg-slate-50 rounded-xl p-8 relative overflow-hidden flex flex-col items-center justify-center">
            
            {/* 顶部状态条 */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-sm text-slate-500">
               <span>Input: Word Sequence</span>
               <span>Output: {currentScenario.type === 'generation' ? 'Prediction' : 'Sentiment'}</span>
            </div>

            {/* 中央 RNN 单元动画 */}
            <div className="relative flex flex-col items-center z-10 w-full max-w-lg">
                
                {/* 气泡 (输出/理解) */}
                <AnimatePresence mode='wait'>
                    <motion.div 
                        key={currentStepIndex}
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="mb-8 bg-white px-6 py-4 rounded-2xl shadow-lg border border-slate-200 text-center min-h-[100px] flex flex-col items-center justify-center w-full max-w-sm"
                    >
                        {currentStepIndex === -1 ? (
                            <span className="text-slate-400">点击播放开始分析...</span>
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

                {/* RNN 核心球体 */}
                <div className="relative mb-8">
                    <motion.div
                        animate={{
                            backgroundColor: getBallColor(currentStepData),
                            scale: [1, 1.05, 1],
                            boxShadow: currentStepData?.memory ? "0 0 20px rgba(59, 130, 246, 0.5)" : "0 0 0 rgba(0,0,0,0)"
                        }}
                        transition={{ duration: 0.5 }}
                        className={`w-32 h-32 rounded-full shadow-xl flex items-center justify-center border-4 border-white relative z-20 transition-colors duration-500`}
                    >
                        <span className="text-white font-bold text-xl">RNN</span>
                    </motion.div>

                    {/* 记忆保持指示器 (小徽章) */}
                    <AnimatePresence>
                        {currentStepData?.memory && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0, x: -20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0 }}
                                className="absolute -right-24 top-0 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg border border-blue-200 text-xs font-bold shadow-sm z-30 flex items-center"
                            >
                                <BrainCircuit className="w-3 h-3 mr-1" />
                                Memory: {currentStepData.memory}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 循环连接箭头 (Memory Loop) */}
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
                                 stroke: currentStepData?.memory ? "#3b82f6" : "#a5b4fc"
                             }}
                             transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <path d="M 78 85 L 80 90 L 85 87" fill="none" stroke="currentColor" strokeWidth="4" className={currentStepData?.memory ? "text-blue-500" : "text-indigo-300"} />
                        <text x="85" y="50" className={`text-[10px] font-bold ${currentStepData?.memory ? "fill-blue-500" : "fill-indigo-400"}`}>Memory</text>
                    </svg>
                </div>

                {/* 当前输入的单词 */}
                <div className="h-16 flex items-center justify-center flex-wrap px-4 gap-1 w-full overflow-hidden">
                    {currentScenario.sentence.map((word, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0.3, scale: 0.8 }}
                            animate={{ 
                                opacity: idx === currentStepIndex ? 1 : (idx < currentStepIndex ? 0.4 : 0.2),
                                scale: idx === currentStepIndex ? 1.3 : 1,
                                y: idx === currentStepIndex ? -5 : 0,
                                color: idx === currentStepIndex ? '#4f46e5' : '#64748b',
                                fontWeight: idx === currentStepIndex ? 800 : 400
                            }}
                            className="text-lg transition-all duration-300 min-w-[20px] text-center"
                        >
                            {word}
                        </motion.div>
                    ))}
                </div>
            </div>

          </div>

          {/* 控制栏 */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="text-sm text-slate-500">
                进度: {currentStepIndex + 1} / {currentScenario.sentence.length}
            </div>
            <div className="flex space-x-4">
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
                    {isPlaying ? '暂停' : (currentStepIndex === -1 ? '开始演示' : '继续')}
                    {!isPlaying && <Play className="w-4 h-4 ml-2 fill-current" />}
                </button>
                <button 
                    onClick={handleNextStep}
                    disabled={isPlaying || currentStepIndex >= currentScenario.steps.length - 1}
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

export default RNN;