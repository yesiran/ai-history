// 简单的中文 N-gram 实现

export const defaultCorpus = [
  "我喜欢吃苹果",
  "我喜欢吃香蕉",
  "我喜欢吃西瓜",
  "我喜欢看电影",
  "他喜欢吃苹果",
  "他喜欢看书",
  "她喜欢吃水果",
  "人工智能很有趣",
  "人工智能改变世界",
  "人工智能是未来",
  "人工智能很厉害",
  "机器学习是人工智能的核心",
  "机器学习很有趣",
  "深度学习是机器学习的分支",
  "深度学习很有趣",
  "深度学习改变世界",
  "我们都有美好的未来",
  "我们一起去吃饭",
  "我们一起去学习",
  "我们一起去旅游",
  "今天天气真好",
  "今天天气不错",
  "今天我们去学习",
  "明天天气真好",
  "学习人工智能",
];

/**
 * 训练 N-gram 模型
 * @param {string[]} corpus - 语料库（句子数组）
 * @param {number} n - 上下文窗口大小（N=2 表示看前 2 个字猜下一个）
 * @returns {Object} 模型对象，key 为 n 个字的上下文，value 为 {下一个字: 出现次数}
 */
export function trainNGram(corpus, n) {
  const model = {};

  corpus.forEach(sentence => {
    // 用前 n 个字作为 context，第 n+1 个字作为 target
    for (let i = 0; i <= sentence.length - n - 1; i++) {
      const context = sentence.slice(i, i + n);
      const target = sentence[i + n];

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
 * @param {number} n - 上下文窗口大小
 * @returns {Array} 预测结果数组 [{char: '字', prob: 0.5, count: 5}, ...]
 */
export function predictNext(model, currentText, n) {
  if (!currentText || currentText.length < n) return [];

  // 取最后 n 个字作为上下文
  const context = currentText.slice(-n);

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
    .sort((a, b) => b.count - a.count);
}
