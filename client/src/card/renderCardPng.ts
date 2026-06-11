/** 인증카드 PNG 합성 — 프사용 고해상도 다운로드 (720×1200) */

import { cardLook } from '../components/CardView';
import type { EarnedCard } from '../game/store';

const W = 720;
const H = 1200;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** 시드 기반 별 배치 (일러스트 없을 때의 절차적 배경) */
function drawStars(ctx: CanvasRenderingContext2D, accent: string, seed: number) {
  let a = seed >>> 0;
  const rand = () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 0xffffffff;
  };
  ctx.save();
  for (let i = 0; i < 70; i++) {
    const x = 60 + rand() * (W - 120);
    const y = 60 + rand() * (H - 120);
    const r = 1 + rand() * 3;
    ctx.globalAlpha = 0.15 + rand() * 0.5;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export async function renderCardPng(card: EarnedCard, nickname: string): Promise<Blob> {
  const look = cardLook(card);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // 배경 그라데이션 (둥근 모서리 클립)
  roundRect(ctx, 0, 0, W, H, 56);
  ctx.clip();
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, look.colors[0]);
  grad.addColorStop(1, look.colors[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  drawStars(ctx, look.accent, card.level * 7919 + card.tier + (card.bossId?.length ?? 0));

  // 일러스트 (에셋이 있으면 중앙 창에 표시)
  const artPath =
    card.kind === 'boss' ? `assets/cards/${card.bossId}.png` : `assets/cards/tier${card.tier}.png`;
  const art = await loadImage(artPath);
  if (art) {
    ctx.save();
    roundRect(ctx, 90, 230, W - 180, 620, 32);
    ctx.clip();
    ctx.drawImage(art, 90, 230, W - 180, 620);
    ctx.restore();
    ctx.strokeStyle = look.accent;
    ctx.lineWidth = 4;
    roundRect(ctx, 90, 230, W - 180, 620, 32);
    ctx.stroke();
  }

  // 장식 테두리 2겹
  ctx.strokeStyle = look.accent;
  ctx.lineWidth = 6;
  roundRect(ctx, 26, 26, W - 52, H - 52, 40);
  ctx.stroke();
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 2;
  roundRect(ctx, 46, 46, W - 92, H - 92, 28);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // 모서리 장식 (다이아)
  ctx.fillStyle = look.accent;
  for (const [cx, cy] of [
    [70, 70],
    [W - 70, 70],
    [70, H - 70],
    [W - 70, H - 70],
  ] as const) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-10, -10, 20, 20);
    ctx.restore();
  }

  ctx.textAlign = 'center';

  // 상단 타이틀
  ctx.fillStyle = look.accent;
  ctx.font = '28px Georgia, serif';
  ctx.fillText(`M A T H   M O N   ·   ${look.subtitle}`, W / 2, 130);

  // 중앙 심볼 (일러스트 없을 때 크게)
  ctx.fillStyle = look.accent;
  if (!art) {
    ctx.font = 'bold 230px Georgia, serif';
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 26;
    ctx.fillText(look.symbol, W / 2, 620);
    ctx.shadowBlur = 0;
  } else {
    ctx.font = 'bold 64px Georgia, serif';
    ctx.fillText(look.symbol, W / 2, 200);
  }

  // 카드 이름
  ctx.fillStyle = '#ffffff';
  ctx.font = '72px Jua, sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 14;
  ctx.fillText(look.name, W / 2, art ? 950 : 800);
  ctx.shadowBlur = 0;

  ctx.fillStyle = look.accent;
  ctx.font = '34px Georgia, serif';
  ctx.fillText('✦  ✦  ✦', W / 2, art ? 1000 : 860);

  // 하단: 학생 이름 + 캡션
  ctx.fillStyle = '#ffffff';
  ctx.font = '52px Jua, sans-serif';
  ctx.fillText(nickname, W / 2, 1080);
  ctx.fillStyle = look.accent;
  ctx.font = '26px Georgia, serif';
  ctx.fillText(look.caption, W / 2, 1128);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
}

export async function downloadCardPng(card: EarnedCard, nickname: string) {
  const blob = await renderCardPng(card, nickname);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = card.kind === 'boss' ? `mathmon-boss-${card.bossId}.png` : `mathmon-card-lv${card.level}.png`;
  a.click();
  URL.revokeObjectURL(url);
}
