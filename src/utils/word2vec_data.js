// src/utils/word2vec_data.js

// 预定义词向量坐标 (2D 模拟)
// 为了演示效果，这些坐标是精心构造的，并非真实训练结果，但符合语义直觉。

export const wordVectors = {
  // --- 国家与首都 (关系：首都 -> 国家) ---
  "北京": { x: 80, y: 80, category: "place" },
  "中国": { x: 90, y: 90, category: "place" },
  "巴黎": { x: 80, y: 20, category: "place" },
  "法国": { x: 90, y: 30, category: "place" },
  "伦敦": { x: 80, y: -20, category: "place" },
  "英国": { x: 90, y: -10, category: "place" },
  "东京": { x: 80, y: 50, category: "place" },
  "日本": { x: 90, y: 60, category: "place" },

  // --- 家庭与性别 (关系：男性 -> 女性) ---
  "男人": { x: -50, y: 50, category: "family" },
  "女人": { x: -30, y: 50, category: "family" },
  "国王": { x: -50, y: 80, category: "family" },
  "女王": { x: -30, y: 80, category: "family" }, // 确保 (女王 - 国王) ≈ (女人 - 男人)
  "爸爸": { x: -50, y: 20, category: "family" },
  "妈妈": { x: -30, y: 20, category: "family" },
  "爷爷": { x: -50, y: 10, category: "family" },
  "奶奶": { x: -30, y: 10, category: "family" },
  "王子": { x: -50, y: 70, category: "family" },
  "公主": { x: -30, y: 70, category: "family" },

  // --- 食物 (聚类) ---
  "苹果": { x: 20, y: -50, category: "food" },
  "香蕉": { x: 30, y: -45, category: "food" },
  "橘子": { x: 25, y: -55, category: "food" },
  "西瓜": { x: 35, y: -50, category: "food" },
  "葡萄": { x: 15, y: -45, category: "food" },

  // --- 动物 (聚类) ---
  "猫": { x: -20, y: -80, category: "animal" },
  "狗": { x: -10, y: -85, category: "animal" },
  "老虎": { x: -25, y: -75, category: "animal" },
  "狮子": { x: -15, y: -70, category: "animal" },
  "兔子": { x: -5, y: -80, category: "animal" },

  // --- 职业与场所 (关系：职业 -> 场所) ---
  "医生": { x: -80, y: -60, category: "job" },
  "医院": { x: -70, y: -50, category: "job" },
  "老师": { x: -80, y: -30, category: "job" },
  "学校": { x: -70, y: -20, category: "job" },
};

export const categories = {
  place: { label: "地理", color: "#3b82f6" }, // blue
  family: { label: "人物/关系", color: "#ef4444" }, // red
  food: { label: "食物", color: "#22c55e" }, // green
  animal: { label: "动物", color: "#eab308" }, // yellow
  job: { label: "职业/场所", color: "#f97316" }, // orange
};

// 计算两个向量的距离 (欧氏距离)
export function getDistance(wordA, wordB) {
  const v1 = wordVectors[wordA];
  const v2 = wordVectors[wordB];
  if (!v1 || !v2) return Infinity;
  return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2));
}

// 寻找最近的 N 个词
export function findNearest(targetVector, n = 5, excludeWord = null) {
  return Object.keys(wordVectors)
    .filter(word => word !== excludeWord)
    .map(word => {
      const v = wordVectors[word];
      const dist = Math.sqrt(Math.pow(v.x - targetVector.x, 2) + Math.pow(v.y - targetVector.y, 2));
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

  // 目标向量坐标
  const targetX = vA.x - vB.x + vC.x;
  const targetY = vA.y - vB.y + vC.y;

  return { x: targetX, y: targetY };
}
