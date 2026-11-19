import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { UserData } from '../types/progress';
import { browserStore, KEYS, loadUserData, saveUserData, type KeyValueStore, type LoadResult } from '../services/storage';

export type ToastTone = 'info' | 'sucesso' | 'erro';

interface StoreValue {
  data: UserData;
  update: (fn: (d: UserData) => UserData) => void;
  replaceAll: (d: UserData, opts?: { snapshot?: boolean }) => void;
  toast: (message: string, tone?: ToastTone) => void;
  toastState: { message: string; tone: ToastTone; id: number } | null;
  saveError: string | null;
  load: LoadResult;
  kv: KeyValueStore;
}

const Ctx = createContext<StoreValue | null>(null);

export function StoreProvider({ children, kv: injected }: { children: ReactNode; kv?: KeyValueStore }) {
  const kv = useMemo(() => injected ?? browserStore(), [injected]);
  const [load] = useState<LoadResult>(() => loadUserData(kv));
  const [data, setData] = useState<UserData>(load.data);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toastState, setToast] = useState<StoreValue['toastState']>(null);
  const first = useRef(true);

  // Salvamento automático a cada alteração.
  useEffect(() => {
    if (first.current && load.source === 'v2') {
      first.current = false;
      return;
    }
    first.current = false;
    const r = saveUserData(kv, data);
    setSaveError(r.ok ? null : r.error);
  }, [data, kv, load.source]);

  const update = useCallback((fn: (d: UserData) => UserData) => setData((d) => fn(d)), []);
  const replaceAll = useCallback(
    (d: UserData, opts?: { snapshot?: boolean }) => {
      if (opts?.snapshot) {
        setData((prev) => {
          try {
            kv.setItem(KEYS.preImport, JSON.stringify(prev));
          } catch {
            /* sem espaço para a cópia de segurança */
          }
          return d;
        });
      } else setData(d);
    },
    [kv],
  );
  const toast = useCallback((message: string, tone: ToastTone = 'info') => setToast({ message, tone, id: Date.now() }), []);

  useEffect(() => {
    if (!toastState) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toastState]);

  const value = useMemo(() => ({ data, update, replaceAll, toast, toastState, saveError, load, kv }), [data, update, replaceAll, toast, toastState, saveError, load, kv]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore fora do StoreProvider');
  return v;
}
