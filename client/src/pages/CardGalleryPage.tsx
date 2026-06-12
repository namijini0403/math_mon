/** 보물 카드 도감 — 캡처용 컬렉션 페이지. 획득 카드는 컬러+중복 ×n, 미획득은 실루엣 🔒 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../game/store';
import {
  RARITY_COLOR,
  RARITY_LABEL,
  REWARD_CARDS,
  type RewardCardDef,
  type RewardRarity,
} from '../game/rewardCards';
import { downloadTreasurePng } from '../card/renderTreasurePng';
import { sfx } from '../game/sounds';

const RARITY_ORDER: RewardRarity[] = ['legendary', 'rare', 'common'];

function CardCell({
  card,
  count,
  onOpen,
}: {
  card: RewardCardDef;
  count: number;
  onOpen: (card: RewardCardDef) => void;
}) {
  const owned = count > 0;
  const color = RARITY_COLOR[card.rarity];
  return (
    <motion.button
      whileTap={owned ? { scale: 0.94 } : {}}
      onClick={() => owned && onOpen(card)}
      aria-label={owned ? `${card.name} 크게 보기` : '아직 모으지 못한 카드'}
      className="relative flex flex-col items-center gap-1.5"
    >
      <div
        className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2"
        style={{
          borderColor: owned ? color : '#1e293b',
          boxShadow: owned ? `0 0 14px 1px ${color}55` : 'none',
        }}
      >
        <img
          src={card.src}
          alt={owned ? card.name : '???'}
          className={`w-full h-full object-cover ${owned ? '' : 'brightness-[0.12] saturate-0'}`}
          loading="lazy"
        />
        {!owned && (
          <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-60">
            🔒
          </div>
        )}
        {count > 1 && (
          <div
            className="absolute top-1.5 right-1.5 rounded-full px-2 py-0.5 text-xs font-bold text-night-950"
            style={{ background: color }}
          >
            ×{count}
          </div>
        )}
      </div>
      <div className={`text-xs text-center leading-tight ${owned ? '' : 'opacity-40'}`}>
        {owned ? card.name : '???'}
      </div>
    </motion.button>
  );
}

export default function CardGalleryPage() {
  const { nickname, rewardCards, rewardCardCounts } = useGame();
  const [zoom, setZoom] = useState<RewardCardDef | null>(null);
  const [saving, setSaving] = useState(false);

  const countOf = (id: string) =>
    rewardCardCounts[id] ?? (rewardCards.includes(id) ? 1 : 0);
  const ownedTotal = REWARD_CARDS.filter((c) => countOf(c.id) > 0).length;

  async function savePng(card: RewardCardDef) {
    if (saving) return;
    setSaving(true);
    try {
      await downloadTreasurePng(card, nickname || '수학 탐험가');
      sfx.fanfare();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-5 pb-16">
      {/* ── 헤더 (캡처에 같이 담기는 부분) ── */}
      <div className="sticky top-0 z-10 bg-night-950/90 backdrop-blur py-3 flex items-center gap-3">
        <Link to="/" className="text-2xl" aria-label="홈으로">
          ←
        </Link>
        <div className="flex-1">
          <div className="text-lg font-bold">🎴 {nickname}의 보물 카드 도감</div>
          <div className="text-xs opacity-60">
            {ownedTotal}/{REWARD_CARDS.length}장 수집 — 카드를 누르면 크게 보고 저장할 수 있어요
          </div>
        </div>
      </div>

      {/* ── 등급별 섹션 ── */}
      {RARITY_ORDER.map((rarity) => {
        const cards = REWARD_CARDS.filter((c) => c.rarity === rarity);
        const owned = cards.filter((c) => countOf(c.id) > 0).length;
        return (
          <section key={rarity} className="mt-5">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-sm font-bold" style={{ color: RARITY_COLOR[rarity] }}>
                {RARITY_LABEL[rarity]}
              </span>
              <span className="text-xs opacity-50">
                {owned}/{cards.length}
              </span>
              <div
                className="flex-1 h-px opacity-30"
                style={{ background: RARITY_COLOR[rarity] }}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {cards.map((card) => (
                <CardCell key={card.id} card={card} count={countOf(card.id)} onOpen={setZoom} />
              ))}
            </div>
          </section>
        );
      })}

      {/* ── 클로즈업 모달 ── */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoom(null)}
            className="fixed inset-0 z-50 bg-night-950/95 backdrop-blur-sm flex flex-col items-center justify-center px-8 gap-4"
          >
            <motion.img
              initial={{ scale: 0.6, rotateY: 90 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              src={zoom.src}
              alt={zoom.name}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs rounded-3xl border-4 shadow-2xl"
              style={{
                borderColor: RARITY_COLOR[zoom.rarity],
                boxShadow: `0 0 40px 6px ${RARITY_COLOR[zoom.rarity]}66`,
              }}
            />
            <div className="text-center">
              <div className="text-xl font-bold">{zoom.name}</div>
              <div className="text-sm mt-0.5" style={{ color: RARITY_COLOR[zoom.rarity] }}>
                {zoom.title} · {RARITY_LABEL[zoom.rarity]}
                {countOf(zoom.id) > 1 && ` · ×${countOf(zoom.id)}`}
              </div>
            </div>
            <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => savePng(zoom)}
                disabled={saving}
                className="btn-3d rounded-2xl bg-coin border-coin border-b-amber-600 px-6 py-2.5 text-base font-bold text-night-950 disabled:opacity-50"
              >
                {saving ? '만드는 중…' : '📥 카드 이미지 저장'}
              </button>
              <button
                onClick={() => setZoom(null)}
                className="btn-3d rounded-2xl bg-night-800 border-night-700 border-b-night-700 px-6 py-2.5 text-base"
              >
                닫기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
