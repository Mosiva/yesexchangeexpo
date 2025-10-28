// src/utils/nbkDateUtils.ts

/** Format date to YYYY-MM-DD local */
export const ymdLocal = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** Format date to DD.MM.YYYY local */
export const dmyLocal = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}.${m}.${y}`;
};

/** parse YYYY-MM-DD or DD.MM.YYYY → timestamp */
export const parseApiDate = (s: string): number | null => {
  if (!s) return null;

  // ✅ YYYY-MM-DD
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/;
  const m1 = s.match(iso);
  if (m1) {
    const [_, y, mo, d] = m1;
    return new Date(Number(y), Number(mo) - 1, Number(d)).getTime();
  }

  // ✅ DD.MM.YYYY
  const dmy = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const m2 = s.match(dmy);
  if (m2) {
    const [_, d, mo, y] = m2;
    return new Date(Number(y), Number(mo) - 1, Number(d)).getTime();
  }

  return null;
};

/** Keep latest record per currency.code */
export const pickLatestPerCode = (rows: any[]) => {
  const map = new Map();

  rows.forEach((r) => {
    const code = r?.currency?.code;
    if (!code) return;

    const ts = parseApiDate(r.date ?? "") ?? -Infinity;
    const prev = map.get(code);

    if (!prev) {
      map.set(code, r);
    } else {
      const prevTs = parseApiDate(prev.date ?? "") ?? -Infinity;
      if (ts > prevTs) map.set(code, r);
    }
  });

  return Array.from(map.values());
};
