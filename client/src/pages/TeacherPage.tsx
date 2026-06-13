/** 교사용 현황 — 반 코드 + 교사 키로 학생 진도 조회, 반 생성 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { STAGES } from '../game/stages';
import { levelFromXp } from '../game/xp';

interface StudentRow {
  nickname: string;
  xp: number | null;
  stages: Record<string, { stars: number }> | null;
  skill_stats: Record<string, { c: number; w: number }> | null;
  card_count: number | null;
  streak: number | null;
  updated_at: string | null;
}

export default function TeacherPage() {
  const [classCode, setClassCode] = useState('');
  const [key, setKey] = useState('');
  const [students, setStudents] = useState<StudentRow[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/teacher/${classCode.trim().toUpperCase()}`, {
        headers: { 'X-Teacher-Key': key },
      });
      if (!res.ok) throw new Error(res.status === 403 ? '교사 키가 틀렸습니다.' : '조회 실패');
      const data = (await res.json()) as { students: StudentRow[] };
      setStudents(data.students);
    } catch (e) {
      setError(e instanceof Error ? e.message : '서버에 연결할 수 없습니다.');
    } finally {
      setBusy(false);
    }
  };

  const createClass = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/teacher/class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: classCode.trim().toUpperCase(), key }),
      });
      if (!res.ok) throw new Error('반 생성 실패 (코드는 영문 대문자/숫자 3~8자)');
      setError('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : '서버에 연결할 수 없습니다.');
    } finally {
      setBusy(false);
    }
  };

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

      {students && (
        <div className="mt-6 overflow-x-auto">
          {students.length === 0 ? (
            <p className="opacity-60">아직 가입한 학생이 없어요.</p>
          ) : (
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
                      <td className="py-2.5 text-xs opacity-60">
                        {s.updated_at ? new Date(s.updated_at).toLocaleString('ko-KR') : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
