import type { UserData } from '../types/progress';
import { modulesOfWorld } from '../content';

/** Critérios mínimos do Glossário vivo, verificados automaticamente (não autodeclarados). */
export const LG_MIN = { explanation: 80, example: 40, diary: 3 };

export function livingGlossaryStatus(d: UserData) {
  const ids = modulesOfWorld(1).map((m) => m.id);
  const c = d.livingGlossary.concepts;
  const explained = ids.filter((id) => (c[id]?.explanation.trim().length ?? 0) >= LG_MIN.explanation).length;
  const exemplified = ids.filter((id) => (c[id]?.example.trim().length ?? 0) >= LG_MIN.example).length;
  const diary = d.livingGlossary.diary.filter((e) => e.claim.trim() && e.howFound.trim() && e.correct.trim()).length;
  return {
    total: ids.length, explained, exemplified, diary,
    /** Itens do checklist do projeto p1 calculados a partir do conteúdo. */
    auto: { k1: explained === ids.length, k2: exemplified === ids.length, k3: diary >= LG_MIN.diary } as Record<string, boolean>,
  };
}

/** Exporta o glossário como Markdown, para publicar ou guardar. */
export function livingGlossaryMarkdown(d: UserData, titles: Record<string, string>): string {
  const lines = ['# Glossário vivo de IA', '', `Atualizado em ${new Date().toLocaleDateString('pt-BR')}.`, '', '## Conceitos', ''];
  for (const m of modulesOfWorld(1)) {
    const c = d.livingGlossary.concepts[m.id];
    lines.push(`### ${titles[m.id] ?? m.title}`, '', c?.explanation.trim() || '_(pendente)_', '', `**Exemplo que testei:** ${c?.example.trim() || '_(pendente)_'}`, '');
  }
  lines.push('## Diário de alucinações', '');
  d.livingGlossary.diary.forEach((e, i) => {
    lines.push(`### Caso ${i + 1} — ${e.tool || 'ferramenta não informada'}`, '', `- **O que a IA afirmou:** ${e.claim}`, `- **Como descobri o erro:** ${e.howFound}`, `- **Informação correta:** ${e.correct}`, `- **Fonte da verificação:** ${e.source}`, '');
  });
  return lines.join('\n');
}
