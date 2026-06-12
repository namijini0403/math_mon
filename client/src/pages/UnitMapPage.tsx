/** 홈 — 유닛맵 (구불구불한 길 + 스테이지 노드) + 미션 패널 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DailyRewardModal from '../components/DailyRewardModal';
import DragonWidget from '../components/DragonWidget';
import { SEMESTERS, STAGES, UNIT_TITLES, type StageDef } from '../game/stages';
import { useGame } from '../game/store';
import { levelFromXp } from '../game/xp';
import { DAILY_MISSIONS, todayStr } from '../game/missions';
import { dragonEmoji } from '../game/dragon';
import { sfx } from '../game/sounds';

function StageNode({ stage, index, unlocked, stars }: { stage: StageDef; index: number; unlocked: boolean; stars: number }) {
  const offset = [0, 48, 0, -48][index % 4]; // 지그재그 길
  const isBoss = stage.type === 'boss';
  const inner = (
    <motion.div
      whileTap={unlocked ? { scale: 0.92 } : {}}
      animate={unlocked && stars === 0 ? { y: [0, -6, 0] } : {}}
      transition={unlocked && stars === 0 ? { repeat: Infinity, duration: 1.4 } : {}}
      className={`relative flex flex-col items-center ${unlocked ? '' : 'opacity-40 grayscale'}`}
      style={{ marginLeft: offset }}
    >
      <div
        className={`${isBoss ? 'w-24 h-24 text-5xl' : 'w-18 h-18 text-4xl'} rounded-full flex items-center justify-center border-b-8 ${
          isBoss
            ? 'bg-gradient-to-b from-rose-500 to-rose-700 border-rose-900'
            : stage.type === 'challenge'
              ? stars > 0
                ? 'bg-gradient-to-b from-amber-300 to-amber-500 border-amber-700'
                : 'bg-gradient-to-b from-indigo-400 to-indigo-700 border-indigo-900 ring-2 ring-coin/40'
              : stars > 0
                ? 'bg-gradient-to-b from-lime-400 to-lime-600 border-lime-800'
                : 'bg-gradient-to-b from-violet-500 to-violet-700 border-violet-900'
        } shadow-xl`}
      >
        {stage.emoji}
      </div>
      {stars > 0 && (
        <div className="absolute -bottom-2 flex text-sm drop-shadow">
          {[1, 2, 3].map((i) => (
            <span key={i} className={i <= stars ? '' : 'opacity-25 grayscale'}>
              ⭐
            </span>
          ))}
        </div>
      )}
      {/* 별이 노드 아래로 튀어나오므로 제목과 겹치지 않게 여백 확보 */}
      <div className={`${stars > 0 ? 'mt-6' : 'mt-3'} text-sm text-center opacity-90 max-w-28`}>
        {stage.title}
      </div>
    </motion.div>
  );

  return unlocked ? (
    <Link to={`/lesson/${stage.id}`} aria-label={`${stage.title} 시작`}>
      {inner}
    </Link>
  ) : (
    <div aria-label={`${stage.title} (잠김)`}>{inner}</div>
  );
}

function MissionPanel() {
  const { daily, claimMission } = useGame();
  const counters = daily.date === todayStr() ? daily : { ...daily, solved: 0, lessons: 0, perfect: 0, claimed: [] };
  return (
    <div className="rounded-3xl bg-night-900 border border-night-700 p-4 flex flex-col gap-3">
      <div className="text-sm opacity-70">오늘의 미션</div>
      {DAILY_MISSIONS.map((m) => {
        const prog = Math.min(m.progress(counters), m.target);
        const complete = prog >= m.target;
        const claimed = counters.claimed.includes(m.id);
        return (
          <div key={m.id} className="flex items-center gap-3">
            <span className="text-2xl">{m.emoji}</span>
            <div className="flex-1">
              <div className="text-sm">{m.label}</div>
              <div className="h-2.5 mt-1 rounded-full bg-night-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-coin to-amber-500 transition-all"
                  style={{ width: `${(prog / m.target) * 100}%` }}
                />
              </div>
            </div>
            {claimed ? (
              <span className="text-glow text-xl">✓</span>
            ) : complete ? (
              <button
                onClick={() => {
                  claimMission(m.id);
                  sfx.fanfare();
                }}
                className="btn-3d rounded-xl bg-coin border-coin border-b-amber-600 px-3 py-1.5 text-sm text-night-950"
              >
                +15 XP
              </button>
            ) : (
              <span className="text-xs opacity-50">
                {prog}/{m.target}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function UnitMapPage() {
  const { nickname, xp, stages, streak, dragon } = useGame();
  const { level, into, need } = levelFromXp(xp);
  const streakActive = streak.last === todayStr();
  // 학기 탭 (마지막 선택 기억)
  const [semesterId, setSemesterId] = useState(
    () => localStorage.getItem('mathmon-semester') ?? 'g5s1',
  );
  const semester = SEMESTERS.find((s) => s.id === semesterId) ?? SEMESTERS[0];
  const selectSemester = (id: string) => {
    setSemesterId(id);
    localStorage.setItem('mathmon-semester', id);
  };
  // 펼친 단원 (탭한 단원만 스테이지 표시 — 지도가 너무 길어지지 않게)
  const [openUnitRaw, setOpenUnitRaw] = useState<string | null>(
    () => localStorage.getItem('mathmon-unit'),
  );
  const openUnit = semester.units.includes(openUnitRaw ?? '') ? openUnitRaw : null;
  const toggleUnit = (id: string) => {
    const next = openUnit === id ? null : id;
    setOpenUnitRaw(next);
    if (next) localStorage.setItem('mathmon-unit', next);
    else localStorage.removeItem('mathmon-unit');
  };

  // 단원별 잠금: 각 단원의 첫 스테이지는 항상 열려 있고, 단원 안에서는 순차 해제
  // (교사가 진도에 맞는 단원부터 시작하게 할 수 있음)
  const clearedByUnit = new Map<string, boolean>();
  const nodes = STAGES.map((stage, i) => {
    const stars = stages[stage.id]?.stars ?? 0;
    // 심화 탐험은 선택 트랙 — 항상 열려 있고 잠금 체인에도 영향 없음
    if (stage.type === 'challenge') return { stage, i, unlocked: true, stars };
    const unlocked = clearedByUnit.get(stage.unitId) ?? true;
    clearedByUnit.set(stage.unitId, stars > 0);
    return { stage, i, unlocked, stars };
  });

  return (
    <div className="max-w-xl mx-auto px-5 pb-16">
      <DailyRewardModal />
      {/* ── 헤더 ── */}
      <div className="sticky top-0 z-10 bg-night-950/90 backdrop-blur py-3 flex items-center gap-3">
        <Link to="/profile" className="flex items-center gap-2" aria-label="프로필">
          <div className="w-11 h-11 rounded-full bg-gradient-to-b from-violet-500 to-violet-700 flex items-center justify-center text-xl">
            {dragonEmoji(dragon)}
          </div>
          <div>
            <div className="text-sm leading-tight">{nickname}</div>
            <div className="text-xs text-coin leading-tight">Lv.{level}</div>
          </div>
        </Link>
        <div className="flex-1 mx-1">
          <div className="h-3.5 rounded-full bg-night-800 overflow-hidden border border-night-700">
            <div className="h-full bg-gradient-to-r from-coin to-amber-500" style={{ width: `${(into / need) * 100}%` }} />
          </div>
          <div className="text-[0.65rem] opacity-60 text-center mt-0.5">
            {into}/{need} XP
          </div>
        </div>
        <div className={`text-lg flex items-center gap-1 ${streakActive ? 'text-coin' : 'opacity-40 grayscale'}`}>
          🔥<span className="text-sm">{streak.count}</span>
        </div>
      </div>

      <div className="mt-3">
        <MissionPanel />
      </div>

      <div className="mt-3">
        <DragonWidget />
      </div>

      {/* ── 연습·시험 모드 ── */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link
          to="/practice/basic"
          className="btn-3d rounded-3xl bg-night-900 border-2 border-night-700 border-b-night-700 p-4 text-center hover:bg-night-800"
        >
          <div className="text-3xl mb-1">🏋️</div>
          <div className="text-sm">기초 연산 연습</div>
          <div className="text-[0.65rem] opacity-50">무한 모드</div>
        </Link>
        <Link
          to="/practice/word"
          className="btn-3d rounded-3xl bg-night-900 border-2 border-night-700 border-b-night-700 p-4 text-center hover:bg-night-800"
        >
          <div className="text-3xl mb-1">📖</div>
          <div className="text-sm">문장제 연습</div>
          <div className="text-[0.65rem] opacity-50">무한 모드</div>
        </Link>
        <Link
          to="/practice/challenge"
          className="btn-3d rounded-3xl bg-night-900 border-2 border-violet-700/60 border-b-violet-700/60 p-4 text-center hover:bg-night-800"
        >
          <div className="text-3xl mb-1">🌌</div>
          <div className="text-sm">심화 연습</div>
          <div className="text-[0.65rem] opacity-50">최고 수준 무한 모드</div>
        </Link>
        <Link
          to="/exam"
          className="btn-3d rounded-3xl bg-night-900 border-2 border-coin/50 border-b-coin/50 p-4 text-center hover:bg-night-800"
        >
          <div className="text-3xl mb-1">🏟️</div>
          <div className="text-sm">명예의 시험장</div>
          <div className="text-[0.65rem] opacity-50">단원 시험 10문제</div>
        </Link>
      </div>

      {/* ── 보물 카드 갤러리 ── */}
      <Link
        to="/cards"
        className="mt-3 btn-3d rounded-3xl bg-night-900 border-2 border-night-700 border-b-night-700 p-3 text-center hover:bg-night-800 flex items-center justify-center gap-2"
      >
        <span className="text-2xl">🎴</span>
        <span className="text-sm">나의 보물 카드 도감</span>
      </Link>

      {/* ── 학기 선택 탭 ── */}
      <div className="mt-6 grid grid-cols-4 gap-1.5">
        {SEMESTERS.map((s) => (
          <button
            key={s.id}
            onClick={() => selectSemester(s.id)}
            className={`rounded-2xl py-2.5 text-xs leading-tight border-2 transition-colors ${
              s.id === semesterId
                ? 'bg-coin/20 border-coin text-coin'
                : 'bg-night-900 border-night-700 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="text-lg">{s.emoji}</div>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── 유닛맵: 단원을 탭하면 그 단원의 스테이지만 펼쳐진다 ── */}
      {semester.units.map((unitId) => {
        const unitNodes = nodes.filter((n) => n.stage.unitId === unitId);
        const cleared = unitNodes.filter((n) => n.stars > 0).length;
        const starsSum = unitNodes.reduce((a, n) => a + n.stars, 0);
        const isOpen = openUnit === unitId;
        return (
          <section key={unitId} className="mt-3">
            <button
              onClick={() => toggleUnit(unitId)}
              className={`w-full rounded-2xl border px-5 py-3.5 flex items-center gap-3 text-left transition-colors ${
                isOpen ? 'bg-night-800 border-coin/50' : 'bg-night-900 border-night-700 hover:bg-night-800'
              }`}
            >
              <span className="flex-1 text-lg">{UNIT_TITLES[unitId]}</span>
              <span className="text-xs opacity-60">
                {cleared}/{unitNodes.length}
                {starsSum > 0 && ` · ⭐${starsSum}`}
              </span>
              <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {isOpen && (
              <div className="flex flex-col items-center gap-9 py-9">
                {unitNodes.map((n, idx) => (
                  <StageNode
                    key={n.stage.id}
                    stage={n.stage}
                    index={idx}
                    unlocked={n.unlocked}
                    stars={n.stars}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
