/** 인증 메달 — 레벨업·보스 격파 기념 (타로 카드 폐기 → 세계관 통일된 원형 메달) */

import { BOSS_CARDS, CARD_TIERS } from '../game/xp';
import type { EarnedCard } from '../game/store';

export interface MedalLook {
  name: string;
  symbol: string;
  colors: [string, string];
  accent: string;
  caption: string;
}

export function medalLook(card: EarnedCard): MedalLook {
  if (card.kind === 'boss' && card.bossId && BOSS_CARDS[card.bossId]) {
    const b = BOSS_CARDS[card.bossId];
    return {
      name: b.name,
      symbol: b.emoji,
      colors: b.colors,
      accent: b.accent,
      caption: card.date,
    };
  }
  const tier = CARD_TIERS.find((t) => t.tier === card.tier) ?? CARD_TIERS[0];
  return {
    name: tier.name,
    symbol: tier.numeral,
    colors: tier.colors,
    accent: tier.accent,
    caption: `Lv.${card.level} · ${card.date}`,
  };
}

export function MedalView({
  card,
  size = 'md',
}: {
  card: EarnedCard;
  size?: 'md' | 'lg';
}) {
  const look = medalLook(card);
  const dim = size === 'lg' ? 'w-28 h-28' : 'w-16 h-16';
  const symbolSize = size === 'lg' ? 'text-4xl' : 'text-xl';
  return (
    <div className="flex flex-col items-center gap-1">
      {/* 메달 본체: 이중 링 + 리본 느낌 */}
      <div
        className={`${dim} rounded-full flex items-center justify-center border-4 shadow-lg relative`}
        style={{
          background: `radial-gradient(circle at 35% 30%, ${look.colors[1]}, ${look.colors[0]})`,
          borderColor: look.accent,
          boxShadow: `0 0 12px 2px ${look.accent}55`,
        }}
      >
        <div
          className="absolute inset-1.5 rounded-full border opacity-60 pointer-events-none"
          style={{ borderColor: look.accent }}
        />
        <span
          className={`${symbolSize} font-bold drop-shadow`}
          style={{ color: look.accent, fontFamily: 'Georgia, serif' }}
        >
          {look.symbol}
        </span>
      </div>
      <div className={`${size === 'lg' ? 'text-sm' : 'text-[10px]'} text-center leading-tight opacity-90`}>
        {look.name}
      </div>
      <div className="text-[9px] opacity-50">{look.caption}</div>
    </div>
  );
}
