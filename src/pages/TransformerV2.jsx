import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/* ════════════════════════════════════════════════════════════════
   Transformer V2 — 阅卷大楼 (3D版)
   ════════════════════════════════════════════════════════════════ */

/* ── 字号上下文 ── */
const FontSizeCtx = createContext('M');
const FONT_SCALES = { S: 0.85, M: 1, L: 1.2 };
function useFontSize() {
  const size = useContext(FontSizeCtx);
  const s = FONT_SCALES[size] || 1;
  return { scale: s, px: (base) => Math.round(base * s) };
}

function FontSizeSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-slate-800/80 rounded-md px-1.5 py-0.5 border border-slate-700/50">
      <span className="text-[9px] text-slate-500 mr-0.5">字号</span>
      {['S', 'M', 'L'].map((s) => (
        <button key={s} onClick={() => onChange(s)}
          className={`w-5 h-5 rounded text-[10px] font-bold transition-all ${
            value === s ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white hover:bg-slate-700'
          }`}>{s}</button>
      ))}
    </div>
  );
}

const INPUT_TEXT = '我舅舅参与了苹果手机开发，我有一个亲戚他在乔布斯创办的公司工作了10年，这个亲戚是我的什么';
const TOKENS = ['我','舅舅','参与了','苹果','手机','开发','，','我','有','一个','亲戚','他','在','乔布斯','创办的','公司','工作了','10年','，','这个','亲戚','是','我的','什么'];
const PREDICTED = '舅舅';

const FLOOR_SYNTHESIS = [
  '"舅舅"和"亲戚"分别出现在第①段和第②③段，而"什么"是疑问词 → 后面的段落很可能是在问第一段提到的某个人',
  '"舅舅"和"他"在句中都做主语（做事的人），角色相似；问句在问"亲戚"到底是谁 → 需要确定这两个主语是否有关联',
  '重大线索！"苹果手机开发"和"乔布斯创办的公司"都指向Apple → 第①②段说的是同一个工作场所！"舅舅"和"他"很可能就是同一人',
  '逻辑闭环！舅舅 = 一个亲戚 = 这个亲戚 = 他（指代消解完成）→ 第一段直接说了"我舅舅" → 答案确认是"舅舅"',
  '"舅舅"在第一段被直接提到 + 指代链完全确认 → 62% 概率远超其他候选 → 输出"舅舅"',
];

const FLOORS = [
  {
    label: '1F', name: '字词识别层', color: '#818cf8',
    inputNote: null,
    heads: [
      {
        icon: '👀', name: '相邻搭配', color: '#818cf8',
        arcs: [[0,1,0.9],[3,4,0.85],[4,5,0.9],[13,14,0.85],[14,15,0.9],[16,17,0.8]],
        finding: '我+舅舅、苹果+手机+开发、乔布斯+创办的+公司、工作了+10年',
      },
      {
        icon: '✂️', name: '分句断句', color: '#a78bfa',
        arcs: [[5,6,0.8],[6,7,0.8],[17,18,0.8],[18,19,0.8]],
        finding: '3段：①舅舅参与苹果开发 ②亲戚在公司工作10年 ③亲戚是我的什么',
      },
      {
        icon: '📐', name: '词性标注', color: '#c4b5fd',
        arcs: [],
        finding: '舅舅=名词、苹果=名词、乔布斯=专名、什么=疑问词',
      },
    ],
  },
  {
    label: '2F', name: '语法关系层', color: '#c084fc',
    inputNote: '基于 1F：卡片已标注词组边界（舅舅、苹果手机、乔布斯等）→ 现在可以分析词组之间的语法关系',
    heads: [
      {
        icon: '🏷️', name: '修饰嵌套', color: '#c084fc',
        arcs: [[13,15,0.9],[14,15,0.95]],
        finding: '因为 1F 已识别"乔布斯""创办的""公司"→ 现在发现"乔布斯创办的"修饰"公司"',
      },
      {
        icon: '⚡', name: '动作结构', color: '#d8b4fe',
        arcs: [[1,2,0.8],[11,16,0.85],[12,15,0.75]],
        finding: '因为 1F 已识别"舅舅""工作了"→ 现在发现 舅舅→参与了、他→在公司工作了10年',
      },
      {
        icon: '❓', name: '疑问句式', color: '#e9d5ff',
        arcs: [[21,22,0.9],[22,23,0.85],[19,20,0.8]],
        finding: '因为 1F 标注"什么"=疑问词 → 现在识别出"这个亲戚是我的什么"是身份提问句',
      },
    ],
  },
  {
    label: '3F', name: '语义理解层', color: '#f472b6',
    inputNote: '基于 1F+2F：卡片已含词组+语法结构 → 现在可以做语义级别的理解和实体识别',
    heads: [
      {
        icon: '🏢', name: '实体识别', color: '#f472b6',
        arcs: [[3,5,0.85],[13,15,0.9]],
        finding: '因为 2F 已建立"苹果+手机+开发"和"乔布斯+创办的+公司"→ 现在识别出两者都指 Apple！',
      },
      {
        icon: '👨‍👩‍👦', name: '关系类型', color: '#fb7185',
        arcs: [[22,23,0.85],[0,1,0.7]],
        finding: '因为 2F 已识别疑问句式 → 现在确认问的是亲属关系，注意到第一段有"我舅舅"',
      },
      {
        icon: '🧑‍💼', name: '人物画像', color: '#fda4af',
        arcs: [[11,16,0.7],[11,17,0.7]],
        finding: '因为 2F 已建立"他→在公司工作了→10年"→ 现在推断"他"是成年男性、资深员工',
      },
    ],
  },
  {
    label: '4F', name: '上下文整合层', color: '#fb923c',
    inputNote: '基于 1F+2F+3F：卡片已含词组+语法+语义（Apple=同一公司）→ 现在可以跨段落整合推理',
    heads: [
      {
        icon: '🔗', name: '指代消解', color: '#fb923c',
        arcs: [[1,10,0.95],[1,20,0.95],[10,20,0.9],[11,1,0.9]],
        finding: '因为 3F 确认了同一家公司 → 现在确认"舅舅"="亲戚"="他"全是同一人！',
      },
      {
        icon: '📊', name: '信息汇聚', color: '#fdba74',
        arcs: [[3,23,0.5],[13,23,0.5],[1,23,0.9],[17,23,0.4]],
        finding: '前 3 层的所有线索（苹果+乔布斯+10年+舅舅）→ 全部汇聚到"什么"这个位置',
      },
      {
        icon: '🧩', name: '逻辑推理', color: '#fed7aa',
        arcs: [[0,22,0.6],[1,23,0.95]],
        finding: '指代链完成 + 线索汇聚 → 第一段直接说了"我舅舅" → 答案就是"舅舅"',
      },
    ],
  },
  {
    label: '5F', name: '预测决策层', color: '#4ade80',
    inputNote: '基于 1-4F 全部分析：指代链+实体+语义+语法全部就位 → 做最终决策',
    heads: [
      {
        icon: '🎲', name: '候选生成', color: '#4ade80',
        arcs: [],
        finding: '候选词：舅舅、叔叔、哥哥、爸爸、朋友...',
      },
      {
        icon: '⚖️', name: '概率排序', color: '#86efac',
        arcs: [],
        finding: '舅舅 62% >> 叔叔 15% >> 哥哥 8% >> 其他',
      },
      {
        icon: '✅', name: '最终输出', color: '#bbf7d0',
        arcs: [],
        finding: '输出预测：舅舅 ✓',
      },
    ],
  },
];

const TOTAL = 13;
const FH = 2.2;

function getPhaseInfo(phase) {
  if (phase === 0) return { type: 'overview' };
  if (phase === 1) return { type: 'tokenize' };
  if (phase === 2) return { type: 'enter' };
  if (phase === TOTAL - 1) return { type: 'output' };
  const p = phase - 3;
  const fi = Math.floor(p / 2);
  if (p % 2 === 1) return { type: 'pass', floorIdx: fi + 1 };
  return { type: 'floor', floorIdx: fi };
}

/* ── Token 位置 ── */
const TCOLS = 12;
const TSX = 0.58;
const TSZ = 0.72;
function tpos(idx, baseY) {
  const row = Math.floor(idx / TCOLS);
  const col = idx % TCOLS;
  const rowLen = Math.min(TCOLS, TOKENS.length - row * TCOLS);
  return [(col - (rowLen - 1) / 2) * TSX, baseY, 1.6 - row * TSZ];
}

/* ═══════════════════════════════════════════════
   3D Components
   ═══════════════════════════════════════════════ */

/* ── 相机控制器（到达目标后自动让位给 OrbitControls） ── */
function CameraController({ phase }) {
  const { camera } = useThree();
  const tgt = useRef(new THREE.Vector3(10, 7, 14));
  const look = useRef(new THREE.Vector3(0, 4, 0));
  const lookNow = useRef(new THREE.Vector3(0, 4, 0));
  const settled = useRef(false);
  const prevPhase = useRef(phase);

  useEffect(() => {
    if (prevPhase.current !== phase) {
      settled.current = false;
      prevPhase.current = phase;
    }
    const info = getPhaseInfo(phase);
    if (info.type === 'overview') {
      tgt.current.set(9, 7, 13); look.current.set(0, 3.5, 0);
    } else if (info.type === 'tokenize') {
      tgt.current.set(0, 2, 14); look.current.set(0, 1.5, 0);
    } else if (info.type === 'enter') {
      tgt.current.set(0, 1.5, 8); look.current.set(0, 0.8, 0);
    } else if (info.type === 'floor') {
      const y = info.floorIdx * FH + 1.2;
      tgt.current.set(0.5, y + 1.6, 8); look.current.set(0, y + 0.2, 0);
    } else if (info.type === 'pass') {
      const y = (info.floorIdx - 0.5) * FH + 1.5;
      tgt.current.set(3, y + 2, 9); look.current.set(0, y + 0.5, 0);
    } else if (info.type === 'output') {
      const y = 4 * FH + 2;
      tgt.current.set(0, y + 2, 10); look.current.set(0, y, 0);
    }
  }, [phase]);

  useFrame((_, dt) => {
    if (settled.current) return;
    const s = 1 - Math.exp(-4.5 * dt);
    camera.position.lerp(tgt.current, s);
    lookNow.current.lerp(look.current, s);
    camera.lookAt(lookNow.current);
    if (camera.position.distanceTo(tgt.current) < 0.1) settled.current = true;
  });
  return null;
}

/* ── 3D大楼外观 ── */
function Building3D({ activeFloor }) {
  return (
    <group>
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[8, 0.3, 5]} />
        <meshStandardMaterial color="#5a6a7e" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.05, 2.2]}>
        <boxGeometry args={[3, 0.1, 0.8]} />
        <meshStandardMaterial color="#5a6578" roughness={0.7} />
      </mesh>
      {FLOORS.map((floor, i) => {
        const y = i * FH + 1;
        const isActive = activeFloor === i;
        return (
          <group key={i} position={[0, y, 0]}>
            <mesh>
              <boxGeometry args={[7, FH - 0.1, 4.5]} />
              <meshStandardMaterial color={isActive ? floor.color : '#1e2d42'} transparent opacity={isActive ? 0.4 : 0.35} emissive={floor.color} emissiveIntensity={isActive ? 0.35 : 0.15} />
            </mesh>
            <mesh position={[0, FH / 2 - 0.05, 0]}>
              <boxGeometry args={[7.05, 0.06, 4.55]} />
              <meshStandardMaterial color={floor.color} transparent opacity={isActive ? 0.7 : 0.4} />
            </mesh>
            {[-2.4, -0.8, 0.8, 2.4].map((wx, wi) => (
              <mesh key={wi} position={[wx, 0, 2.26]}>
                <planeGeometry args={[1.2, 1.2]} />
                <meshStandardMaterial color={isActive ? floor.color : '#1a2540'} emissive={floor.color} emissiveIntensity={isActive ? 0.5 : 0.15} transparent opacity={0.7} />
              </mesh>
            ))}
            <Html position={[3.8, 0, 2.3]} center distanceFactor={12}>
              <div style={{ color: floor.color, fontSize: 18, fontWeight: 900, whiteSpace: 'nowrap', textShadow: `0 0 12px ${floor.color}` }}>{floor.label}</div>
            </Html>
          </group>
        );
      })}
      <mesh position={[0, 0.6, 2.3]}>
        <boxGeometry args={[1.6, 1.2, 0.1]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} emissive="#8B4513" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.65, 2.32]}>
        <boxGeometry args={[1.8, 1.35, 0.03]} />
        <meshStandardMaterial color="#B8652E" />
      </mesh>
      <Html position={[0, 1.45, 2.35]} center distanceFactor={10}>
        <div style={{ background: 'rgba(0,0,0,0.7)', padding: '2px 10px', borderRadius: 4, border: '1px solid #818cf8', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 700 }}>🏢 Transformer 阅卷大楼</span>
        </div>
      </Html>
      <mesh position={[0, FLOORS.length * FH + 0.7, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[5, 1.5, 4]} />
        <meshStandardMaterial color="#3d4f66" roughness={0.6} />
      </mesh>
      <mesh position={[0, FLOORS.length * FH + 1.8, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[0, FLOORS.length * FH + 2.4, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#131b2e" roughness={1} />
      </mesh>
    </group>
  );
}

/* ── 聚光灯阅卷员（Attention Head） ── */
function ReviewerDesk3D({ head, hi, x, baseY, isWorking, showFinding }) {
  const coneRef = useRef();
  const lensRef = useRef();
  const { px } = useFontSize();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coneRef.current) {
      coneRef.current.material.opacity = isWorking ? 0.18 + Math.sin(t * 2.5 + hi) * 0.06 : 0.03;
    }
    if (lensRef.current) {
      lensRef.current.material.emissiveIntensity = isWorking ? 0.6 + Math.sin(t * 3 + hi) * 0.3 : 0.08;
    }
  });

  return (
    <group position={[x, baseY, -0.8]}>
      {/* 桌面 */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[1.4, 0.05, 0.9]} />
        <meshStandardMaterial color="#1e293b" emissive={head.color} emissiveIntensity={isWorking ? 0.05 : 0} />
      </mesh>
      {[[-0.6,0.14,-0.35],[0.6,0.14,-0.35],[-0.6,0.14,0.35],[0.6,0.14,0.35]].map((p,i) => (
        <mesh key={i} position={p}><boxGeometry args={[0.04,0.28,0.04]} /><meshStandardMaterial color="#334155" /></mesh>
      ))}

      {/* ── 聚光灯外形 ── */}
      {/* 灯座（圆柱） */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.12, 12]} />
        <meshStandardMaterial color="#2d3748" roughness={0.5} />
      </mesh>
      {/* 灯罩（倒圆锥） */}
      <mesh position={[0, 0.82, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.16, 0.2, 16]} />
        <meshStandardMaterial color={head.color} transparent opacity={isWorking ? 0.85 : 0.35} emissive={head.color} emissiveIntensity={isWorking ? 0.3 : 0.05} metalness={0.4} roughness={0.3} />
      </mesh>
      {/* 镜头（发光透镜） */}
      <mesh ref={lensRef} position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#ffffff" emissive={head.color} emissiveIntensity={0.08} transparent opacity={isWorking ? 0.95 : 0.3} />
      </mesh>
      {/* 光锥（工作时向下投射） */}
      <mesh ref={coneRef} position={[0, 0.38, 0.3]} rotation={[0.25, 0, 0]}>
        <coneGeometry args={[0.6, 0.7, 16, 1, true]} />
        <meshBasicMaterial color={head.color} transparent opacity={0.03} side={THREE.DoubleSide} />
      </mesh>
      {/* 聚光灯实际光源 */}
      {isWorking && (
        <pointLight position={[0, 0.7, 0]} intensity={0.4} color={head.color} distance={2.5} />
      )}

      {/* icon + name 标签 */}
      <Html position={[0, 1.15, 0]} center zIndexRange={[20, 10]}>
        <div style={{ textAlign: 'center', opacity: isWorking ? 1 : 0.5, transition: 'opacity 0.3s' }}>
          <div style={{ fontSize: px(20) }}>{head.icon}</div>
          <div style={{ fontSize: px(11), fontWeight: 700, color: head.color, whiteSpace: 'nowrap', marginTop: 2 }}>{head.name}</div>
        </div>
      </Html>

      {/* 发现信息气泡 */}
      {showFinding && (
        <Html position={[0, -0.15, 0.6]} center zIndexRange={[5, 1]}>
          <div style={{
            background: 'rgba(0,0,0,0.88)',
            border: `1px solid ${head.color}50`,
            borderRadius: 8,
            padding: '7px 11px',
            width: 210,
            backdropFilter: 'blur(6px)',
            boxShadow: `0 0 12px ${head.color}20`,
          }}>
            <div style={{ fontSize: px(12), color: '#e2e8f0', lineHeight: 1.5, whiteSpace: 'normal' }}>{head.finding}</div>
            <div style={{ fontSize: px(10), color: head.color, marginTop: 3, fontWeight: 700 }}>📝 已记录</div>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ── 3D楼层房间 ── */
function FloorRoom3D({ floorIdx, floorStage }) {
  const floor = FLOORS[floorIdx];
  const by = floorIdx * FH + 0.05;
  const c = floor.color;

  return (
    <group>
      {/* 地板 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, by, 0.4]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#0d1320" />
      </mesh>
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={`v${i}`} position={[i - 5, by + 0.005, 0.4]}>
          <boxGeometry args={[0.008, 0.008, 5]} />
          <meshBasicMaterial color={c} transparent opacity={0.18} />
        </mesh>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`h${i}`} position={[0, by + 0.005, i - 2.1]}>
          <boxGeometry args={[10, 0.008, 0.008]} />
          <meshBasicMaterial color={c} transparent opacity={0.18} />
        </mesh>
      ))}

      {/* 后墙 */}
      <mesh position={[0, by + 1.1, -2]}>
        <planeGeometry args={[10, 2.2]} />
        <meshStandardMaterial color={c} transparent opacity={0.15} emissive={c} emissiveIntensity={0.1} side={THREE.DoubleSide} />
      </mesh>
      <Html position={[0, by + 1.85, -1.95]} center distanceFactor={14}>
        <div style={{ color: c, fontSize: 22, fontWeight: 900, opacity: 0.5, whiteSpace: 'nowrap' }}>
          {floor.label} {floor.name}
        </div>
      </Html>

      {/* 侧墙 */}
      <mesh position={[-5, by + 1.1, 0.4]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[5, 2.2]} />
        <meshStandardMaterial color={c} transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[5, by + 1.1, 0.4]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[5, 2.2]} />
        <meshStandardMaterial color={c} transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>

      {/* 天花板 + 灯条 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, by + 2.15, 0.4]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color={c} transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, by + 2.1, 0.5]}>
        <boxGeometry args={[6, 0.02, 0.1]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.4} transparent opacity={0.6} />
      </mesh>

      {/* 3个阅卷员 */}
      {floor.heads.map((head, hi) => (
        <ReviewerDesk3D key={hi} head={head} hi={hi} x={(hi - 1) * 3.2} baseY={by}
          isWorking={floorStage >= 1} showFinding={floorStage >= 2} />
      ))}

      {/* 长桌 */}
      <mesh position={[0, by + 0.18, 1.2]}>
        <boxGeometry args={[8.5, 0.04, 1.6]} />
        <meshStandardMaterial color="#151d2e" emissive={c} emissiveIntensity={0.02} />
      </mesh>

      {/* Token卡片 */}
      {TOKENS.map((t, i) => {
        const [x, , z] = tpos(i, 0);
        const y = by + 0.22;
        const referenced = floor.heads.some(h => h.arcs.some(([f, t2]) => f === i || t2 === i));
        return (
          <group key={i} position={[x, y, z]}>
            {Array.from({ length: floorIdx }).map((_, li) => (
              <mesh key={li} position={[0, -0.012 - li * 0.012, 0]}>
                <boxGeometry args={[0.42, 0.01, 0.3]} />
                <meshStandardMaterial color={FLOORS[li].color} transparent opacity={0.4} emissive={FLOORS[li].color} emissiveIntensity={0.15} />
              </mesh>
            ))}
            <RoundedBox args={[0.42, 0.035, 0.3]} radius={0.015} smoothness={4}>
              <meshStandardMaterial
                color="#ffffff"
                emissive={referenced && floorStage >= 1 ? c : '#4466aa'}
                emissiveIntensity={referenced && floorStage >= 1 ? 0.2 : 0.06}
              />
            </RoundedBox>
            <Html center distanceFactor={10} position={[0, 0.03, 0]}>
              <div style={{
                fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap', userSelect: 'none',
                color: referenced && floorStage >= 1 ? '#0f172a' : '#475569',
                textShadow: referenced && floorStage >= 1 ? `0 0 4px ${c}60` : 'none',
              }}>{t}</div>
            </Html>
          </group>
        );
      })}

      {/* 弧线 */}
      {floorStage >= 1 && floor.heads.map((head, hi) =>
        head.arcs.map(([from, to, weight], ai) => {
          const p1 = tpos(from, by + 0.26);
          const p2 = tpos(to, by + 0.26);
          const dist = Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[2] - p1[2]) ** 2);
          const midX = (p1[0] + p2[0]) / 2;
          const midY = by + 0.26 + dist * 0.22 + 0.25 + hi * 0.12;
          const midZ = (p1[2] + p2[2]) / 2 + 0.1;
          const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(p1[0], p1[1], p1[2]),
            new THREE.Vector3(midX, midY, midZ),
            new THREE.Vector3(p2[0], p2[1], p2[2]),
          );
          const pts = curve.getPoints(24);
          return (
            <line key={`${hi}-${ai}`}>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={pts.length}
                  array={new Float32Array(pts.flatMap(p => [p.x, p.y, p.z]))} itemSize={3} />
              </bufferGeometry>
              <lineBasicMaterial color={head.color} transparent opacity={0.35 + weight * 0.4} />
            </line>
          );
        })
      )}

      {/* 汇总标记已移至底部2D面板 */}

      {/* 前几层报告堆 */}
      {floorIdx > 0 && (
        <group position={[4.2, by + 0.05, -1.3]}>
          {Array.from({ length: floorIdx }).map((_, pi) => (
            <group key={pi} position={[0, pi * 0.09, 0]}>
              <RoundedBox args={[1.2, 0.06, 0.5]} radius={0.02} smoothness={4}>
                <meshStandardMaterial color={FLOORS[pi].color} transparent opacity={0.4} emissive={FLOORS[pi].color} emissiveIntensity={0.2} />
              </RoundedBox>
              <Html center distanceFactor={12} position={[0, 0.04, 0]}>
                <div style={{ fontSize: 10, color: FLOORS[pi].color, fontWeight: 600, whiteSpace: 'nowrap', opacity: 0.8 }}>✓ {FLOORS[pi].label}</div>
              </Html>
            </group>
          ))}
          <Html center distanceFactor={12} position={[0, floorIdx * 0.09 + 0.06, 0]}>
            <div style={{ fontSize: 9, color: '#94a3b8', whiteSpace: 'nowrap' }}>前{floorIdx}层报告</div>
          </Html>
        </group>
      )}

      {/* 灯光 */}
      <pointLight position={[0, by + 1.8, 1]} intensity={0.5} color={c} distance={5} />
      <pointLight position={[-3, by + 1, 0.5]} intensity={0.2} color="#ffffff" distance={4} />
      <pointLight position={[3, by + 1, 0.5]} intensity={0.2} color="#ffffff" distance={4} />
    </group>
  );
}

/* ── Pass过渡场景：报告+卡片一起上行 ── */
function PassScene3D({ fromIdx, toIdx }) {
  const groupRef = useRef();
  const fromFloor = FLOORS[fromIdx];
  const midY = (fromIdx + 0.5) * FH + 1;

  useFrame((state) => {
    if (groupRef.current) groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.12;
  });

  return (
    <group>
      <group ref={groupRef}>
        {/* 上行的token卡片 */}
        {TOKENS.map((t, i) => {
          const [x, , z] = tpos(i, 0);
          return (
            <group key={i} position={[x * 0.7, midY, z * 0.7]}>
              {Array.from({ length: fromIdx + 1 }).map((_, li) => (
                <mesh key={li} position={[0, -0.008 - li * 0.008, 0]}>
                  <boxGeometry args={[0.3, 0.008, 0.22]} />
                  <meshStandardMaterial color={FLOORS[li].color} transparent opacity={0.5} emissive={FLOORS[li].color} emissiveIntensity={0.2} />
                </mesh>
              ))}
              <RoundedBox args={[0.3, 0.025, 0.22]} radius={0.01} smoothness={4}>
                <meshStandardMaterial color="#e2e8f0" />
              </RoundedBox>
            </group>
          );
        })}
        {/* 一起上行的汇总报告（仅3D视觉，文字在2D面板中） */}
        <group position={[0, midY + 0.5, 0.8]}>
          <RoundedBox args={[1.8, 0.06, 0.45]} radius={0.02} smoothness={4}>
            <meshStandardMaterial color={fromFloor.color} transparent opacity={0.4} emissive={fromFloor.color} emissiveIntensity={0.3} />
          </RoundedBox>
        </group>
      </group>
      {/* 上升粒子 */}
      {Array.from({ length: 6 }).map((_, i) => (
        <UpParticle key={i} x={(i - 2.5) * 1.2} baseY={midY - 1} color={fromFloor.color} delay={i * 0.3} />
      ))}
      <pointLight position={[0, midY, 3]} intensity={0.3} color={fromFloor.color} distance={4} />
    </group>
  );
}

function UpParticle({ x, baseY, color, delay }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = ((state.clock.elapsedTime + delay) % 2) / 2;
    ref.current.position.y = baseY + t * 3;
    ref.current.material.opacity = t < 0.5 ? t * 0.8 : (1 - t) * 0.8;
  });
  return (
    <mesh ref={ref} position={[x, baseY, 2]}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0} />
    </mesh>
  );
}

const STARS = Array.from({ length: 80 }, () => ({
  pos: [(Math.random() - 0.5) * 40, Math.random() * 20 + 2, -5 - Math.random() * 15],
  size: 0.03 + Math.random() * 0.04,
  op: 0.5 + Math.random() * 0.5,
}));

/* ── 底部汇总面板（独立组件，使用字号上下文） ── */
function FloorSummaryPanel({ floorIdx }) {
  const { px } = useFontSize();
  const floor = FLOORS[floorIdx];
  return (
    <motion.div
      className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}>
      <div className="rounded-xl px-5 py-3" style={{
        background: 'rgba(8,12,20,0.92)',
        border: `1px solid ${floor.color}30`,
        backdropFilter: 'blur(10px)',
        maxWidth: 620,
      }}>
        <div className="flex items-start gap-4">
          {/* 左侧：阅卷员头像列表 */}
          <div className="flex flex-col gap-1.5 shrink-0 pt-0.5">
            {floor.heads.map((h, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: `${h.color}12` }}>
                <span style={{ fontSize: px(14) }}>{h.icon}</span>
                <span className="font-bold" style={{ color: h.color, fontSize: px(10) }}>{h.name}</span>
              </div>
            ))}
          </div>
          {/* 右侧：综合新发现 */}
          <div className="flex-1 rounded-lg px-3 py-2" style={{
            background: `${floor.color}12`,
            border: `1px solid ${floor.color}35`,
          }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span style={{ fontSize: px(13) }}>💡</span>
              <span className="font-bold" style={{ color: floor.color, fontSize: px(12) }}>
                {floor.label} 综合新发现
              </span>
            </div>
            <div className="text-slate-200 leading-relaxed" style={{ fontSize: px(12) }}>
              {FLOOR_SYNTHESIS[floorIdx]}
            </div>
            {floorIdx < 4 && (
              <div className="mt-1.5" style={{ color: floor.color + '80', fontSize: px(10) }}>
                → 报告与卡片送往 {FLOORS[floorIdx + 1].label} {FLOORS[floorIdx + 1].name}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── 3D场景总控 ── */
function BuildingScene({ phase, floorStage }) {
  const info = getPhaseInfo(phase);
  const showBuilding = info.type === 'overview' || info.type === 'enter';

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 12, 6]} intensity={0.9} />
      <pointLight position={[0, 3, 6]} intensity={0.25} color="#818cf8" />
      <CameraController phase={phase} />

      {/* Overview 旋转 */}
      {info.type === 'overview' && (
        <OrbitControls enableZoom={false} enablePan={false}
          minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.2}
          autoRotate autoRotateSpeed={1.5} />
      )}

      {/* 楼层可旋转 */}
      {info.type === 'floor' && (
        <OrbitControls
          target={[0, info.floorIdx * FH + 0.8, 0.8]}
          enableZoom={false} enablePan={false}
          minPolarAngle={0.4} maxPolarAngle={Math.PI / 2}
          minAzimuthAngle={-Math.PI / 3} maxAzimuthAngle={Math.PI / 3}
        />
      )}

      {(showBuilding || info.type === 'output') && (
        <Building3D activeFloor={info.type === 'overview' ? -1 : info.type === 'output' ? 4 : 0} />
      )}
      {info.type === 'floor' && <FloorRoom3D floorIdx={info.floorIdx} floorStage={floorStage} />}
      {info.type === 'pass' && <PassScene3D fromIdx={info.floorIdx - 1} toIdx={info.floorIdx} />}
      {info.type === 'output' && <pointLight position={[0, 4 * FH + 2, 4]} intensity={0.8} color="#4ade80" distance={8} />}

      {STARS.map((s, i) => (
        <mesh key={i} position={s.pos}>
          <sphereGeometry args={[s.size, 4, 4]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={s.op} />
        </mesh>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════
   2D Overlays
   ═══════════════════════════════════════════════ */

function FloorProgress({ activeFloor }) {
  return (
    <div className="flex items-center gap-0.5">
      {FLOORS.map((f, i) => {
        const isActive = i === activeFloor;
        const isDone = activeFloor > i;
        return (
          <React.Fragment key={i}>
            <div className="px-2 py-0.5 rounded text-[10px] font-bold transition-all duration-300"
              style={{ backgroundColor: isActive ? f.color + '25' : 'transparent', color: isActive ? f.color : isDone ? f.color + '60' : '#64748b' }}>
              {isDone ? '✓' : ''}{f.label}
            </div>
            {i < FLOORS.length - 1 && <div className="w-3 h-[1px]" style={{ backgroundColor: isDone ? f.color + '30' : '#334155' }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Pass信息面板：清晰展示 NF → (N+1)F 的信息传递 ── */
function PassInfoPanel({ fromIdx, toIdx }) {
  const from = FLOORS[fromIdx];
  const to = FLOORS[toIdx];
  const { px } = useFontSize();
  return (
    <motion.div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex flex-col items-center gap-0" style={{ maxWidth: 480 }}>

        {/* ── TO 卡片（上方）：下一层要做什么 ── */}
        <motion.div className="w-full rounded-xl p-4"
          style={{ background: 'rgba(8,12,20,0.92)', border: `1px solid ${to.color}40`, backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-black px-2 py-0.5 rounded" style={{ background: to.color + '25', color: to.color, fontSize: px(14) }}>
              {to.label}
            </span>
            <span className="font-bold" style={{ color: to.color + 'cc', fontSize: px(12) }}>{to.name}</span>
          </div>
          {to.inputNote && (
            <div className="rounded-lg px-3 py-2 leading-relaxed" style={{ background: to.color + '08', fontSize: px(12), color: '#cbd5e1' }}>
              📥 {to.inputNote}
            </div>
          )}
          <div className="flex gap-2 mt-2.5">
            {to.heads.map((h, i) => (
              <div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ background: `${h.color}10` }}>
                <span style={{ fontSize: px(12) }}>{h.icon}</span>
                <span className="font-bold" style={{ color: h.color, fontSize: px(10) }}>{h.name}</span>
              </div>
            ))}
          </div>
          {toIdx === 3 && (
            <div className="mt-2 text-orange-400 font-bold" style={{ fontSize: px(11) }}>
              ⚡ 关键的指代消解即将发生！
            </div>
          )}
        </motion.div>

        {/* ── 传递箭头（向上） ── */}
        <motion.div className="flex flex-col items-center py-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="w-px h-6" style={{ background: `linear-gradient(${to.color}, ${from.color})` }} />
          <motion.div className="text-2xl my-1"
            animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 0.7 }}>
            <span style={{ color: to.color }}>⬆</span>
          </motion.div>
          <div className="px-3 py-1 rounded-full text-center" style={{ background: 'rgba(8,12,20,0.8)', fontSize: px(11), color: '#94a3b8' }}>
            卡片携带标注结果，向上传递
          </div>
          <div className="w-px h-6" style={{ background: `linear-gradient(${to.color}, ${from.color})` }} />
        </motion.div>

        {/* ── FROM 卡片（下方）：上一层的成果 ── */}
        <motion.div className="w-full rounded-xl p-4"
          style={{ background: 'rgba(8,12,20,0.92)', border: `1px solid ${from.color}40`, backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="font-black px-2 py-0.5 rounded" style={{ background: from.color + '25', color: from.color, fontSize: px(14) }}>
              ✓ {from.label}
            </span>
            <span className="font-bold" style={{ color: from.color + 'cc', fontSize: px(12) }}>{from.name} 已完成</span>
          </div>
          <div className="flex gap-2 mb-2.5">
            {from.heads.map((h, i) => (
              <div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ background: `${h.color}10` }}>
                <span style={{ fontSize: px(12) }}>{h.icon}</span>
                <span className="font-bold" style={{ color: h.color, fontSize: px(10) }}>{h.name}</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg px-3 py-2 leading-relaxed" style={{ background: from.color + '08', fontSize: px(12), color: '#cbd5e1' }}>
            📋 {FLOOR_SYNTHESIS[fromIdx]}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */
export default function TransformerV2() {
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [floorStage, setFloorStage] = useState(0);
  const [fontSize, setFontSize] = useState('M');
  const info = getPhaseInfo(phase);

  useEffect(() => {
    if (info.type !== 'floor') { setFloorStage(0); return; }
    setFloorStage(0);
    const t1 = setTimeout(() => setFloorStage(1), 100);
    const t2 = setTimeout(() => setFloorStage(2), 1200);
    const t3 = setTimeout(() => setFloorStage(3), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [phase, info.type]);

  useEffect(() => {
    if (!playing || phase >= TOTAL - 1) { if (phase >= TOTAL - 1) setPlaying(false); return; }
    const dur = info.type === 'pass' ? 3500 : info.type === 'floor' ? 4500 : info.type === 'overview' ? 6000 : 4000;
    const t = setTimeout(() => setPhase(p => p + 1), dur);
    return () => clearTimeout(t);
  }, [playing, phase, info.type]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); setPhase(p => Math.min(p + 1, TOTAL - 1)); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); setPhase(p => Math.max(p - 1, 0)); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const reset = useCallback(() => { setPhase(0); setPlaying(false); }, []);

  let activeFloor = -1;
  if (info.type === 'floor') activeFloor = info.floorIdx;
  else if (info.type === 'pass') activeFloor = info.floorIdx;
  else if (info.type === 'output') activeFloor = 5;

  return (
    <FontSizeCtx.Provider value={fontSize}>
    <div className="h-screen flex flex-col overflow-hidden bg-[#060a12] text-white select-none">
      {/* Top Nav */}
      <div className="flex items-center justify-between px-5 py-2 bg-[#0c1222] border-b border-slate-800/50 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-600 hover:text-indigo-400 transition"><ChevronLeft size={18} /></Link>
          <span className="text-sm font-bold text-slate-300">🏢 Transformer 阅卷大楼</span>
          <FontSizeSelector value={fontSize} onChange={setFontSize} />
        </div>
        {phase >= 3 && <FloorProgress activeFloor={activeFloor} />}
        <span className="text-[10px] text-slate-600 font-mono">{phase + 1}/{TOTAL}</span>
      </div>

      {/* Stage */}
      <div className="flex-1 relative overflow-hidden">
        <Canvas camera={{ position: [10, 7, 14], fov: 50 }} className="absolute inset-0" style={{ background: '#060a12' }}>
          <BuildingScene phase={phase} floorStage={floorStage} />
        </Canvas>

        <AnimatePresence mode="wait">
          {info.type === 'overview' && (
            <motion.div key="ov" className="absolute inset-0 flex flex-col items-center justify-end pb-8 pointer-events-none z-10"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">Transformer = 一栋阅卷大楼</h1>
                <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
                  训练模型的人就是这栋大楼的<span className="text-amber-400 font-bold">建筑师</span>——
                  他决定了建几层楼、每层安排几位阅卷员、每位阅卷员关注什么维度。
                </p>
                <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-400">
                  <span>每层 = <span className="text-indigo-400 font-bold">Layer</span></span>
                  <span>阅卷员 = <span className="text-pink-400 font-bold">Attention Head</span></span>
                  <span><span className="text-amber-400">并行</span>工作</span>
                </div>
              </div>
            </motion.div>
          )}

          {info.type === 'tokenize' && (
            <motion.div key="tok" className="absolute inset-0 flex flex-col items-center justify-center z-10"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-[11px] text-slate-500 mb-2">输入句子</div>
              <div className="text-sm font-bold text-slate-200 tracking-wide mb-6 text-center leading-relaxed max-w-xl px-4">{INPUT_TEXT}</div>
              <div className="text-[11px] text-slate-500 mb-4">↓ 拆分为 {TOKENS.length} 张卡片，准备送入大楼</div>
              <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-2xl px-4">
                {TOKENS.map((t, i) => (
                  <motion.div key={i}
                    className="w-11 h-12 rounded-lg border-2 border-slate-400 bg-white flex items-center justify-center text-[11px] font-bold text-slate-800"
                    style={{ boxShadow: '0 3px 12px rgba(0,0,0,0.15)' }}
                    initial={{ opacity: 0, y: 20, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.04, type: 'spring', stiffness: 250, damping: 16 }}
                  >{t}</motion.div>
                ))}
              </div>
              <motion.div className="text-[10px] text-slate-500 mt-4 text-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                关键：第一段说"我舅舅"，第二段说"一个亲戚"、"他"——指的都是同一人
              </motion.div>
            </motion.div>
          )}

          {info.type === 'enter' && (
            <motion.div key="enter" className="absolute inset-0 flex flex-col items-center justify-end pb-16 pointer-events-none z-10"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <p className="text-sm text-slate-300 mb-1">📥 {TOKENS.length} 张卡片从大门送入 1 楼</p>
                <p className="text-[11px] text-slate-500">每层的 3 位阅卷员将同时审阅，各写报告后汇总</p>
              </motion.div>
            </motion.div>
          )}

          {/* 楼层：顶部状态条 + 底部汇总面板 */}
          {info.type === 'floor' && (
            <React.Fragment key={`fl-${info.floorIdx}`}>
              <motion.div
                className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 px-4 py-2 rounded-lg"
                style={{ background: 'rgba(8,12,20,0.85)', border: `1px solid ${FLOORS[info.floorIdx].color}30`, maxWidth: 550 }}
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black" style={{ color: FLOORS[info.floorIdx].color }}>{FLOORS[info.floorIdx].label}</span>
                  <span className="text-xs font-bold" style={{ color: FLOORS[info.floorIdx].color + 'aa' }}>{FLOORS[info.floorIdx].name}</span>
                  <span className="text-[9px] text-slate-500">
                    {floorStage < 1 ? '准备中...' : floorStage < 2 ? '🔍 审阅中' : floorStage < 3 ? '📝 提交报告' : '📋 汇总完成 → 可拖拽旋转'}
                  </span>
                </div>
                {FLOORS[info.floorIdx].inputNote && (
                  <div className="text-[10px] text-slate-400 text-center leading-snug">
                    📥 {FLOORS[info.floorIdx].inputNote}
                  </div>
                )}
              </motion.div>

              {/* 底部汇总面板 */}
              {floorStage >= 3 && <FloorSummaryPanel floorIdx={info.floorIdx} />}
            </React.Fragment>
          )}

          {info.type === 'pass' && (
            <PassInfoPanel key={`pass-${info.floorIdx}`} fromIdx={info.floorIdx - 1} toIdx={info.floorIdx} />
          )}

          {info.type === 'output' && (
            <motion.div key="output" className="absolute inset-0 flex flex-col items-center justify-center z-10"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-[#0c1222ee] backdrop-blur-md rounded-2xl p-6 max-w-lg border border-slate-700/50">
                <div className="text-[11px] text-slate-500 mb-3 text-center">
                  经过 5 层 × 3 位阅卷员 = 15 轮并行审阅，汇总了 5 份楼层报告
                </div>
                <div className="flex flex-wrap gap-1 justify-center mb-4">
                  {FLOORS.map((f, i) => (
                    <motion.div key={i} className="px-2 py-0.5 rounded-md text-[9px] font-bold"
                      style={{ backgroundColor: f.color + '15', color: f.color, border: `1px solid ${f.color}25` }}
                      initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.08 }}>
                      ✓ {f.label}
                    </motion.div>
                  ))}
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-5">
                  <span className="text-xs text-slate-400">这个亲戚是我的</span>
                  <motion.span className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent"
                    initial={{ opacity: 0, scale: 3 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}>{PREDICTED}</motion.span>
                </div>
                <motion.div className="space-y-1.5 mb-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                  {[
                    { w: '舅舅', p: 62, c: '#4ade80' },
                    { w: '叔叔', p: 15, c: '#64748b' },
                    { w: '哥哥', p: 8, c: '#475569' },
                    { w: '爸爸', p: 5, c: '#475569' },
                    { w: '…', p: 10, c: '#334155' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-8 text-right text-xs text-slate-400 font-bold">{item.w}</span>
                      <div className="flex-1 h-2.5 bg-slate-800/80 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ backgroundColor: item.c }}
                          initial={{ width: 0 }} animate={{ width: `${item.p}%` }}
                          transition={{ delay: 0.9 + i * 0.08, duration: 0.5 }} />
                      </div>
                      <span className="w-8 text-[11px] text-slate-600">{item.p}%</span>
                    </div>
                  ))}
                </motion.div>
                <motion.div className="text-[11px] text-slate-500 leading-[1.7] text-center"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
                  <p className="mb-1.5">
                    模型通过 5 层注意力计算，逐层积累理解，
                    在"什么"这个位置聚合了全部上下文信息。
                  </p>
                  <p className="text-slate-600 text-[10px]">
                    关键突破：<span className="text-orange-400">4F 指代消解</span>——
                    发现"舅舅""亲戚""他"指的是同一人。
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-2 right-4 text-[9px] text-slate-700 z-10">← → 翻页 · 空格下一步</div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 py-2 bg-[#0c1222] border-t border-slate-800/50 shrink-0">
        <button onClick={() => setPhase(p => Math.max(p - 1, 0))} disabled={phase === 0}
          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => setPlaying(!playing)}
          className={`flex items-center gap-1.5 px-6 py-2 rounded-lg text-xs font-bold transition-all ${
            playing ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
          }`}>
          {playing ? <Pause size={13} /> : <Play size={13} />}
          {playing ? '暂停' : '播放'}
        </button>
        <button onClick={() => setPhase(p => Math.min(p + 1, TOTAL - 1))} disabled={phase >= TOTAL - 1}
          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
          <ChevronRight size={16} />
        </button>
        <button onClick={reset}
          className="p-2 rounded-lg bg-slate-800 text-slate-500 hover:text-white hover:bg-slate-700 transition-all">
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
    </FontSizeCtx.Provider>
  );
}
