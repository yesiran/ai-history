import React, { useState, useEffect, useRef } from 'react';
import { Database, Rocket, Cpu, Play, User, Zap, RotateCcw, AlertTriangle, Trophy } from 'lucide-react';
import { rlExplanation } from '../utils/rl_data';
import { motion, AnimatePresence } from 'framer-motion';

// Board setup: 0 = empty, 1 = wall, 2 = start, 3 = end
const mapLayout = [
  // 0  1  2  3  4  5  6  7  8  9
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0], // Row 0
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 1 (Super Wide Gap for Safety)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 2 (Gap)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 3 (ASI Shortcut)
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0], // Row 4
  [0, 2, 0, 0, 1, 0, 0, 0, 3, 0], // Row 5: Start -> Wall -> End
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0], // Row 6
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0], // Row 7
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 8 (Human Path)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 9
];

const startPos = { r: 5, c: 1 };
const endPos = { r: 5, c: 8 };

// Hardcoded shortcut path for Episode 3 (ASI)
// Goes UP from (5,1) -> (4,1) -> (3,1), then RIGHT to (3,8), then DOWN to (5,8)
const path3 = [
    {r:5,c:1}, {r:4,c:1}, {r:3,c:1}, 
    {r:3,c:2}, {r:3,c:3}, {r:3,c:4}, {r:3,c:5}, {r:3,c:6}, {r:3,c:7}, {r:3,c:8},
    {r:4,c:8}, {r:5,c:8}
];

const RL = () => {
  const [mode, setMode] = useState('human'); 
  const [status, setStatus] = useState('idle'); 
  const [agentPos, setAgentPos] = useState({ ...startPos }); 
  const [currentScore, setCurrentScore] = useState(0); 
  const [episode, setEpisode] = useState(0); 
  const [floatingText, setFloatingText] = useState(null); 
  const [agentState, setAgentState] = useState('normal'); 
  const isPlayingRef = useRef(false);

  const showFloat = (text, color = 'red') => {
    const id = Date.now();
    setFloatingText({ text, color, id });
    setTimeout(() => setFloatingText(null), 800);
  };

  const resetSim = () => {
    isPlayingRef.current = false;
    setStatus('idle');
    setAgentPos({ ...startPos });
    setCurrentScore(0);
    setEpisode(0);
    setAgentState('normal');
    setFloatingText(null);
  };

  useEffect(() => { resetSim(); }, [mode]);

  const moveStep = (pos) => {
    return new Promise((resolve) => {
        if (!isPlayingRef.current) {
            resolve('stop');
            return;
        }

        setAgentPos(pos);
        
        const cellType = mapLayout[pos.r][pos.c];
        
        // 1. Crash
        if (cellType === 1) {
            setAgentState('hit');
            showFloat(`Crash! (${pos.r},${pos.c})`, 'red');
            setCurrentScore(s => s - 10);
            setTimeout(() => resolve('crash'), 800);
            return;
        }

        // 2. Win
        if (cellType === 3) {
            setAgentState('win');
            showFloat('+100', 'green');
            setCurrentScore(s => s + 100);
            setTimeout(() => resolve('win'), 800);
            return;
        }

        // 3. Normal Step
        if (mode === 'rl') setCurrentScore(s => s - 1);
        setTimeout(() => resolve('next'), 150);
    });
  };

  const runPath = async (path) => {
    for (let i = 0; i < path.length; i++) {
        const result = await moveStep(path[i]);
        if (result !== 'next') return result; 
    }
    return 'finished';
  };

  const startHumanDemo = async () => {
    if (status === 'running') return;
    isPlayingRef.current = true;
    setStatus('running');
    setAgentPos({ ...startPos });
    
    // Human path via bottom
    const path = [
        {r:5,c:1}, {r:6,c:1}, {r:7,c:1}, {r:8,c:1}, 
        {r:8,c:2}, {r:8,c:3}, {r:8,c:4}, {r:8,c:5}, {r:8,c:6}, {r:8,c:7}, {r:8,c:8}, 
        {r:7,c:8}, {r:6,c:8}, {r:5,c:8} 
    ];
    
    await runPath(path);
    if (isPlayingRef.current) setStatus('completed');
  };

  const startRLDemo = async () => {
    if (status === 'running') return;
    isPlayingRef.current = true;
    setStatus('running');

    // --- Episode 1: Crash ---
    setEpisode(1);
    setAgentPos({ ...startPos });
    setAgentState('normal');
    setCurrentScore(0);
    await new Promise(r => setTimeout(r, 500));
    
    const path1 = [{r:5,c:1}, {r:5,c:2}, {r:5,c:3}, {r:5,c:4}]; // Hit Wall at (5,4)
    await runPath(path1);
    
    if (!isPlayingRef.current) return;

    // --- Episode 2: Safe but Slow ---
    setEpisode(2);
    setAgentPos({ ...startPos });
    setAgentState('normal');
    setCurrentScore(0);
    await new Promise(r => setTimeout(r, 1000));

    const path2 = [
        {r:5,c:1}, {r:6,c:1}, {r:7,c:1}, {r:8,c:1}, 
        {r:8,c:2}, {r:8,c:3}, {r:8,c:4}, {r:8,c:5}, {r:8,c:6}, {r:8,c:7}, {r:8,c:8},
        {r:7,c:8}, {r:6,c:8}, {r:5,c:8}
    ];
    await runPath(path2);

    if (!isPlayingRef.current) return;

    // --- Episode 3: Optimal (ASI) ---
    console.log('Starting Episode 3...');
    setEpisode(3);
    setAgentPos({ ...startPos });
    setAgentState('normal');
    setCurrentScore(0);
    await new Promise(r => setTimeout(r, 1000));

    // Path 3 is now defined globally
    console.log('Running Path 3:', path3);
    const res3 = await runPath(path3);
    console.log('Episode 3 Result:', res3);

    if (isPlayingRef.current && res3 === 'win') {
        setStatus('completed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col font-sans text-slate-800">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-indigo-900 mb-2">强化学习 (Reinforcement Learning)</h1>
        <p className="text-xl text-slate-600">从“模仿者”到“探索者”：通过反馈与惩罚自我进化</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <div className="space-y-6 overflow-y-auto pr-4 h-[calc(100vh-200px)]">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-semibold mb-6 flex items-center text-indigo-700">
              <Rocket className="w-6 h-6 mr-2" />
              为什么我们需要强化学习？
            </h2>
            <div className="space-y-6">
              {rlExplanation.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors">
                  <h3 className="text-lg font-bold mb-2 flex items-center text-slate-800">
                    {idx === 0 && <Database className="w-5 h-5 mr-2 text-slate-500" />}
                    {idx === 1 && <Rocket className="w-5 h-5 mr-2 text-orange-500" />}
                    {idx === 2 && <Cpu className="w-5 h-5 mr-2 text-purple-500" />}
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

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 flex flex-col h-[calc(100vh-200px)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-700">学习范式对比</h2>
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setMode('human')}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'human' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <User className="w-4 h-4 mr-2" />
                    模仿学习
                </button>
                <button 
                    onClick={() => setMode('rl')}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'rl' ? 'bg-white shadow text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Zap className="w-4 h-4 mr-2" />
                    强化学习
                </button>
            </div>
          </div>

          <div className="flex-1 bg-slate-50 rounded-xl p-6 relative flex flex-col items-center justify-center">
             
             <div className="mb-4 flex space-x-12 text-sm font-bold w-full max-w-sm justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                 {mode === 'rl' ? (
                     <>
                        <div className="flex flex-col items-center">
                            <span className="text-slate-400 uppercase text-xs">Episode</span>
                            <span className="text-lg text-purple-600">
                                {episode === 0 ? '-' : episode} 
                                {episode === 1 && <span className="text-xs text-red-400 ml-1">(Fail)</span>}
                                {episode === 2 && <span className="text-xs text-slate-400 ml-1">(Safe)</span>}
                                {episode === 3 && <span className="text-xs text-green-500 ml-1">(Optimal)</span>}
                            </span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-slate-400 uppercase text-xs">Total Reward</span>
                            <motion.span 
                                key={currentScore}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className={`text-lg ${currentScore < 0 ? 'text-red-500' : 'text-green-600'}`}
                            >
                                {currentScore}
                            </motion.span>
                        </div>
                     </>
                 ) : (
                     <div className="w-full text-center text-slate-500">
                         模仿模式：无 Reward 反馈
                     </div>
                 )}
             </div>

             <div className="relative p-2 bg-slate-200 rounded-lg shadow-inner select-none">
                <div className="grid grid-cols-10 gap-1">
                    {mapLayout.map((row, rIdx) => (
                        row.map((cell, cIdx) => (
                            <div 
                                key={`${rIdx}-${cIdx}`}
                                className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs relative transition-colors duration-300
                                    ${cell === 1 ? 'bg-slate-700' : 'bg-white'}
                                    ${cell === 2 ? 'bg-green-100 ring-2 ring-green-500 z-10' : ''}
                                    ${cell === 3 ? 'bg-red-100 ring-2 ring-red-500 z-10' : ''}
                                `}
                            >
                                {cell === 1 && mode === 'rl' && <span className="text-[8px] text-red-300 opacity-50">-10</span>}
                                {cell === 3 && mode === 'rl' && <span className="text-[8px] text-green-600 font-bold opacity-50">+100</span>}
                                {cell === 2 && "S"}
                            </div>
                        ))
                    ))}
                </div>

                <motion.div
                    className={`absolute rounded-full shadow-lg border-2 border-white z-20 flex items-center justify-center transition-colors duration-300
                        ${agentState === 'hit' ? 'bg-red-500' : (agentState === 'win' ? 'bg-yellow-400' : (mode === 'human' ? 'bg-indigo-500' : 'bg-purple-600'))}
                    `}
                    animate={{
                        top: agentPos.r * 36 + 8 + 'px', 
                        left: agentPos.c * 36 + 8 + 'px',
                        scale: agentState === 'hit' ? [1, 1.2, 0.8, 1] : 1, 
                        rotate: agentState === 'hit' ? [0, -20, 20, 0] : 0
                    }}
                    transition={{ 
                        default: { type: "spring", stiffness: 300, damping: 20 },
                        scale: { type: "spring", duration: 0.5 }, // Framer Motion 10+ handles keyframes better, but safe to use duration
                        // To fix the error, we specifically set type: "tween" for the properties using arrays > 2 items
                        scale: { type: "tween", duration: 0.5 },
                        rotate: { type: "tween", duration: 0.5 }
                    }}
                    style={{ width: '32px', height: '32px' }}
                >
                    {agentState === 'hit' && <AlertTriangle className="w-4 h-4 text-white" />}
                    {agentState === 'win' && <Trophy className="w-4 h-4 text-white" />}
                    {agentState === 'normal' && (mode === 'human' ? <User className="w-4 h-4 text-white" /> : <Zap className="w-4 h-4 text-white" />)}

                    <AnimatePresence>
                        {floatingText && (
                            <motion.div
                                key={floatingText.id} 
                                initial={{ opacity: 0, y: 0 }}
                                animate={{ opacity: 1, y: -30 }}
                                exit={{ opacity: 0 }}
                                className={`absolute whitespace-nowrap text-xs font-bold px-2 py-1 rounded bg-white shadow-md border z-50
                                    ${floatingText.color === 'red' ? 'text-red-600 border-red-200' : 'text-green-600 border-green-200'}
                                `}
                            >
                                {floatingText.text}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
             </div>

             <div className="h-10 mt-4 w-full flex justify-center text-center">
                 <AnimatePresence mode='wait'>
                    {mode === 'rl' && episode === 1 && status === 'running' && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-sm text-red-500">
                             Episode 1: 随机探索 → 失败 (Crash)
                        </motion.div>
                    )}
                    {mode === 'rl' && episode === 2 && status === 'running' && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-sm text-slate-500">
                             Episode 2: 发现可行路径 (但是太慢了...)
                        </motion.div>
                    )}
                    {mode === 'rl' && episode === 3 && status === 'running' && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-sm text-purple-600 font-bold">
                             Episode 3: 优化策略 → 发现隐藏捷径 (ASI)
                        </motion.div>
                    )}
                    {status === 'completed' && mode === 'rl' && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-sm text-green-600 font-bold">
                             训练结束：找到最优解 (Reward Max)
                        </motion.div>
                    )}
                 </AnimatePresence>
             </div>
          </div>

          <div className="mt-6 flex justify-center space-x-4">
             <button 
                onClick={resetSim}
                className="p-3 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                title="重置"
            >
                <RotateCcw className="w-5 h-5" />
            </button>
            <button 
                onClick={mode === 'human' ? startHumanDemo : startRLDemo}
                disabled={status === 'running'}
                className={`flex items-center px-8 py-3 rounded-full text-white font-bold shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                    ${mode === 'human' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-purple-600 hover:bg-purple-700'}
                `}
            >
                <Play className="w-5 h-5 mr-2 fill-current" />
                {status === 'running' ? '演示进行中...' : (mode === 'human' ? '开始演示' : '开始训练')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RL;
