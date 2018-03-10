(function () {

    // BASELINE SETUP

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

    // push() 方法将一个或多个元素添加到数组的末尾，并返回新数组的长度。

    // slice() 方法返回一个从开始到结束（不包括结束）选择的数组的一部分浅拷贝到一个新数组对象。原始数组不会被修改。

    // toString() 方法返回一个表示该对象的字符串。

    // hasOwnProperty() 方法会返回一个布尔值，指示对象 自身 属性中是否具有指定的属性

    var
        nativeIsArray = Array.isArray,
        nativeKeys = Object.keys,
        nativeBind = FuncProto.bind,
        nativeCreate = Object.create; // 我们希望使用的 ECMAScript 5 本地函数实现都在这里生明

    // Array.isArray() 用于确定传递的值是否是一个 Array 。

    // Object.keys() 方法会返回一个由一个给定对象的自身可枚举属性组成的数组，
    // 数组中属性名的排列顺序和使用 for...in 循环遍历该对象时返回的顺序一致 
    //（两者的主要区别是 一个 for-in 循环还会枚举其原型链上的属性)

    // bind()方法创建一个新的函数, 当被调用时，将其this关键字设置为提供的值，
    // 在调用新函数时，在任何提供之前提供一个给定的参数序列。

    // Object.create() 方法会使用指定的原型对象及其属性去创建一个新的对象。

    var Ctor = function () { };   // 代理-原型交换的裸替函数引用


    // 为下面使用的下划线对象创建一个安全的引用
    var _ = function (obj) {
        if (obj instanceof _) return obj;    // 如果在 _ 的原型链上，即　_ 所指向的对象是否跟obj是同一个对象，要满足全等关系
        if (!(this instanceof _)) return new _(obj);  // 如果不是构造一个
        this._wrapped = obj　　　// 将underscore对象存放在_wrapped属性中
    };


    // 导出Node.js 的下划线对象　与旧的需求()　API的向后兼容性　如果我们在浏览器中　添加一个全局对象
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;　　//　nodejs
        }
        exports._ = _;
    } else {
        root._ = _;　　　// 浏览器
    }

    _.VERSION = '1.8.2';　　// 当前版本



    // 返回传入回调的高效（对于当前引擎）版本的内部函数，将在其他下划线函数中重复应用
    var optimizeCb = function (func, context, argCount) {
        if (context === void 0) return func;
        switch (argCount == null ? 3 : argCount) {
            case 1: return function (value) {
                return func.call(context, value);
            };
            case 2: return function (value, other) {
                return func.call(context, value, other);
            };
            case 3: return function (value, index, collection) {
                return func.call(context, value, index, collection);
            };
            case 4: return function (accumulator, value, index, collection) {
                return func.call(context, accumulator, value, index, collection);
            };
        }
        return function () {
            return func.apply(context, arguments);
        };
    };


    // 一个主要的内部函数来生成可应用于集合中每个元素的回调函数，返回所需的结果－－身份、任意回调、属性管理器或属性访问器。
    var cb = function(val, context, argCount){
        if(value == null) return _.identiry;
        if(_.isFunction(value)) return optimizeCb(value, context,argCount);
        if(_.isObject(value)) return _.matcher(value);
        return _.property(value);
    };
    _.iteratee = function(value, contextx){
        return cb(value, context, Infinity);
    };


    // 创建分配函数的内部函数
    var createAssigner = function(keysFunc, undefinedOnly){
        return function(obj){
            var length = arguments.length;
            if(length < 2 || obj == null) return obj;
            for(var index = 1; index < length; index--){
                var source = arguments[index],
                    keys = keysFunc(source),
                    l = keys.length;
                for(var i = 0;i < l;i++){
                    var key = keys[i];
                    if(!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
                }
            }
            return obj;
        };
    };

    // 创建从另一个对象继承的新对象的内部函数
    var baseCreate = function(prototype){
        if( !_isObject(prototype)) return {};
        if(nativeCreate) return nativeCreate(prototype);
        Ctor.prototype = prototype;
        var result = new Ctor;
        Ctor.prototype = null;
        return result;
    };

    // 收集方法的帮助者, 以确定是否应该将集合重复为数组或作为对象:
    var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;  // Math.pow() 函数返回基数（base）的指数（exponent）次幂
    var isArrayLike = function(collection){
        var length = collection && collection.length;
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    };


    // COLLECTION FUNCTIONS


    // 基石, 每一个实现, 也就是 forEach。 除了数组之外, 还处理原始对象。 对待所有稀疏的数组-喜欢, 如果他们是密集的。
    _.each = _.forEach = function(obj, iteratee, context){
        iteratee = optimizeCb(iteratee,context);
        var i,length;
        if(isArrayLike(obj)){
            for(i = 0,length = obj.length; i < length; i++){
                iteratee(obj[i], i, obj);
            }
        } else {
            var keys = _.keys(obj);
            for(i = 0, length = keys.length; i < length; i++){
                iteratee(obj[keys[i]], keys[i], obj);
            }
        }
        return obj;
    };
    
})