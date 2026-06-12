/** 타로풍 인증카드 (DOM 버전 — 컬렉션·획득 연출용. PNG 다운로드는 card/renderCardPng) */

import { useState } from 'react';
import { BOSS_CARDS, CARD_TIERS } from '../game/xp';
import type { EarnedCard } from '../game/store';

interface CardLook {
  name: string;
  subtitle: string;
  colors: [string, string];
  accent: string;
  /** 중앙 심볼 (로마숫자 or 보스 이모지) */
  symbol: string;
  caption: string;
}

export function cardLook(card: EarnedCard): CardLook {
  if (card.kind === 'boss' && card.bossId && BOSS_CARDS[card.bossId]) {
    const b = BOSS_CARDS[card.bossId];
    return {
      name: b.name,
      subtitle: b.subtitle,
      colors: b.colors,
      accent: b.accent,
      symbol: b.emoji,
      caption: `BOSS CLEAR · ${card.date}`,
    };
  }
  const tier = CARD_TIERS.find((t) => t.tier === card.tier) ?? CARD_TIERS[0];
  return {
    name: tier.name,
    subtitle: tier.subtitle,
    colors: tier.colors,
    accent: tier.accent,
    symbol: tier.numeral,
    caption: `LEVEL ${card.level} · ${card.date}`,
  };
}

export function CardView({
  card,
  nickname,
  className = '',
}: {
  card: EarnedCard;
  nickname: string;
  className?: string;
}) {
  const look = cardLook(card);
  const [hasArt, setHasArt] = useState(false);
  const artSrc =
    card.kind === 'boss' && card.bossId
      ? `assets/cards/${card.bossId}.png`
      : `assets/cards/tier${card.tier}.png`;
  return (
    <div
      className={`relative aspect-[3/5] rounded-2xl overflow-hidden shadow-2xl ${className}`}
      style={{ background: `linear-gradient(160deg, ${look.colors[0]}, ${look.colors[1]})` }}
    >
      {/* 일러스트 (에셋 있으면 배경으로, 없으면 그라데이션만) */}
      <img
        src={artSrc}
        alt=""
        onLoad={() => setHasArt(true)}
        onError={(e) => (e.currentTarget.style.display = 'none')}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {hasArt && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${look.colors[0]}cc 0%, transparent 28%, transparent 55%, ${look.colors[0]}e6 82%)`,
          }}
        />
      )}
      {/* 장식 테두리 */}
      <div
        className="absolute inset-2 rounded-xl border-2 pointer-events-none"
        style={{ borderColor: look.accent }}
      />
      <div
        className="absolute inset-3.5 rounded-lg border pointer-events-none opacity-60"
        style={{ borderColor: look.accent }}
      />
      {/* 본문 */}
      <div className="absolute inset-0 flex flex-col items-center justify-between py-[12%] px-[10%] text-center">
        <div style={{ color: look.accent }} className="text-[0.55rem] tracking-[0.3em] opacity-90">
          MATH MON · {look.subtitle}
        </div>
        <div className="flex flex-col items-center gap-1">
          {!hasArt && (
            <div
              className="text-6xl font-bold drop-shadow-lg"
              style={{ color: look.accent, fontFamily: 'Georgia, serif' }}
            >
              {look.symbol}
            </div>
          )}
          <div className={`text-2xl mt-1 text-white drop-shadow-lg ${hasArt ? 'translate-y-16' : ''}`}>
            {look.name}
          </div>
          <div className="text-xs opacity-80" style={{ color: look.accent }}>
            ✦ ✦ ✦
          </div>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <div className="text-base text-white">{nickname}</div>
          <div className="text-[0.6rem] opacity-80" style={{ color: look.accent }}>
            {look.caption}
          </div>
        </div>
      </div>
    </div>
  );
}
