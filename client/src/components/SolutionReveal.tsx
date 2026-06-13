/**
 * 풀이 보기 — 정답을 맞혔을 때도 '왜/어떻게'를 펼쳐 볼 수 있는 접이식 풀이.
 * (오답 피드백은 풀이를 바로 보여주므로 이 컴포넌트는 주로 정답 분기에서 쓴다.)
 * 풀이 텍스트는 각 문제의 explanation(MathExpr) — 학년 수준·교육과정 표기로 작성된다.
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { MathExpr } from '../generator/types';
import { MathView } from './MathView';

export function SolutionReveal({
  explanation,
  tone = 'correct',
}: {
  explanation: MathExpr;
  /** 배경 톤 — 정답 시트(연두)/중립 */
  tone?: 'correct' | 'neutral';
}) {
  const [open, setOpen] = useState(false);
  const accent = tone === 'correct' ? 'text-lime-200' : 'text-mana';

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 rounded-full bg-black/20 ${accent} px-3 py-1 text-xs`}
        aria-expanded={open}
      >
        💡 풀이 {open ? '접기' : '보기'}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-2xl bg-black/20 px-4 py-3 text-sm leading-relaxed opacity-95">
              <MathView expr={explanation} size="md" className="justify-start" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
