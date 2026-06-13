/** 드래곤 위젯 — 홈 화면용 미니 카드 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../game/store';
import {
  AFFINITY_INFO,
  DRAGON_STAGES,
  MOOD_INFO,
  currentFullness,
  dragonMood,
  stageForGp,
} from '../game/dragon';
import { dragonMiniArt } from '../game/dragonArt';
import { todayStr } from '../game/missions';

export default function DragonWidget() {
  const { dragon, streak } = useGame();
  const today = todayStr();
  const stage = stageForGp(dragon.gp);
  const fullness = currentFullness(dragon, today);
  const streakActive = streak.last === today;
  const mood = dragonMood(fullness, streakActive);
  const moodInfo = MOOD_INFO[mood];
  const isHungry = fullness < 40;

  // 미니 이미지
  const [imgError, setImgError] = useState(false);
  const miniArt = dragonMiniArt(dragon, fullness);
  const imgSrc = miniArt.src;
  const stagesArr = DRAGON_STAGES as readonly { stage: number; name: string; emoji: string; minGp: number }[];
  const fallbackEmoji = miniArt.fallbackEmoji || (
    dragon.adult
      ? AFFINITY_INFO[dragon.adult.affinity].emoji
      : stagesArr[stage]?.emoji ?? '🥚'
  );

  return (
    <Link to="/dragon" aria-label="드래곤 방 가기">
      <motion.div
        whileTap={{ scale: 0.97 }}
        className="relative rounded-3xl bg-night-900 border border-night-700 p-4 flex items-center gap-4 hover:bg-night-800 transition-colors"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, #2b2768 0%, #1e1b4b 70%)',
        }}
      >
        {/* 배고픔 빨간 점 */}
        {isHungry && (
          <motion.div
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-hurt border-2 border-night-950 z-10"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        )}

        {/* 미니 드래곤 */}
        <div className="relative shrink-0">
          {!imgError && imgSrc ? (
            <img
              src={imgSrc}
              alt="드래곤"
              className="w-14 h-14 object-contain drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-4xl leading-none drop-shadow-[0_0_6px_rgba(167,139,250,0.4)]">
              {fallbackEmoji}
            </span>
          )}
          <span className="absolute -bottom-1 -right-1 text-base leading-none">
            {moodInfo.emoji}
          </span>
        </div>

        {/* 상태 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs opacity-70">
              {stagesArr[stage]?.name ?? '완전한 성체'}
            </span>
          </div>

          {/* 배부름 바 */}
          <div className="h-2 rounded-full bg-night-800 overflow-hidden border border-night-700 mb-1">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${fullness}%`,
                background: fullness >= 70
                  ? 'linear-gradient(90deg, #34d399, #6ee7b7)'
                  : fullness >= 40
                    ? 'linear-gradient(90deg, #fbbf24, #fde68a)'
                    : 'linear-gradient(90deg, #fb7185, #fda4af)',
              }}
            />
          </div>

          {isHungry ? (
            <div className="text-xs text-hurt font-bold">배고파해요!</div>
          ) : (
            <div className="text-xs opacity-50">{moodInfo.label}</div>
          )}
        </div>

        {/* 이동 화살표 */}
        <div className="text-sm opacity-40 shrink-0">드래곤 방 가기 →</div>
      </motion.div>
    </Link>
  );
}
