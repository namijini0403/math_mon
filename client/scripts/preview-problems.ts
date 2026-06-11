/**
 * 문제 생성기 미리보기 CLI
 *   npm run preview:problems            → 스킬당 3문제
 *   npm run preview:problems u1-simplify 10 → 특정 스킬 10문제
 */

import { SKILLS, generateProblem } from '../src/generator/index';
import { exprToText, choiceToText } from '../src/generator/render-text';
import type { Problem } from '../src/generator/types';

function show(p: Problem): string {
  const lines: string[] = [];
  lines.push(`  [${p.format}] ${p.prompt}`);
  if (p.expr) lines.push(`    문제: ${exprToText(p.expr)}`);
  switch (p.format) {
    case 'choice':
      p.choices.forEach((c, i) =>
        lines.push(`    ${i === p.answerIndex ? '✓' : ' '} ${i + 1}) ${choiceToText(c)}`),
      );
      break;
    case 'fraction-input': {
      const a = p.answer;
      lines.push(`    정답: ${a.whole !== undefined ? `${a.whole} ` : ''}${a.n}/${a.d}`);
      break;
    }
    case 'comparison':
      lines.push(`    ${exprToText(p.left)} [${p.answer}] ${exprToText(p.right)}`);
      break;
    case 'fill-blanks':
      lines.push(`    빈칸 정답: ${p.blankAnswers.join(', ')}`);
      break;
    case 'matching':
      p.pairs.forEach((pair) =>
        lines.push(`    ${choiceToText(pair.left)} ↔ ${choiceToText(pair.right)}`),
      );
      break;
  }
  lines.push(`    해설: ${exprToText(p.explanation)}`);
  return lines.join('\n');
}

const [skillArg, countArg] = process.argv.slice(2);
const count = countArg ? parseInt(countArg, 10) : 3;
const targets = skillArg ? SKILLS.filter((s) => s.id === skillArg) : SKILLS;

if (targets.length === 0) {
  console.error(`스킬을 찾을 수 없음: ${skillArg}`);
  console.error(`사용 가능: ${SKILLS.map((s) => s.id).join(', ')}`);
  process.exit(1);
}

for (const skill of targets) {
  console.log(`\n━━━ ${skill.id} · ${skill.title} ━━━ (${skill.note})`);
  for (let i = 0; i < count; i++) {
    const seed = Math.floor(Math.random() * 0xffffffff);
    console.log(show(generateProblem(skill.id, seed)));
  }
}
