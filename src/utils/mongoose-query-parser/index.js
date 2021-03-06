"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseQueryParser = void 0;
var qs = require("querystring");
var _ = require("lodash");
var utils_1 = require("./utils");
const { SSL_OP_NETSCAPE_CA_DN_BUG } = require("constants");
var MongooseQueryParser = /** @class */ (function () {
    function MongooseQueryParser(options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        this.options = options;
        this.builtInCaster = {
            string: function (val) { return String(val); },
            date: function (val) {
                var dt = utils_1.toDate(val, _this.options.dateFormat);
                if (dt.isValid) {
                    return dt.toJSDate();
                }
                else {
                    throw new Error("Invalid date string: [" + val + "]");
                }
            }
        };
        this.operators = [
            { operator: 'select', method: this.castSelect, defaultKey: 'select' },
            { operator: 'populate', method: this.castPopulate, defaultKey: 'populate' },
            { operator: 'sort', method: this.castSort, defaultKey: 'sort' },
            { operator: 'skip', method: this.castSkip, defaultKey: 'skip' },
            { operator: 'limit', method: this.castLimit, defaultKey: 'limit' },
            { operator: 'filter', method: this.castFilter, defaultKey: 'filter' },
        ];
        // add builtInCaster
        this.options.casters = Object.assign(this.builtInCaster, options.casters);
        // build blacklist
        this.options.blacklist = options.blacklist || [];
        this.operators.forEach(function (_a) {
            var operator = _a.operator, method = _a.method, defaultKey = _a.defaultKey;
            _this.options.blacklist.push(_this.options[operator + "Key"] || defaultKey);
        });
    }
    /**
     * parses query string/object to Mongoose friendly query object/QueryOptions
     * @param {string | Object} query
     * @param {Object} [context]
     * @return {QueryOptions}
     */
    MongooseQueryParser.prototype.parse = function (query, context) {
        var _this = this;
        var params = _.isString(query) ? qs.parse(query) : query;
        var options = this.options;
        var result = {};
        this.operators.forEach(function (_a) {
            var operator = _a.operator, method = _a.method, defaultKey = _a.defaultKey;
            var key = options[operator + "Key"] || defaultKey;
            var value = params[key];
            if (value || operator === 'filter') {
                result[operator] = method.call(_this, value, params);
            }
        }, this);
        result = this.parsePredefinedQuery(result, context);
        return result;
    };
    /**
     * parses string to typed values
     * This methods will apply auto type casting on Number, RegExp, Date, Boolean and null
     * Also, it will apply defined casters in given options of the instance
     * @param {string} value
     * @param {string} key
     * @return {any} typed value
     */
    MongooseQueryParser.prototype.parseValue = function (value, key) {
        var me = this;
        var options = this.options;
        // Apply casters
        // Match type casting operators like: string(true), _caster(123), $('test')
        var casters = options.casters;
        var casting = value.match(/^([a-zA-Z_$][0-9a-zA-Z_$]*)\((.*)\)$/);
        if (casting && casters[casting[1]]) {
            return casters[casting[1]](casting[2]);
        }
        // Apply casters per params
        if (key && options.castParams && options.castParams[key] && casters[options.castParams[key]]) {
            return casters[options.castParams[key]](value);
        }
        // cast array
        if (value.includes(',')) {
            return value.split(',').map(function (val) { return me.parseValue(val, key); });
        }
        // Apply type casting for Number, RegExp, Date, Boolean and null
        // Match regex operators like /foo_\d+/i
        var regex = value.match(/^\/(.*)\/(i?)$/);
        if (regex) {
            return new RegExp(regex[1], regex[2]);
        }
        // Match boolean values
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }
        // Match null
        if (value === 'null') {
            return null;
        }
        // Match numbers (string padded with zeros are not numbers)
        if (value !== '' && !isNaN(Number(value)) && !/^0[0-9]+/.test(value)) {
            return Number(value);
        }
        // Match dates
        var dt = utils_1.toDate(value, this.options.dateFormat);
        if (dt.isValid) {
            return dt.toJSDate();
        }
        return value;
    };
    MongooseQueryParser.prototype.castFilter = function (filter, params) {
        var _this = this;
        var options = this.options;
        var parsedFilter = filter ? this.parseFilter(filter) : {};
        return Object.keys(params)
            .map(function (val) {
            var join = params[val] ? val + "=" + params[val] : val;
            // Separate key, operators and value
            var _a = join.match(/(!?)([^><!=]+)([><]=?|!?=|)(.*)/), prefix = _a[1], key = _a[2], op = _a[3], value = _a[4];
            return { prefix: prefix, key: key, op: _this.parseOperator(op), value: _this.parseValue(value, key) };
        })
            .filter(function (_a) {
            var key = _a.key;
            return options.blacklist.indexOf(key) === -1;
        })
            .reduce(function (result, _a) {
            var prefix = _a.prefix, key = _a.key, op = _a.op, value = _a.value;
            if (!result[key]) {
                result[key] = {};
            }
            if (Array.isArray(value)) {
                result[key][op === '$ne' ? '$nin' : '$in'] = value;
            }
            else if (op === '$exists') {
                result[key][op] = prefix !== '!';
            }
            else if (op === '$eq') {
                result[key] = value;
            }
            else if (op === '$ne' && typeof value === 'object') {
                result[key].$not = value;
            }
            else {
                result[key][op] = value;
            }
            return result;
        }, parsedFilter);
    };
    MongooseQueryParser.prototype.parseFilter = function (filter) {
        try {
            if (typeof filter === 'object') {
                return filter;
            }
            return JSON.parse(filter);
        }
        catch (err) {
            throw new Error("Invalid JSON string: " + filter);
        }
    };
    MongooseQueryParser.prototype.parseOperator = function (operator) {
        if (operator === '=') {
            return '$eq';
        }
        else if (operator === '!=') {
            return '$ne';
        }
        else if (operator === '>') {
            return '$gt';
        }
        else if (operator === '>=') {
            return '$gte';
        }
        else if (operator === '<') {
            return '$lt';
        }
        else if (operator === '<=') {
            return '$lte';
        }
        else if (!operator) {
            return '$exists';
        }
    };
    /**
     * cast select query to object like:
     * select=a,b or select=-a,-b
     * =>
     * {select: { a: 1, b: 1 }} or {select: { a: 0, b: 0 }}
     * @param val
     */
    MongooseQueryParser.prototype.castSelect = function (val) {
        var fields = this.parseUnaries(val, { plus: 1, minus: 0 });
        /*
          From the MongoDB documentation:
          "A projection cannot contain both include and exclude specifications, except for the exclusion of the _id field."
        */
        var hasMixedValues = Object.keys(fields)
            .reduce(function (set, key) {
            if (key !== '_id') {
                set.add(fields[key]);
            }
            return set;
        }, new Set()).size > 1;
        if (hasMixedValues) {
            Object.keys(fields)
                .forEach(function (key) {
                if (fields[key] === 1) {
                    delete fields[key];
                }
            });
        }
        return fields;
    };
    /**
     * cast populate query to object like:
     * populate=field1.p1,field1.p2,field2
     * =>
     * [{path: 'field1', select: 'p1 p2'}, {path: 'field2'}]
     * @param val
     */
    MongooseQueryParser.prototype.castPopulate = function (val) {
        return val
            .split(',')
            .map(function (qry) {
                var _a = qry.split('/', 3), p1 = _a[0], p2 = _a[1], p3 = _a[2];
                var _b = _a.pop().split('.', 2), p = _b[0], s = _b[1];
                if (p3){
                    return {
                        path : p1,
                        populate: {
                            path: p2,
                            populate : {
                                path: p,
                                select: s || null
                            }
                        }
                    }
                } else if (p2){
                    return {
                        path : p1,
                        populate : {
                                path: p,
                                select: s || null
                        }
                    }
                } else {
                    return {
                        path: p,
                        select: s || null
                        
                    }
                }
        }).reduce(function (prev, curr, key) {
            // consolidate population array
            if(curr.populate.populate){
                var path = curr.populate.populate.path;
                var select = curr.populate.populate.select;
            } else if(curr.populate){
                var path = curr.populate.path;
                var select = curr.populate.select;
            } else {
                var path = curr.path;
                var select = curr.select;
            }
            var found = false;
            prev.forEach(function (e) {
                if (e.path === path) {
                    found = true;
                    if (select) {
                        e.select = e.select ? (e.select + ' ' + select) : select;
                    }
                }
            });
            if (!found) {
                prev.push(curr);
            }
            return prev;
        }, []);
    };
    /**
     * cast sort query to object like
     * sort=-a,b
     * =>
     * {sort: {a: -1, b: 1}}
     * @param sort
     */
    MongooseQueryParser.prototype.castSort = function (sort) {
        return this.parseUnaries(sort);
    };
    /**
     * Map/reduce helper to transform list of unaries
     * like '+a,-b,c' to {a: 1, b: -1, c: 1}
     */
    MongooseQueryParser.prototype.parseUnaries = function (unaries, values) {
        if (values === void 0) { values = { plus: 1, minus: -1 }; }
        var unariesAsArray = _.isString(unaries)
            ? unaries.split(',')
            : unaries;
        return unariesAsArray
            .map(function (x) { return x.match(/^(\+|-)?(.*)/); })
            .reduce(function (result, _a) {
            var val = _a[1], key = _a[2];
            result[key.trim()] = val === '-' ? values.minus : values.plus;
            return result;
        }, {});
    };
    /**
     * cast skip query to object like
     * skip=100
     * =>
     * {skip: 100}
     * @param skip
     */
    MongooseQueryParser.prototype.castSkip = function (skip) {
        return Number(skip);
    };
    /**
     * cast limit query to object like
     * limit=10
     * =>
     * {limit: 10}
     * @param limit
     */
    MongooseQueryParser.prototype.castLimit = function (limit) {
        return Number(limit);
    };
    /**
     * transform predefined query strings defined in query string to the actual query object out of the given context
     * @param query
     * @param context
     */
    MongooseQueryParser.prototype.parsePredefinedQuery = function (query, context) {
        if (context) {
            // check if given string is the format as predefined query i.e. ${query}
            var _match_1 = function (str) {
                var reg = /^\$\{([a-zA-Z_$][0-9a-zA-Z_$]*)\}$/;
                var match = str.match(reg);
                var val = undefined;
                if (match) {
                    val = _.property(match[1])(context);
                    if (val === undefined) {
                        throw new Error("No predefined query found for the provided reference [" + match[1] + "]");
                    }
                }
                return { match: !!match, val: val };
            };
            var _transform_1 = function (obj) {
                return _.reduce(obj, function (prev, curr, key) {
                    var _a, _b;
                    var val = undefined, match = undefined;
                    if (_.isString(key)) {
                        (_a = _match_1(key), match = _a.match, val = _a.val);
                        if (match) {
                            if (_.has(curr, '$exists')) {
                                // 1). as a key: {'${qry}': {$exits: true}} => {${qry object}}
                                return _.merge(prev, val);
                            }
                            else if (_.isString(val)) {
                                // 1). as a key: {'${qry}': 'something'} => {'${qry object}': 'something'}
                                key = val;
                            }
                            else {
                                throw new Error("Invalid query string at " + key);
                            }
                        }
                    }
                    if (_.isString(curr)) {
                        (_b = _match_1(curr), match = _b.match, val = _b.val);
                        if (match) {
                            _.isNumber(key)
                                ? prev.push(val) // 3). as an item of array: ['${qry}', ...] => [${qry object}, ...]
                                : (prev[key] = val); // 2). as a value: {prop: '${qry}'} => {prop: ${qry object}}
                            return prev;
                        }
                    }
                    if (_.isObject(curr) && !_.isRegExp(curr) && !_.isDate(curr)) {
                        // iterate all props & keys recursively
                        _.isNumber(key) ? prev.push(_transform_1(curr)) : (prev[key] = _transform_1(curr));
                    }
                    else {
                        _.isNumber(key) ? prev.push(curr) : (prev[key] = curr);
                    }
                    return prev;
                }, _.isArray(obj) ? [] : {});
            };
            return _transform_1(query);
        }
        return query;
    };
    return MongooseQueryParser;
}());
exports.MongooseQueryParser = MongooseQueryParser;
//# sourceMappingURL=index.js.map