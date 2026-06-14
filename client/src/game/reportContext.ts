/**
 * reportContext — 오류 신고('이 문제 이상해요')의 재현 정보를 담는 전역 슬롯.
 * 풀이 화면(GuidingStarButton)이 현재 문제를 등록해 두면, 상단 오류 신고 버튼이
 * 그 맥락(skillId·problemId=skillId:seed·stageId)을 함께 보낸다 → 교사·개발자가 재현 가능.
 */

export interface ReportProblemCtx {
  skillId?: string;
  problemId?: string;
  stageId?: string;
}

let current: ReportProblemCtx | null = null;

export function setReportProblem(ctx: ReportProblemCtx | null): void {
  current = ctx;
}

export function getReportProblem(): ReportProblemCtx | null {
  return current;
}
