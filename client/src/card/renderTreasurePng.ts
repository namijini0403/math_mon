/** 보물 카드 PNG 합성 — 프사·자랑용 다운로드 (760×1140) */

import { RARITY_COLOR, RARITY_LABEL, type RewardCardDef } from '../game/rewardCards';

const W = 760;
const H = 1140;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function renderTreasurePng(card: RewardCardDef, nickname: string): Promise<Blob> {
  const color = RARITY_COLOR[card.rarity];
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // 바탕: 밤하늘 그라데이션
  roundRect(ctx, 0, 0, W, H, 48);
  ctx.clip();
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1e1b4b');
  bg.addColorStop(1, '#0f0d29');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 카드 일러스트 (중앙)
  try {
    const art = await loadImage(card.src);
    const artW = W - 120;
    const artH = Math.round((art.height / art.width) * artW);
    ctx.save();
    roundRect(ctx, 60, 130, artW, artH, 28);
    ctx.clip();
    ctx.drawImage(art, 60, 130, artW, artH);
    ctx.restore();
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    roundRect(ctx, 60, 130, artW, artH, 28);
    ctx.stroke();
  } catch {
    /* 일러스트가 없으면 틀만 */
  }

  // 외곽 장식 테두리
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  roundRect(ctx, 22, 22, W - 44, H - 44, 36);
  ctx.stroke();

  ctx.textAlign = 'center';
  // 상단
  ctx.fillStyle = color;
  ctx.font = '26px Georgia, serif';
  ctx.fillText('M A T H   M O N   ·   T R E A S U R E', W / 2, 92);

  // 하단: 이름·등급·주인
  ctx.fillStyle = '#ffffff';
  ctx.font = '58px Jua, sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 12;
  ctx.fillText(card.name, W / 2, H - 190);
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.font = '26px Georgia, serif';
  ctx.fillText(`${card.title}  ·  ${RARITY_LABEL[card.rarity]}`, W / 2, H - 145);
  ctx.fillStyle = '#ffffff';
  ctx.font = '36px Jua, sans-serif';
  ctx.fillText(`${nickname}의 보물`, W / 2, H - 80);
  ctx.fillStyle = color;
  ctx.font = '22px Georgia, serif';
  ctx.fillText(new Date().toLocaleDateString('sv'), W / 2, H - 44);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
}

export async function downloadTreasurePng(card: RewardCardDef, nickname: string) {
  const blob = await renderTreasurePng(card, nickname);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mathmon-treasure-${card.id}.png`;
  a.click();
  URL.revokeObjectURL(url);
}
