// src/utils/word2vec_data.js

// 预定义词向量坐标 (3D 模拟)
// 坐标经过精心设计，模拟真实 Word2Vec 训练结果的分布特征：
// - 同类词聚集但坐标各异（无整数对齐），模拟高维降维后的散布
// - 类比关系通过一致的偏移向量实现：
//     性别 Δ ≈ (+18.4, +3.7, +1.8)
//     首都→国家 Δ ≈ (+8.2, +11.5, +2.4)
//     职业→场所 Δ ≈ (+12.3, +8.6, +3.8)

export const wordVectors = {
  // --- 国家与首都 (关系：首都 → 国家, Δ = +8.2, +11.5, +2.4) ---
  "北京": { x: 76.3, y: 72.8, z: 30.5, category: "place" },
  "中国": { x: 84.5, y: 84.3, z: 32.9, category: "place" },
  "巴黎": { x: 73.8, y: 18.4, z: 27.1, category: "place" },
  "法国": { x: 82.0, y: 29.9, z: 29.5, category: "place" },
  "伦敦": { x: 78.1, y: -15.3, z: 25.8, category: "place" },
  "英国": { x: 86.3, y: -3.8, z: 28.2, category: "place" },
  "东京": { x: 81.6, y: 47.2, z: 33.7, category: "place" },
  "日本": { x: 89.8, y: 58.7, z: 36.1, category: "place" },

  // --- 家庭与性别 (关系：男性 → 女性, Δ = +18.4, +3.7, +1.8) ---
  "男人": { x: -53.2, y: 44.7, z: -19.5, category: "family" },
  "女人": { x: -34.8, y: 48.4, z: -17.7, category: "family" },
  "国王": { x: -48.6, y: 73.2, z: -23.4, category: "family" },
  "女王": { x: -30.2, y: 76.9, z: -21.6, category: "family" },
  "爸爸": { x: -55.8, y: 22.3, z: -16.1, category: "family" },
  "妈妈": { x: -37.4, y: 26.0, z: -14.3, category: "family" },
  "爷爷": { x: -51.3, y: 15.8, z: -15.2, category: "family" },
  "奶奶": { x: -32.9, y: 19.5, z: -13.4, category: "family" },
  "王子": { x: -46.5, y: 67.4, z: -22.7, category: "family" },
  "公主": { x: -28.1, y: 71.1, z: -20.9, category: "family" },

  // --- 食物 (聚类，无类比约束) ---
  "苹果": { x: 18.7, y: -52.4, z: 53.1, category: "food" },
  "香蕉": { x: 28.3, y: -43.8, z: 47.9, category: "food" },
  "橘子": { x: 22.1, y: -58.6, z: 55.4, category: "food" },
  "西瓜": { x: 33.5, y: -47.2, z: 48.8, category: "food" },
  "葡萄": { x: 14.2, y: -46.1, z: 52.6, category: "food" },

  // --- 动物 (聚类，无类比约束) ---
  "猫": { x: -18.6, y: -82.3, z: -57.2, category: "animal" },
  "狗": { x: -8.4, y: -87.1, z: -63.5, category: "animal" },
  "老虎": { x: -26.3, y: -72.8, z: -54.3, category: "animal" },
  "狮子": { x: -13.7, y: -68.5, z: -52.1, category: "animal" },
  "兔子": { x: -3.9, y: -78.4, z: -61.7, category: "animal" },

  // --- 职业与场所 (关系：职业 → 场所, Δ = +12.3, +8.6, +3.8) ---
  "医生": { x: -82.4, y: -55.3, z: 7.6, category: "job" },
  "医院": { x: -70.1, y: -46.7, z: 11.4, category: "job" },
  "老师": { x: -78.7, y: -33.8, z: 5.9, category: "job" },
  "学校": { x: -66.4, y: -25.2, z: 9.7, category: "job" },
};

export const categories = {
  place: { label: "地理", color: "#3b82f6" }, // blue
  family: { label: "人物/关系", color: "#ef4444" }, // red
  food: { label: "食物", color: "#22c55e" }, // green
  animal: { label: "动物", color: "#eab308" }, // yellow
  job: { label: "职业/场所", color: "#f97316" }, // orange
};

// 计算两个向量的距离 (欧氏距离, 3D)
export function getDistance(wordA, wordB) {
  const v1 = wordVectors[wordA];
  const v2 = wordVectors[wordB];
  if (!v1 || !v2) return Infinity;
  return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2 + (v1.z - v2.z) ** 2);
}

// 寻找最近的 N 个词
export function findNearest(targetVector, n = 5, excludeWord = null) {
  return Object.keys(wordVectors)
    .filter(word => word !== excludeWord)
    .map(word => {
      const v = wordVectors[word];
      const dist = Math.sqrt(
        (v.x - targetVector.x) ** 2 +
        (v.y - targetVector.y) ** 2 +
        (v.z - targetVector.z) ** 2
      );
      return { word, dist };
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, n);
}

// 向量运算：A - B + C
export function vectorArithmetic(wordA, wordB, wordC) {
  const vA = wordVectors[wordA];
  const vB = wordVectors[wordB];
  const vC = wordVectors[wordC];

  if (!vA || !vB || !vC) return null;

  return {
    x: vA.x - vB.x + vC.x,
    y: vA.y - vB.y + vC.y,
    z: vA.z - vB.z + vC.z,
  };
}

// 训练模式：7 步训练语料
export const trainingSteps = [
  {
    sentence: "我爱吃 ___ ，味道很甜",
    targetWords: ["苹果", "橘子", "西瓜", "香蕉", "葡萄"],
  },
  {
    sentence: "动物园里有 ___ 和其他动物",
    targetWords: ["猫", "狗", "老虎", "狮子", "兔子"],
  },
  {
    sentence: "___ 是一个伟大的国家",
    targetWords: ["中国", "法国", "英国", "日本"],
  },
  {
    sentence: "___ 是 ___ 的首都",
    targetWords: ["北京", "中国", "巴黎", "法国", "伦敦", "英国", "东京", "日本"],
  },
  {
    sentence: "他是一位 ___",
    targetWords: ["男人", "爸爸", "爷爷", "国王", "王子"],
  },
  {
    sentence: "她是一位 ___",
    targetWords: ["女人", "妈妈", "奶奶", "女王", "公主"],
  },
  {
    sentence: "___ 在 ___ 里工作",
    targetWords: ["医生", "医院", "老师", "学校"],
  },
];

// 生成随机起始位置（训练模式），将 27 个词散布到球体表面
export function generateRandomPositions() {
  const words = Object.keys(wordVectors);
  const positions = {};

  // 简单种子伪随机 (mulberry32)
  let seed = 42;
  function random() {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  words.forEach((word) => {
    const radius = 40 + random() * 60;
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    positions[word] = {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta),
      z: radius * Math.cos(phi),
    };
  });

  return positions;
}
