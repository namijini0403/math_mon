# 문제 그림 자동 렌더(SVG) 시스템 설계안

> 목적: 도형·종이접기처럼 **그림이 있어야 풀 수 있는 문제**를, 이미지 파일 없이 **코드로 그리는 파라메트릭 SVG**로 자동 생성한다.
> 앱 철학과 일치 — 배지(BadgeEmblem), 메달(MedalView)도 전부 코드 렌더 SVG. 그림은 시드로 결정되어 재현 가능.

## 1. 자료 구조 (추가, 비파괴)

`generator/types.ts`의 `Problem`에 **선택 필드** 하나 추가:

```ts
export interface Problem {
  // ... 기존 그대로 ...
  figure?: FigureSpec;   // 있으면 prompt 아래에 SVG 그림을 그린다. 없으면 기존과 동일.
}

export type FigureSpec =
  | { kind: 'staircase'; squares: number; side: number }            // 계단 도형 둘레 (ch51-stairs)
  | { kind: 'overlap-rect-square'; w: number; h: number; s: number; frac: number } // 겹친 도형 (ch51-overlap)
  | { kind: 'painted-cube'; n: number; highlight: 'one-face' }      // 정육면체 칠하기 (ch52-paintcut)
  | { kind: 'congruent-triangles'; a: number; b: number; c: number; join: 'shared-side' } // 합동 삼각형 (ch52-congtriangle)
  | { kind: 'paper-fold'; angle: number }                           // 정사각형 종이접기 (ch52-paperfold)
  | { kind: 'line-symmetry'; shape: 'triangle' | 'quad'; markDist?: number } // 선대칭 (unitSym, ch52-symaxis)
  | { kind: 'point-symmetry'; shape: 'quad' }                       // 점대칭
  | { kind: 'cuboid'; w: number; h: number; d: number; show: 'edges' } // 직육면체 겨냥도 (unitCuboid)
  | { kind: 'bar-graph'; labels: string[]; values: number[] }       // (확장) 막대그래프
  | { kind: 'number-line'; min: number; max: number; marks: number[] }; // (확장) 수직선·범위
```

- **순수·결정적**: FigureSpec은 숫자/문자열만 담는 평범한 객체. 시드로 정해진 파라미터를 그대로 넣는다(재현성).
- 라벨(ㄱㄴㄷ, ㉮)·각도·길이는 spec 필드로. 그림과 풀이 텍스트의 수치가 항상 일치하도록 generator가 같은 변수에서 만든다.

## 2. 렌더러 컴포넌트

`client/src/components/figure/FigureView.tsx`:

```tsx
export function FigureView({ spec }: { spec: FigureSpec }) {
  switch (spec.kind) {
    case 'staircase': return <Staircase {...spec} />;
    case 'painted-cube': return <PaintedCube {...spec} />;
    // ...
  }
}
```

- 각 도형은 `figure/shapes/*.tsx`의 작은 SVG 컴포넌트. viewBox 고정, 다크 인디고 배경/굵은 외곽선/글로우 — 앱 톤과 통일.
- 접근성: `<svg role="img" aria-label="...">`에 한국어 설명(스크린리더·그림 못 보는 환경 폴백).
- 폴백: spec.kind가 미구현이면 `aria-label`만 있는 빈 박스(앱 안 깨짐).

## 3. 표시 위치 (배선)

- 공통 문제뷰 `components/problem/ProblemBody.tsx`(회랑·첨탑)에서 prompt 아래, expr 위에 `{problem.figure && <FigureView spec={problem.figure} />}`.
- 기존 3페이지(LessonPage·ExamPage·BossPage)는 회귀 방지로 각각의 문제 표시부에 같은 한 줄을 추가(작고 비파괴적).
- figure 없으면 아무 것도 안 그림 → **기존 모든 문제 영향 0**.

## 4. generator 연결

그림이 필요한 스킬의 `generate()`가 반환 객체에 `figure`를 추가만 하면 된다. 예:

```ts
// ch51-stairs
return { ...앞과 동일..., figure: { kind: 'staircase', squares: n, side: a } };
```

- 그림과 텍스트 수치 동일 변수 공유 → 불일치 0.
- 텍스트 서술(현재 풀이)은 **유지**(그림 + 말 병행이 가장 친절). 그림은 이해 보조.

## 5. 단계별 적용 순서

1. **1단계(골격)**: types.ts figure 필드 + FigureView + ProblemBody 배선 + **staircase·painted-cube** 2종(가장 단순한 격자 도형) + 스냅샷 테스트.
2. **2단계(심화 그림 의존)**: congruent-triangles·paper-fold·line-symmetry·point-symmetry·overlap — TEACHER-VERIFY ②의 '그림 의존' 항목 해소.
3. **3단계(정규 단원)**: cuboid 겨냥도(unitCuboid), unitSym 합동/대칭 기본형. 그 다음 6학년 도형(각기둥·각뿔 전개도는 난도 높음 — 별도 검토).
4. **확장**: bar-graph·number-line 등으로 자료/범위 단원까지(현재는 텍스트 서술).

## 6. 검증

- 각 도형: 시드 몇 개로 스냅샷(svg 문자열) 회귀 테스트 + `aria-label` 존재 단언.
- tsc + 기존 vitest 전체 통과(비파괴라 영향 없어야 함).
- Playwright로 실제 렌더 캡처 — 그림이 문제 수치와 맞는지 사람이 1회 눈검수(TEACHER-VERIFY).

## 7. 비고

- **그림 필수인데 자동 렌더가 어려운 것**(쌓기나무 3면도, 복잡한 전개도)은 무리하게 그리지 않고, 해당 유형을 심화 풀에서 제외하거나 단순화한다(품질 우선).
- 이미지 파일(Codex 보스 등)과는 별개 — 이 시스템은 **문제 도해 전용 코드 SVG**.
