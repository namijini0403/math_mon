/**
 * GuidingStarButton — 「길잡이 별 띄우기」. 너무 어려운 문제에 도움 신호를 보낸다.
 * 선생님 현황판에 누적되어, 개인이 어떤 유형을 어려워하는지·반이 어떤 유형에
 * 도움을 많이 청했는지 보여준다. 문제가 바뀌면 다시 띄울 수 있다.
 */

import { useEffect, useState } from 'react';
import { sendHelpRequest } from '../api';
import { getSkill } from '../generator';
import { setReportProblem } from '../game/reportContext';

export function GuidingStarButton({ skillId, stageId, problemId }: {
  skillId?: string;
  stageId?: string;
  problemId?: string;
}) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  // 문제가 바뀌면 다시 띄울 수 있도록 초기화 + 오류 신고용 현재 문제 등록
  useEffect(() => {
    setSent(false);
    setReportProblem({ skillId, problemId, stageId });
    return () => setReportProblem(null);
  }, [skillId, problemId, stageId]);

  const onClick = async () => {
    if (sent || busy) return;
    setBusy(true);
    let unitId: string | undefined;
    try { unitId = skillId ? getSkill(skillId).unitId : undefined; } catch { unitId = undefined; }
    await sendHelpRequest({ skillId, unitId, stageId, problemId });
    setBusy(false);
    setSent(true);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={sent || busy}
      className={`mx-auto mt-3 flex items-center gap-1 rounded-full px-3 py-1 text-xs transition ${
        sent
          ? 'bg-coin/20 text-coin border border-coin/40'
          : 'bg-night-800 text-night-300 border border-night-700 hover:text-coin hover:border-coin/40'
      }`}
    >
      {sent ? '⭐ 길잡이 별을 띄웠어요! 선생님이 도와주실 거예요' : '⭐ 너무 어려워요 — 길잡이 별 띄우기'}
    </button>
  );
}
