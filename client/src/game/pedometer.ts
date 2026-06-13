/**
 * 만보기 측정 어댑터 (docs/future-ideas.md §2 — 1단계)
 * - StepSource 인터페이스로 측정부를 추상화 → 2단계에서 네이티브 Health(HealthKit/
 *   Health Connect) 어댑터로 갈아끼우면 진짜 백그라운드로 승급(나머지 코드 그대로).
 * - 현재 제공: ForegroundPedometer(앱 켠 동안 가속도계 피크 검출) · ManualSource(시연·교사용).
 * - 측정 누적은 store.ingestSteps(count)로 흘려보낸다(순수 로직은 steps.ts).
 */

export type StepSourceId = 'foreground' | 'manual' | 'health';

export interface StepSource {
  readonly id: StepSourceId;
  /** 이 환경에서 사용 가능한가 (센서/플러그인 유무) */
  isAvailable(): boolean;
  /** iOS DeviceMotion 등 권한 요청 (필요 없으면 true) */
  requestPermission(): Promise<boolean>;
  /** 측정 시작 — 걸음이 감지될 때마다 onStep(증가분) 호출 */
  start(onStep: (delta: number) => void): void;
  /** 측정 중지 */
  stop(): void;
}

interface DeviceMotionEventStatic {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

/**
 * 포그라운드 가속도계 만보기 — 앱이 화면에 떠 있는 동안만 동작(PWA 한계).
 * 단순 피크 검출: 중력 제거한 가속도 크기가 임계값을 위로 통과할 때 1걸음.
 * 정확도는 대략적(체감용). 정밀·백그라운드는 2단계 네이티브.
 */
export class ForegroundPedometer implements StepSource {
  readonly id = 'foreground' as const;
  private onStep: ((delta: number) => void) | null = null;
  private lastPeakTs = 0;
  private wasAbove = false;
  // 중력 보정용 저역통과 필터 값
  private gravity = { x: 0, y: 0, z: 0 };
  private handler = (e: DeviceMotionEvent) => this.onMotion(e);

  isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.DeviceMotionEvent !== 'undefined';
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const dm = window.DeviceMotionEvent as unknown as DeviceMotionEventStatic;
    // iOS 13+: 명시적 권한 요청 필요
    if (typeof dm.requestPermission === 'function') {
      try {
        const res = await dm.requestPermission();
        return res === 'granted';
      } catch {
        return false;
      }
    }
    return true; // 안드로이드 등: 권한 불필요
  }

  start(onStep: (delta: number) => void): void {
    if (!this.isAvailable()) return;
    this.onStep = onStep;
    window.addEventListener('devicemotion', this.handler);
  }

  stop(): void {
    if (!this.isAvailable()) return;
    window.removeEventListener('devicemotion', this.handler);
    this.onStep = null;
    this.wasAbove = false;
  }

  private onMotion(e: DeviceMotionEvent): void {
    const acc = e.accelerationIncludingGravity;
    if (!acc || acc.x == null || acc.y == null || acc.z == null) return;
    // 저역통과로 중력 추정 후 제거 → 동적 가속도
    const a = 0.8;
    this.gravity.x = a * this.gravity.x + (1 - a) * acc.x;
    this.gravity.y = a * this.gravity.y + (1 - a) * acc.y;
    this.gravity.z = a * this.gravity.z + (1 - a) * acc.z;
    const dx = acc.x - this.gravity.x;
    const dy = acc.y - this.gravity.y;
    const dz = acc.z - this.gravity.z;
    const mag = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const THRESHOLD = 1.2; // m/s^2 (대략적)
    const MIN_INTERVAL = 280; // ms — 분당 ~214보 상한(달리기 방지·중복 제거)
    const now = Date.now();
    if (mag > THRESHOLD && !this.wasAbove) {
      this.wasAbove = true;
      if (now - this.lastPeakTs > MIN_INTERVAL) {
        this.lastPeakTs = now;
        this.onStep?.(1);
      }
    } else if (mag < THRESHOLD * 0.6) {
      this.wasAbove = false; // 히스테리시스
    }
  }
}

/** 수동 소스 — 시연·교사용. start는 아무것도 안 하고, bump()로 직접 걸음 주입. */
export class ManualStepSource implements StepSource {
  readonly id = 'manual' as const;
  private onStep: ((delta: number) => void) | null = null;
  isAvailable(): boolean { return true; }
  async requestPermission(): Promise<boolean> { return true; }
  start(onStep: (delta: number) => void): void { this.onStep = onStep; }
  stop(): void { this.onStep = null; }
  bump(n: number): void { this.onStep?.(n); }
}
