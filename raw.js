const Adapter = Promise

module.exports = {
  deferred: () => {
    let resolve;
    let reject;
    const promise = new Adapter((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return {
      promise,
      reject,
      resolve,
    };
  },
  rejected: (reason) => Adapter.reject(reason),
  resolved: (value) => Adapter.resolve(value),
};
