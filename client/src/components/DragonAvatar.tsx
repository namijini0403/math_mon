/** 작은 드래곤 아바타 — 홈 헤더·프로필용. Codex 성장 일러스트(dragonArt) + 이모지 폴백 */

import { useState } from 'react';
import { useGame } from '../game/store';
import { currentFullness } from '../game/dragon';
import { dragonMiniArt } from '../game/dragonArt';
import { todayStr } from '../game/missions';

export function DragonAvatar({
  sizeClass = 'w-11 h-11',
  textClass = 'text-xl',
}: {
  sizeClass?: string;
  textClass?: string;
}) {
  const dragon = useGame((s) => s.dragon);
  const fullness = currentFullness(dragon, todayStr());
  const art = dragonMiniArt(dragon, fullness);
  const [imgOk, setImgOk] = useState(true);
  const showImg = Boolean(art.src) && imgOk;
  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-b from-violet-500 to-violet-700 flex items-center justify-center ${textClass} overflow-hidden`}
    >
      {showImg ? (
        <img
          src={art.src}
          alt="내 드래곤"
          className="w-full h-full object-contain"
          onError={() => setImgOk(false)}
        />
      ) : (
        <span>{art.fallbackEmoji}</span>
      )}
    </div>
  );
}
