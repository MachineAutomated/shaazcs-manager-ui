export function objectToMap<T>(
  obj: Record<string, T>
): Map<number, T> {
  return new Map<number, T>(
    Object.entries(obj).map(([k, v]) => [Number(k), v])
  );
}