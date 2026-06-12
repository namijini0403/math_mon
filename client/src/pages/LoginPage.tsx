/** 온보딩 — 닉네임(필수) + 반 코드/PIN(선택, 서버 연동 시) */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../game/store';
import { join } from '../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const setProfile = useGame((s) => s.setProfile);
  const [nickname, setNickname] = useState('');
  const [classCode, setClassCode] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const start = async () => {
    const name = nickname.trim();
    if (name.length < 1) return;
    setBusy(true);
    setError('');
    if (classCode.trim()) {
      if (pin.length !== 4) {
        setError('PIN은 숫자 4자리예요.');
        setBusy(false);
        return;
      }
      const res = await join(classCode.trim().toUpperCase(), name, pin);
      if (res.kind === 'ok') {
        // 서버에 세이브가 있으면 복원 (기기를 바꿔 로그인한 경우)
        if (res.data.save && typeof res.data.save === 'object') {
          useGame.setState(res.data.save as unknown as Parameters<typeof useGame.setState>[0]);
        }
        setProfile({
          nickname: res.data.nickname,
          classCode: res.data.classCode,
          studentId: res.data.studentId,
        });
        navigate('/');
        return;
      }
      if (res.kind === 'wrong-pin') {
        setError('비밀번호(PIN)가 달라요. 처음 정했던 숫자 4개를 다시 확인해 주세요.');
        setBusy(false);
        return;
      }
      if (res.kind === 'no-class') {
        setError('그 반 코드를 찾을 수 없어요. 선생님께 다시 확인해 주세요.');
        setBusy(false);
        return;
      }
      // 서버 없음(미리보기 배포 등) → 혼자 모험 모드로 자동 시작
      setProfile({ nickname: name });
      navigate('/');
      return;
    }
    setProfile({ nickname: name });
    navigate('/');
  };

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center gap-6 p-6"
      style={{
        backgroundImage:
          'linear-gradient(to bottom, rgba(15,13,41,0.55), rgba(15,13,41,0.92)), url(assets/bg/title.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-md flex flex-col items-center gap-6">
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
      >
        {/* 드래곤의 알 — 고급 일러스트 도착 전엔 빛나는 알 연출 */}
        <motion.div
          animate={{ y: [0, -6, 0], filter: ['drop-shadow(0 0 18px rgba(251,191,36,0.45))', 'drop-shadow(0 0 34px rgba(251,191,36,0.8))', 'drop-shadow(0 0 18px rgba(251,191,36,0.45))'] }}
          transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
          className="mb-3 flex justify-center"
        >
          <img
            src="assets/dragon/mini/stage0.png"
            alt="드래곤의 알"
            className="w-28 h-28 object-contain"
            onError={(e) => {
              e.currentTarget.outerHTML = '<span class="text-7xl">🥚</span>';
            }}
          />
        </motion.div>
        <h1 className="text-4xl text-glow tracking-widest">DRACONIS</h1>
        <p className="opacity-70 mt-2">오늘을 쌓아, 드래곤을 깨워라</p>
        <p className="opacity-50 mt-1 text-sm">매일 미션을 완료하며 나만의 드래곤을 키워 보세요 🐉</p>
      </motion.div>

      <div className="w-full flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm opacity-80">닉네임 (실명 말고 별명을 써요!)</span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 10))}
            placeholder="예: 별빛드래곤"
            autoFocus
            className="rounded-2xl border-2 border-night-700 bg-night-800 px-4 py-3.5 text-lg focus:border-mana focus:outline-none"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm opacity-80">반 코드 (선생님이 알려줘요)</span>
            <input
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase().slice(0, 8))}
              placeholder="예: TIGER5"
              className="rounded-2xl border-2 border-night-700 bg-night-800 px-4 py-3.5 text-lg uppercase focus:border-mana focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm opacity-80">나의 비밀번호 (숫자 4개)</span>
            <input
              value={pin}
              type="password"
              inputMode="numeric"
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="● ● ● ●"
              className="rounded-2xl border-2 border-night-700 bg-night-800 px-4 py-3.5 text-lg focus:border-mana focus:outline-none"
            />
          </label>
        </div>
        <p className="text-xs opacity-50">반 코드 없이도 시작할 수 있어요. 나중에 다시 입력하면 돼요.</p>
        {error && <p className="text-sm text-hurt">{error}</p>}
      </div>

      <button
        onClick={start}
        disabled={busy || nickname.trim().length === 0}
        className="btn-3d w-full rounded-2xl py-4 text-xl bg-glow border-glow border-b-lime-600 text-night-950 disabled:opacity-30"
      >
        {busy ? '접속 중...' : '모험 시작! 🐲'}
      </button>
      </div>
    </div>
  );
}
