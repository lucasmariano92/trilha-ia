import { useEffect, useRef } from 'react';
import { useStore } from '../store/StoreContext';
import { accrueSeconds, TICK_MS } from '../services/activeTime';
import { addStudySeconds } from '../services/actions';

/**
 * Registra tempo de estudo ATIVO para uma chave (id do módulo ou "revisao").
 * Só conta com a aba visível e com interação recente; ver services/activeTime.ts.
 */
export function useActiveTime(key: string | null) {
  const { update } = useStore();
  const lastInteraction = useRef(Date.now());
  const lastTick = useRef(Date.now());

  useEffect(() => {
    if (!key) return;
    lastTick.current = Date.now();
    lastInteraction.current = Date.now();
    const onAct = () => (lastInteraction.current = Date.now());
    const events = ['keydown', 'pointerdown', 'pointermove', 'scroll', 'touchstart', 'wheel'] as const;
    events.forEach((e) => window.addEventListener(e, onAct, { passive: true }));

    const flush = () => {
      const now = Date.now();
      const s = accrueSeconds(lastTick.current, now, lastInteraction.current, document.visibilityState === 'visible');
      lastTick.current = now;
      if (s > 0) update((d) => addStudySeconds(d, key, s));
    };
    const id = window.setInterval(flush, TICK_MS);
    const onVis = () => flush();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      flush();
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
      events.forEach((e) => window.removeEventListener(e, onAct));
    };
  }, [key, update]);
}
