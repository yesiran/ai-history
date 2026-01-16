// 简单的中文 N-gram 实现

export const defaultCorpus = [
  "我喜欢吃苹果",
  "我喜欢吃香蕉",
  "我喜欢吃西瓜",
  "他喜欢吃苹果",
  "人工智能很有趣",
  "人工智能改变世界",
  "人工智能是未来",
  "机器学习是人工智能的核心",
  "深度学习是机器学习的分支",
  "我们都有美好的未来",
  "我们一起去吃饭",
  "我们一起去学习",
  "今天天气真好",
  "今天天气不错",
];

/**
 * 训练 N-gram 模型
 * @param {string[]} corpus - 语料库（句子数组）
 * @param {number} n - N 值 (1, 2, 3...)
 * @returns {Object} 模型对象
 */
export function trainNGram(corpus, n) {
  const model = {};

  corpus.forEach(sentence => {
    // 为了处理 N-gram，我们需要在句子前面补位，或者只处理足够长的部分
    // 这里简化处理：直接按字符滑动窗口
    // 比如 N=2 (Bigram)，看1个词猜下1个。窗口大小为 2。
    
    // 如果 N=1 (Unigram)，不需要上下文，只统计每个字出现的频率
    if (n === 1) {
      for (let i = 0; i < sentence.length; i++) {
        const char = sentence[i];
        if (!model['']) model[''] = {};
        model[''][char] = (model[''][char] || 0) + 1;
      }
      return;
    }

    // N > 1
    // 窗口大小其实是 N。我们要用前 N-1 个字作为 key (context)，第 N 个字作为 value (target)
    const contextLength = n - 1;
    for (let i = 0; i <= sentence.length - n; i++) {
      const context = sentence.slice(i, i + contextLength);
      const target = sentence[i + contextLength];

      if (!model[context]) {
        model[context] = {};
      }
      model[context][target] = (model[context][target] || 0) + 1;
    }
  });

  return model;
}

/**
 * 预测下一个字
 * @param {Object} model - 训练好的模型
 * @param {string} currentText - 当前输入的文本
 * @param {number} n - N 值
 * @returns {Array} 预测结果数组 [{char: '字', prob: 0.5, count: 5}, ...]
 */
export function predictNext(model, currentText, n) {
  if (!currentText && n > 1) return [];

  let context = "";
  
  if (n === 1) {
    context = "";
  } else {
    // 取最后 N-1 个字作为上下文
    const contextLength = n - 1;
    if (currentText.length < contextLength) {
       // 文本不够长，无法匹配 N-gram 上下文
       // 这里可以做一个 fallback，比如降级到 N-1，但为了演示原理，我们严格返回空或提示
       return [];
    }
    context = currentText.slice(-contextLength);
  }

  const predictions = model[context];
  
  if (!predictions) {
    return [];
  }

  // 计算总次数
  const total = Object.values(predictions).reduce((sum, count) => sum + count, 0);

  // 转换为数组并排序
  return Object.entries(predictions)
    .map(([char, count]) => ({
      char,
      count,
      prob: count / total
    }))
    .sort((a, b) => b.count - a.count); // 按概率降序
}
