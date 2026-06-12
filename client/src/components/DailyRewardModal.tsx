/** 일일 출석 보상 모달 — 마운트 시 오늘 미수령이면 자동 팝업 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../game/store';
import { dailyRewardXp } from '../game/badges';
import { RARITY_COLOR, RARITY_LABEL, type RewardCardDef } from '../game/rewardCards';
import { sfx } from '../game/sounds';
import type { EarnedCard } from '../game/store';
import type { BadgeDef } from '../game/badges';

const TODAY = new Date().toLocaleDateString('sv');

/** 파티클 ✨ 위치 목록 — 터질 때 absolute 배치 */
const PARTICLES = [
  { x: -90, y: -80 },
  { x: 0,   y: -110 },
  { x: 90,  y: -80 },
  { x: -110, y: 0 },
  { x: 110,  y: 0 },
  { x: -70,  y: 80 },
  { x: 0,    y: 100 },
  { x: 70,   y: 80 },
];

/** 연속 출석 일차별 캘린더 스트립 */
function CalendarStrip({ streak }: { streak: number }) {
  const activeDay = Math.min(streak, 7);
  const xpList = [10, 15, 20, 25, 30, 40, 50];

  return (
    <div className="flex gap-1.5 justify-center">
      {xpList.map((xp, i) => {
        const day = i + 1;
        const isPast = day < activeDay;
        const isToday = day === activeDay;
        return (
          <div
            key={day}
            className={`flex flex-col items-center rounded-xl px-1.5 py-2 w-10 border transition-all ${
              isToday
                ? 'bg-coin/20 border-coin shadow-[0_0_12px_2px_rgba(251,191,36,0.5)]'
                : isPast
                  ? 'bg-night-800 border-night-700 opacity-70'
                  : 'bg-night-900 border-night-700 opacity-40'
            }`}
          >
            <span className="text-[10px] opacity-70">{day}일</span>
            <span className="text-lg leading-tight">
              {isPast ? '✅' : isToday ? '🌟' : '🎁'}
            </span>
            <span className={`text-[9px] font-bold ${isToday ? 'text-coin' : 'opacity-60'}`}>
              +{xp}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function DailyRewardModal() {
  const { attendance, streak, claimDailyReward, evaluateBadges } = useGame();

  // 오늘 이미 받았으면 모달 안 뜸
  const shouldShow = attendance.lastClaim !== TODAY;
  const [visible, setVisible] = useState(shouldShow);
  const [opened, setOpened] = useState(false);
  const [reward, setReward] = useState<{
    xp: number;
    day: number;
    cards: EarnedCard[];
    drawn: RewardCardDef;
    duplicate: boolean;
  } | null>(null);
  const [newBadges, setNewBadges] = useState<BadgeDef[]>([]);

  // 스트릭: 아직 오늘 claimDailyReward 안 했으니 미리 계산 (어제 접속했으면 +1, 아니면 1)
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('sv');
  const displayStreak = streak.last === yesterday ? streak.count + 1 : streak.last === TODAY ? streak.count : 1;
  const todayXp = dailyRewardXp(displayStreak);

  // 다른 곳에서 수령 처리된 경우만 닫기 (열어서 보상 화면을 보는 중에는 닫지 않음)
  useEffect(() => {
    if (attendance.lastClaim === TODAY && !opened) setVisible(false);
  }, [attendance.lastClaim, opened]);

  if (!visible) return null;

  function handleOpen() {
    if (opened) return;
    const result = claimDailyReward();
    if (!result) {
      setVisible(false);
      return;
    }
    setReward(result);
    const earned = evaluateBadges();
    setNewBadges(earned);
    setOpened(true);
    sfx.fanfare();
  }

  function handleClose() {
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="daily-reward-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-night-950/95 backdrop-blur-sm flex flex-col items-center justify-center px-6"
        >
          {/* 배경 별빛 반짝임 */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(16)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-xs text-coin/40 select-none"
                style={{
                  left: `${(i * 37 + 5) % 95}%`,
                  top: `${(i * 53 + 8) % 88}%`,
                }}
                animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
              >
                ✦
              </motion.span>
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="relative w-full max-w-sm rounded-3xl bg-night-900 border border-night-700 p-7 flex flex-col items-center gap-5 shadow-2xl"
          >
            {!opened ? (
              /* ── 미수령 상태 ── */
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold">출석 선물이 도착했어요! 🎉</div>
                  <div className="mt-1 text-sm opacity-70">매일 접속하면 보상이 더 커져요</div>
                </div>

                {/* 연속 출석 표시 */}
                <div className="flex items-center gap-2 bg-night-800 rounded-2xl px-4 py-2">
                  <span className="text-2xl">🔥</span>
                  <span className="text-coin font-bold text-lg">{displayStreak}일째 연속 출석!</span>
                </div>

                {/* 캘린더 스트립 */}
                <CalendarStrip streak={displayStreak} />

                {/* 오늘 보상 미리보기 */}
                <div className="text-center text-sm opacity-80">
                  오늘 보상:{' '}
                  <span className="text-coin font-bold text-base">+{todayXp} XP</span>
                </div>

                {/* 보물상자 — 흔들리다가 탭하면 열림 */}
                <motion.button
                  onClick={handleOpen}
                  animate={{ rotate: [-4, 4, -4, 4, 0], scale: [1, 1.04, 1, 1.04, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.8 }}
                  whileTap={{ scale: 0.88 }}
                  aria-label="선물 열기"
                  className="text-8xl mt-1 cursor-pointer select-none drop-shadow-lg"
                >
                  🎁
                </motion.button>

                <div className="text-sm opacity-60 animate-pulse">탭해서 열어보세요!</div>
              </>
            ) : (
              /* ── 수령 완료 상태 ── */
              <>
                {/* 폭발 파티클 */}
                {PARTICLES.map((p, i) => (
                  <motion.span
                    key={i}
                    className="absolute text-2xl pointer-events-none select-none"
                    style={{ left: '50%', top: '40%' }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                    animate={{
                      x: p.x,
                      y: p.y,
                      opacity: [1, 1, 0],
                      scale: [0.5, 1.4, 0.8],
                      rotate: [0, 180, 360],
                    }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.04 }}
                  >
                    ✨
                  </motion.span>
                ))}

                {/* 뽑은 보상 카드 — 뒤집기 연출 */}
                {reward && (
                  <motion.div
                    initial={{ rotateY: 180, scale: 0.6, opacity: 0 }}
                    animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                    transition={{ duration: 0.7, type: 'spring', stiffness: 160, damping: 18 }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <img
                      src={reward.drawn.src}
                      alt={reward.drawn.name}
                      className="w-40 rounded-2xl border-4 shadow-2xl"
                      style={{
                        borderColor: RARITY_COLOR[reward.drawn.rarity],
                        boxShadow: `0 0 24px 4px ${RARITY_COLOR[reward.drawn.rarity]}66`,
                      }}
                    />
                    <div className="text-base font-bold mt-1">{reward.drawn.name}</div>
                    <div className="text-xs font-bold" style={{ color: RARITY_COLOR[reward.drawn.rarity] }}>
                      {RARITY_LABEL[reward.drawn.rarity]}
                    </div>
                    {reward.duplicate && (
                      <div className="text-xs opacity-70">이미 모은 카드라 보너스 XP로 받았어요!</div>
                    )}
                  </motion.div>
                )}

                {/* XP */}
                <motion.div
                  initial={{ scale: 0.3, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, type: 'spring', stiffness: 300 }}
                  className="text-center"
                >
                  <div className="text-5xl font-bold text-coin drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]">
                    +{reward?.xp} XP!
                  </div>
                  <div className="mt-1 text-sm opacity-70">
                    {reward?.day}일째 연속 출석 보상이에요! 🔥
                  </div>
                </motion.div>

                {/* 카드 획득 */}
                {reward && reward.cards.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-2xl bg-night-800 border border-coin/40 px-4 py-2 text-sm text-coin text-center"
                  >
                    🃏 레벨업 카드도 획득했어요!
                  </motion.div>
                )}

                {/* 새 배지 */}
                {newBadges.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="text-sm opacity-70">새 배지 획득!</div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {newBadges.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center gap-1.5 bg-night-800 border border-coin/50 rounded-xl px-3 py-1.5"
                        >
                          <span className="text-xl">{b.emoji}</span>
                          <span className="text-sm font-bold">{b.name}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 받기 버튼 */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                  onClick={handleClose}
                  className="btn-3d rounded-2xl bg-glow border-glow border-b-lime-600 px-10 py-3 text-xl font-bold text-night-950 shadow-[0_0_20px_4px_rgba(163,230,53,0.4)] mt-1"
                >
                  받기! 🎊
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
