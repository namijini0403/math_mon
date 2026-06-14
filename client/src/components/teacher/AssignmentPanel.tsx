/**
 * 교사용 단원평가 패널 — 시험 작성/발행 + 결과 보드
 * props: classCode, teacherKey, students
 */

import { useState, useEffect, useCallback } from 'react';
import { SEMESTERS, UNIT_TITLES } from '../../game/stages';
import { allocate } from '../../game/assignmentGen';
import type { AssignmentConfig, DifficultyMix } from '../../game/assignmentGen';
import { getSkill } from '../../generator';
import WorksheetPrint from './WorksheetPrint';

// ── 타입 ─────────────────────────────────────────────────────────────────────

interface AssignmentRow {
  id: string;
  title: string | null;
  target_type: 'class' | 'student';
  target_nickname: string | null;
  config: AssignmentConfig;
  seed: number;
  status: 'open' | 'closed';
  created_at: string;
}

interface ResultItem {
  skillId: string;
  seed: number;
  correct: boolean;
}

interface ResultRow {
  assignment_id: string;
  nickname: string;
  score: number;
  total: number;
  items: ResultItem[];
  submitted_at: string;
}

interface BoardData {
  assignments: AssignmentRow[];
  results: ResultRow[];
}

// ── 헬퍼 ─────────────────────────────────────────────────────────────────────

function skillLabel(skillId: string): string {
  try {
    return getSkill(skillId).title;
  } catch {
    return skillId;
  }
}

/** ResultRow[] → skillId 별 {c, w} 집계 */
function aggregateSkillStats(results: ResultRow[]): Record<string, { c: number; w: number }> {
  const map: Record<string, { c: number; w: number }> = {};
  for (const r of results) {
    for (const it of r.items) {
      if (!map[it.skillId]) map[it.skillId] = { c: 0, w: 0 };
      if (it.correct) map[it.skillId].c += 1;
      else map[it.skillId].w += 1;
    }
  }
  return map;
}

/** SVG 스파크라인 (점수 % 시계열) */
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return <span className="text-xs opacity-60">{values[0] ?? '-'}%</span>;
  const W = 60;
  const H = 20;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - ((v - min) / range) * (H - 2) - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width={W} height={H} className="inline-block align-middle">
      <polyline points={pts} fill="none" stroke="#a3e635" strokeWidth="1.5" strokeLinejoin="round" />
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * W;
        const y = H - ((v - min) / range) * (H - 2) - 1;
        return <circle key={i} cx={x} cy={y} r={2} fill="#a3e635" />;
      })}
    </svg>
  );
}

// ── 결과보드 서브컴포넌트 ────────────────────────────────────────────────────

function ResultBoard({
  board,
  onStatusChange,
}: {
  board: BoardData;
  onStatusChange: (id: string, status: 'open' | 'closed') => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 학생별 점수 추이 (제출 시각 순)
  const trendByStudent = useCallback(
    (nickname: string): number[] => {
      return board.results
        .filter((r) => r.nickname === nickname)
        .sort((a, b) => a.submitted_at.localeCompare(b.submitted_at))
        .map((r) => (r.total > 0 ? Math.round((r.score / r.total) * 100) : 0));
    },
    [board.results],
  );

  const allStudents = [...new Set(board.results.map((r) => r.nickname))];

  if (board.assignments.length === 0) {
    return <p className="mt-6 opacity-60 text-sm">아직 발행한 시험이 없어요.</p>;
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* 누적 추이 */}
      {allStudents.length > 0 && (
        <section className="rounded-2xl bg-night-900 border border-night-700 p-4">
          <h3 className="text-sm font-bold mb-3">📈 학생별 점수 추이</h3>
          <div className="flex flex-col gap-2">
            {allStudents.map((nick) => {
              const vals = trendByStudent(nick);
              return (
                <div key={nick} className="flex items-center gap-3 text-sm">
                  <span className="w-20 truncate">{nick}</span>
                  <Sparkline values={vals} />
                  <span className="text-xs opacity-60 tabular-nums">{vals.join('→')}%</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 시험 목록 */}
      {[...board.assignments].reverse().map((a) => {
        const results = board.results.filter((r) => r.assignment_id === a.id);
        const isOpen = expandedId === a.id;
        const alloc = allocate(a.config.mix, a.config.count);
        const stats = aggregateSkillStats(results);

        // 강·약 분석
        const skillEntries = Object.entries(stats).map(([id, s]) => ({
          id,
          rate: s.c + s.w > 0 ? s.c / (s.c + s.w) : 0.5,
        }));
        skillEntries.sort((a, b) => a.rate - b.rate);
        const weak = skillEntries.slice(0, 3);
        const strong = skillEntries.slice(-3).reverse();

        return (
          <div key={a.id} className="rounded-2xl bg-night-900 border border-night-700 overflow-hidden">
            {/* 헤더 */}
            <div
              className="p-4 cursor-pointer hover:bg-night-800 transition"
              onClick={() => setExpandedId(isOpen ? null : a.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-sm">
                    {a.title ?? '(제목 없음)'}
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      a.status === 'open' ? 'bg-glow/20 text-glow' : 'bg-night-800 text-night-300'
                    }`}>
                      {a.status === 'open' ? '진행 중' : '마감'}
                    </span>
                  </div>
                  <div className="text-xs opacity-60 mt-0.5">
                    {a.target_type === 'class' ? '반 전체' : `학생: ${a.target_nickname}`}
                    {' · '}
                    {a.config.count}문항 (계산 {alloc.low} · 문장제 {alloc.mid} · 심화 {alloc.high})
                    {' · '}
                    {new Date(a.created_at).toLocaleDateString('ko-KR')}
                    {' · '}
                    응시 {results.length}명
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(a.id, a.status === 'open' ? 'closed' : 'open');
                    }}
                    className="rounded-full bg-night-800 border border-night-700 px-2.5 py-1 text-xs hover:text-coin"
                  >
                    {a.status === 'open' ? '마감' : '재개'}
                  </button>
                  <span className="text-night-300 text-sm">{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>
            </div>

            {/* 펼침: 학생별 점수 + 강·약 분석 */}
            {isOpen && (
              <div className="border-t border-night-700 p-4 flex flex-col gap-4">
                {/* 강·약 분석 */}
                {skillEntries.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-bold text-hurt mb-1">⚠️ 약점 유형 (정답률 낮음)</div>
                      {weak.map((e) => (
                        <div key={e.id} className="text-xs flex gap-1.5 items-center">
                          <span className="text-hurt font-bold tabular-nums">
                            {Math.round(e.rate * 100)}%
                          </span>
                          <span className="opacity-80 truncate">{skillLabel(e.id)}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-glow mb-1">✨ 강점 유형 (정답률 높음)</div>
                      {strong.map((e) => (
                        <div key={e.id} className="text-xs flex gap-1.5 items-center">
                          <span className="text-glow font-bold tabular-nums">
                            {Math.round(e.rate * 100)}%
                          </span>
                          <span className="opacity-80 truncate">{skillLabel(e.id)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 학생별 점수 */}
                {results.length === 0 ? (
                  <p className="text-xs opacity-60">아직 응시한 학생이 없어요.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left border-b border-night-700 opacity-60">
                          <th className="pb-1.5 pr-3">닉네임</th>
                          <th className="pb-1.5 pr-3">점수</th>
                          <th className="pb-1.5 pr-3">정오 현황</th>
                          <th className="pb-1.5">제출 시각</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results
                          .sort((a, b) => b.score / b.total - a.score / a.total)
                          .map((r) => (
                            <tr key={r.nickname} className="border-b border-night-800">
                              <td className="py-2 pr-3">{r.nickname}</td>
                              <td className="py-2 pr-3 tabular-nums">
                                <span className={
                                  r.total > 0 && r.score / r.total >= 0.8
                                    ? 'text-glow font-bold'
                                    : r.total > 0 && r.score / r.total < 0.5
                                    ? 'text-hurt'
                                    : 'text-coin'
                                }>
                                  {r.score}/{r.total}
                                </span>
                                <span className="opacity-60 ml-1">
                                  ({r.total > 0 ? Math.round((r.score / r.total) * 100) : 0}%)
                                </span>
                              </td>
                              <td className="py-2 pr-3">
                                <div className="flex flex-wrap gap-0.5">
                                  {r.items.map((it, idx) => (
                                    <span
                                      key={idx}
                                      title={skillLabel(it.skillId)}
                                      className={`w-4 h-4 rounded-sm flex items-center justify-center text-[0.55rem] font-bold ${
                                        it.correct ? 'bg-glow/30 text-glow' : 'bg-hurt/30 text-hurt'
                                      }`}
                                    >
                                      {it.correct ? '○' : '●'}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-2 text-xs opacity-60">
                                {new Date(r.submitted_at).toLocaleString('ko-KR')}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── 메인 패널 ────────────────────────────────────────────────────────────────

interface Props {
  classCode: string;
  teacherKey: string;
  students: { nickname: string }[];
}

type PanelTab = 'create' | 'board';

export default function AssignmentPanel({ classCode, teacherKey, students }: Props) {
  const [panelTab, setPanelTab] = useState<PanelTab>('create');

  // ── 시험 작성 상태 ──
  const [title, setTitle] = useState('');
  const [selectedSemesterId, setSelectedSemesterId] = useState(SEMESTERS[0].id);
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<string>>(new Set());
  const [count, setCount] = useState(10);
  const [mix, setMix] = useState<DifficultyMix>({ low: 4, mid: 4, high: 2 });
  const [weakWeight, setWeakWeight] = useState(false);
  const [targetType, setTargetType] = useState<'class' | 'student'>('class');
  const [targetNickname, setTargetNickname] = useState('');
  // 「길잡이 별」 집중 출제 — 반이 도움 많이 청한 유형
  const [focusSkillIds, setFocusSkillIds] = useState<string[]>([]);
  const [helpTotals, setHelpTotals] = useState<{ skill_id: string | null; unit_id: string | null; n: number }[]>([]);

  // ── 미리보기 ──
  const [showPreview, setShowPreview] = useState(false);

  // ── 발행 상태 ──
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState('');

  // ── 결과 보드 상태 ──
  const [board, setBoard] = useState<BoardData | null>(null);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardError, setBoardError] = useState('');

  const authHeaders = () => ({
    'X-Teacher-Key': teacherKey,
    'Content-Type': 'application/json',
  });

  const semester = SEMESTERS.find((s) => s.id === selectedSemesterId) ?? SEMESTERS[0];

  // 학기 변경 시 단원 선택 초기화
  const handleSemesterChange = (semId: string) => {
    setSelectedSemesterId(semId);
    setSelectedUnitIds(new Set());
  };

  const toggleUnit = (unitId: string) => {
    setSelectedUnitIds((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  };

  // 집중 출제는 선택된 단원에 속한 유형만 (엔진 풀과 일치)
  const activeFocus = focusSkillIds.filter((id) => {
    try {
      return selectedUnitIds.has(getSkill(id).unitId);
    } catch {
      return false;
    }
  });

  const currentConfig: AssignmentConfig = {
    unitIds: [...selectedUnitIds],
    count,
    mix,
    weakWeight,
    focusSkillIds: activeFocus,
  };

  const alloc = allocate(mix, count);
  const canPublish = selectedUnitIds.size > 0 && count >= 5 && count <= 20;

  // 「길잡이 별」 추천 반영 — 도움 많이 청한 유형의 단원을 자동 선택 + 집중 출제 설정
  const applyHelpRecommendation = () => {
    const top = helpTotals.filter((h) => h.skill_id && h.unit_id).slice(0, 10) as {
      skill_id: string;
      unit_id: string;
      n: number;
    }[];
    if (top.length === 0) return;
    // 가장 많이 도움 청한 유닛들이 속한 학기로 전환
    const semScore = new Map<string, number>();
    for (const h of top) {
      const sem = SEMESTERS.find((s) => s.units.includes(h.unit_id));
      if (sem) semScore.set(sem.id, (semScore.get(sem.id) ?? 0) + h.n);
    }
    const bestSem = [...semScore.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? selectedSemesterId;
    setSelectedSemesterId(bestSem);
    const sem = SEMESTERS.find((s) => s.id === bestSem);
    const units = new Set(top.map((h) => h.unit_id).filter((u) => sem?.units.includes(u)));
    setSelectedUnitIds(units);
    setFocusSkillIds(top.filter((h) => units.has(h.unit_id)).map((h) => h.skill_id));
  };

  // ── 결과 보드 로드 ──
  const loadBoard = useCallback(async () => {
    setBoardLoading(true);
    setBoardError('');
    try {
      const res = await fetch(`/api/teacher/${classCode}/assignments`, {
        headers: { 'X-Teacher-Key': teacherKey },
      });
      if (!res.ok) throw new Error('조회 실패');
      const data = (await res.json()) as BoardData;
      setBoard(data);
    } catch (e) {
      setBoardError(e instanceof Error ? e.message : '서버에 연결할 수 없습니다.');
    } finally {
      setBoardLoading(false);
    }
  }, [classCode, teacherKey]);

  useEffect(() => {
    if (panelTab === 'board') loadBoard();
  }, [panelTab, loadBoard]);

  // 반 「길잡이 별」 집계 로드 (시험 작성 추천용)
  useEffect(() => {
    if (!classCode || !teacherKey) return;
    let alive = true;
    fetch(`/api/teacher/${classCode}/help`, { headers: { 'X-Teacher-Key': teacherKey } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { classTotals?: typeof helpTotals } | null) => {
        if (alive && d?.classTotals) setHelpTotals(d.classTotals);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [classCode, teacherKey]);

  // ── 발행 ──
  const handlePublish = async () => {
    if (!canPublish) return;
    setPublishing(true);
    setPublishMsg('');
    try {
      const body: Record<string, unknown> = {
        title: title.trim() || null,
        targetType,
        config: currentConfig,
      };
      if (targetType === 'student' && targetNickname) {
        body.targetNickname = targetNickname;
      }
      const res = await fetch(`/api/teacher/${classCode}/assignments`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('발행 실패');
      setPublishMsg('시험을 성공적으로 발행했습니다! 학생들이 📜 단원평가 탭에서 응시할 수 있어요.');
      // 결과 보드 리프레시
      await loadBoard();
    } catch (e) {
      setPublishMsg(e instanceof Error ? `오류: ${e.message}` : '서버에 연결할 수 없습니다.');
    } finally {
      setPublishing(false);
    }
  };

  // ── 상태 변경 (마감/재개) ──
  const handleStatusChange = async (id: string, status: 'open' | 'closed') => {
    try {
      await fetch(`/api/teacher/${classCode}/assignments/${id}/status`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      setBoard((prev) =>
        prev
          ? {
              ...prev,
              assignments: prev.assignments.map((a) => (a.id === id ? { ...a, status } : a)),
            }
          : prev,
      );
    } catch {
      /* graceful: 상태 변경 실패는 조용히 무시 */
    }
  };

  return (
    <div className="mt-4">
      {/* 내부 탭 */}
      <div className="flex gap-2 mb-4">
        {([['create', '✏️ 시험 작성'], ['board', '📊 결과 보드']] as const).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setPanelTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              panelTab === t ? 'bg-mana text-white' : 'bg-night-800 text-night-300 border border-night-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ① 시험 작성기 */}
      {panelTab === 'create' && (
        <div className="flex flex-col gap-4">
          {/* 제목 */}
          <label className="flex flex-col gap-1 text-sm">
            <span className="opacity-70">시험 제목 (선택)</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 5학년 1학기 중간 단원평가"
              className="rounded-xl border-2 border-night-700 bg-night-800 px-3 py-2 focus:border-mana focus:outline-none text-sm"
            />
          </label>

          {/* 「길잡이 별」 추천 */}
          {helpTotals.filter((h) => h.skill_id).length > 0 && (
            <div className="rounded-2xl bg-night-900 border border-coin/40 p-3">
              <div className="text-sm font-bold text-coin mb-1.5">🌟 우리 반이 도움을 많이 청한 유형</div>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {helpTotals
                  .filter((h) => h.skill_id)
                  .slice(0, 8)
                  .map((h, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-night-800 border border-night-700 px-2.5 py-0.5 text-xs"
                    >
                      {skillLabel(h.skill_id!)} <span className="text-coin font-bold">{h.n}</span>
                    </span>
                  ))}
              </div>
              <button
                onClick={applyHelpRecommendation}
                className="btn-3d rounded-xl bg-coin/20 border border-coin/40 border-b-coin/50 px-3 py-1.5 text-xs text-coin"
              >
                이 유형 자동 포함 (단원 선택 + 집중 출제)
              </button>
            </div>
          )}

          {/* 학기 선택 */}
          <div>
            <div className="text-sm opacity-70 mb-2">학기 선택</div>
            <div className="flex flex-wrap gap-1.5">
              {SEMESTERS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSemesterChange(s.id)}
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    selectedSemesterId === s.id
                      ? 'bg-mana text-white'
                      : 'bg-night-800 border border-night-700 text-night-300'
                  }`}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 단원 체크박스 */}
          <div>
            <div className="text-sm opacity-70 mb-2">
              출제 단원 선택 <span className="text-xs text-hurt">(최소 1개 필수)</span>
            </div>
            <div className="rounded-2xl bg-night-900 border border-night-700 p-3 flex flex-col gap-1.5">
              {semester.units.map((unitId) => (
                <label key={unitId} className="flex items-center gap-2.5 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUnitIds.has(unitId)}
                    onChange={() => toggleUnit(unitId)}
                    className="accent-mana w-4 h-4"
                  />
                  <span>{UNIT_TITLES[unitId] ?? unitId}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 난이도 비율 */}
          <div>
            <div className="text-sm opacity-70 mb-2">난이도 비율</div>
            <div className="rounded-2xl bg-night-900 border border-night-700 p-3 flex flex-col gap-3">
              {(['low', 'mid', 'high'] as const).map((tier) => {
                const labels: Record<string, string> = {
                  low: '계산(하)',
                  mid: '문장제(중)',
                  high: '심화(상)',
                };
                return (
                  <div key={tier} className="flex items-center gap-3">
                    <span className="w-20 text-sm">{labels[tier]}</span>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={mix[tier]}
                      onChange={(e) => setMix((prev) => ({ ...prev, [tier]: Number(e.target.value) }))}
                      className="flex-1 accent-mana"
                    />
                    <span className="w-4 text-sm text-right tabular-nums">{mix[tier]}</span>
                  </div>
                );
              })}
              {/* 실시간 문항 배분 미리보기 */}
              <div className="mt-1 text-xs opacity-70 bg-night-800 rounded-xl px-3 py-2">
                계산 <span className="text-coin font-bold">{alloc.low}</span>문제 ·
                문장제 <span className="text-coin font-bold">{alloc.mid}</span>문제 ·
                심화 <span className="text-coin font-bold">{alloc.high}</span>문제
              </div>
            </div>
          </div>

          {/* 문항 수 + 약점 가중 */}
          <div className="flex flex-wrap gap-4 items-end">
            <label className="flex flex-col gap-1 text-sm">
              <span className="opacity-70">문항 수 (5~20)</span>
              <input
                type="number"
                min={5}
                max={20}
                value={count}
                onChange={(e) => setCount(Math.min(20, Math.max(5, Number(e.target.value))))}
                className="rounded-xl border-2 border-night-700 bg-night-800 px-3 py-2 w-24 focus:border-mana focus:outline-none text-sm tabular-nums"
              />
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={weakWeight}
                onChange={(e) => setWeakWeight(e.target.checked)}
                className="accent-mana w-4 h-4"
              />
              학생별 자주 틀린 유형 더 내기
            </label>
          </div>

          {/* 집중 출제(길잡이 별) 활성 표시 */}
          {activeFocus.length > 0 && (
            <div className="flex items-center gap-2 text-xs rounded-xl bg-coin/10 text-coin px-3 py-2">
              <span>🌟 집중 출제: {activeFocus.length}개 유형(길잡이 별 반영) — 이 유형이 더 자주 출제돼요.</span>
              <button
                onClick={() => setFocusSkillIds([])}
                className="ml-auto rounded-full bg-night-800 border border-night-700 px-2 py-0.5 hover:text-hurt"
              >
                해제
              </button>
            </div>
          )}

          {/* 대상 */}
          <div>
            <div className="text-sm opacity-70 mb-2">대상</div>
            <div className="flex gap-3 items-center flex-wrap">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  value="class"
                  checked={targetType === 'class'}
                  onChange={() => setTargetType('class')}
                  className="accent-mana"
                />
                반 전체
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  value="student"
                  checked={targetType === 'student'}
                  onChange={() => setTargetType('student')}
                  className="accent-mana"
                />
                특정 학생
              </label>
              {targetType === 'student' && (
                <select
                  value={targetNickname}
                  onChange={(e) => setTargetNickname(e.target.value)}
                  className="rounded-xl border-2 border-night-700 bg-night-800 px-3 py-1.5 text-sm focus:border-mana focus:outline-none"
                >
                  <option value="">학생 선택</option>
                  {students.map((s) => (
                    <option key={s.nickname} value={s.nickname}>
                      {s.nickname}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handlePublish}
              disabled={!canPublish || publishing}
              className="btn-3d rounded-xl bg-glow border-glow border-b-lime-600 px-5 py-2.5 text-night-950 text-sm disabled:opacity-30"
            >
              {publishing ? '발행 중…' : '📜 발행하기'}
            </button>
            <button
              onClick={() => setShowPreview(true)}
              disabled={!canPublish}
              className="btn-3d rounded-xl bg-night-800 border-night-700 border-b-night-600 px-5 py-2.5 text-sm disabled:opacity-30"
            >
              🖨 미리보기·인쇄
            </button>
          </div>

          {publishMsg && (
            <p className={`text-sm rounded-xl px-3 py-2 ${
              publishMsg.startsWith('오류') ? 'bg-hurt/10 text-hurt' : 'bg-glow/10 text-glow'
            }`}>
              {publishMsg}
            </p>
          )}
        </div>
      )}

      {/* ② 결과 보드 */}
      {panelTab === 'board' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-70">발행한 시험 목록</span>
            <button
              onClick={loadBoard}
              disabled={boardLoading}
              className="rounded-full bg-night-800 border border-night-700 px-3 py-1 text-xs hover:text-coin disabled:opacity-40"
            >
              {boardLoading ? '로딩…' : '🔄 새로고침'}
            </button>
          </div>
          {boardError && <p className="text-sm text-hurt mb-2">{boardError}</p>}
          {board && (
            <ResultBoard board={board} onStatusChange={handleStatusChange} />
          )}
          {!board && !boardLoading && !boardError && (
            <p className="text-sm opacity-60 mt-6">조회 중…</p>
          )}
        </div>
      )}

      {/* 인쇄 미리보기 모달 */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-auto py-8 print:bg-transparent print:py-0 print:items-start"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPreview(false);
          }}
        >
          <div className="bg-white text-black rounded-2xl shadow-2xl print:shadow-none print:rounded-none min-w-[640px] max-w-3xl w-full">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 print:hidden">
              <span className="font-bold text-gray-800">학습지 미리보기</span>
              <button
                onClick={() => setShowPreview(false)}
                className="rounded-full bg-gray-100 hover:bg-gray-200 px-3 py-1 text-sm text-gray-700"
              >
                닫기
              </button>
            </div>
            <WorksheetPrint config={currentConfig} title={title.trim() || undefined} />
          </div>
        </div>
      )}
    </div>
  );
}
