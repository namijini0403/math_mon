/** 교사용 현황 — 반 코드 + 교사 키로 진도 / 길잡이 별(도움 요청) / 오류 신고 조회 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { STAGES, UNIT_TITLES } from '../game/stages';
import { levelFromXp } from '../game/xp';
import { getSkill } from '../generator';

interface StudentRow {
  nickname: string;
  xp: number | null;
  stages: Record<string, { stars: number }> | null;
  skill_stats: Record<string, { c: number; w: number }> | null;
  card_count: number | null;
  streak: number | null;
  updated_at: string | null;
}

interface HelpRow { nickname: string; skill_id: string | null; unit_id: string | null; n?: number; stage_id?: string | null; created_at?: string }
interface HelpData { classTotals: HelpRow[]; byStudent: HelpRow[]; recent: HelpRow[] }
interface ReportRow {
  id: string;
  nickname: string | null;
  kind: string;
  message: string | null;
  context: Record<string, unknown> | null;
  status: string;
  created_at: string;
}

type Tab = 'students' | 'help' | 'reports';

/** skillId → 읽기 쉬운 유형 이름 (없으면 id 그대로) */
function skillLabel(skillId: string | null): string {
  if (!skillId) return '(알 수 없음)';
  try { return getSkill(skillId).title; } catch { return skillId; }
}
function unitLabel(unitId: string | null): string {
  if (!unitId) return '';
  return UNIT_TITLES[unitId] ?? unitId;
}

export default function TeacherPage() {
  const [classCode, setClassCode] = useState('');
  const [key, setKey] = useState('');
  const [tab, setTab] = useState<Tab>('students');
  const [students, setStudents] = useState<StudentRow[] | null>(null);
  const [help, setHelp] = useState<HelpData | null>(null);
  const [reports, setReports] = useState<ReportRow[] | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const code = () => classCode.trim().toUpperCase();
  const authHeaders = () => ({ 'X-Teacher-Key': key });

  const fetchJson = async <T,>(path: string): Promise<T> => {
    const res = await fetch(path, { headers: authHeaders() });
    if (!res.ok) throw new Error(res.status === 403 ? '교사 키가 틀렸습니다.' : '조회 실패');
    return (await res.json()) as T;
  };

  const load = async () => {
    setBusy(true); setError('');
    try {
      const data = await fetchJson<{ students: StudentRow[] }>(`/api/teacher/${code()}`);
      setStudents(data.students);
      // 다른 탭 데이터도 미리 받아둔다 (한 번에)
      const [h, r] = await Promise.all([
        fetchJson<HelpData>(`/api/teacher/${code()}/help`).catch(() => null),
        fetchJson<{ reports: ReportRow[] }>(`/api/teacher/${code()}/reports`).catch(() => null),
      ]);
      if (h) setHelp(h);
      if (r) setReports(r.reports);
    } catch (e) {
      setError(e instanceof Error ? e.message : '서버에 연결할 수 없습니다.');
    } finally {
      setBusy(false);
    }
  };

  const createClass = async () => {
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/teacher/class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code(), key }),
      });
      if (!res.ok) throw new Error('반 생성 실패 (코드는 영문 대문자/숫자 3~8자)');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : '서버에 연결할 수 없습니다.');
    } finally {
      setBusy(false);
    }
  };

  const loaded = students !== null;

  return (
    <div className="max-w-3xl mx-auto px-5 pb-16">
      <div className="flex items-center gap-3 py-4">
        <Link to="/" className="text-2xl opacity-60 hover:opacity-100">←</Link>
        <h1 className="text-xl">교사용 현황판</h1>
      </div>

      <div className="rounded-3xl bg-night-900 border border-night-700 p-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          반 코드
          <input
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase().slice(0, 8))}
            placeholder="TIGER5"
            className="rounded-xl border-2 border-night-700 bg-night-800 px-3 py-2 uppercase focus:border-mana focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          교사 키
          <input
            value={key}
            type="password"
            onChange={(e) => setKey(e.target.value)}
            className="rounded-xl border-2 border-night-700 bg-night-800 px-3 py-2 focus:border-mana focus:outline-none"
          />
        </label>
        <button onClick={load} disabled={busy || !classCode || !key} className="btn-3d rounded-xl bg-glow border-glow border-b-lime-600 px-5 py-2 text-night-950 disabled:opacity-30">
          조회
        </button>
        <button onClick={createClass} disabled={busy || !classCode || !key} className="btn-3d rounded-xl bg-night-800 border-night-800 border-b-night-700 px-5 py-2 disabled:opacity-30">
          이 코드로 반 만들기
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-hurt">{error}</p>}

      {loaded && (
        <>
          <div className="mt-5 flex gap-2">
            {([['students', '📊 진도'], ['help', '⭐ 길잡이 별'], ['reports', '🐞 오류 신고']] as const).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-sm transition ${
                  tab === t ? 'bg-mana text-white' : 'bg-night-800 text-night-300 border border-night-700'
                }`}
              >
                {label}
                {t === 'reports' && reports && reports.filter((r) => r.status !== 'resolved').length > 0 && (
                  <span className="ml-1 rounded-full bg-hurt text-white text-[0.6rem] px-1.5 py-0.5">
                    {reports.filter((r) => r.status !== 'resolved').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === 'students' && <StudentsTable students={students!} />}
          {tab === 'help' && <HelpView help={help} />}
          {tab === 'reports' && (
            <ReportsView
              reports={reports}
              showResolved={showResolved}
              setShowResolved={setShowResolved}
              onResolve={async (ids) => {
                await fetch(`/api/teacher/${code()}/reports/resolve`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', ...authHeaders() },
                  body: JSON.stringify({ ids, status: 'resolved' }),
                }).catch(() => undefined);
                setReports((prev) => prev?.map((r) => (ids.includes(r.id) ? { ...r, status: 'resolved' } : r)) ?? null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

// ── 진도 표 (기존) ───────────────────────────────────────────────────────────
function StudentsTable({ students }: { students: StudentRow[] }) {
  if (students.length === 0) return <p className="mt-6 opacity-60">아직 가입한 학생이 없어요.</p>;
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left opacity-60 border-b border-night-700">
            <th className="py-2 pr-3">닉네임</th>
            <th className="py-2 pr-3">레벨</th>
            <th className="py-2 pr-3">XP</th>
            <th className="py-2 pr-3">진행 스테이지</th>
            <th className="py-2 pr-3">정답률</th>
            <th className="py-2 pr-3">카드</th>
            <th className="py-2 pr-3">스트릭</th>
            <th className="py-2">마지막 활동</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => {
            const stats = Object.values(s.skill_stats ?? {});
            const c = stats.reduce((a, v) => a + v.c, 0);
            const w = stats.reduce((a, v) => a + v.w, 0);
            const cleared = Object.values(s.stages ?? {}).filter((v) => v.stars > 0).length;
            return (
              <tr key={s.nickname} className="border-b border-night-800">
                <td className="py-2.5 pr-3">{s.nickname}</td>
                <td className="py-2.5 pr-3 text-coin">Lv.{levelFromXp(s.xp ?? 0).level}</td>
                <td className="py-2.5 pr-3">{s.xp ?? 0}</td>
                <td className="py-2.5 pr-3">{cleared}/{STAGES.length}</td>
                <td className="py-2.5 pr-3">{c + w > 0 ? `${Math.round((c / (c + w)) * 100)}%` : '-'}</td>
                <td className="py-2.5 pr-3">{s.card_count ?? 0}장</td>
                <td className="py-2.5 pr-3">{s.streak ?? 0}일</td>
                <td className="py-2.5 text-xs opacity-60">{s.updated_at ? new Date(s.updated_at).toLocaleString('ko-KR') : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── 길잡이 별(도움 요청) ──────────────────────────────────────────────────────
function HelpView({ help }: { help: HelpData | null }) {
  if (!help) return <p className="mt-6 opacity-60">불러오지 못했어요 (서버 연결 확인).</p>;
  if (help.classTotals.length === 0) return <p className="mt-6 opacity-60">아직 띄워진 길잡이 별이 없어요.</p>;

  // 학생별 묶기
  const byName = new Map<string, HelpRow[]>();
  for (const r of help.byStudent) {
    const arr = byName.get(r.nickname) ?? [];
    arr.push(r);
    byName.set(r.nickname, arr);
  }

  return (
    <div className="mt-4 flex flex-col gap-6">
      <section>
        <h2 className="text-sm font-bold mb-2">📈 우리 반이 많이 도움을 청한 유형</h2>
        <div className="flex flex-col gap-1">
          {help.classTotals.slice(0, 12).map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="w-8 text-right tabular-nums font-bold text-coin">{r.n}</span>
              <span className="flex-1">{skillLabel(r.skill_id)}</span>
              <span className="text-xs opacity-50">{unitLabel(r.unit_id)}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold mb-2">🙋 학생별 어려워하는 유형</h2>
        <div className="flex flex-col gap-3">
          {[...byName.entries()].map(([name, rows]) => (
            <div key={name} className="rounded-2xl bg-night-900 border border-night-700 p-3">
              <div className="font-bold text-sm mb-1">{name}
                <span className="ml-2 text-xs opacity-50">총 {rows.reduce((a, r) => a + (r.n ?? 0), 0)}회</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {rows.slice(0, 6).map((r, i) => (
                  <span key={i} className="rounded-full bg-night-800 border border-night-700 px-2.5 py-0.5 text-xs">
                    {skillLabel(r.skill_id)} <span className="text-coin font-bold">{r.n}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── 오류 신고 트리아지 ────────────────────────────────────────────────────────
interface ReportGroup {
  key: string;
  kind: string;
  label: string;
  detail: string;
  count: number;
  ids: string[];
  openIds: string[];
  messages: string[];
  latest: string;
}

function groupReports(reports: ReportRow[]): ReportGroup[] {
  const map = new Map<string, ReportGroup>();
  for (const r of reports) {
    const ctx = r.context ?? {};
    const skillId = typeof ctx.skillId === 'string' ? ctx.skillId : null;
    const route = typeof ctx.route === 'string' ? ctx.route : '';
    const key = `${r.kind}|${skillId ?? route}`;
    const g = map.get(key) ?? {
      key,
      kind: r.kind,
      label: r.kind === 'problem' ? (skillId ? skillLabel(skillId) : '문제 오류') : '기능 오류',
      detail: skillId ? `${skillId}` : route,
      count: 0,
      ids: [],
      openIds: [],
      messages: [],
      latest: r.created_at,
    };
    g.count += 1;
    g.ids.push(r.id);
    if (r.status !== 'resolved') g.openIds.push(r.id);
    if (r.message) g.messages.push(r.message);
    if (r.created_at > g.latest) g.latest = r.created_at;
    map.set(key, g);
  }
  return [...map.values()].sort((a, b) => b.openIds.length - a.openIds.length || b.count - a.count);
}

function ReportsView({ reports, showResolved, setShowResolved, onResolve }: {
  reports: ReportRow[] | null;
  showResolved: boolean;
  setShowResolved: (v: boolean) => void;
  onResolve: (ids: string[]) => void;
}) {
  const [copied, setCopied] = useState(false);
  if (!reports) return <p className="mt-6 opacity-60">불러오지 못했어요 (서버 연결 확인).</p>;
  const visible = showResolved ? reports : reports.filter((r) => r.status !== 'resolved');
  if (visible.length === 0) return (
    <div className="mt-6">
      <p className="opacity-60">{showResolved ? '신고가 없어요.' : '처리할 신고가 없어요. 👍'}</p>
      <label className="mt-3 flex items-center gap-2 text-xs opacity-70">
        <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />
        처리완료 포함 보기
      </label>
    </div>
  );

  const groups = groupReports(visible);

  // 개발자 전달용 요약 (클립보드 복사 → 채팅에 붙여넣기)
  const summary = groups.map((g) => {
    const head = `- [${g.kind === 'problem' ? '문제' : '기능'}] ${g.label} ×${g.openIds.length || g.count}${g.detail ? ` (${g.detail})` : ''}`;
    const msgs = [...new Set(g.messages)].slice(0, 3).map((m) => `    · "${m}"`).join('\n');
    return msgs ? `${head}\n${msgs}` : head;
  }).join('\n');

  const copySummary = async () => {
    try { await navigator.clipboard.writeText(`오류 신고 요약 (${new Date().toLocaleDateString('ko-KR')})\n${summary}`); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* noop */ }
  };

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs opacity-70">
          <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />
          처리완료 포함
        </label>
        <button onClick={copySummary} className="rounded-full bg-night-800 border border-night-700 px-3 py-1 text-xs hover:text-coin">
          {copied ? '복사됨!' : '📋 요약 복사 (개발자 전달용)'}
        </button>
      </div>

      {groups.map((g) => (
        <div key={g.key} className="rounded-2xl bg-night-900 border border-night-700 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-bold text-sm">
                {g.kind === 'problem' ? '🐞' : '🔧'} {g.label}
                <span className="ml-2 rounded-full bg-coin/20 text-coin text-xs px-2 py-0.5">×{g.openIds.length || g.count}</span>
              </div>
              {g.detail && <div className="text-[0.65rem] opacity-50 truncate">{g.detail}</div>}
            </div>
            {g.openIds.length > 0 && (
              <button onClick={() => onResolve(g.openIds)} className="shrink-0 rounded-full bg-night-800 border border-night-700 px-2.5 py-1 text-xs hover:text-glow">
                처리완료
              </button>
            )}
          </div>
          {g.messages.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1">
              {[...new Set(g.messages)].slice(0, 4).map((m, i) => (
                <li key={i} className="text-xs opacity-80 bg-night-800 rounded-lg px-2 py-1">“{m}”</li>
              ))}
            </ul>
          )}
          <div className="text-[0.6rem] opacity-40 mt-1.5">최근: {new Date(g.latest).toLocaleString('ko-KR')}</div>
        </div>
      ))}
    </div>
  );
}
