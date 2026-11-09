export class Storage {
  constructor(adapter, onError = () => {}) {
    this.onError = onError;
    try {
      this.adapter = adapter ?? globalThis.localStorage;
    } catch {
      this.adapter = null;
      this.onError("浏览器未开放本地存储，仍可体验本次工作日。");
    }
  }
  read(key, fallback = null) {
    try {
      const value = this.adapter?.getItem(`gamex:v1:${key}`);
      return value ? JSON.parse(value) : fallback;
    } catch {
      this.onError("本地记录无法读取。原数据已保留，请检查浏览器存储。");
      return fallback;
    }
  }
  write(key, data) {
    try {
      if (!this.adapter) throw new Error();
      this.adapter.setItem(`gamex:v1:${key}`, JSON.stringify(data));
      return true;
    } catch {
      this.onError("本地保存失败，当前仍可继续；刷新后可能无法恢复。");
      return false;
    }
  }
  remove(key) {
    try {
      this.adapter?.removeItem(`gamex:v1:${key}`);
    } catch {
      this.onError("无法清除本地记录。");
    }
  }
}
