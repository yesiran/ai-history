export const transformerExplanation = [
  {
    title: "RNN 的局限：盲人摸象",
    icon: "Footprints", // 线性足迹
    content: "RNN 读句子就像拿着手电筒走夜路，只能看清脚下的词，前面的还没到，后面的已经模糊了。比如句子：\n\n**‘老王 把 昨天 买 的 那 本 书 借 给 了 小李’**\n\n当 RNN 读到最后的 **‘小李’** 时，它可能已经记不清借给他的是‘书’还是‘钱’了，因为它必须背着沉重的记忆包袱走完全程。",
  },
  {
    title: "Transformer 的革命：上帝视角",
    icon: "Network", // 网络/连接
    content: "Transformer 不再是一个词一个词地读。它像开了灯一样，**瞬间看到了整句话**。\n\n它有一种超能力叫 **‘自注意力 (Self-Attention)’**。每一个词都会同时向句子里所有的词‘发射信号’，询问彼此的关系。\n\n在上面的句子里，**‘借’** 这个字会瞬间抓住 **‘老王’** (谁借的)、**‘书’** (借什么)、**‘小李’** (借给谁)。它不再是线性地处理，而是直接构建了一张**逻辑关系网**。",
  },
  {
    title: "为什么它能理解逻辑？",
    icon: "Zap",
    content: "因为 Transformer 可以**并行**地比较所有词之间的关系。这就好比在一场聚会中，所有人同时都在和别人交换名片。通过这种机制，它能精准地处理长距离的依赖关系（比如开头的主语和结尾的动词），彻底解决了 RNN ‘记性不好’和‘无法建立复杂逻辑’的问题。",
  }
];

export const transformerScenarios = [
  {
    id: 'coreference',
    title: '语义消歧 (指代关系)',
    description: '演示 Attention 机制如何通过上下文确定代词 "it" 的含义',
    sentence: ["The", "animal", "didn't", "cross", "the", "street", "because", "it", "was", "too", "tired"],
    // 重点演示当鼠标悬停在 "it" 上时，它关注谁
    // 权重：0-1
    attention: {
      "it": [
        { target: "animal", weight: 0.9, type: "ref" }, // 强关联，指代对象
        { target: "street", weight: 0.1, type: "ref" },
        { target: "tired", weight: 0.6, type: "adj" },  // 辅助判断词：因为累，所以是动物
      ],
      "tired": [
          { target: "animal", weight: 0.8, type: "adj" },
          { target: "it", weight: 0.7, type: "adj" }
      ]
    }
  },
  {
    id: 'structure',
    title: '逻辑结构构建',
    description: '演示 Transformer 如何瞬间建立主谓宾和修饰关系的逻辑网',
    sentence: ["那", "个", "穿", "红", "裙", "子", "的", "女", "孩", "喜", "欢", "吃", "苹", "果"],
    // 演示复杂的句法依赖
    attention: {
      "女": [ // 女孩
        { target: "那", weight: 0.4, type: "mod" },
        { target: "个", weight: 0.4, type: "mod" },
        { target: "裙", weight: 0.6, type: "mod" }, // 穿红裙子的 -> 女孩
        { target: "子", weight: 0.6, type: "mod" },
        { target: "喜", weight: 0.9, type: "subj" }, // 女孩 -> 喜欢 (主谓)
        { target: "孩", weight: 1.0, type: "self" }
      ],
      "孩": [ // 同 "女"
        { target: "裙", weight: 0.6, type: "mod" },
        { target: "喜", weight: 0.9, type: "subj" },
      ],
      "喜": [ // 喜欢
        { target: "女", weight: 0.9, type: "subj" }, // 谁喜欢？
        { target: "孩", weight: 0.9, type: "subj" },
        { target: "吃", weight: 0.8, type: "verb" }, // 喜欢干嘛？
      ],
      "欢": [ // 同 "喜"
        { target: "女", weight: 0.9, type: "subj" },
        { target: "孩", weight: 0.9, type: "subj" },
        { target: "吃", weight: 0.8, type: "verb" },
      ],
      "吃": [
        { target: "喜", weight: 0.7, type: "verb" },
        { target: "苹", weight: 0.9, type: "obj" }, // 吃什么？苹果
        { target: "果", weight: 0.9, type: "obj" },
      ],
      "苹": [
         { target: "吃", weight: 0.9, type: "obj" }
      ],
      "果": [
         { target: "吃", weight: 0.9, type: "obj" }
      ],
      "裙": [
          { target: "红", weight: 0.8, type: "mod" }, // 红色的 -> 裙子
          { target: "女", weight: 0.5, type: "mod" }, // 裙子修饰 -> 女孩
          { target: "孩", weight: 0.5, type: "mod" },
      ]
    }
  }
];
