export const transformerExplanation = [
  {
    title: '核心突破：分布式并行计算',
    icon: 'Network',
    content:
      'Transformer 的核心不是“记忆链条”，而是“全体并行计算”。在每一层里，所有 token 会同时产生 Query / Key / Value，然后一次性计算 N×N 的相关性矩阵。也就是说，不是一个词接一个词排队，而是整句一起进入同一轮矩阵运算。',
  },
  {
    title: '同一句情感分析：为什么它比 RNN 更稳',
    icon: 'Lightbulb',
    content:
      '用同一句“这部电影不是一般的好看”做分类。Transformer 在每层都能让“好”和“不”直接建立联系，不需要靠长链路传递。中间层会形成逐步估计（layer probe），最终用顶层句子表示做一次分类头输出。',
  },
  {
    title: '标准判定方式：最终层输出',
    icon: 'Zap',
    content:
      '行业里的句子级情感分类通常使用最终层的句子表示（例如 [CLS] 或池化向量）接分类头。每层的中间概率更多用于解释模型演化过程，而不是最终业务判定。',
  },
];

export const transformerScenarios = [
  {
    id: 'sentiment_parallel',
    title: '并行情感分析',
    description: '同一句话：这部电影不是一般的好看',
    task: 'sentiment',
    sentence: ['这', '部', '电', '影', '不', '是', '一', '般', '的', '好', '看'],
  },
];

export const transformerTechSpec = {
  modelDim: 4,
  numLayers: 3,
  outputLabels: ['负面', '中性', '正面'],
  // Toy projection matrices (4x4) for demo only.
  WQ: [
    [0.52, -0.11, 0.08, 0.27],
    [-0.09, 0.46, 0.21, -0.14],
    [0.24, 0.12, 0.43, -0.16],
    [0.17, -0.23, 0.15, 0.49],
  ],
  WK: [
    [0.47, 0.07, -0.13, 0.18],
    [-0.18, 0.51, 0.09, 0.12],
    [0.16, -0.04, 0.45, 0.22],
    [0.09, 0.14, -0.21, 0.41],
  ],
  WV: [
    [0.41, -0.16, 0.24, 0.19],
    [0.05, 0.39, -0.08, 0.26],
    [-0.14, 0.11, 0.52, -0.09],
    [0.18, 0.07, 0.13, 0.44],
  ],
};

const round3 = (x) => Number(x.toFixed(3));

function tanh(x) {
  return Math.tanh(x);
}

function softmax(arr) {
  const maxVal = Math.max(...arr);
  const exps = arr.map((x) => Math.exp(x - maxVal));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((x) => round3(x / sum));
}

function dot(a, b) {
  let out = 0;
  for (let i = 0; i < a.length; i += 1) out += (a[i] || 0) * (b[i] || 0);
  return out;
}

function matVecMul(matrix, vector) {
  return matrix.map((row) => round3(dot(row, vector)));
}

function vecAdd(a, b) {
  return a.map((x, i) => round3(x + (b[i] || 0)));
}

function vecScale(v, s) {
  return v.map((x) => round3(x * s));
}

function vecTanh(v) {
  return v.map((x) => round3(tanh(x)));
}

function vecNorm(v) {
  return Math.sqrt(v.reduce((acc, x) => acc + x * x, 0));
}

function meanVectors(vectors) {
  if (!vectors.length) return [];
  const dim = vectors[0].length;
  const out = Array(dim).fill(0);
  vectors.forEach((v) => {
    for (let i = 0; i < dim; i += 1) out[i] += v[i] || 0;
  });
  return out.map((x) => round3(x / vectors.length));
}

function argmax(arr) {
  let idx = 0;
  for (let i = 1; i < arr.length; i += 1) {
    if (arr[i] > arr[idx]) idx = i;
  }
  return idx;
}

function tokenEmbedding(token, position) {
  const code = token.codePointAt(0) || 0;
  const p = position + 1;
  const v1 = ((code % 31) - 15) / 15;
  const v2 = ((code % 19) - 9) / 9;
  const v3 = ((code % 23) - 11) / 11;
  const v4 = ((p % 7) - 3) / 3;
  return [v1, v2, v3, v4].map((x) => round3(Math.max(-1, Math.min(1, x))));
}

function attentionBias(queryToken, keyToken, layerIdx) {
  let bias = 0;
  if (queryToken === keyToken) bias += 0.3;
  if (keyToken === '不') bias += 0.2;
  if (keyToken === '好' || keyToken === '看') bias += 0.32;

  if (queryToken === '好' && keyToken === '不') bias += 1 + layerIdx * 0.15;
  if (queryToken === '看' && keyToken === '好') bias += 0.92 + layerIdx * 0.1;
  if (queryToken === '看' && keyToken === '不') bias += 0.56 + layerIdx * 0.08;
  if (queryToken === '般' && keyToken === '不') bias += 0.44 + layerIdx * 0.06;
  if (queryToken === '好' && keyToken === '般') bias += 0.38 + layerIdx * 0.06;

  return bias;
}

function classifyLayer(tokens, attentionMatrix, states, layerIdx, totalLayers) {
  const idxBu = tokens.indexOf('不');
  const idxHao = tokens.indexOf('好');
  const idxKan = tokens.indexOf('看');
  const idxBan = tokens.indexOf('般');

  const pooled = meanVectors(states);
  const n = tokens.length;

  const colMean = (col) => {
    if (col < 0) return 0;
    let sum = 0;
    for (let i = 0; i < n; i += 1) sum += attentionMatrix[i][col];
    return sum / n;
  };

  const buFocus = colMean(idxBu);
  const haoFocus = colMean(idxHao);
  const kanFocus = colMean(idxKan);
  const banFocus = colMean(idxBan);

  const phraseBoost =
    (idxHao >= 0 && idxBu >= 0 ? attentionMatrix[idxHao][idxBu] : 0) +
    (idxKan >= 0 && idxHao >= 0 ? attentionMatrix[idxKan][idxHao] : 0) +
    (idxKan >= 0 && idxBu >= 0 ? 0.65 * attentionMatrix[idxKan][idxBu] : 0) +
    (idxHao >= 0 && idxBan >= 0 ? 0.4 * attentionMatrix[idxHao][idxBan] : 0);

  const layerGain = (layerIdx + 1) / totalLayers;
  const negLogit = round3(0.12 + 0.64 * buFocus - 0.3 * phraseBoost - 0.2 * pooled[0]);
  const posLogit = round3(0.08 + 0.56 * (haoFocus + kanFocus) + 0.9 * phraseBoost + 0.18 * layerGain + 0.2 * pooled[2]);
  const neuLogit = round3(0.05 + 0.12 * banFocus + 0.12 * pooled[1] + 0.08 * (1 - Math.abs(posLogit - negLogit)));

  const probs = softmax([negLogit, neuLogit, posLogit]);
  const predIdx = argmax(probs);

  return {
    pooled,
    logits: [negLogit, neuLogit, posLogit],
    probs,
    predictionIdx: predIdx,
    predictionLabel: transformerTechSpec.outputLabels[predIdx],
    confidence: Math.max(...probs),
    signals: {
      buFocus: round3(buFocus),
      haoFocus: round3(haoFocus),
      kanFocus: round3(kanFocus),
      phraseBoost: round3(phraseBoost),
    },
  };
}

export const layerInsights = [
  {
    title: '表面关联',
    desc: "发现基本词对关系：'好'↔'不'、'电'↔'影'",
  },
  {
    title: '短语组合',
    desc: "'好'↔'不'连接加强，'不是一般的好'作为短语被识别",
  },
  {
    title: '句意理解',
    desc: '双重否定 = 强烈肯定。最终判断：极高的正面评价',
  },
];

// key = "layerIdx-wordIdx"，为关键词在特定层提供解读
export const attentionExplanations = {
  '0-9': "'好'初步注意到'不'——发现否定关系",
  '1-9': "'好'↔'不'连接加强，同时关注'般'——短语模式浮现",
  '2-9': "'好'强烈关注'不'(35%)——理解了'不是一般的好'是双重否定",
  '0-4': "'不'广泛扫描全句，寻找它要否定的对象",
  '2-4': "'不'锁定'好'和'般'——否定结构完全建立",
  '2-10': "'看'关注'好'——确认'好看'是核心评价词",
};

// ── Ch1: QKV 概念化描述 ──

export const ch1QkvDescriptions = {
  这: { query: '我指代什么？后面是什么名词？', key: '指示词（"这个"的"这"）', value: '指代特定事物', result: '锁定"电影"→ 确认"这部电影"是讨论对象' },
  部: { query: '我属于什么短语？', key: '量词', value: '数量标记', result: '连接"这"和"电影"→ "这部电影"' },
  电: { query: '我和谁组成词？', key: '"电影"的前半部分', value: '字符信息', result: '与"影"绑定 → 确认"电影"' },
  影: { query: '前面跟着谁？', key: '"电影"的后半部分', value: '影视含义', result: '与"电"组合 → "电影"概念成立' },
  不: { query: '我要否定谁？后面哪个词需要我？', key: '否定词——能改变别人的含义', value: '否定信号', result: '发现自己是"不是一般的"的开头，这不是简单否定，而是程度强调' },
  是: { query: '我在什么语法结构中？', key: '系动词 / 结构词', value: '连接功能', result: '融入"不是一般的"这个固定搭配' },
  一: { query: '我和谁搭配？', key: '数词，和"般"搭配', value: '数量/程度信号', result: '与"般"组合 → "一般" = 普通程度' },
  般: { query: '前面是什么？', key: '和"一"搭配 = "一般"', value: '"普通"的含义', result: '与"一"绑定 → "不是一般的" = 不普通 = 超乎寻常' },
  的: { query: '我连接什么修饰语？', key: '结构助词（的字结构）', value: '修饰关系标记', result: '连接"不是一般"和"好看"→ 形成定语修饰' },
  好: { query: '谁在修饰我？谁改变了我的含义？', key: '正面评价词', value: '正面情感、"好"的语义', result: '"不"和"般"的信息涌入 → 我不是普通的"好"，而是在"不是一般的"语境中 = 极好' },
  看: { query: '谁和我搭配？我的含义受什么影响？', key: '动作词 / 评价词', value: '观看、评价含义', result: '"好"涌入 → "好看"被识别。加上"不是一般的"修饰 → 极其好看' },
};

export const ch1GuidedSteps = [
  {
    wordIndex: 9,
    title: '"好" 在找什么？',
    narrative: '"好"的 Query 向全句发问："谁在修饰我？"\n它发现"不"的 Key（否定词）匹配度最高——因为否定词直接改变"好"的含义。',
  },
  {
    wordIndex: 4,
    title: '"不" 的影响范围',
    narrative: '"不"的 Key 向全句广播"我是否定词"。\n"好""般""是"的 Query 都匹配到了它——多个词需要知道"不"的存在，才能理解这句话。',
  },
  {
    wordIndex: 10,
    title: '"看" 的搭配发现',
    narrative: '"看"最关注"好"——发现"好看"是常见搭配。\n同时也感知到前面"不是一般的"修饰，理解这是一个极高的评价。',
  },
];

export function applyCausalMask(row, wordIndex) {
  const masked = row.map((w, i) => (i <= wordIndex ? w : 0));
  const sum = masked.reduce((a, b) => a + b, 0) || 1;
  return masked.map((w) => w / sum);
}

// ── 预测模式数据 ──

export const generationSentence = ['我', '在', '法', '国', '长', '大', '所', '以', '我', '会', '说'];

export const vocabPrediction = [
  { word: '法语', prob: 0.62 },
  { word: '中文', prob: 0.11 },
  { word: '英语', prob: 0.09 },
  { word: '日语', prob: 0.05 },
  { word: '德语', prob: 0.04 },
  { word: '其他', prob: 0.09 },
];

export const generationExplanations = {
  0: '初始层："说"关注"法"和"国"——识别到地点信息',
  1: '中间层："说"↔"法国"连接加强，同时注意到"长大"——建立因果联系',
  2: '顶层："说"强烈关注"法国"——模型确定要预测与法国相关的语言',
};

// ── 预测模式故事步骤（4步叙事） ──
export const predictionStorySteps = [
  {
    title: '第 1 层：发现关键词',
    narrative: '"说"开始扫描前文，注意到"法"和"国"——这是一个地点。',
    focus: '地点识别',
    color: 'indigo',
  },
  {
    title: '第 2 层：建立因果链',
    narrative: '"说"↔"法国"的连接加强，同时关注到"长大"——在法国长大，所以会说某种语言。',
    focus: '因果推理',
    color: 'purple',
  },
  {
    title: '第 3 层：锁定答案',
    narrative: '"说"最强烈地关注"法国"——模型确信答案与法国相关。这就是注意力的核心价值：让模型把分散在句子各处的线索聚合起来。',
    focus: '信息聚合',
    color: 'violet',
  },
  {
    title: '预测：法语',
    narrative: '经过 3 层注意力，"说"的表示已经充分吸收了"法国"的信息。最终向量投影到词汇表上，"法语"以 62% 的概率胜出。',
    focus: '词汇投影',
    color: 'amber',
  },
];

// ── Chapter 2: 多层推理数据（"他在乔布斯创办的公司工作了十年"） ──

export const ch2Sentence = ['他', '在', '乔', '布', '斯', '创', '办', '的', '公', '司', '工', '作', '了', '十', '年'];

export const embeddingCategories = {
  他: { category: 'person', color: '#60a5fa', label: '人物' },
  在: { category: 'function', color: '#94a3b8', label: '功能词' },
  乔: { category: 'name', color: '#a78bfa', label: '人名' },
  布: { category: 'name', color: '#a78bfa', label: '人名' },
  斯: { category: 'name', color: '#a78bfa', label: '人名' },
  创: { category: 'action', color: '#34d399', label: '动作' },
  办: { category: 'action', color: '#34d399', label: '动作' },
  的: { category: 'function', color: '#94a3b8', label: '功能词' },
  公: { category: 'org', color: '#60a5fa', label: '组织' },
  司: { category: 'org', color: '#60a5fa', label: '组织' },
  工: { category: 'action', color: '#34d399', label: '动作' },
  作: { category: 'action', color: '#34d399', label: '动作' },
  了: { category: 'function', color: '#94a3b8', label: '功能词' },
  十: { category: 'time', color: '#fbbf24', label: '时间' },
  年: { category: 'time', color: '#fbbf24', label: '时间' },
};

export const embeddingProjections = {
  // Layer 0：散乱分布
  0: {
    他: [0.20, 0.55], 在: [0.35, 0.40],
    乔: [0.75, 0.18], 布: [0.58, 0.28], 斯: [0.88, 0.32],
    创: [0.48, 0.68], 办: [0.40, 0.58], 的: [0.55, 0.45],
    公: [0.22, 0.22], 司: [0.32, 0.15],
    工: [0.72, 0.72], 作: [0.82, 0.62],
    了: [0.45, 0.82], 十: [0.15, 0.78], 年: [0.25, 0.85],
  },
  // Layer 1：相邻字对聚合（"乔布斯"、"公司"、"工作"、"十年"）
  1: {
    他: [0.15, 0.50], 在: [0.25, 0.48],
    乔: [0.68, 0.18], 布: [0.65, 0.22], 斯: [0.71, 0.25],
    创: [0.50, 0.55], 办: [0.48, 0.58], 的: [0.52, 0.45],
    公: [0.28, 0.20], 司: [0.30, 0.23],
    工: [0.78, 0.72], 作: [0.80, 0.68],
    了: [0.72, 0.80],
    十: [0.18, 0.80], 年: [0.20, 0.78],
  },
  // Layer 2：短语结构浮现（"乔布斯创办"移向"公司"）
  2: {
    他: [0.12, 0.45], 在: [0.18, 0.42],
    乔: [0.55, 0.18], 布: [0.53, 0.21], 斯: [0.57, 0.23],
    创: [0.50, 0.30], 办: [0.48, 0.33], 的: [0.46, 0.37],
    公: [0.40, 0.28], 司: [0.42, 0.31],
    工: [0.80, 0.70], 作: [0.82, 0.68],
    了: [0.78, 0.73],
    十: [0.85, 0.78], 年: [0.87, 0.76],
  },
  // Layer 3：语义单元（"乔布斯创办的公司"融为一体）
  3: {
    他: [0.15, 0.40], 在: [0.18, 0.43],
    乔: [0.45, 0.18], 布: [0.43, 0.20], 斯: [0.47, 0.22],
    创: [0.42, 0.26], 办: [0.40, 0.28], 的: [0.38, 0.30],
    公: [0.36, 0.24], 司: [0.38, 0.26],
    工: [0.82, 0.68], 作: [0.84, 0.66],
    了: [0.80, 0.72],
    十: [0.86, 0.78], 年: [0.88, 0.76],
  },
};

export const emergentClusters = {
  0: [],
  1: [
    { label: '人名', words: ['乔', '布', '斯'], color: '#a78bfa' },
    { label: '公司', words: ['公', '司'], color: '#60a5fa' },
    { label: '工作', words: ['工', '作'], color: '#34d399' },
    { label: '十年', words: ['十', '年'], color: '#fbbf24' },
  ],
  2: [
    { label: '乔布斯·创办', words: ['乔', '布', '斯', '创', '办', '的'], color: '#a78bfa' },
    { label: '公司', words: ['公', '司'], color: '#60a5fa' },
    { label: '工作了十年', words: ['工', '作', '了', '十', '年'], color: '#34d399' },
  ],
  3: [
    { label: '乔布斯创办的公司', words: ['乔', '布', '斯', '创', '办', '的', '公', '司'], color: '#a78bfa' },
    { label: '工作经历', words: ['工', '作', '了', '十', '年'], color: '#34d399' },
  ],
};

export const layerDetailedInsights = [
  {
    title: '初始嵌入',
    subtitle: '15 个独立的字符',
    desc: '每个字只有自己的初始向量。"乔""布""斯"只是三个毫无关联的字符，模型不知道它们组成了一个人名。',
  },
  {
    title: 'Layer 1：词对发现',
    subtitle: '相邻的字开始配对',
    desc: '"乔"↔"布"↔"斯"开始聚合——模型发现它们经常相邻出现。',
  },
  {
    title: 'Layer 2：结构理解',
    subtitle: '定语结构浮现',
    desc: '"创办的"把"乔布斯"和"公司"连接起来——模型发现"乔布斯创办的"修饰"公司"。',
  },
  {
    title: 'Layer 3：语义推理',
    subtitle: '"他"的身份被推断出来',
    desc: '"公司"绑定到"乔布斯"。"他"通过"工作""公司"链条推断出身份。',
  },
];

// 每层的"发现"——核心教学内容
export const ch2LayerDiscoveries = [
  {
    title: '初始状态',
    summary: '15 个字各自独立——"乔""布""斯"只是三个毫无关联的字符。模型此刻什么都不理解。',
    discoveries: [],
  },
  {
    title: 'Layer 1：词对发现',
    summary: '相邻的字开始互相关注，发现常见组合',
    discoveries: [
      {
        title: '"乔布斯" 被识别为连续序列',
        highlight: [2, 3, 4],
        connections: [
          { from: 2, to: 3, label: '乔→布' },
          { from: 3, to: 4, label: '布→斯' },
          { from: 4, to: 2, label: '斯→乔' },
        ],
        explanation: '三个字的注意力互相聚焦——模型发现它们经常一起出现。这是人名识别的第一步。但此时"乔布斯"只是一个符号，模型不知道他是谁。',
      },
      {
        title: '双字词配对："公司""工作""十年"',
        highlight: [8, 9, 10, 11, 13, 14],
        connections: [
          { from: 8, to: 9, label: '公→司' },
          { from: 10, to: 11, label: '工→作' },
          { from: 13, to: 14, label: '十→年' },
        ],
        explanation: '基本的双字词被识别。但"公司"和"乔布斯"之间还没有任何连接——模型不知道它们有关系。',
      },
    ],
  },
  {
    title: 'Layer 2：结构理解',
    summary: '"乔布斯创办的" 被识别为修饰 "公司" 的定语',
    discoveries: [
      {
        title: '定语结构浮现："谁创办的什么"',
        highlight: [2, 3, 4, 5, 6, 7, 8, 9],
        connections: [
          { from: 8, to: 5, label: '公→创' },
          { from: 8, to: 2, label: '公→乔' },
          { from: 7, to: 5, label: '的→创' },
        ],
        explanation: '"公司"开始关注"创办"和"乔布斯"——模型发现"乔布斯创办的"是在修饰"公司"。这是从字面到语法的飞跃：不再是 15 个孤立的字，而是一个嵌套结构。',
      },
      {
        title: '"工作了十年" 形成时间状语',
        highlight: [10, 11, 12, 13, 14],
        connections: [
          { from: 12, to: 10, label: '了→工' },
          { from: 14, to: 13, label: '年→十' },
        ],
        explanation: '"了"连接到"工作"标记完成体，"年"绑定到"十"——模型理解这是一个"动作+时间跨度"的表达。',
      },
    ],
  },
  {
    title: 'Layer 3：语义推理',
    summary: '完整理解："他" 是乔布斯公司的资深员工',
    discoveries: [
      {
        title: '"他" 的身份被推断出来',
        highlight: [0, 8, 9, 10, 11],
        connections: [
          { from: 0, to: 8, label: '他→公' },
          { from: 0, to: 10, label: '他→工' },
          { from: 0, to: 2, label: '他→乔' },
        ],
        explanation: '"他"强烈关注"公司"和"工作"——模型推断出主语的身份：一个在这家公司工作的人。注意"他"甚至间接关注了"乔"，说明模型已经沿着"公司→乔布斯"的链条传递了信息。',
      },
      {
        title: '"公司" = 乔布斯创办的公司',
        highlight: [2, 3, 4, 5, 6, 8, 9],
        connections: [
          { from: 8, to: 2, label: '公→乔' },
          { from: 8, to: 5, label: '公→创' },
          { from: 9, to: 2, label: '司→乔' },
        ],
        explanation: '"公司"最强烈地关注"乔布斯"——语义绑定完成。虽然句中没有说"苹果"，但模型内部已经建立了"乔布斯创办的公司"这个完整概念。这就是 Transformer 的推理能力。',
      },
    ],
  },
];

// ── 5阶段元数据 ──

export const phaseDescriptions = [
  {
    name: '词嵌入 → Q/K/V',
    shortName: 'Q/K/V',
    formula: 'Q = x·W_Q,  K = x·W_K,  V = x·W_V',
    explanation: '每个词的嵌入向量分别乘以三个投影矩阵，得到 Query、Key、Value。',
  },
  {
    name: 'Q·K 打分',
    shortName: '打分',
    formula: 'score_ij = Q_i · K_j / √d',
    explanation: '选定词的 Query 与每个词的 Key 做点积，得到"相关性分数"。',
  },
  {
    name: 'Softmax 归一化',
    shortName: '权重',
    formula: 'α_ij = softmax(scores)',
    explanation: '原始分数经过 softmax 变成概率分布——归一化的注意力权重。',
  },
  {
    name: '加权聚合',
    shortName: '聚合',
    formula: 'context = Σ α_ij · V_j',
    explanation: '用注意力权重对所有 Value 向量做加权求和，得到上下文向量。',
  },
  {
    name: '残差连接 → 输出',
    shortName: '输出',
    formula: 'h_new = tanh(0.58·h_old + 0.42·context + bias)',
    explanation: '上下文向量与原始嵌入融合（残差连接），经非线性变换得到这一层的输出。',
  },
];

// ── 阶段数据提取辅助 ──

export function getPhaseData(traceLayer, wordIndex, tokens, phaseIdx) {
  const dim = transformerTechSpec.modelDim;
  switch (phaseIdx) {
    case 0: // Q/K/V
      return {
        embedding: traceLayer.prevStates[wordIndex],
        q: traceLayer.qVectors[wordIndex],
        k: traceLayer.kVectors[wordIndex],
        v: traceLayer.vVectors[wordIndex],
      };
    case 1: { // Q·K scoring
      const q = traceLayer.qVectors[wordIndex];
      const rawScores = traceLayer.kVectors.map((kVec, j) => ({
        idx: j,
        token: tokens[j],
        score: round3(dot(q, kVec) / Math.sqrt(dim) + attentionBias(tokens[wordIndex], tokens[j], traceLayer.layer - 1)),
      }));
      rawScores.sort((a, b) => b.score - a.score);
      return { q, rawScores };
    }
    case 2: { // Softmax
      const q2 = traceLayer.qVectors[wordIndex];
      const raw = traceLayer.kVectors.map((kVec, j) => ({
        idx: j,
        token: tokens[j],
        score: round3(dot(q2, kVec) / Math.sqrt(dim) + attentionBias(tokens[wordIndex], tokens[j], traceLayer.layer - 1)),
      }));
      raw.sort((a, b) => b.score - a.score);
      const weights = traceLayer.attentionMatrix[wordIndex];
      const sorted = raw.map((r) => ({
        ...r,
        weight: weights[r.idx],
      }));
      return { items: sorted };
    }
    case 3: { // Weighted aggregation
      const wts = traceLayer.attentionMatrix[wordIndex];
      const contributors = wts
        .map((w, j) => ({
          idx: j,
          token: tokens[j],
          weight: w,
          v: traceLayer.vVectors[j],
          scaled: vecScale(traceLayer.vVectors[j], w),
        }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 4);
      return {
        contributors,
        contextVector: traceLayer.contextVectors[wordIndex],
      };
    }
    case 4: // Output
      return {
        prevState: traceLayer.prevStates[wordIndex],
        contextVector: traceLayer.contextVectors[wordIndex],
        newState: traceLayer.states[wordIndex],
        probs: traceLayer.probs,
        predictionLabel: traceLayer.predictionLabel,
        confidence: traceLayer.confidence,
      };
    default:
      return {};
  }
}

// ── 因果掩码版 trace 构建 ──

function attentionBiasGeneration(queryToken, keyToken, layerIdx) {
  let bias = 0;
  if (queryToken === keyToken) bias += 0.25;
  // 法国相关
  if (queryToken === '说' && (keyToken === '法' || keyToken === '国')) bias += 0.8 + layerIdx * 0.2;
  if (queryToken === '说' && keyToken === '长') bias += 0.3 + layerIdx * 0.1;
  if (queryToken === '说' && keyToken === '大') bias += 0.25 + layerIdx * 0.08;
  if (queryToken === '会' && keyToken === '说') bias += 0.5;
  if (queryToken === '会' && (keyToken === '法' || keyToken === '国')) bias += 0.4 + layerIdx * 0.15;
  if (queryToken === '以' && keyToken === '所') bias += 0.6;
  if (queryToken === '大' && keyToken === '长') bias += 0.5;
  if (queryToken === '国' && keyToken === '法') bias += 0.7;
  if (queryToken === '在' && keyToken === '我') bias += 0.3;
  return bias;
}

export function buildTransformerGenerationTrace(sentence) {
  const tokens = sentence;
  const n = tokens.length;
  const dim = transformerTechSpec.modelDim;
  const traces = [];

  let states = tokens.map((token, idx) => tokenEmbedding(token, idx));

  for (let layerIdx = 0; layerIdx < transformerTechSpec.numLayers; layerIdx += 1) {
    const qVectors = states.map((s) => matVecMul(transformerTechSpec.WQ, s));
    const kVectors = states.map((s) => matVecMul(transformerTechSpec.WK, s));
    const vVectors = states.map((s) => matVecMul(transformerTechSpec.WV, s));

    // Causal attention: mask future positions before softmax
    const attentionMatrix = [];
    for (let i = 0; i < n; i += 1) {
      const scores = [];
      for (let j = 0; j < n; j += 1) {
        if (j > i) {
          scores.push(-1e9); // mask future
        } else {
          const raw = dot(qVectors[i], kVectors[j]) / Math.sqrt(dim);
          scores.push(round3(raw + attentionBiasGeneration(tokens[i], tokens[j], layerIdx)));
        }
      }
      attentionMatrix.push(softmax(scores));
    }

    const contextVectors = [];
    for (let i = 0; i < n; i += 1) {
      const context = Array(dim).fill(0);
      for (let j = 0; j < n; j += 1) {
        const w = attentionMatrix[i][j];
        for (let d = 0; d < dim; d += 1) {
          context[d] += w * vVectors[j][d];
        }
      }
      contextVectors.push(context.map(round3));
    }

    const layerBias = [0.02 * (layerIdx + 1), -0.01 * (layerIdx + 1), 0.015 * (layerIdx + 1), 0.01 * (layerIdx + 1)];

    const nextStates = states.map((state, i) => {
      const mixed = vecAdd(vecScale(state, 0.58), vecScale(contextVectors[i], 0.42));
      const withBias = vecAdd(mixed, layerBias);
      return vecTanh(withBias);
    });

    traces.push({
      layer: layerIdx + 1,
      tokens,
      qVectors,
      kVectors,
      vVectors,
      states: nextStates,
      prevStates: states,
      contextVectors,
      attentionMatrix,
      stateNorms: nextStates.map((v) => round3(Math.min(1, vecNorm(v) / 2))),
    });

    states = nextStates;
  }

  return traces;
}

// Generation phase data extraction (causal)
export function getGenerationPhaseData(traceLayer, wordIndex, tokens, phaseIdx) {
  const dim = transformerTechSpec.modelDim;
  switch (phaseIdx) {
    case 0:
      return {
        embedding: traceLayer.prevStates[wordIndex],
        q: traceLayer.qVectors[wordIndex],
        k: traceLayer.kVectors[wordIndex],
        v: traceLayer.vVectors[wordIndex],
      };
    case 1: {
      const q = traceLayer.qVectors[wordIndex];
      const rawScores = traceLayer.kVectors.map((kVec, j) => ({
        idx: j,
        token: tokens[j],
        score: j > wordIndex ? null : round3(dot(q, kVec) / Math.sqrt(dim) + attentionBiasGeneration(tokens[wordIndex], tokens[j], traceLayer.layer - 1)),
        masked: j > wordIndex,
      }));
      const visible = rawScores.filter((r) => !r.masked);
      visible.sort((a, b) => b.score - a.score);
      return { q, rawScores: visible, maskedCount: rawScores.filter((r) => r.masked).length };
    }
    case 2: {
      const q2 = traceLayer.qVectors[wordIndex];
      const raw = traceLayer.kVectors.map((kVec, j) => ({
        idx: j,
        token: tokens[j],
        score: j > wordIndex ? null : round3(dot(q2, kVec) / Math.sqrt(dim) + attentionBiasGeneration(tokens[wordIndex], tokens[j], traceLayer.layer - 1)),
        masked: j > wordIndex,
      }));
      const visible = raw.filter((r) => !r.masked);
      visible.sort((a, b) => b.score - a.score);
      const weights = traceLayer.attentionMatrix[wordIndex];
      const sorted = visible.map((r) => ({ ...r, weight: weights[r.idx] }));
      return { items: sorted };
    }
    case 3: {
      const wts = traceLayer.attentionMatrix[wordIndex];
      const contributors = wts
        .map((w, j) => ({
          idx: j,
          token: tokens[j],
          weight: w,
          v: traceLayer.vVectors[j],
          scaled: vecScale(traceLayer.vVectors[j], w),
        }))
        .filter((c) => c.idx <= wordIndex)
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 4);
      return {
        contributors,
        contextVector: traceLayer.contextVectors[wordIndex],
      };
    }
    case 4:
      return {
        prevState: traceLayer.prevStates[wordIndex],
        contextVector: traceLayer.contextVectors[wordIndex],
        newState: traceLayer.states[wordIndex],
      };
    default:
      return {};
  }
}

export function buildTransformerParallelTrace(sentence) {
  const tokens = sentence;
  const n = tokens.length;
  const dim = transformerTechSpec.modelDim;
  const traces = [];

  let states = tokens.map((token, idx) => tokenEmbedding(token, idx));

  for (let layerIdx = 0; layerIdx < transformerTechSpec.numLayers; layerIdx += 1) {
    const qVectors = states.map((s) => matVecMul(transformerTechSpec.WQ, s));
    const kVectors = states.map((s) => matVecMul(transformerTechSpec.WK, s));
    const vVectors = states.map((s) => matVecMul(transformerTechSpec.WV, s));

    const attentionMatrix = [];
    for (let i = 0; i < n; i += 1) {
      const scores = [];
      for (let j = 0; j < n; j += 1) {
        const raw = dot(qVectors[i], kVectors[j]) / Math.sqrt(dim);
        scores.push(round3(raw + attentionBias(tokens[i], tokens[j], layerIdx)));
      }
      attentionMatrix.push(softmax(scores));
    }

    const contextVectors = [];
    for (let i = 0; i < n; i += 1) {
      const context = Array(dim).fill(0);
      for (let j = 0; j < n; j += 1) {
        const w = attentionMatrix[i][j];
        for (let d = 0; d < dim; d += 1) {
          context[d] += w * vVectors[j][d];
        }
      }
      contextVectors.push(context.map(round3));
    }

    const layerBias = [0.02 * (layerIdx + 1), -0.01 * (layerIdx + 1), 0.015 * (layerIdx + 1), 0.01 * (layerIdx + 1)];

    const nextStates = states.map((state, i) => {
      const mixed = vecAdd(vecScale(state, 0.58), vecScale(contextVectors[i], 0.42));
      const withBias = vecAdd(mixed, layerBias);
      return vecTanh(withBias);
    });

    const cls = classifyLayer(tokens, attentionMatrix, nextStates, layerIdx, transformerTechSpec.numLayers);

    traces.push({
      layer: layerIdx + 1,
      tokens,
      qVectors,
      kVectors,
      vVectors,
      states: nextStates,
      prevStates: states,
      contextVectors,
      attentionMatrix,
      stateNorms: nextStates.map((v) => round3(Math.min(1, vecNorm(v) / 2))),
      workerMetrics: {
        workers: n,
        pairTasks: n * n,
        operations: n * n * dim,
      },
      ...cls,
    });

    states = nextStates;
  }

  return traces;
}

// ── Chapter 2 专用 trace 构建 ──

function ch2AttentionBias(queryToken, keyToken, layerIdx) {
  let bias = 0;
  if (queryToken === keyToken) bias += 0.25;

  // 相邻字对
  const namePairs = [['乔', '布'], ['布', '斯']];
  const wordPairs = [['公', '司'], ['工', '作'], ['十', '年'], ['创', '办']];
  for (const [a, b] of namePairs) {
    if ((queryToken === a && keyToken === b) || (queryToken === b && keyToken === a))
      bias += 0.7 + layerIdx * 0.1;
  }
  for (const [a, b] of wordPairs) {
    if ((queryToken === a && keyToken === b) || (queryToken === b && keyToken === a))
      bias += 0.5 + layerIdx * 0.08;
  }

  // Layer 1+：跨词连接
  if (layerIdx >= 1) {
    if (queryToken === '斯' && keyToken === '乔') bias += 0.35;
    if (queryToken === '乔' && keyToken === '斯') bias += 0.25;
    if ((queryToken === '创' || queryToken === '办') && (keyToken === '乔' || keyToken === '布' || keyToken === '斯'))
      bias += 0.25 + layerIdx * 0.1;
    if (queryToken === '公' && (keyToken === '创' || keyToken === '办')) bias += 0.2 + layerIdx * 0.12;
    if (queryToken === '司' && (keyToken === '创' || keyToken === '办')) bias += 0.15 + layerIdx * 0.08;
    if (queryToken === '的' && (keyToken === '创' || keyToken === '办')) bias += 0.2;
    if (queryToken === '的' && (keyToken === '乔' || keyToken === '斯')) bias += 0.15;
    if (queryToken === '了' && (keyToken === '工' || keyToken === '作')) bias += 0.3;
  }

  // Layer 2：深层语义
  if (layerIdx >= 2) {
    if (queryToken === '他' && keyToken === '公') bias += 0.45;
    if (queryToken === '他' && keyToken === '司') bias += 0.2;
    if (queryToken === '他' && keyToken === '工') bias += 0.35;
    if (queryToken === '他' && keyToken === '作') bias += 0.15;
    if (queryToken === '他' && keyToken === '乔') bias += 0.25;
    if (queryToken === '公' && keyToken === '乔') bias += 0.45;
    if (queryToken === '公' && keyToken === '布') bias += 0.2;
    if (queryToken === '公' && keyToken === '斯') bias += 0.15;
    if (queryToken === '司' && keyToken === '乔') bias += 0.25;
    if (queryToken === '工' && keyToken === '公') bias += 0.3;
    if (queryToken === '工' && keyToken === '司') bias += 0.15;
    if (queryToken === '年' && keyToken === '工') bias += 0.2;
  }

  return bias;
}

export function buildCh2Trace(sentence) {
  const tokens = sentence;
  const n = tokens.length;
  const dim = transformerTechSpec.modelDim;
  const traces = [];

  let states = tokens.map((token, idx) => tokenEmbedding(token, idx));

  for (let layerIdx = 0; layerIdx < transformerTechSpec.numLayers; layerIdx += 1) {
    const qVectors = states.map((s) => matVecMul(transformerTechSpec.WQ, s));
    const kVectors = states.map((s) => matVecMul(transformerTechSpec.WK, s));
    const vVectors = states.map((s) => matVecMul(transformerTechSpec.WV, s));

    const attentionMatrix = [];
    for (let i = 0; i < n; i += 1) {
      const scores = [];
      for (let j = 0; j < n; j += 1) {
        const raw = dot(qVectors[i], kVectors[j]) / Math.sqrt(dim);
        scores.push(round3(raw + ch2AttentionBias(tokens[i], tokens[j], layerIdx)));
      }
      attentionMatrix.push(softmax(scores));
    }

    const contextVectors = [];
    for (let i = 0; i < n; i += 1) {
      const context = Array(dim).fill(0);
      for (let j = 0; j < n; j += 1) {
        const w = attentionMatrix[i][j];
        for (let d = 0; d < dim; d += 1) {
          context[d] += w * vVectors[j][d];
        }
      }
      contextVectors.push(context.map(round3));
    }

    const layerBias = [0.02 * (layerIdx + 1), -0.01 * (layerIdx + 1), 0.015 * (layerIdx + 1), 0.01 * (layerIdx + 1)];
    const nextStates = states.map((state, i) => {
      const mixed = vecAdd(vecScale(state, 0.58), vecScale(contextVectors[i], 0.42));
      const withBias = vecAdd(mixed, layerBias);
      return vecTanh(withBias);
    });

    traces.push({
      layer: layerIdx + 1,
      tokens,
      qVectors, kVectors, vVectors,
      states: nextStates,
      prevStates: states,
      contextVectors,
      attentionMatrix,
      stateNorms: nextStates.map((v) => round3(Math.min(1, vecNorm(v) / 2))),
    });

    states = nextStates;
  }

  return traces;
}
