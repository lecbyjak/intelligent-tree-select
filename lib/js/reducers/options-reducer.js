"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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
                    v: _extends({}, state, {
                        history: newHistory
                    })
                };
            case "ADD_SELECTED_OPTIONS":
                return {
                    v: _extends({}, state, {
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
                    v: _extends({}, state, {
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
                    mergedArr.push(Object.assign.apply(Object, [{}].concat(_toConsumableArray(conflicts.reverse()), [currOption])));
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
                    v: _extends({}, state, {
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
                    v: _extends({}, state, {
                        cashedOptions: state.options
                    })
                };
            case "SET_EXPANDED_FOR_ALL":
                state.cashedOptions.forEach(function (option) {
                    return option.expanded = action.payload;
                });
                return {
                    v: _extends({}, state, {
                        cashedOptions: state.cashedOptions
                    })
                };
            default:
                return {
                    v: state
                };
        }
    }();

    if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
};

var _App = require("../containers/App");

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }