// 状态可序列化的 mulberry32；不读取时钟或全局随机源。
export function createRng(seed) {
  let state = seed >>> 0;
  return {
    next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    get state() {
      return state;
    },
  };
}
export function deriveSeed(seed, key) {
  let hash = seed >>> 0;
  for (const char of key)
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  return hash;
}
export const clamp = (n, min = 0, max = 100) => Math.min(max, Math.max(min, n));
export const round = (n) => Math.round(n * 100) / 100;
