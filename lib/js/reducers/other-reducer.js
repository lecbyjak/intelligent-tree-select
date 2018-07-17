"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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
            return _extends({}, state, {
                currentSearch: action.payload
            });
        case "TOGGLE_MODAL_WINDOW":
            return _extends({}, state, {
                modalWindowVisible: !state.modalWindowVisible,
                modalFormAdvancedOptionsVisible: false
            });
        case "TOGGLE_MODAL_WINDOW_BUTTON_TOOLTIP":
            return _extends({}, state, {
                modalWindowButtonTooltipVisible: !state.modalWindowButtonTooltipVisible
            });
        case "TOGGLE_MODAL_FORM_ADVANCED_OPTIONS":
            return _extends({}, state, {
                modalFormAdvancedOptionsVisible: !state.modalFormAdvancedOptionsVisible
            });
        default:
            return state;
    }
};