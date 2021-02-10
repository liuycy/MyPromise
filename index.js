const Promise = require('./promise.js');

Promise.resolve({ dummy: 'dummy' })
  .then(function onBasePromiseFulfilled() {


  })
  .then(
    (v) => console.log('value: ', v),
    (e) => console.log('error: ', e)
  );
