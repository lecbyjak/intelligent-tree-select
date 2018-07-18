"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

exports.default = function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        cashedOptions: [],
        selectedOptions: '',
        history: []
    };
    var action = arguments[1];

    var _ret = function () {

        switch (action.type) {
            case "ADD_TO_HISTORY":
                var newHistory = state.history;
                newHistory.unshift(action.payload);

                return {
                    v: (0, _extends3.default)({}, state, {
                        history: newHistory
                    })
                };
            case "ADD_SELECTED_OPTIONS":
                return {
                    v: (0, _extends3.default)({}, state, {
                        selectedOptions: action.payload
                    })
                };
            case "ADD_CHILDREN_TO_PARENT":
                var childrenID = action.payload.childrenID;
                var parentID = action.payload.parentID;

                var parentOption = state.cashedOptions.find(function (x) {
                    return x[x.providers[0].valueKey] === parentID;
                });
                var children = parentOption[parentOption.providers[0].childrenKey];
                if (children.indexOf(childrenID) === -1) children.push(childrenID);

                return {
                    v: (0, _extends3.default)({}, state, {
                        cashedOptions: state.cashedOptions
                    })
                };
            case "ADD_NEW_OPTIONS":

                var _toArray = function _toArray(object) {
                    var childrenKey = object.providers[0].childrenKey;

                    if (!Array.isArray(object[childrenKey])) {
                        if (object[childrenKey]) object[childrenKey] = [object[childrenKey]];else object[childrenKey] = [];
                    }
                    return object;
                };

                var options = action.payload.options.concat(state.cashedOptions);
                var mergedArr = [];

                //merge options

                var _loop = function _loop() {
                    var currOption = options.shift();

                    currOption = _toArray(currOption);

                    var conflicts = options.filter(function (object) {
                        return object[object.providers[0].valueKey] === currOption[currOption.providers[0].valueKey];
                    });
                    conflicts.forEach(function (conflict) {
                        conflict = _toArray(conflict);
                        var a = currOption[currOption.providers[0].childrenKey];
                        var b = conflict[conflict.providers[0].childrenKey];
                        currOption[currOption.providers[0].childrenKey] = a.concat(b.filter(function (item) {
                            return a.indexOf(item) < 0;
                        }));
                    });
                    mergedArr.push(_assign2.default.apply(Object, [{}].concat((0, _toConsumableArray3.default)(conflicts.reverse()), [currOption])));
                    if (currOption.providers.length > 0) currOption.state = _App.optionStateEnum.MERGED;
                    conflicts.forEach(function (conflict) {
                        return options.splice(options.findIndex(function (el) {
                            return el[el.providers[0].valueKey] === conflict[conflict.providers[0].valueKey];
                        }), 1);
                    });
                };

                while (options.length > 0) {
                    _loop();
                }

                return {
                    v: (0, _extends3.default)({}, state, {
                        cashedOptions: mergedArr
                    })
                };
            case "TOGGLE_EXPANDED_FOR_OPTION":
                var index = state.cashedOptions.findIndex(function (obj) {
                    return obj[obj.provider[0].valueKey] === action.payload.optionID;
                });
                console.log("TOGGLE_EXPANDED_FOR_OPTION", state.options[index], index, action.payload.optionID);
                state.cashedOptions[index].expanded = !state.options[index].expanded;
                return {
                    v: (0, _extends3.default)({}, state, {
                        cashedOptions: state.options
                    })
                };
            case "SET_EXPANDED_FOR_ALL":
                state.cashedOptions.forEach(function (option) {
                    return option.expanded = action.payload;
                });
                return {
                    v: (0, _extends3.default)({}, state, {
                        cashedOptions: state.cashedOptions
                    })
                };
            default:
                return {
                    v: state
                };
        }
    }();

    if ((typeof _ret === "undefined" ? "undefined" : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
};

var _App = require("../containers/App");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }