// 预设的演示场景数据
// 模拟 RNN 在处理不同句子时的内部状态（简化为情感值和解释）

export const rnnScenarios = [
  {
    id: 1,
    title: "情感反转演示",
    type: "sentiment",
    description: "观察否定词如何改变整个句子的情感走向",
    sentence: ["这", "部", "电", "影", "不", "是", "一", "般", "的", "好", "看"],
    // 模拟的每一步状态
    // score: -10 (最负面) 到 10 (最正面), 0 为中性
    steps: [
      { word: "这", score: 0, reason: "开始读取，捕捉主语..." },
      { word: "部", score: 0, reason: "量词，还在等待核心内容" },
      { word: "电", score: 0, reason: "识别到对象：电影" },
      { word: "影", score: 0, reason: "识别到对象：电影" },
      { word: "不", score: -5, reason: "⚠️ 警报！检测到否定词，预测可能是负面评价" },
      { word: "是", score: -5, reason: "保持警惕..." },
      { word: "一", score: -4, reason: "..." },
      { word: "般", score: -2, reason: "检测到程度修饰 '一般'，语气似乎在缓和？" },
      { word: "的", score: -1, reason: "等待最终形容词..." },
      { word: "好", score: 5, reason: "🔄 反转！'不是一般的好' -> 双重强调！" },
      { word: "看", score: 8, reason: "✅ 确认为极高评价！记忆结合：否定+一般+好 = 极好" },
    ],
  },
  {
    id: 2,
    title: "长距离记忆与生成",
    type: "generation",
    description: "演示 RNN 如何记住早期的关键信息并用于后续生成",
    sentence: ["我", "在", "法", "国", "长", "大", "，", "（", "…", "）", "所", "以", "我", "会", "说", "一", "口", "流", "利", "的"],
    steps: [
      { word: "我", score: 0, reason: "主语输入" },
      { word: "在", score: 0, reason: "介词..." },
      { word: "法", score: 0, memory: "France", reason: "🌍 捕捉到关键地点信息：法国" },
      { word: "国", score: 0, memory: "France", reason: "确认地点：法国。写入长时记忆。" },
      { word: "长", score: 0, memory: "France", reason: "动作：长大" },
      { word: "大", score: 0, memory: "France", reason: "动作：长大" },
      { word: "，", score: 0, memory: "France", reason: "逗号。记忆保持中..." },
      { word: "（", score: 0, memory: "France", reason: "跳过中间的一百句废话..." },
      { word: "…", score: 0, memory: "France", reason: "记忆 'Location: France' 依然在传递" },
      { word: "）", score: 0, memory: "France", reason: "..." },
      { word: "所", score: 0, memory: "France", reason: "连接词：所以" },
      { word: "以", score: 0, memory: "France", reason: "准备输出结论" },
      { word: "我", score: 0, memory: "France", reason: "主语" },
      { word: "会", score: 0, memory: "France", reason: "能力..." },
      { word: "说", score: 0, memory: "France", reason: "动作：说" },
      { word: "一", score: 0, memory: "France", reason: "量词" },
      { word: "口", score: 0, memory: "France", reason: "量词" },
      { word: "流", score: 0, memory: "France", reason: "形容词" },
      { word: "利", score: 0, memory: "France", reason: "形容词" },
      { word: "的", score: 0, memory: "France", prediction: "法语", reason: "✨ 激活记忆！地点是法国 -> 预测语言是：法语" },
    ],
  },
  {
    id: 3,
    title: "语序的重要性",
    type: "sentiment",
    description: "相同的词汇，不同的顺序：演示 RNN 如何识别主谓宾结构",
    sentence: ["他", "狠", "狠", "地", "打", "了", "我"],
    steps: [
        { word: "他", score: 0, reason: "主语：他 (潜在的动作发起者)" },
        { word: "狠", score: -2, reason: "修饰词：带有攻击性..." },
        { word: "狠", score: -4, reason: "程度加深..." },
        { word: "地", score: -4, reason: "..." },
        { word: "打", score: -8, reason: "⚠️ 动作确认：打！结合前文 -> 他在打人" },
        { word: "了", score: -8, reason: "动作已发生" },
        { word: "我", score: -10, reason: "🛑 宾语：我。结论：我被打了 (受伤/负面)" },
    ]
  }
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