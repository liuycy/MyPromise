const Promise = require('./promise.js');

Promise.resolve({ dummy: 'dummy' })
  .then(function onBasePromiseFulfilled() {
    // x
    return {
      then: function (resolvePromise) {
        setTimeout(() => {
          resolvePromise(
            // y
            Object.create(null, {
              then: {
                get: function () {
                  throw 111;
                },
              },
            })
          );
        }, 0);
      },
    };
  })
  .then(
    (v) => console.log('value: ', v),
    (e) => console.log('error: ', e)
  );
