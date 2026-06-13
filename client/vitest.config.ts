import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    // 스킬당 1000샘플 속성 테스트가 머신 과부하 시 기본 5초를 넘겨 거짓 실패(타임아웃)하는 것 방지.
    // 로직 검증용 시간 한도이지 성능 한도가 아니므로 넉넉히.
    testTimeout: 30000,
  },
});
