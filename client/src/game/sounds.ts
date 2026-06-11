/** 효과음 — WebAudio 합성 (에셋 파일 불필요, 오프라인 동작) */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.15) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ac.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + dur);
}

export const sfx = {
  correct() {
    tone(660, 0, 0.12, 'triangle');
    tone(880, 0.1, 0.2, 'triangle');
  },
  wrong() {
    tone(220, 0, 0.25, 'sawtooth', 0.08);
    tone(180, 0.12, 0.3, 'sawtooth', 0.08);
  },
  combo(level: number) {
    tone(660 + level * 60, 0, 0.1, 'square', 0.06);
  },
  bossHit() {
    tone(120, 0, 0.18, 'square', 0.15);
    tone(90, 0.05, 0.22, 'sawtooth', 0.12);
  },
  fanfare() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.3, 'triangle', 0.12));
  },
  levelUp() {
    [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle', 0.1));
  },
};
