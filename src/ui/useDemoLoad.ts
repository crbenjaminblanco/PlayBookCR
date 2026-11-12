import { useEffect, useState } from 'react';

export type LoadStatus = 'loading' | 'ready' | 'error';

export function useDemoLoad() {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setStatus('loading');
    const timer = setTimeout(() => setStatus('ready'), 420);
    return () => clearTimeout(timer);
  }, [attempt]);

  return {
    status,
    retry: () => setAttempt((value) => value + 1),
  };
}
