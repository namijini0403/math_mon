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
      if (res) {
        setProfile({ nickname: res.nickname, classCode: res.classCode, studentId: res.studentId });
        navigate('/');
        return;
      }
      setError('접속에 실패했어요. 반 코드와 PIN을 확인하거나, 비워두고 혼자 모험을 시작할 수도 있어요.');
      setBusy(false);
      return;
    }
    setProfile({ nickname: name });
    navigate('/');
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-6 p-6 max-w-md mx-auto">
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
      >
        <div className="text-7xl mb-3">🦊</div>
        <h1 className="text-4xl text-glow">매스몬</h1>
        <p className="opacity-70 mt-2">분수 몬스터를 물리치는 수학 모험!</p>
      </motion.div>

      <div className="w-full flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm opacity-80">닉네임 (실명 말고 별명을 써요!)</span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 10))}
            placeholder="예: 번개여우"
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
        {busy ? '접속 중...' : '모험 시작! ⚔️'}
      </button>
    </div>
  );
}
