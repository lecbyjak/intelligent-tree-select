'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        settingsOpened: false,
        expanded: true,
        displayState: true,
        displayInfoOnHover: false,
        renderAsTree: false,
        multi: true,
        labelKey: 'label',
        valueKey: 'value',
        childrenKey: 'children'
    };
    var action = arguments[1];

    switch (action.type) {
        case "TOGGLE_SETTINGS":
            return _extends({}, state, {
                settingsOpened: !state.settingsOpened
            });
        case "TOGGLE_EXPANDED":
            return _extends({}, state, {
                expanded: !state.expanded
            });
        case "TOGGLE_OPTION_STATE_DISPLAY":
            return _extends({}, state, {
                displayState: !state.displayState
            });
        case "TOGGLE_DISPLAY_OPTION_INFO_ON_HOVER":
            return _extends({}, state, {
                displayInfoOnHover: !state.displayInfoOnHover
            });
        case "TOGGLE_RENDER_AS_TREE":
            return _extends({}, state, {
                renderAsTree: !state.renderAsTree
            });
        case "TOGGLE_MULTISELECT":
            return _extends({}, state, {
                multi: !state.multi
            });
        case "INIT_SETTINGS":
            return _extends({}, state, {
                displayState: action.payload.displayState,
                displayInfoOnHover: action.payload.displayInfoOnHover,
                expanded: action.payload.expanded,
                renderAsTree: action.payload.renderAsTree,
                multi: action.payload.multi,
                labelKey: action.payload.labelKey,
                valueKey: action.payload.valueKey,
                childrenKey: action.payload.childrenKey
            });
        default:
            return state;
    }
};