// 一个简单的实现
// 传入一个函数与它的参数，在函数中声明时可加上最后一个参数defer, 为一个回调，调用方式为:
// defer(true, params) // 触发下一轮的success函数
// defer(false, params) // 触发下一轮的error函数

class Promise {
  constructor(todoFunc, ...args) {
    this.list = [];
    this.status = 0; // 当前处理的状态(未处理, 通过与拒绝)
    this.data = null; // 当期的数据
    this.progress = -1; // 当前promise处理到的坐标
    this.finish = false; // 本身的then是否已经完成
    this.runFunc(todoFunc, ...args);
  };

  // defer中的操作
  defer(resolve, ...newArgs) {
    var {list, progress} = this;
    if(newArgs) this.data = Array.isArray(newArgs) ? newArgs : [newArgs];
    if(resolve) {
      this.status = 0;
    } else {
      this.status = 1;
    }
    this.progress ++;
    if(list[this.progress]) {
      // 如果有的话，处理then的数组
      var func = list[this.progress][this.status];
      this.runFunc(func, ...this.data);
    } else {
      this.finish = true;
    }
  };

  // 顺序处理then
  runFunc(todoFunc, ...args) {
    if(todoFunc) todoFunc(...args, (resolve, ...newArgs) => {
      this.defer(resolve, ...newArgs);
    });
  };

  // 链式push then数组
  then(...item) {
    this.list.push(item);
    return {
      then: (...item) => {
        this.then(...item);
        return this;
      }
    };
  };

  static all(promiseArr) {
    return new Promise((defer) => {
      // 给数组元素加上序列
      var done = (pass, args, i) => {
        // 删掉refer的一项
        args.pop();
        if(pass) successArr.push([i, ...args]);
        else errorArr.push([i, ...args]);
        count++;
        if(count === promiseArr.length) {
          defer(true, successArr, errorArr);
        }
      };
      var successArr = [];
      var errorArr = [];
      var count = 0;
      promiseArr.forEach((promise, i) => {
        promise.then((...args) => {
          done(true, args, i);
        }, (...args) => {
          done(false, args, i);
        });
      });
    });

  };
}

module.exports = Promise;
