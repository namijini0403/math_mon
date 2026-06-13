/**
 * 연습·평가 던전 허브 — 학기 선택 → 단원 선택 → 모드(기초/문장제/심화/단원평가) 선택.
 * 하단에 학기 총괄평가 던전 입구(해금 조건: 그 학기 단원 3개 이상 별 획득).
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEMESTERS, STAGES, UNIT_TITLES } from '../game/stages';
import { useGame } from '../game/store';

/** 한 단원에 '별 받은 스테이지(심화 제외)'가 1개 이상이면 클리어로 간주 */
function isUnitCleared(unitId: string, stages: Record<string, { stars: number }>): boolean {
  return STAGES.filter((st) => st.unitId === unitId && st.type !== 'challenge').some(
    (st) => (stages[st.id]?.stars ?? 0) > 0,
  );
}

/** 그 학기의 클리어 단원 수 */
function clearedCount(semesterUnits: string[], stages: Record<string, { stars: number }>): number {
  return semesterUnits.filter((u) => isUnitCleared(u, stages)).length;
}

const MODES = [
  { key: 'basic', label: '기초 연산', emoji: '🏋️', desc: '계산 문제만 무한으로' },
  { key: 'word', label: '문장제', emoji: '📖', desc: '줄글 문제만 모아서' },
  { key: 'challenge', label: '심화', emoji: '🌌', desc: '고난도 문제 도전' },
] as const;

export default function PracticeHubPage() {
  const { stages } = useGame();
  const navigate = useNavigate();

  // 학기 선택 — localStorage 초기값
  const [semesterId, setSemesterId] = useState<string>(
    () => localStorage.getItem('mathmon-semester') ?? SEMESTERS[0].id,
  );
  const semester = SEMESTERS.find((s) => s.id === semesterId) ?? SEMESTERS[0];

  // 단원 선택
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const selectSemester = (id: string) => {
    setSemesterId(id);
    localStorage.setItem('mathmon-semester', id);
    setSelectedUnit(null); // 학기 바꾸면 단원 초기화
  };

  const cleared = clearedCount(semester.units, stages);
  const unlocked = cleared >= 3;

  return (
    <div className="max-w-xl mx-auto px-5 pb-20">
      {/* ── 헤더 ── */}
      <div className="flex items-center gap-3 py-4">
        <Link to="/" className="text-2xl opacity-60 hover:opacity-100" aria-label="홈으로">
          ←
        </Link>
        <div>
          <h1 className="text-xl">🗺️ 연습·평가 던전</h1>
          <p className="text-xs opacity-60">
            정규 학습(레슨→보스)은{' '}
            <Link to="/" className="underline opacity-80 hover:opacity-100">
              홈 지도
            </Link>
            에서 해요
          </p>
        </div>
      </div>

      {/* ── 학기 선택 탭 ── */}
      <div className="grid grid-cols-4 gap-1.5 mt-1">
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

      {/* ── 단원 선택 ── */}
      <div className="flex flex-col gap-2.5 mt-5">
        <div className="text-xs opacity-50 px-1">단원 선택</div>
        {semester.units.map((uid) => {
          const isSelected = selectedUnit === uid;
          return (
            <div key={uid}>
              <button
                onClick={() => setSelectedUnit(isSelected ? null : uid)}
                className={`w-full btn-3d rounded-2xl border-2 px-5 py-4 text-left flex items-center transition-colors ${
                  isSelected
                    ? 'bg-night-800 border-coin/60'
                    : 'bg-night-900 border-night-700 hover:bg-night-800'
                }`}
              >
                <span className="flex-1">{UNIT_TITLES[uid] ?? uid}</span>
                <span className={`transition-transform text-sm opacity-60 ${isSelected ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>

              {/* ── 모드 패널 (선택된 단원만) ── */}
              {isSelected && (
                <div className="mt-2 flex flex-col gap-2 pl-2">
                  {MODES.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => navigate(`/practice/${m.key}/${uid}`)}
                      className="btn-3d rounded-2xl bg-night-900 border-2 border-night-700 border-b-night-700 px-5 py-3 text-left hover:bg-night-800 flex items-center gap-3"
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <div>
                        <div className="text-sm">{m.label}</div>
                        <div className="text-[0.65rem] opacity-50">{m.desc}</div>
                      </div>
                    </button>
                  ))}
                  {/* 단원평가 */}
                  <button
                    onClick={() => navigate(`/exam/${uid}`)}
                    className="btn-3d rounded-2xl bg-night-900 border-2 border-coin/40 border-b-coin/40 px-5 py-3 text-left hover:bg-night-800 flex items-center gap-3"
                  >
                    <span className="text-2xl">🏟️</span>
                    <div>
                      <div className="text-sm">단원평가</div>
                      <div className="text-[0.65rem] opacity-50">10문제 · 보스전 수준</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 총괄평가 던전 입구 ── */}
      <div className="mt-8">
        <div className="text-xs opacity-50 px-1 mb-2">학기 총괄평가</div>
        {unlocked ? (
          <Link
            to={`/finalexam/${semester.id}`}
            className="btn-3d rounded-3xl bg-gradient-to-r from-violet-900 to-night-900 border-2 border-violet-500/70 border-b-violet-700 px-6 py-5 flex items-center gap-4 hover:from-violet-800"
          >
            <span className="text-4xl">🏰</span>
            <div>
              <div className="text-base">학기말 총괄평가 던전</div>
              <div className="text-xs opacity-70">25문제 · 합격 기준 23점 이상</div>
            </div>
            <span className="ml-auto text-lg opacity-60">→</span>
          </Link>
        ) : (
          <div className="rounded-3xl bg-night-900 border-2 border-night-700 px-6 py-5 flex items-center gap-4 opacity-50">
            <span className="text-4xl grayscale">🏰</span>
            <div>
              <div className="text-base">학기말 총괄평가 던전</div>
              <div className="text-xs opacity-70">
                단원 3개 이상 클리어하면 열려요 (현재 {cleared}/3)
              </div>
            </div>
            <span className="ml-auto text-lg opacity-40">🔒</span>
          </div>
        )}
      </div>
    </div>
  );
}
