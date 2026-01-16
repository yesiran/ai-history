export const rlExplanation = [
  {
    title: "Transformer 的天花板：人类数据",
    icon: "Database",
    content: "前四个阶段（N-Gram 到 Transformer）本质上都是在**模仿人类**。它们阅读了互联网上所有的人类文字，所以它们最聪明也只能达到全人类知识的总和（AGI 雏形）。\n\n但是，如果人类自己都治不好癌症，或者算不出可控核聚变公式，喂再多数据给 Transformer，它也给不出答案。**模仿永远无法超越被模仿者。**",
  },
  {
    title: "强化学习：打破数据的枷锁",
    icon: "Rocket",
    content: "强化学习 (RL) 引入了全新的范式：**探索 (Exploration) 与 奖励 (Reward)**。\n\n它不再依赖人类告诉它“怎么做”，而是通过在环境中不断试错、自我博弈来学习。就像 AlphaGo，它没有一直背棋谱，而是通过几亿次的左右互搏，发现了人类几千年棋史中从未见过的“神之一手”。",
  },
  {
    title: "通往 ASI (超级人工智能) 之路",
    icon: "Cpu", // 或 Sparkles
    content: "未来的 AI 训练范式，将是从 **Pre-training (预训练)** 转向 **Post-training (强化推理)**。\n\n比如 OpenAI 的 o1 模型，通过强化学习学会了“慢思考”。当 AI 开始通过自我进化解决人类无法解决的问题时，我们就跨越了 AGI，迈向了 **ASI (Super Artificial Intelligence)**。Transformer 给了 AI 广博的知识，而 RL 将赋予 AI 深邃的智慧。",
  }
];

export const rlScenarios = [
  {
    id: 'pathfinding',
    title: '模仿 vs 进化',
    description: '对比“模仿人类经验”与“RL 自我探索”在解决问题上的本质区别',
  }
];
