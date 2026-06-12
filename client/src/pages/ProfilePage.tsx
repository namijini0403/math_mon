/** 프로필 — 통계 + 배지 컬렉션 + 인증 메달 + 보물 카드 도감 링크 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../game/store';
import { levelFromXp } from '../game/xp';
import { MedalView } from '../components/MedalView';
import { BADGES, type BadgeDef } from '../game/badges';
import { dragonEmoji } from '../game/dragon';
import { STAGES } from '../game/stages';
import { REWARD_CARDS } from '../game/rewardCards';

/** 희귀도별 테두리 + glow 스타일 */
function rarityStyle(rarity: 1 | 2 | 3): string {
  if (rarity === 3) return 'border-coin shadow-[0_0_10px_2px_rgba(251,191,36,0.55)]';
  if (rarity === 2) return 'border-[#c0c0c0] shadow-[0_0_8px_1px_rgba(192,192,192,0.45)]';
  return 'border-[#cd7f32] shadow-[0_0_6px_1px_rgba(205,127,50,0.35)]';
}

export default function ProfilePage() {
  const {
    nickname, xp, cards, streak, skillStats, badges, rewardCards, dragon,
    showAnswers, toggleShowAnswers, devUnlockAll, dragonGain, resetAll,
  } = useGame();
  const [devOpen, setDevOpen] = useState(false);
  const { level } = levelFromXp(xp);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDef | null>(null);

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
          {dragonEmoji(dragon)}
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

      {/* ── 배지 컬렉션 ── */}
      <h2 className="mt-7 mb-3 text-lg flex items-center gap-2">
        🏅 배지{' '}
        <span className="text-sm opacity-60">
          ({badges.length}/{BADGES.length})
        </span>
      </h2>
      <div className="rounded-3xl bg-night-900 border border-night-700 p-4">
        <div className="grid grid-cols-4 gap-3">
          {BADGES.map((b) => {
            const owned = badges.includes(b.id);
            return (
              <motion.button
                key={b.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedBadge(selectedBadge?.id === b.id ? null : b)}
                aria-label={owned ? `${b.name}: ${b.desc}` : '잠긴 배지'}
                className={`flex flex-col items-center rounded-2xl border-2 p-2 gap-1 transition-all ${
                  owned
                    ? rarityStyle(b.rarity)
                    : 'border-night-700 opacity-30 grayscale'
                } ${selectedBadge?.id === b.id ? 'ring-2 ring-white/40' : ''}`}
              >
                <span className="text-2xl leading-none">
                  {owned ? b.emoji : '🔒'}
                </span>
                <span className="text-[9px] leading-tight text-center line-clamp-2 opacity-80">
                  {owned ? b.name : '???'}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* 배지 상세 — 탭한 배지 하단에 표시 */}
        <AnimatePresence>
          {selectedBadge && (
            <motion.div
              key={selectedBadge.id}
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div
                className={`mt-4 rounded-2xl border-2 p-4 flex items-center gap-3 ${
                  badges.includes(selectedBadge.id)
                    ? rarityStyle(selectedBadge.rarity)
                    : 'border-night-700 opacity-50'
                } bg-night-800`}
              >
                <span className="text-4xl">
                  {badges.includes(selectedBadge.id) ? selectedBadge.emoji : '🔒'}
                </span>
                <div className="flex-1">
                  <div className="font-bold text-sm">
                    {badges.includes(selectedBadge.id) ? selectedBadge.name : '???'}
                  </div>
                  <div className="text-xs opacity-70 mt-0.5">
                    {badges.includes(selectedBadge.id)
                      ? selectedBadge.desc
                      : '아직 획득하지 못한 배지예요. 계속 도전해 보세요!'}
                  </div>
                  {badges.includes(selectedBadge.id) && (
                    <div className="text-[10px] mt-1 opacity-50">
                      {selectedBadge.rarity === 3
                        ? '✨ 골드 — 최고 등급 배지!'
                        : selectedBadge.rarity === 2
                          ? '🥈 실버 배지'
                          : '🥉 브론즈 배지'}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="opacity-40 text-xl px-1"
                  aria-label="닫기"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 보물 카드 도감 바로가기 ── */}
      <Link
        to="/cards"
        className="mt-7 btn-3d rounded-3xl bg-night-900 border-2 border-night-700 border-b-night-700 p-4 flex items-center gap-3 hover:bg-night-800"
      >
        <span className="text-3xl">🎴</span>
        <div className="flex-1">
          <div className="text-base">나의 보물 카드 도감</div>
          <div className="text-xs opacity-60">
            {rewardCards.length}/{REWARD_CARDS.length}장 수집 · 카드 이미지 저장은 여기서!
          </div>
        </div>
        <span className="opacity-40 text-xl">›</span>
      </Link>

      {/* ── 인증 메달 ── */}
      <h2 className="mt-7 mb-3 text-lg">
        🏵️ 인증 메달 <span className="text-sm opacity-60">({cards.length}개)</span>
      </h2>
      {cards.length === 0 ? (
        <div className="rounded-3xl bg-night-900 border border-dashed border-night-700 p-10 text-center opacity-60">
          레벨 2가 되면 첫 메달을 받아요!
        </div>
      ) : (
        <div className="rounded-3xl bg-night-900 border border-night-700 p-4 grid grid-cols-4 gap-4">
          {cards.map((c, i) => (
            <MedalView key={i} card={c} />
          ))}
        </div>
      )}

      {/* ── 교사용 체험 도구 (확인 코드 필요) ── */}
      <div className="mt-12 flex flex-col gap-2">
        <button
          onClick={() => {
            if (devOpen) {
              setDevOpen(false);
              return;
            }
            const code = window.prompt('교사 확인 코드를 입력하세요');
            if (code === '0403') setDevOpen(true);
            else if (code !== null) window.alert('코드가 맞지 않아요.');
          }}
          className="text-xs opacity-40 underline self-start"
        >
          🧑‍🏫 교사용 체험 도구
        </button>
        {devOpen && (
          <div className="rounded-2xl border border-coin/40 bg-night-900 p-4 flex flex-col gap-2">
            <button
              onClick={() => {
                devUnlockAll(STAGES.map((s) => s.id));
                window.alert('모든 스테이지가 열렸어요! 지도에서 보스전까지 바로 들어갈 수 있어요.');
              }}
              className="btn-3d rounded-xl bg-night-800 border-night-800 border-b-night-700 px-4 py-2 text-sm text-left"
            >
              🔓 모든 스테이지 잠금 해제 (보스전 바로 체험)
            </button>
            <button
              onClick={toggleShowAnswers}
              className="btn-3d rounded-xl bg-night-800 border-night-800 border-b-night-700 px-4 py-2 text-sm text-left"
            >
              🔑 문제 화면에 정답 표시: {showAnswers ? '켜짐 ✅' : '꺼짐'}
            </button>
            <button
              onClick={() => dragonGain({ gp: 100 })}
              className="btn-3d rounded-xl bg-night-800 border-night-800 border-b-night-700 px-4 py-2 text-sm text-left"
            >
              🐲 드래곤 성장 +100 (성장 단계 미리 보기)
            </button>
            <div className="text-[10px] opacity-50">
              체험·시연용 도구예요. 학생 계정에서는 사용하지 마세요!
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => {
          if (window.confirm('정말 모든 진행을 지우고 처음부터 시작할까요?')) resetAll();
        }}
        className="mt-4 text-xs opacity-40 underline"
      >
        진행 초기화
      </button>

    </div>
  );
}
