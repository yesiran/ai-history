// 预设的演示场景数据
// 模拟 RNN 在处理不同句子时的内部状态（简化为情感值和解释）

export const rnnScenarios = [
  {
    id: 1,
    title: "情感反转",
    type: "sentiment",
    description: "观察否定词如何改变整个句子的情感走向",
    sentence: ["这", "部", "电", "影", "不", "是", "一", "般", "的", "好", "看"],
    steps: [
      { word: "这", score: 0, reason: "句子刚开始，还没有情感信号",
        stateDesc: "空白状态，等待输入" },
      { word: "部", score: 0, reason: "量词'部'，后面可能跟电影、小说...",
        stateDesc: "识别到量词，猜测在评价某个作品" },
      { word: "电", score: 0, reason: "开始识别名词'电影'",
        stateDesc: "逐步拼出'电影'这个词" },
      { word: "影", score: 0, reason: "确认主题是'电影'，现在等评价词出现",
        stateDesc: "主题锁定：正在评价一部电影" },
      { word: "不", score: -5, reason: "出现'不'！情感信号急转——很可能是负面评价",
        stateDesc: "否定信号写入！情感维度从中性急转为负面" },
      { word: "是", score: -5, reason: "'不是'——否定句式正在形成",
        stateDesc: "否定语境'不是...'持续，等待后续内容" },
      { word: "一", score: -4, reason: "继续读取，否定语境仍然笼罩着记忆",
        stateDesc: "否定影响持续，但强度微微减弱" },
      { word: "般", score: -2, reason: "'一般'——等等，'不是一般的'是贬义还是在强调？",
        stateDesc: "出现歧义！'不是一般的'可以是贬义也可以是强调" },
      { word: "的", score: -1, reason: "关键时刻——下一个词将决定整句的情感走向",
        stateDesc: "语义悬而未决，记忆中否定和评价信号并存" },
      { word: "好", score: 5, reason: "'好'出现！'不是一般的好' = 非常好——双重否定变成了强烈肯定",
        stateDesc: "情感维度大反转！从负面急转为强烈正面" },
      { word: "看", score: 8, reason: "'好看'确认。RNN 结合全句记忆得出：这是极高的正面评价",
        stateDesc: "最终理解：强烈的正面评价（否定+一般+好 = 极好）" },
    ],
  },
  {
    id: 2,
    title: "长距离记忆与生成",
    type: "generation",
    description: "演示 RNN 如何记住早期的关键信息并用于后续生成",
    sentence: ["我", "在", "法", "国", "长", "大", "，", "（", "…", "）", "所", "以", "我", "会", "说", "一", "口", "流", "利", "的"],
    steps: [
      { word: "我", score: 0, reason: "主语'我'，开始积累上下文",
        stateDesc: "记录主语信息" },
      { word: "在", score: 0, reason: "介词'在'，后面应该是一个地点",
        stateDesc: "检测到地点相关的语法结构" },
      { word: "法", score: 0, memory: "法国", reason: "关键信息！读到'法'，可能是法国、法律...",
        stateDesc: "关键地点开始写入记忆：法..." },
      { word: "国", score: 0, memory: "法国", reason: "'法国'确认——这个关键信息被压缩进隐藏状态",
        stateDesc: "'法国'完整写入记忆。这是后面要用到的关键。" },
      { word: "长", score: 0, memory: "法国", reason: "'长大'——描述在法国的经历",
        stateDesc: "积累经历信息，'法国'持续保持在记忆中" },
      { word: "大", score: 0, memory: "法国", reason: "记忆状态：在法国长大",
        stateDesc: "记忆 = 在法国 + 长大" },
      { word: "，", score: 0, memory: "法国", reason: "句子第一段结束。'法国'这个记忆能撑到最后吗？",
        stateDesc: "分句结束。记忆面临考验：后面还有很长..." },
      { word: "（", score: 0, memory: "法国", reason: "括号——中间可能有大量无关内容",
        stateDesc: "新信息涌入，'法国'记忆开始受到挤压" },
      { word: "…", score: 0, memory: "法国", reason: "省略号代表中间有一百句废话...",
        stateDesc: "大量无关信息冲刷记忆，'法国'在衰减但仍保持" },
      { word: "）", score: 0, memory: "法国", reason: "无关内容结束。'法国'的记忆还残留着",
        stateDesc: "记忆中的'法国'变微弱了，但还没完全消失" },
      { word: "所", score: 0, memory: "法国", reason: "'所以'——因果关系出现，模型需要回忆前面说了什么",
        stateDesc: "因果连接词触发！模型尝试从记忆中提取前文信息" },
      { word: "以", score: 0, memory: "法国", reason: "'所以'完成，准备推导结论",
        stateDesc: "准备输出结论，记忆中的'法国'被唤醒" },
      { word: "我", score: 0, memory: "法国", reason: "主语'我'，呼应开头",
        stateDesc: "主语回到'我'，与开头形成照应" },
      { word: "会", score: 0, memory: "法国", reason: "'会'——表示一种能力",
        stateDesc: "能力相关的语境形成" },
      { word: "说", score: 0, memory: "法国", reason: "'说'——语言能力！记忆中的'法国'开始被关联",
        stateDesc: "'说' + 记忆中的'法国' → 语言相关的信号增强" },
      { word: "一", score: 0, memory: "法国", reason: "量词'一口'的开始",
        stateDesc: "'一口流利的'语言修饰正在形成" },
      { word: "口", score: 0, memory: "法国", reason: "'一口'——用来修饰语言流利程度",
        stateDesc: "修饰语积累：一口..." },
      { word: "流", score: 0, memory: "法国", reason: "'流利'——描述语言能力的形容词",
        stateDesc: "法国 + 说 + 一口流利的 → 即将得出结论" },
      { word: "利", score: 0, memory: "法国", reason: "'流利的'——在法国长大+说一口流利的... 什么？",
        stateDesc: "所有线索汇聚：法国 + 语言 + 流利 → ?" },
      { word: "的", score: 0, memory: "法国", prediction: "法语", reason: "结合全部记忆：在法国长大 + 说一口流利的 → 法语！",
        stateDesc: "记忆'法国'完美激活！预测下一个词：法语" },
    ],
  },
  {
    id: 3,
    title: "语序重要性",
    type: "sentiment",
    description: "相同的词汇，不同的顺序：演示 RNN 如何识别主谓宾结构",
    sentence: ["他", "狠", "狠", "地", "打", "了", "我"],
    steps: [
      { word: "他", score: 0, reason: "主语'他'——谁在做这件事？",
        stateDesc: "记录主语：'他'是动作的发起者" },
      { word: "狠", score: -2, reason: "'狠'——出现负面程度词，气氛开始紧张",
        stateDesc: "负面修饰词进入记忆，情感开始偏负" },
      { word: "狠", score: -4, reason: "重复'狠狠'——程度加深，暴力感增强",
        stateDesc: "程度加倍！'狠狠'让负面信号更强烈" },
      { word: "地", score: -4, reason: "'地'——连接修饰词和动作：'狠狠地'修饰接下来的动词",
        stateDesc: "'狠狠地'修饰后续动作，等待动词出现" },
      { word: "打", score: -8, reason: "动词'打'确认！结合'狠狠地' → 暴力行为",
        stateDesc: "暴力动作确认：他 + 狠狠地 + 打" },
      { word: "了", score: -8, reason: "'了'表示动作已经发生——不是威胁，是既成事实",
        stateDesc: "动作已完成，施暴事实确立" },
      { word: "我", score: -10, reason: "宾语'我'出现——我是被打的人。语序决定了谁打谁！",
        stateDesc: "完整理解：他打了我（我是受害者），强烈负面" },
    ],
  },
];

export const explanationData = [
  {
    title: "核心原理：自带日记本的阅读者",
    icon: "Notebook",
    content: "想象一下，N-Gram 就像金鱼，读到这一页时，已经忘了上一页写了什么。而 RNN 是一个**记性很好**的读者，他手里始终拿着一本**“日记本”（Hidden State）**。每读到一个新词，他不仅会看这个词，还会快速翻阅一下日记本，结合之前的记忆来理解当下的意思，然后把新的理解写回日记本里，带到下一个词。",
  },
  {
    title: "实战对比：情绪大反转",
    icon: "SmilePlus",
    content: "请看右侧的【情感反转演示】。句子是：“这部电影**不**是**一般**的**好**看”。\n\n- **N-Gram 容易误判**：它可能只看到最后的“好看”就打高分，或者看到“不”就打低分，很难理解整体逻辑。\n- **RNN 统观全局**：当它读到“不”时，状态变红（警觉）。带着这个状态读到“一般”，再读到“好看”，它能结合全程的记忆，理解出“不是一般的...好”这种双重否定的极高评价。",
  },
  {
    title: "痛点解决：为什么我们需要记忆？",
    icon: "Unlink", 
    content: "在语言中，很多词的意思取决于**很久之前**出现的词。比如右侧的第二个案例：“我从**法国**长大……（中间讲了100句废话）……所以我说一口流利的__”。如果不记得最开始的“法国”，就无法填出“法语”。RNN 的“日记本”机制就是为了把这个关键信息一路“携带”过来。",
  },
  {
    title: "不仅是词，顺序是关键",
    icon: "ArrowRightLeft",
    content: "右侧第三个案例演示了：“他狠狠地打了**我**”。\n虽然词汇都是一样的（如果换成“我狠狠地打了他”），但 RNN 按照**顺序**读取，当读到“打”时，它知道前面的“他”是施暴者；当读到最后的“我”时，它知道“我”是承受者。这种对**语序**的敏感性是理解“谁对谁做了什么”的关键。",
  },
];

// -------------------------------
// 技术演示：Toy RNN 参数与逐步计算
// -------------------------------

export const rnnTechSpec = {
  inputDim: 3,
  hiddenDim: 4,
  outputDim: 3,
  outputLabels: ["负面", "中性", "正面"],
  // h_t = tanh(W_xh x_t + W_hh h_{t-1} + b_h)
  W_xh: [
    [0.62, -0.28, 0.33],
    [-0.47, 0.55, 0.18],
    [0.12, 0.31, -0.66],
    [0.51, 0.09, 0.24],
  ],
  W_hh: [
    [0.42, -0.19, 0.08, 0.17],
    [0.11, 0.38, -0.27, 0.05],
    [-0.22, 0.14, 0.41, 0.16],
    [0.09, -0.31, 0.22, 0.36],
  ],
  b_h: [0.04, -0.02, 0.01, 0.03],
  // y_t = softmax(W_hy h_t + b_y)
  W_hy: [
    [0.61, -0.25, 0.19, -0.13], // 负面
    [-0.18, 0.47, -0.11, 0.08], // 中性
    [-0.29, 0.06, 0.41, 0.35], // 正面
  ],
  b_y: [0.02, 0.01, -0.03],
};

const round3 = (x) => Number(x.toFixed(3));

function clampRange(x, min = -1, max = 1) {
  if (x < min) return min;
  if (x > max) return max;
  return x;
}

// 用字符编码构造稳定的 toy 输入向量（演示用途，不是训练得到）
function charToInputVector(char) {
  const code = char.codePointAt(0) || 0;
  const v1 = ((code % 17) - 8) / 8;
  const v2 = ((code % 23) - 11) / 11;
  const v3 = ((code % 29) - 14) / 14;
  return [v1, v2, v3].map((v) => round3(clampRange(v)));
}

function matVecMul(mat, vec) {
  return mat.map((row) =>
    round3(row.reduce((acc, val, idx) => acc + val * (vec[idx] || 0), 0)),
  );
}

function vecAdd(...vectors) {
  if (!vectors.length) return [];
  const dim = vectors[0].length;
  const out = Array(dim).fill(0);
  vectors.forEach((v) => {
    for (let i = 0; i < dim; i += 1) {
      out[i] += v[i] || 0;
    }
  });
  return out.map(round3);
}

function tanhVec(vec) {
  return vec.map((x) => round3(Math.tanh(x)));
}

function softmax(vec) {
  const maxVal = Math.max(...vec);
  const exps = vec.map((x) => Math.exp(x - maxVal));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((x) => round3(x / sum));
}

function l2Norm(vec) {
  return Math.sqrt(vec.reduce((acc, x) => acc + x * x, 0));
}

function argmax(vec) {
  let maxIdx = 0;
  for (let i = 1; i < vec.length; i += 1) {
    if (vec[i] > vec[maxIdx]) maxIdx = i;
  }
  return maxIdx;
}

export function buildRnnTechnicalTrace(sentence) {
  const trace = [];
  let hPrev = Array(rnnTechSpec.hiddenDim).fill(0);

  sentence.forEach((token, idx) => {
    const x_t = charToInputVector(token);
    const ax = matVecMul(rnnTechSpec.W_xh, x_t);
    const ah = matVecMul(rnnTechSpec.W_hh, hPrev);
    const z_t = vecAdd(ax, ah, rnnTechSpec.b_h);
    const h_t = tanhVec(z_t);
    const logits = vecAdd(matVecMul(rnnTechSpec.W_hy, h_t), rnnTechSpec.b_y);
    const y_t = softmax(logits);
    const predictionIdx = argmax(y_t);
    const memoryStrength = round3(Math.min(1, l2Norm(h_t) / 2));

    trace.push({
      idx,
      token,
      x_t,
      h_prev: hPrev,
      ax,
      ah,
      z_t,
      h_t,
      logits,
      y_t,
      predictionIdx,
      predictionLabel: rnnTechSpec.outputLabels[predictionIdx],
      memoryStrength,
    });

    hPrev = h_t;
  });

  return trace;
}
