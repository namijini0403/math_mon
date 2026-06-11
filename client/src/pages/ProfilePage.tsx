/** 프로필 — 통계 + 인증카드 컬렉션 + PNG 다운로드 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame, type EarnedCard } from '../game/store';
import { levelFromXp } from '../game/xp';
import { CardView } from '../components/CardView';
import { downloadCardPng } from '../card/renderCardPng';

export default function ProfilePage() {
  const { nickname, xp, cards, streak, skillStats, resetAll } = useGame();
  const { level } = levelFromXp(xp);
  const [selected, setSelected] = useState<EarnedCard | null>(null);
  const [saving, setSaving] = useState(false);

  const totalCorrect = Object.values(skillStats).reduce((s, v) => s + v.c, 0);

  return (
    <div className="max-w-xl mx-auto px-5 pb-16">
      <div className="flex items-center gap-3 py-4">
        <Link to="/" className="text-2xl opacity-60 hover:opacity-100" aria-label="뒤로">
          ←
        </Link>
        <h1 className="text-xl">내 프로필</h1>
      </div>

      <div className="rounded-3xl bg-night-900 border border-night-700 p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-b from-violet-500 to-violet-700 flex items-center justify-center text-3xl">
          🦊
        </div>
        <div className="flex-1">
          <div className="text-xl">{nickname}</div>
          <div className="text-coin text-sm">Lv.{level} · {xp} XP</div>
        </div>
        <div className="text-center">
          <div className="text-2xl">🔥</div>
          <div className="text-xs opacity-70">{streak.count}일</div>
        </div>
        <div className="text-center">
          <div className="text-2xl">🎯</div>
          <div className="text-xs opacity-70">{totalCorrect}문제</div>
        </div>
      </div>

      <h2 className="mt-7 mb-3 text-lg">
        🃏 인증카드 <span className="text-sm opacity-60">({cards.length}장)</span>
      </h2>
      {cards.length === 0 ? (
        <div className="rounded-3xl bg-night-900 border border-dashed border-night-700 p-10 text-center opacity-60">
          레벨 2가 되면 첫 카드를 받아요!
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {cards.map((c, i) => (
            <button key={i} onClick={() => setSelected(c)} aria-label={`레벨 ${c.level} 카드 보기`}>
              <CardView card={c} nickname={nickname ?? ''} className="hover:scale-105 transition-transform" />
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          if (window.confirm('정말 모든 진행을 지우고 처음부터 시작할까요?')) resetAll();
        }}
        className="mt-12 text-xs opacity-40 underline"
      >
        진행 초기화
      </button>

      {/* 카드 상세 모달 */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-night-950/90 backdrop-blur flex flex-col items-center justify-center gap-5 p-8"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ rotateY: 90 }}
              animate={{ rotateY: 0 }}
              transition={{ duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="w-64"
            >
              <CardView card={selected} nickname={nickname ?? ''} />
            </motion.div>
            <button
              disabled={saving}
              onClick={async (e) => {
                e.stopPropagation();
                setSaving(true);
                await downloadCardPng(selected, nickname ?? '모험가');
                setSaving(false);
              }}
              className="btn-3d rounded-2xl bg-glow border-glow border-b-lime-600 px-8 py-3 text-lg text-night-950 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '📥 PNG로 저장 (프사용)'}
            </button>
            <button onClick={() => setSelected(null)} className="opacity-60">
              닫기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
