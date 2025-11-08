import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 1000): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const tm = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(tm);
  }, [value, delay]);

  return debounced;
}
