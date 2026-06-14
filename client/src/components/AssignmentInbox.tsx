/**
 * 📜 도착한 시험 — 교사가 배포한 특별 시험이 있으면 홈에 눈에 띄게 띄운다 (Phase D).
 * 서버/토큰 없으면 조용히 사라진다(빈 목록). 평소엔 잠겨 있다가 배포 시 갑자기 나타난다.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchMyAssignments, type PendingAssignment } from '../api';

export function AssignmentInbox() {
  const [pending, setPending] = useState<PendingAssignment[]>([]);

  useEffect(() => {
    let alive = true;
    fetchMyAssignments().then((list) => {
      if (alive) setPending(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (pending.length === 0) return null;

  return (
    <div className="mt-3 flex flex-col gap-2">
      {pending.map((a) => (
        <motion.div
          key={a.id}
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 18 }}
        >
          <Link
            to={`/assignment/${a.id}`}
            className="btn-3d rounded-3xl bg-gradient-to-b from-amber-500 to-amber-600 border-amber-700 border-b-4 p-4 flex items-center gap-4 text-night-950"
          >
            <motion.span
              className="text-4xl"
              animate={{ rotate: [0, -8, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 1.5 }}
            >
              📜
            </motion.span>
            <div className="flex-1 min-w-0">
              <div className="font-bold leading-tight">선생님이 보낸 특별 시험!</div>
              <div className="text-sm opacity-80 truncate">
                {a.title || '단원평가'} · {a.config.count}문제
              </div>
            </div>
            <span className="shrink-0 text-sm font-bold bg-night-950/20 rounded-full px-3 py-1">도전 ▶</span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
