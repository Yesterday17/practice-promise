const promisesAplusTests = require("promises-aplus-tests");

class Promise {
  constructor(callback) {
    this.status = "pending";
    this.value = undefined;
    this.thens = [];

    const resolve = value => {
      setTimeout(() => {
        if (this.status === "pending") {
          this.status = "resolved";
          this.value = value;
          this.thens.forEach(element => {
            element[0](value);
          });
        }
      });
    };

    const reject = reason => {
      setTimeout(() => {
        if (this.status === "pending") {
          this.status = "rejected";
          this.value = reason;
          this.thens.forEach(element => {
            element[1](reason);
          });
        }
      });
    };

    try {
      callback(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onResolve, onReject) {
    onResolve =
      typeof onResolve === "function"
        ? onResolve
        : function(value) {
            return value;
          };
    onReject =
      typeof onReject === "function"
        ? onReject
        : function(reason) {
            return reason;
          };

    const doResolve = (resolve, reject) => {
      try {
        const x = onResolve(this.value);
        resolve(x);
      } catch (e) {
        reject(e);
      }
    };

    const doReject = (resolve, reject) => {
      try {
        const x = onReject(this.value);
      } catch (e) {
        reject(e);
      }
    };

    if (this.status === "resolved") {
      return new Promise(doResolve);
    }

    if (this.status === "rejected") {
      return new Promise(doReject);
    }

    if (this.status === "pending") {
      return new Promise((resolve, reject) => {
        try {
          this.thens.push([
            value => doResolve(resolve, reject),
            reason => doReject(resolve, reject)
          ]);
        } catch (e) {
          reject(e);
        }
      });
    }
  }
}

Promise.deferred = Promise.defer = function() {
  const def = {};
  def.promise = new Promise(function(resolve, reject) {
    def.resolve = resolve;
    def.reject = reject;
  });
  return def;
};

promisesAplusTests(Promise, function(err) {
  // All done; output is in the console. Or check `err` for number of failures.
});
