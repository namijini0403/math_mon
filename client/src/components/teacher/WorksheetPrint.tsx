/**
 * 인쇄용 학습지 — 흰 배경·검은 글씨, @media print로 UI 버튼 숨김
 * props: config (AssignmentConfig), title (선택)
 * buildAssignment → generateProblem → answerToText 파이프라인
 */

import { useMemo } from 'react';
import type { AssignmentConfig } from '../../game/assignmentGen';
import { buildAssignment } from '../../game/assignmentGen';
import { generateProblem } from '../../generator';
import { answerToText } from '../../generator/render-text';
import type { Problem } from '../../generator/types';
import { FigureView } from '../figure/FigureView';

// 고정 시드: 인쇄 미리보기에서 항상 같은 문제를 보여준다
const PREVIEW_SEED = 20240403;

interface Props {
  config: AssignmentConfig;
  title?: string;
}

/** 수식 토큰 → 인쇄용 텍스트 (HTML 환경에서 분수는 분자/분모 슬래시로) */
function problemToText(p: Problem): string {
  switch (p.format) {
    case 'choice':
      return p.prompt;
    case 'fill-blanks':
    case 'comparison':
    case 'fraction-input':
    case 'decimal-input':
    case 'matching':
      return p.prompt;
  }
}

/** 보기(선택지) 텍스트 */
function choiceText(c: import('../../generator/types').ChoiceValue): string {
  switch (c.kind) {
    case 'frac':
      return c.whole !== undefined ? `${c.whole} ${c.n}/${c.d}` : `${c.n}/${c.d}`;
    case 'decimal':
      return String(c.v);
    case 'text':
      return c.text;
  }
}

export default function WorksheetPrint({ config, title }: Props) {
  const items = useMemo(() => {
    try {
      return buildAssignment(config, PREVIEW_SEED);
    } catch {
      return [];
    }
  }, [config]);

  const problems = useMemo((): (Problem | null)[] => {
    return items.map((item) => {
      try {
        return generateProblem(item.skillId, item.seed);
      } catch {
        return null;
      }
    });
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="p-8 text-gray-600 text-sm">
        단원을 선택하면 학습지 미리보기가 표시됩니다.
      </div>
    );
  }

  return (
    <div className="bg-white text-black print-worksheet-root">
      {/* 인쇄 버튼 */}
      <div className="flex justify-end p-4 border-b border-gray-100 print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-sm font-bold"
        >
          🖨 인쇄
        </button>
      </div>

      {/* 학습지 본문 */}
      <div className="p-8 print:p-6" style={{ fontFamily: "'Malgun Gothic', sans-serif" }}>
        {/* 헤더 */}
        <div className="mb-6 border-b-2 border-black pb-3">
          <div className="flex justify-between items-end">
            <h1 className="text-xl font-bold">{title ?? '단원평가'}</h1>
            <div className="text-xs text-gray-500">시드: {PREVIEW_SEED}</div>
          </div>
          <div className="flex gap-8 mt-2 text-sm">
            <span>이름: <span className="inline-block w-24 border-b border-black">&nbsp;</span></span>
            <span>날짜: <span className="inline-block w-24 border-b border-black">&nbsp;</span></span>
            <span>점수: <span className="inline-block w-12 border-b border-black">&nbsp;</span> / {problems.filter(Boolean).length}점</span>
          </div>
        </div>

        {/* 문제 목록 */}
        <div className="flex flex-col gap-5">
          {problems.map((p, idx) => {
            if (!p) return (
              <div key={idx} className="text-xs text-gray-400">
                {idx + 1}. (문제 생성 실패)
              </div>
            );

            return (
              <div key={idx} className="flex flex-col gap-1.5 page-break-inside-avoid">
                {/* 문제 번호 + 지시문 */}
                <div className="flex gap-2 items-start">
                  <span className="font-bold text-base w-7 shrink-0">{idx + 1}.</span>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{problemToText(p)}</p>

                    {/* 도해 */}
                    {p.figure && (
                      <div className="my-2 flex justify-start [&_svg]:fill-current [&_text]:fill-black [&_text]:!fill-black">
                        {/* FigureView는 다크 팔레트 사용 — 인쇄 시 SVG 색상 필터로 처리 */}
                        <div className="grayscale contrast-200 invert">
                          <FigureView spec={p.figure} />
                        </div>
                      </div>
                    )}

                    {/* 선택지 (choice) */}
                    {p.format === 'choice' && (
                      <div className="mt-2 grid grid-cols-2 gap-1">
                        {p.choices.map((c, ci) => (
                          <div key={ci} className="flex items-center gap-1.5 text-sm">
                            <span className="font-bold">{(['①', '②', '③', '④'][ci] ?? `${ci + 1}.`)}</span>
                            &nbsp;{choiceText(c)}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 답란 */}
                    <div className="mt-2 text-sm">
                      {p.format === 'fill-blanks' ? (
                        <div className="flex gap-2 items-center">
                          <span className="text-gray-600">답:</span>
                          {p.blankAnswers.map((_, bi) => (
                            <span
                              key={bi}
                              className="inline-block w-12 border-b-2 border-black text-center"
                            >
                              &nbsp;
                            </span>
                          ))}
                        </div>
                      ) : p.format === 'matching' ? (
                        <div className="text-gray-600 text-xs">
                          (같은 값끼리 선으로 연결하세요)
                          <div className="mt-1 flex gap-8">
                            <div className="flex flex-col gap-1">
                              {p.pairs.map((pair, pi) => (
                                <span key={pi} className="border border-gray-400 rounded px-2 py-0.5 text-sm">
                                  {choiceText(pair.left)}
                                </span>
                              ))}
                            </div>
                            <div className="flex flex-col gap-1">
                              {/* 오른쪽 열은 섞어서(역순) 단순 행 정렬로 풀리지 않게 */}
                              {[...p.pairs].reverse().map((pair, pi) => (
                                <span key={pi} className="border border-gray-400 rounded px-2 py-0.5 text-sm">
                                  {choiceText(pair.right)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">답:</span>
                          <span className="inline-block w-28 border-b-2 border-black">&nbsp;</span>
                          {p.format === 'decimal-input' && p.unit && (
                            <span className="text-sm">{p.unit}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 정답 섹션 (페이지 구분) */}
        <div className="mt-10 pt-6 border-t-2 border-dashed border-gray-400">
          <h2 className="text-base font-bold mb-3">【 정 답 】</h2>
          <div className="grid grid-cols-4 gap-2">
            {problems.map((p, idx) => {
              if (!p) return (
                <div key={idx} className="text-xs text-gray-400">{idx + 1}. -</div>
              );
              return (
                <div key={idx} className="text-sm flex gap-1.5">
                  <span className="font-bold">{idx + 1}.</span>
                  <span>{answerToText(p)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 인쇄 전용 스타일 — visibility로 학습지만 남기고 나머지 숨김
          (display:none은 조상이 사라져 빈 페이지가 되므로 visibility 사용) */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-worksheet-root, .print-worksheet-root * { visibility: visible !important; }
          .print-worksheet-root {
            position: absolute !important;
            left: 0; top: 0; width: 100%;
            background: #fff !important;
          }
          @page { margin: 1.5cm; size: A4; }
          .page-break-inside-avoid { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
