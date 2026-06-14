/**
 * 드래곤 이름표 — 아이가 자기 드래곤에게 이름을 지어 줄 수 있다.
 * 이름이 없으면 "이름 지어주기"를 권하고, 있으면 이름 + 연필(수정) 표시.
 */

import { useState } from 'react';
import { useGame } from '../game/store';

export function DragonNameTag() {
  const name = useGame((s) => s.dragon.name ?? '');
  const nameDragon = useGame((s) => s.nameDragon);
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(name);

  const open = () => {
    setVal(name);
    setEditing(true);
  };
  const save = () => {
    nameDragon(val);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value.slice(0, 12))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') setEditing(false);
          }}
          placeholder="드래곤 이름 (최대 12자)"
          className="rounded-xl border-2 border-night-700 bg-night-800 px-3 py-1.5 text-sm focus:border-mana focus:outline-none w-44"
        />
        <button
          onClick={save}
          className="btn-3d rounded-xl bg-glow border-glow border-b-lime-600 px-3 py-1.5 text-sm text-night-950"
        >
          저장
        </button>
        <button
          onClick={() => setEditing(false)}
          className="rounded-xl bg-night-800 border border-night-700 px-2.5 py-1.5 text-sm opacity-70"
        >
          취소
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={open}
      className="flex items-center gap-1.5 rounded-full bg-night-800 border border-night-700 px-3 py-1 text-sm hover:border-mana"
      aria-label="드래곤 이름 짓기"
    >
      {name ? (
        <span className="text-coin font-bold">{name}</span>
      ) : (
        <span className="opacity-70">이름 지어주기</span>
      )}
      <span className="opacity-60 text-xs">✏️</span>
    </button>
  );
}
