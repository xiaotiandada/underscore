(function(){


    var root = this;   // 建立根对象,浏览器中的窗口或服务器上的导出

    var previousUnderscore = root._;  // 保存变量的前一个值

    var ArrayProto = Array.prototype,
        ObjProto = Object.prototype,
        FuncProto = Function.prototype;   // 在小型化版本中保存字节(但不是 gzip)版本

    var 
      push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = Objproto.toString,
      hasOwnProperty = Objproto.hasOwnProperty;   // 为核心原型的速度访问创建快速参考变量

    var
      nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeBind = FuncProto.bind,
      nativeCreate = Object.create; // 我们希望使用的 ECMAScript 5 本地函数实现都在这里生明
})