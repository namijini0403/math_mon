/**
 * ErrorReportButton — 상단의 작은 오류 신고 버튼.
 * '🐞 이 문제 이상해요' / '🔧 기능이 안 돼요' 두 갈래로, 현재 화면·문제 맥락을
 * 자동으로 담아 서버에 보낸다(반자동 수집). 교사 현황판에서 자동 분류·중복 묶기로
 * 정리되어, 사람이 거의 손대지 않아도 정돈된 신고 목록이 만들어진다.
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../game/store';
import { sendErrorReport } from '../api';
import { getReportProblem } from '../game/reportContext';

type Kind = 'problem' | 'feature';

function deviceType(): string {
  try { return localStorage.getItem('draconis-device') || 'unknown'; } catch { return 'unknown'; }
}

export function ErrorReportButton() {
  const nickname = useGame((s) => s.nickname);
  const classCode = useGame((s) => s.classCode);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>('problem');
  const [message, setMessage] = useState('');
  const [phase, setPhase] = useState<'form' | 'sending' | 'done'>('form');

  const reset = () => { setKind('problem'); setMessage(''); setPhase('form'); };
  const close = () => { setOpen(false); setTimeout(reset, 200); };

  const submit = async () => {
    setPhase('sending');
    const prob = getReportProblem();
    await sendErrorReport({
      kind,
      message: message.trim() || undefined,
      classCode,
      nickname,
      context: {
        route: typeof location !== 'undefined' ? location.hash || location.pathname : '',
        skillId: prob?.skillId,
        problemId: prob?.problemId,
        stageId: prob?.stageId,
        device: deviceType(),
        ua: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 200) : '',
      },
    });
    setPhase('done');
    setTimeout(close, 1400);
  };

  return (
    <>
      {/* 상단 작은 버튼 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="오류 신고"
        className="fixed top-2 right-2 z-50 flex items-center gap-1 rounded-full bg-night-900/80 border border-night-700 px-2.5 py-1 text-[0.7rem] text-night-300 backdrop-blur hover:text-coin hover:border-coin/40"
      >
        🐞 신고
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              className="w-full max-w-sm rounded-3xl bg-night-900 border border-night-700 p-5"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {phase === 'done' ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">📨</div>
                  <p className="font-bold">신고가 접수됐어요. 고마워요!</p>
                  <p className="text-xs opacity-60 mt-1">선생님이 확인하고 고칠 거예요.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold">무엇이 이상한가요?</h2>
                    <button onClick={close} className="text-xl opacity-60 hover:opacity-100" aria-label="닫기">✕</button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {([
                      ['problem', '🐞 이 문제가\n이상해요', '답·설명이 틀렸거나 깨졌어요'],
                      ['feature', '🔧 기능이\n안 돼요', '버튼·화면이 작동하지 않아요'],
                    ] as const).map(([k, label, desc]) => (
                      <button
                        key={k}
                        onClick={() => setKind(k)}
                        className={`rounded-2xl border p-3 text-left transition ${
                          kind === k
                            ? 'border-coin bg-coin/15 text-coin'
                            : 'border-night-700 bg-night-800 text-night-300'
                        }`}
                      >
                        <div className="font-bold whitespace-pre-line text-sm leading-tight">{label}</div>
                        <div className="text-[0.65rem] opacity-70 mt-1 leading-tight">{desc}</div>
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 300))}
                    placeholder="어떤 점이 이상한지 알려줄래요? (안 써도 돼요)"
                    rows={3}
                    className="w-full rounded-2xl border-2 border-night-700 bg-night-800 px-3 py-2 text-sm focus:border-mana focus:outline-none resize-none"
                  />

                  <button
                    onClick={submit}
                    disabled={phase === 'sending'}
                    className="btn-3d w-full mt-3 rounded-2xl py-3 text-lg bg-glow border-glow border-b-lime-600 text-night-950 disabled:opacity-40"
                  >
                    {phase === 'sending' ? '보내는 중…' : '신고 보내기'}
                  </button>
                  <p className="text-[0.65rem] opacity-50 mt-2 text-center">
                    지금 화면 정보가 함께 전송돼요 (이름·자유 글 외 개인정보 없음).
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
