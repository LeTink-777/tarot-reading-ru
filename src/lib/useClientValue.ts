"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

/**
 * Читает значение из браузерного хранилища после монтирования, не вызывая
 * setState внутри эффекта и не ломая гидратацию: на сервере и в первом
 * клиентском рендере возвращается null.
 *
 * @param read стабильная функция чтения — объявляйте её вне компонента
 * @param intervalMs если задан, значение перечитывается с этим интервалом
 */
export function useClientValue<T>(read: () => T, intervalMs?: number): T | null {
  const cache = useRef<T | null>(null);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      cache.current = read();
      onStoreChange();

      if (!intervalMs) return () => {};

      const id = window.setInterval(() => {
        const next = read();
        if (!Object.is(next, cache.current)) {
          cache.current = next;
          onStoreChange();
        }
      }, intervalMs);

      return () => window.clearInterval(id);
    },
    [read, intervalMs],
  );

  const getSnapshot = useCallback(() => cache.current, []);
  const getServerSnapshot = useCallback(() => null, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
