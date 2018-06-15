// Underscore.js 1.8.2
// http://underscorejs.org
// (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
// Underscore may be freely distributed under the MIT license.

(function(){


    // BASELINE SETUP
    // 基本设置
    
    
    // Establish the root object, window in the browser, or exports on the server.
    // 在浏览器中建立根对象、窗口或导出
    
    
    var root = this
    
    // Save the previous value of the _ variable.
    // 保存以前这个值的 _ 变量
    
    var previousUnderscore = root._
    
    // Save bytes in the minified (but not gzipped) version:
    // 在缩小的( but not gizpped )版本中保存字节
    
    
    // Create quick reference variables for speed access to core prototypes.
    // 创建快速引用变量对核心原型快速使用
    
    
    var ArrayProto = Array.prototype,
        ObjProto = Object.prototype,
        FuncProto = Function.prototype
    
    
    // All ECMAScript 5 native function implementations that we hope to use are declared here.
    // 在这里声明了所有希望使用的 ECMAScript 5 本地函数实现方式
    var push = ArrayProto.push,
        slice = ArrayProto.slice,
        toString = ObjProto.toString,
        hasOwnProperty = ObjProto.hasOwnProperty
    
    var nativeIsArray = Array.isArray,
        nativeKeys = Object.keys,
        nativeBind = FuncProto.bind,
        nativeCreate = Object.create
    
    // Naked function reference for surrogate-prototype-swapping.
    // 代理原型交换的裸函数引用
    
    var Ctor = function(){}
    
    // Create a safe reference to the Underscore object for use below.
    // 为下划线对象创建一个安全的引用提供下面使用
    
    var _ = function(obj){
        if (obj instanceof _) return obj
        if (!(this instanceof _)) return new _(obj)
        this._wrapped = obj
    }
    
    // Export the Underscore object for Node.js, 
    // with backwards-compatibility for the old require() API. 
    // If we’re in the browser, add _ as a global object.
    // 导出Node.js的下划线对象
    // 旧需求的API和向后兼容性
    // 如果我们在浏览器中 添加 _ 为全局对象
    
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports){
            exports = module.exports = _
        }
        exports._ = _
    } else {
        root._ = _
    }
    
    // Current version.
    // 现在版本
    
    _.VERSION = '1.82'
    
    // Internal function that returns an efficient (for current engines) version of the passed-in callback,
    // to be repeatedly applied in other Underscore functions.
    // 内部函数返回传入回调的一个有效(当前引擎)版本
    // 在其他下划线函数中重复使用
    
    var optimizeCb = function(func, context, argCount){
        if(context === void 0) return func
        switch (arguments == null ? 3 : argCount) {
            case 1: return function(value) {
                return func.call(context, value)
            }
            case 2: return function(value, other){
                return func.call(context, value, other)
            }
            case 3: return function(value, index, collection) {
                return func.call(context, value, idnex, collection)
            }
            case 4: return function(accumulator, value, index, collection) {
                return func.call(context, accumulator, value, index, coll)
            }
        }
        return function(){
            return func.apply(context, arguments)
        }
    }
    // A mostly-internal function to generate callbacks that can be applied to each element in a collection, 
    // returning the desired result — either identity, 
    // an arbitrary callback, a property matcher, or a property accessor.
    // 一个主要用于生成回调的内部函数 他可以应用集合中的每一个元素
    // 返回需要的结果--要么是同一性
    // 一个任意回调 一个属性匹配器 一个属性访问器
    
    var cb = function(value, context, argCount){
        if (value == null) return _.identity
        if (_.isFunction(value)) return optimizeCb(value, context, argCount)
        if (_.isObject(value)) return _.matcher(value)
        return _.property(value)
    }
    _.iteratee = function(value, context) {
        return cb(value, conte, Infinity)
    }
    
    
    // An internal function for creating assigner functions.
    // 创建一个分配函数的内部函数
    
    var createAssigner = function(keysFunc, undefinedOnly) {
        return function(obj) {
            var length = arguments.length
            if (length < 2 || obj == null) return obj
            for (var index = 1; index < length; index++){
                var source = arguments[index],
                    keys = keysFunc(source),
                    l = keys.length
                for (var i = 0; i < l; i++) {
                    var key = keys[i]
                    if(!undefinedOnly || obj[key] === void 0) obj[key] = source[key]
                }
            }
            return obj
        }
    }
    
    // An internal function for creating a new object that inherits from another.
    // 创建一个继承另一个新对象的内部函数
    
    
    var baseCreate = function(prototype) {
        if (!_.isObject(prototype)) return {}
        if(nativeCreate) return nativeCreate(prototype)
        Ctor.prototype = prototype
        var result = new Ctor
        Ctor.prototype = null
        return result
    }
    
    // Helper for collection methods to determine whether a collection should be iterated as an array or as an object Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
    // 收集方法的助手 确定集合是否应作为数组或作为对象相关
    
    var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1
    var isArrayLike = function(collection) {
        var length = collection && collection.length
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX
    }
    

    
        // COLLECTION FUNCTIONS  集合函数
    
    // The cornerstone,
    // an each implementation, aka forEach. 
    // Handles raw objects in addition to array-likes. 
    // Treats all sparse array-likes as if they were dense.
    // 基础
    // 一个 each 实现 又叫做forEach
    // 除了数组以为还可以处理原始对象
    // 处理所有稀疏数组就像他们是稠密一样(翻译有问题
    
    /**
     * _.each()
     * // array
     * _.each([1,2,3,4,5], alert)
     * (5) [1, 2, 3, 4, 5]
     * 
     * // object 需要依赖 keys keys依赖isObject
     * _.each({one: 1, two: 2, three: 3}, alert);
     * {one: 1, two: 2, three: 3}
     * 
     * // 注释keys isObject 遍历obj暂不支持
     */
    _.each = _.forEach = function(obj, iteratee, context) {
        iteratee = optimizeCb(iteratee, context)
        var i, length
        if (isArrayLike(obj)) {
            for (i = 0,length = obj.length; i < length; i++){
                iteratee(obj[i], i, obj)
            }
        } else {
            var keys = _.keys(obj)
            for (i = 0, length = keys.length; i < length; i++){
                iteratee(obj[keys[i]], keys[i], obj)
            }
        }
        return obj
    }
    
    // _.keys = function(obj) {
    //     if (!_.isObject(obj)) return [];
    //     if (nativeKeys) return nativeKeys(obj);
    //     var keys = [];
    //     for (var key in obj) if (_.has(obj, key)) keys.push(key);
    
     
    //     if (hasEnumBug) collectNonEnumProps(obj, keys);
    //     return keys;
    //   };
    
    //   _.isObject = function(obj) {
    //     var type = typeof obj;
    //     return type === 'function' || type === 'object' && !!obj;
    //   };
    
    
    
    
    
    
    
    }.call(this))