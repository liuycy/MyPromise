function _thenable(proto) {
  try {
    if ('then' in proto) return true;
    return false;
  } catch {
    return false;
  }
}

function _execute(callbacks, result) {
  for (const cb of callbacks) setTimeout(cb, 0, result);
}

function _createOnce(resolve, reject) {
  const _resolve = (value) => {
    if (_resolve.called) return;
    _resolve.called = true;
    resolve(value);
  };
  const _reject = (reason) => {
    if (_resolve.called) return;
    reject(reason);
  };
  return [_resolve, _reject];
}

function MyPromise(executor) {
  this.status = 'pending';
  this.result = void 0;
  this._resolveCbs = [];
  this._rejectCbs = [];

  const reject = (reason) => {
    if (this.status !== 'pending') return;
    this.status = 'rejected';
    this.result = reason;
    _execute(this._rejectCbs, this.result);
  };

  const resolve = (value) => {
    if (this.status !== 'pending') return;
    if (_thenable(value)) {
      const [_resolve, _reject] = _createOnce(resolve, reject);
      try {
        return value.then(_resolve, _reject);
      } catch (err) {
        if (_resolve.called) return;
        reject(err);
      }
    }
    this.status = 'fulfilled';
    this.result = value;
    _execute(this._resolveCbs, this.result);
  };

  const [_resolve, _reject] = _createOnce(resolve, reject);
  executor(_resolve, _reject);
}

MyPromise.prototype.then = function (onfulfilled, onrejected) {
  if (typeof onfulfilled !== 'function') onfulfilled = function () {};
  if (typeof onrejected !== 'function') onrejected = function () {};

  if (this.status === 'pending') {
    const next = new MyPromise((resolve, reject) => {
      this._resolveCbs.push((result) => {
        try {
          const value = onfulfilled(result);
          if (value === next) reject(new TypeError());
          else if (_thenable(value)) value.then(resolve, reject);
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
          else if (_thenable(reason)) reason.then(resolve, reject);
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
      setTimeout(() => {
        try {
          const value = onfulfilled(this.result);
          if (value === next) reject(new TypeError());
          else if (_thenable(value)) value.then(resolve, reject);
          else if (value) resolve(value);
          else resolve(this.result);
        } catch (error) {
          reject(error);
        }
      }, 0);
    });
    return next;
  } else if (this.status === 'rejected') {
    const next = new MyPromise((resolve, reject) => {
      setTimeout(() => {
        try {
          const reason = onrejected(this.result);
          if (reason === next) reject(new TypeError());
          else if (_thenable(reason)) reason.then(resolve, reject);
          else if (reason) resolve(reason);
          else reject(this.result);
        } catch (error) {
          reject(error);
        }
      }, 0);
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
