function MyPromise(executor) {
  this.status = 'pending';
  this.result = void 0;
  this._resolveCbs = [];
  this._rejectCbs = [];

  function _execute(callbacks, result) {
    for (const cb of callbacks) setImmediate(cb, result);
  }

  executor(
    (value) => {
      if (this.status !== 'pending') return;
      this.status = 'fulfilled';
      this.result = value;
      _execute(this._resolveCbs, this.result);
    },
    (reason) => {
      if (this.status !== 'pending') return;
      this.status = 'rejected';
      this.result = reason;
      _execute(this._rejectCbs, this.result);
    }
  );
}

MyPromise.prototype.then = function (onfulfilled, onrejected) {
  if (typeof onfulfilled !== 'function') onfulfilled = function () {};
  if (typeof onrejected !== 'function') onrejected = function () {};

  function thenable(proto) {
    if (!proto) return false;
    if (!('then' in proto)) return false;
    return true;
  }

  if (this.status === 'pending') {
    const next = new MyPromise((resolve, reject) => {
      this._resolveCbs.push((result) => {
        try {
          const value = onfulfilled(result);
          if (value === next) reject(new TypeError());
          else if (thenable(value)) value.then(resolve, reject);
          else if (value) resolve(value);
          else resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this._rejectCbs.push((result) => {
        try {
          const reason = onrejected(result);
          if (reason === next) reject(new TypeError());
          else if (thenable(reason)) reason.then(resolve, reject);
          else if (reason) resolve(reason);
          else reject(result);
        } catch (error) {
          reject(error);
        }
      });
    });
    return next;
  } else if (this.status === 'fulfilled') {
    const next = new MyPromise((resolve, reject) => {
      setImmediate(() => {
        try {
          const value = onfulfilled(this.result);
          if (value === next) reject(new TypeError());
          else if (thenable(value)) value.then(resolve, reject);
          else if (value) resolve(value);
          else resolve(this.result);
        } catch (error) {
          reject(error);
        }
      });
    });
    return next;
  } else if (this.status === 'rejected') {
    const next = new MyPromise((resolve, reject) => {
      setImmediate(() => {
        try {
          const reason = onrejected(this.result);
          if (reason === next) reject(new TypeError());
          else if (thenable(reason)) reason.then(resolve, reject);
          else if (reason) resolve(reason);
          else reject(this.result);
        } catch (error) {
          reject(error);
        }
      });
    });
    return next;
  }
};

MyPromise.resolve = function (value) {
  return new MyPromise((r) => r(value));
};

MyPromise.reject = function (reason) {
  return new MyPromise((_, r) => r(reason));
};

module.exports = MyPromise;
