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
