/**
 * 문제 본체(지시문 + 수식 + 형식별 입력 뷰)를 한 곳에 모은 표시 전용 컴포넌트.
 * 회랑·첨탑 등 새 풀이 화면에서 6종 포맷 분기를 중복하지 않도록 추출했다.
 * (기존 Lesson/Practice/Exam 페이지는 회귀 방지를 위해 당장 바꾸지 않는다.)
 */

import type { Problem } from '../../generator/types';
import type { UserAnswer } from '../../game/check';
import { answerToText } from '../../generator/render-text';
import { MathView } from '../MathView';
import { ChoiceView } from './ChoiceView';
import { ComparisonView } from './ComparisonView';
import { FractionInputView } from './FractionInputView';
import { DecimalInputView } from './DecimalInputView';
import { FillBlanksView } from './FillBlanksView';
import { MatchingView } from './MatchingView';

export function ProblemBody({
  problem,
  answer,
  onChange,
  locked,
  onMatchingComplete,
  showAnswer = false,
}: {
  problem: Problem;
  answer: UserAnswer | null;
  onChange: (a: UserAnswer) => void;
  locked: boolean;
  onMatchingComplete: (mistakes: number) => void;
  showAnswer?: boolean;
}) {
  return (
    <div className="w-full flex flex-col items-center gap-7">
      <h2 className="text-xl text-center opacity-90">{problem.prompt}</h2>
      {showAnswer && (
        <div className="rounded-full bg-coin/15 text-coin px-4 py-1 text-xs">
          🔑 [교사용] 정답: {answerToText(problem)}
        </div>
      )}
      {problem.expr && problem.format !== 'fill-blanks' && (
        <div className="rounded-3xl bg-night-900 border border-night-700 px-6 py-6 w-full text-center">
          <MathView expr={problem.expr} size="lg" />
        </div>
      )}
      {problem.format === 'choice' && (
        <ChoiceView problem={problem} answer={answer} onChange={onChange} locked={locked} />
      )}
      {problem.format === 'comparison' && (
        <ComparisonView problem={problem} answer={answer} onChange={onChange} locked={locked} />
      )}
      {problem.format === 'fraction-input' && (
        <FractionInputView problem={problem} answer={answer} onChange={onChange} locked={locked} />
      )}
      {problem.format === 'decimal-input' && (
        <DecimalInputView problem={problem} answer={answer} onChange={onChange} locked={locked} />
      )}
      {problem.format === 'fill-blanks' && (
        <div className="rounded-3xl bg-night-900 border border-night-700 px-6 py-8 w-full">
          <FillBlanksView problem={problem} answer={answer} onChange={onChange} locked={locked} />
        </div>
      )}
      {problem.format === 'matching' && (
        <MatchingView problem={problem} locked={locked} onComplete={onMatchingComplete} />
      )}
    </div>
  );
}
