// const Promise = require('./promise.js');

const v = { sentinel: "sentinel" }

function xFactory() {
  return {
    then: function (resolvePromise) {
      resolvePromise(yFactory());
    },
  };
}

function yFactory() {
  return {
    then: function (onFulfilled) {
      onFulfilled(v);
    },
  };
}


Promise.resolve(111).then(() => xFactory()).then(d => {
  console.log(v === d)
})