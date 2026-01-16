import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Info, Play, Search, MessageSquare, AlertTriangle, Eye, ArrowRight } from 'lucide-react';
import { trainNGram, predictNext, defaultCorpus } from '../utils/ngram';

export default function NGram() {
  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-slate-50">
      {/* Left Panel: Theory (Visualized) */}
      <div className="w-full md:w-1/2 h-full overflow-y-auto border-r border-slate-200 bg-white p-6 md:p-10">
        <Link to="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-6 transition-colors text-sm font-medium">
          <ChevronLeft size={16} className="mr-1" /> 返回首页
        </Link>
        
        <div className="max-w-2xl mx-auto space-y-12 pb-20">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Info size={24} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 m-0">N-gram 语言模型</h1>
            </div>
            <p className="text-lg text-slate-500">统计与概率的暴力美学</p>
          </div>

          {/* Section 1: The Hook (Mobile Keyboard) */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-sm text-slate-600">1</span>
              直观理解：手机打字
            </h2>
            <p className="text-slate-600">
              当你输入“我们”时，机器为什么知道你想说“的”？它不懂中文，它只是在做<strong>概率统计</strong>。
            </p>
            
            {/* Visual: Mobile UI Mockup */}
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 max-w-sm mx-auto shadow-inner">
              <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm mb-4 inline-block relative">
                 <p className="text-slate-800 m-0">今天下午我们<span className="animate-pulse">|</span></p>
                 <div className="absolute -top-2 left-0 w-2 h-2 bg-white transform rotate-45"></div>
              </div>
              
              {/* Keyboard Suggestions */}
              <div className="bg-slate-200 p-2 rounded flex gap-2 overflow-hidden">
                <div className="flex-1 bg-white p-2 rounded shadow-sm text-center text-slate-800 font-medium cursor-pointer hover:bg-slate-50">一起</div>
                <div className="flex-1 bg-white p-2 rounded shadow-sm text-center text-slate-800 font-medium cursor-pointer hover:bg-slate-50 border-b-2 border-blue-500">去</div>
                <div className="flex-1 bg-white p-2 rounded shadow-sm text-center text-slate-800 font-medium cursor-pointer hover:bg-slate-50">都在</div>
              </div>
              <p className="text-center text-xs text-slate-400 mt-2">基于历史聊天记录统计出的高频词</p>
            </div>
          </section>

          {/* Section 2: Search Engine */}
          <section className="space-y-4">
             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-sm text-slate-600">2</span>
              搜索引擎的“读心术”
            </h2>
             <p className="text-slate-600">
               搜索引擎并不理解你的意图，它只是发现海量用户在搜了“历史发”之后，紧接着搜“发展”的人最多。
             </p>

             {/* Visual: Search Bar Mockup */}
             <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-0 overflow-hidden max-w-md mx-auto">
               <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                 <Search size={20} className="text-slate-400" />
                 <span className="text-slate-800 text-lg">人工智能的历史发</span>
               </div>
               <div className="bg-slate-50">
                 <div className="p-3 px-12 hover:bg-blue-50 cursor-pointer flex justify-between group">
                    <span className="text-slate-700">人工智能的历史发<strong>展</strong></span>
                    <span className="text-xs text-slate-400 group-hover:text-blue-500">85% 热度</span>
                 </div>
                 <div className="p-3 px-12 hover:bg-blue-50 cursor-pointer flex justify-between group">
                    <span className="text-slate-700">人工智能的历史发<strong>展历程</strong></span>
                    <span className="text-xs text-slate-400 group-hover:text-blue-500">10% 热度</span>
                 </div>
               </div>
             </div>
          </section>

          {/* Section 3: The Concept of N */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-sm text-slate-600">3</span>
              核心参数：N (窗口大小)
            </h2>
            
            <div className="grid gap-4">
               {/* N=1 */}
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-sm font-bold font-mono">Unigram (N=1)</span>
                    <span className="text-sm text-slate-500">也是“盲猜”</span>
                 </div>
                 <div className="flex items-center gap-2 text-lg font-mono">
                    <div className="opacity-30">[ 我 ] [ 喜 ] [ 欢 ]</div>
                    <ArrowRight size={16} className="text-slate-400"/>
                    <div className="bg-blue-100 border border-blue-300 text-blue-800 px-2 rounded">?</div>
                 </div>
                 <p className="text-xs text-slate-500 mt-2">完全不看前面，只猜字典里最常用的字（永远猜“的”）。</p>
               </div>

               {/* N=2 */}
               <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 ring-2 ring-blue-100">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-sm font-bold font-mono">Bigram (N=2)</span>
                    <span className="text-sm text-slate-500">只看前 1 个字</span>
                 </div>
                 <div className="flex items-center gap-2 text-lg font-mono">
                    <div className="opacity-30">[ 我 ]</div>
                    <div className="bg-white border-2 border-blue-500 text-slate-800 px-2 rounded shadow-sm relative">
                      [ 喜 ]
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] px-1 rounded">Context</div>
                    </div>
                    <div className="bg-white border-2 border-dashed border-blue-300 text-slate-400 px-2 rounded">[ 欢 ]</div>
                    <ArrowRight size={16} className="text-blue-400"/>
                    <div className="bg-blue-100 border border-blue-300 text-blue-800 px-2 rounded">?</div>
                 </div>
                 <p className="text-xs text-slate-500 mt-2">看到“欢”，猜“迎”或“喜”。容易猜错，因为没看到“我”。</p>
               </div>

                {/* N=3 */}
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-sm font-bold font-mono">Trigram (N=3)</span>
                    <span className="text-sm text-slate-500">看前 2 个字</span>
                 </div>
                 <div className="flex items-center gap-2 text-lg font-mono">
                    <div className="opacity-30">[ 我 ]</div>
                    <div className="bg-white border-2 border-slate-400 text-slate-800 px-2 rounded shadow-sm relative">
                      [ 喜 ] [ 欢 ]
                       <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-500 text-white text-[10px] px-1 rounded">Context</div>
                    </div>
                    <ArrowRight size={16} className="text-slate-400"/>
                    <div className="bg-blue-100 border border-blue-300 text-blue-800 px-2 rounded">吃</div>
                 </div>
                 <p className="text-xs text-slate-500 mt-2">看到“喜欢”，猜“吃”或“你”的概率就准多了。</p>
               </div>
            </div>
          </section>

          {/* Section 4: Limitations */}
          <section className="bg-amber-50 border border-amber-100 rounded-xl p-6">
             <div className="flex items-start gap-3">
               <AlertTriangle className="text-amber-500 mt-1 shrink-0" />
               <div>
                 <h3 className="text-lg font-bold text-amber-900 mb-1">N-gram 的局限：目光短浅</h3>
                 <p className="text-amber-800 text-sm mb-3">
                   它记不住长距离的语义。
                 </p>
                 <div className="bg-white/60 p-3 rounded border border-amber-100 text-sm text-slate-600 italic">
                   “小明发誓，为了公司的长远发展，为了年终奖，他一定要好好___？”
                 </div>
                 <p className="text-amber-800 text-xs mt-2">
                   如果是 N=2，机器只看到“好好”，可能会猜“睡觉”。<br/>
                   只有拥有<strong>“长记忆”</strong>的模型（如 RNN），才能记住前面的“工作/公司”，从而猜出“工作”。
                 </p>
               </div>
             </div>
          </section>

        </div>
      </div>

      {/* Right Panel: Interactive Demo */}
      <div className="w-full md:w-1/2 h-full bg-slate-50 p-6 md:p-8 flex flex-col overflow-y-auto border-l border-slate-200 shadow-xl z-10">
        <DemoPanel />
      </div>
    </div>
  );
}

function DemoPanel() {
  const [nValue, setNValue] = useState(2);
  const [inputText, setInputText] = useState("");
  
  // 实时训练模型 (数据量小，直接计算)
  const model = trainNGram(defaultCorpus, nValue);
  const predictions = predictNext(model, inputText, nValue);
  
  // 获取当前生效的上下文
  const contextLength = nValue - 1;
  const currentContext = nValue === 1 ? "(无 - 全局统计)" : (inputText.length >= contextLength ? inputText.slice(-contextLength) : "...");

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
      {/* 1. Control Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-blue-600">
             <Play size={24} />
             <h2 className="text-xl font-bold m-0">交互演示</h2>
          </div>
          <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">Live Model</span>
        </div>

        <div className="flex flex-col gap-2">
           <label className="text-sm font-semibold text-slate-700">选择 N 值 (窗口大小):</label>
           <div className="flex gap-2">
             {[1, 2, 3].map(n => (
               <button
                 key={n}
                 onClick={() => setNValue(n)}
                 className={`flex-1 py-2 px-4 rounded-lg border text-sm font-bold transition-all ${
                   nValue === n 
                     ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                     : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                 }`}
               >
                 N = {n} ({n === 1 ? 'Unigram' : n === 2 ? 'Bigram' : 'Trigram'})
               </button>
             ))}
           </div>
           <p className="text-xs text-slate-500 mt-1">
             {nValue === 1 && "只看全局频率，不考虑上下文。"}
             {nValue === 2 && "看前 1 个字，猜下一个。"}
             {nValue === 3 && "看前 2 个字，猜下一个。"}
           </p>
        </div>
      </div>

      {/* 2. Input Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10">
            <MessageSquare size={100} />
         </div>
         <label className="text-sm font-semibold text-slate-700 mb-2 block">试着输入一些字 (基于语料库):</label>
         <input
           type="text"
           value={inputText}
           onChange={(e) => setInputText(e.target.value)}
           placeholder="例如：人工智能..."
           className="w-full text-lg p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50/50 relative z-10"
         />
         <div className="mt-3 text-sm text-slate-500 flex items-center gap-2 relative z-10">
           <Eye size={16} />
           机器看到的 Context: 
           <span className="font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold border border-amber-200">
             {currentContext}
           </span>
         </div>
      </div>

      {/* 3. Predictions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-grow min-h-[200px]">
         <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center justify-between">
            <span>预测概率 (Next Token Probability)</span>
            {predictions.length > 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Match Found</span>}
         </h3>
         
         {predictions.length > 0 ? (
           <div className="space-y-3">
             {predictions.map((p, idx) => (
               <div key={p.char} className="flex items-center gap-3 group">
                 <div className="w-8 h-8 flex items-center justify-center bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors rounded-lg font-bold text-slate-700 border border-slate-200">
                   {p.char}
                 </div>
                 <div className="flex-1 h-8 bg-slate-50 rounded-full overflow-hidden relative border border-slate-100">
                   <div 
                     className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out flex items-center justify-end px-3 text-white text-xs font-bold shadow-sm"
                     style={{ width: `${Math.max(p.prob * 100, 15)}%` }} // Minimum width for text visibility
                   >
                     {(p.prob * 100).toFixed(1)}%
                   </div>
                 </div>
               </div>
             ))}
           </div>
         ) : (
           <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm py-10">
             <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                <Search size={20} className="text-slate-300" />
             </div>
             <p>{inputText.length < contextLength ? "输入长度不足以构成上下文" : "没有在语料库中找到匹配的上下文"}</p>
           </div>
         )}
      </div>

      {/* 4. Corpus Viewer (Optional) */}
      <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
        <div className="flex items-center justify-between mb-2 cursor-pointer group">
          <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
             Training Data (Corpus)
          </span>
          <Info size={14} className="text-slate-400 group-hover:text-slate-600" />
        </div>
        <div className="text-xs text-slate-500 font-mono space-y-1 h-24 overflow-y-auto bg-white/50 p-2 rounded border border-slate-200/50">
          {defaultCorpus.map((s, i) => (
            <div key={i} className="hover:text-blue-600 transition-colors">"{s}"</div>
          ))}
        </div>
      </div>
    </div>
  );
}
