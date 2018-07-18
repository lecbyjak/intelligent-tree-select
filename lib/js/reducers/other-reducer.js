"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

exports.default = function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        currentSearch: "",
        modalWindowVisible: false,
        modalWindowButtonTooltipVisible: false,
        modalFormAdvancedOptionsVisible: false
    };
    var action = arguments[1];

    switch (action.type) {
        case "SET_CURRENT_SEARCH_INPUT":
            return (0, _extends3.default)({}, state, {
                currentSearch: action.payload
            });
        case "TOGGLE_MODAL_WINDOW":
            return (0, _extends3.default)({}, state, {
                modalWindowVisible: !state.modalWindowVisible,
                modalFormAdvancedOptionsVisible: false
            });
        case "TOGGLE_MODAL_WINDOW_BUTTON_TOOLTIP":
            return (0, _extends3.default)({}, state, {
                modalWindowButtonTooltipVisible: !state.modalWindowButtonTooltipVisible
            });
        case "TOGGLE_MODAL_FORM_ADVANCED_OPTIONS":
            return (0, _extends3.default)({}, state, {
                modalFormAdvancedOptionsVisible: !state.modalFormAdvancedOptionsVisible
            });
        default:
            return state;
    }
};

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }