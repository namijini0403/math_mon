/** 프로필 — 통계 + 보물창고 바로가기 + 교사용 체험 도구 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../game/store';
import { levelFromXp } from '../game/xp';
import { DragonAvatar } from '../components/DragonAvatar';
import { BADGES } from '../game/badges';
import { STAGES } from '../game/stages';
import { REWARD_CARDS } from '../game/rewardCards';

export default function ProfilePage() {
  const {
    nickname, xp, cards, streak, skillStats, badges, rewardCards,
    showAnswers, toggleShowAnswers, devUnlockAll, dragonGain, resetDragon, resetAll,
  } = useGame();
  const [devOpen, setDevOpen] = useState(false);
  const { level } = levelFromXp(xp);

  const totalCorrect = Object.values(skillStats).reduce((s, v) => s + v.c, 0);

  return (
    <div className="max-w-xl mx-auto px-5 pb-16">
      <div className="flex items-center gap-3 py-4">
        <Link to="/" className="text-2xl opacity-60 hover:opacity-100" aria-label="뒤로">
          ←
        </Link>
        <h1 className="text-xl">내 프로필</h1>
      </div>

      <div className="rounded-3xl bg-night-900 border border-night-700 p-5 flex items-center gap-4">
        <DragonAvatar sizeClass="w-16 h-16" textClass="text-3xl" />
        <div className="flex-1">
          <div className="text-xl">{nickname}</div>
          <div className="text-coin text-sm">Lv.{level} · {xp} XP</div>
        </div>
        <div className="text-center">
          <div className="text-2xl">🔥</div>
          <div className="text-xs opacity-70">{streak.count}일</div>
        </div>
        <div className="text-center">
          <div className="text-2xl">🎯</div>
          <div className="text-xs opacity-70">{totalCorrect}문제</div>
        </div>
      </div>

      {/* ── 보물창고 바로가기 (배지·메달·보물 카드) ── */}
      <Link
        to="/cards"
        className="mt-7 btn-3d rounded-3xl bg-night-900 border-2 border-night-700 border-b-night-700 p-5 flex items-center gap-4 hover:bg-night-800"
      >
        <span className="text-4xl">💎</span>
        <div className="flex-1">
          <div className="text-lg">나의 보물창고</div>
          <div className="text-xs opacity-60 mt-0.5">
            배지 {badges.length}/{BADGES.length} · 인증 메달 {cards.length}개 · 보물 카드{' '}
            {rewardCards.length}/{REWARD_CARDS.length}장
          </div>
        </div>
        <span className="opacity-40 text-2xl">›</span>
      </Link>

      {/* ── 교사용 체험 도구 (확인 코드 필요) ── */}
      <div className="mt-12 flex flex-col gap-2">
        <button
          onClick={() => {
            if (devOpen) {
              setDevOpen(false);
              return;
            }
            const code = window.prompt('교사 확인 코드를 입력하세요');
            if (code === '0403') setDevOpen(true);
            else if (code !== null) window.alert('코드가 맞지 않아요.');
          }}
          className="text-xs opacity-40 underline self-start"
        >
          🧑‍🏫 교사용 체험 도구
        </button>
        {devOpen && (
          <div className="rounded-2xl border border-coin/40 bg-night-900 p-4 flex flex-col gap-2">
            <button
              onClick={() => {
                devUnlockAll(STAGES.map((s) => s.id));
                window.alert('모든 스테이지가 열렸어요! 지도에서 보스전까지 바로 들어갈 수 있어요.');
              }}
              className="btn-3d rounded-xl bg-night-800 border-night-800 border-b-night-700 px-4 py-2 text-sm text-left"
            >
              🔓 모든 스테이지 잠금 해제 (보스전 바로 체험)
            </button>
            <button
              onClick={toggleShowAnswers}
              className="btn-3d rounded-xl bg-night-800 border-night-800 border-b-night-700 px-4 py-2 text-sm text-left"
            >
              🔑 문제 화면에 정답 표시: {showAnswers ? '켜짐 ✅' : '꺼짐'}
            </button>
            <button
              onClick={() => dragonGain({ gp: 100 })}
              className="btn-3d rounded-xl bg-night-800 border-night-800 border-b-night-700 px-4 py-2 text-sm text-left"
            >
              🐲 드래곤 성장 +100 (성장 단계 미리 보기 — 성체 도달 시 모습 확정)
            </button>
            <button
              onClick={() => {
                if (window.confirm('드래곤을 알 상태로 되돌릴까요? (학습 기록·배지·카드는 그대로예요)'))
                  resetDragon();
              }}
              className="btn-3d rounded-xl bg-night-800 border-night-800 border-b-night-700 px-4 py-2 text-sm text-left"
            >
              🥚 드래곤만 알로 초기화 (미리 보기 되돌리기)
            </button>
            <div className="text-[10px] opacity-50">
              체험·시연용 도구예요. 학생 계정에서는 사용하지 마세요!
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => {
          if (window.confirm('정말 모든 진행을 지우고 처음부터 시작할까요?')) resetAll();
        }}
        className="mt-4 text-xs opacity-40 underline"
      >
        진행 초기화
      </button>
    </div>
  );
}
