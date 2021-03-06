function noop() {}

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
  if (typeof onfulfilled !== 'function') onfulfilled = noop;
  if (typeof onrejected !== 'function') onrejected = noop;

  if (this.status === 'pending') {
    const next = new MyPromise((resolve, reject) => {
      this._resolveCbs.push((result) => {
        try {
          if (onfulfilled === noop) return resolve(result);
          const value = onfulfilled(result);
          if (value === next) reject(new TypeError());
          else if (_thenable(value)) value.then(resolve, reject);
          else resolve(value);
        } catch (error) {
          reject(error);
        }
      });
      this._rejectCbs.push((result) => {
        try {
          if (onrejected === noop) return reject(result);
          const reason = onrejected(result);
          if (reason === next) reject(new TypeError());
          else if (_thenable(reason)) reason.then(resolve, reject);
          else resolve(reason);
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
          if (onfulfilled === noop) return resolve(this.result);
          const value = onfulfilled(this.result);
          if (value === next) reject(new TypeError());
          else if (_thenable(value)) {
            try {
              value.then(resolve, reject);
            } catch (err) {
              if (typeof value.then !== 'function') return resolve(value);
              throw err;
            }
          } else resolve(value);
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
          if (onrejected === noop) return reject(this.result);
          const reason = onrejected(this.result);
          if (reason === next) reject(new TypeError());
          else if (_thenable(reason)) {
            try {
              reason.then(resolve, reject);
            } catch (err) {
              if (typeof reason.then !== 'function') return resolve(reason);
              throw err;
            }
          } else resolve(reason);
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
