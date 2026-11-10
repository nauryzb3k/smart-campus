
export function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;

  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function timeToMinutes(t: string): number {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(t);

  if (!match) {
    return NaN;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours * 60 + minutes;
}
