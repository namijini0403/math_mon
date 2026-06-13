/**
 * 만보기 카드 — 오늘 걸음/2000보 목표 + 포그라운드 측정 토글.
 * (1단계: 앱 켠 동안 측정. 2단계 네이티브 Health 연동 시 측정부만 교체.)
 */

import { useEffect, useRef, useState } from 'react';
import { useGame } from '../game/store';
import { STEP_GOAL } from '../game/steps';
import { ForegroundPedometer } from '../game/pedometer';

export function StepsCard() {
  const steps = useGame((s) => s.steps);
  const ingestSteps = useGame((s) => s.ingestSteps);
  const [measuring, setMeasuring] = useState(false);
  const [available, setAvailable] = useState(false);
  const pedRef = useRef<ForegroundPedometer | null>(null);

  useEffect(() => {
    const p = new ForegroundPedometer();
    pedRef.current = p;
    setAvailable(p.isAvailable());
    return () => p.stop();
  }, []);

  const toggle = async () => {
    const p = pedRef.current;
    if (!p) return;
    if (measuring) {
      p.stop();
      setMeasuring(false);
      return;
    }
    const ok = await p.requestPermission();
    if (!ok) return;
    p.start((d) => ingestSteps(d));
    setMeasuring(true);
  };

  const today = steps.today;
  const pct = Math.min(100, Math.round((today / STEP_GOAL) * 100));
  const reached = today >= STEP_GOAL;

  return (
    <div className="mt-4 rounded-3xl bg-night-900 border border-night-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm opacity-70">🏃 오늘의 만보기</div>
        {steps.goalDays > 0 && (
          <div className="text-[0.65rem] text-glow">목표 달성 {steps.goalDays}일</div>
        )}
      </div>

      <div className="flex items-end gap-1 mb-2">
        <span className={`text-2xl font-bold ${reached ? 'text-glow' : 'text-coin'}`}>
          {today.toLocaleString()}
        </span>
        <span className="text-sm opacity-60 mb-0.5">/ {STEP_GOAL.toLocaleString()} 보</span>
      </div>

      <div className="h-3 rounded-full bg-night-800 overflow-hidden border border-night-700">
        <div
          className={`h-full transition-all ${reached ? 'bg-glow' : 'bg-gradient-to-r from-coin to-amber-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {reached ? (
        <div className="text-xs text-glow mt-2">🎉 오늘 목표 달성! 드래곤 과일을 받았어요.</div>
      ) : available ? (
        <button
          onClick={toggle}
          className={`btn-3d mt-3 w-full rounded-xl px-4 py-2.5 text-sm ${
            measuring
              ? 'bg-night-800 border-night-800 border-b-night-700'
              : 'bg-glow border-glow border-b-lime-600 text-night-950'
          }`}
        >
          {measuring ? '⏸️ 측정 멈추기' : '▶️ 운동 측정 시작'}
        </button>
      ) : (
        <div className="text-[0.65rem] opacity-50 mt-2 leading-snug">
          이 기기는 걸음 측정을 지원하지 않아요. 휴대폰에서 앱을 켠 채로 걸으면 측정돼요.
          (정밀·자동 측정은 추후 업데이트 예정)
        </div>
      )}
      {measuring && (
        <div className="text-[0.6rem] opacity-50 mt-1.5 leading-snug">
          측정 중 — 휴대폰을 들고 걸어 보세요. 화면을 끄거나 앱을 닫으면 멈춰요.
        </div>
      )}
    </div>
  );
}
