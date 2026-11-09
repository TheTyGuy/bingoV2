import { useEffect, useState } from 'react';

const KEY = 'kabingo:name';

/** The player's name, remembered on this device for next time. */
export function useRememberedName(): [string, (name: string) => void] {
  const [name, setName] = useState('');
  useEffect(() => {
    try {
      setName(localStorage.getItem(KEY) ?? '');
    } catch {
      /* storage blocked: start blank */
    }
  }, []);
  const update = (value: string) => {
    setName(value);
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
  };
  return [name, update];
}
