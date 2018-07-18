'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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
            return (0, _extends3.default)({}, state, {
                settingsOpened: !state.settingsOpened
            });
        case "TOGGLE_EXPANDED":
            return (0, _extends3.default)({}, state, {
                expanded: !state.expanded
            });
        case "TOGGLE_OPTION_STATE_DISPLAY":
            return (0, _extends3.default)({}, state, {
                displayState: !state.displayState
            });
        case "TOGGLE_DISPLAY_OPTION_INFO_ON_HOVER":
            return (0, _extends3.default)({}, state, {
                displayInfoOnHover: !state.displayInfoOnHover
            });
        case "TOGGLE_RENDER_AS_TREE":
            return (0, _extends3.default)({}, state, {
                renderAsTree: !state.renderAsTree
            });
        case "TOGGLE_MULTISELECT":
            return (0, _extends3.default)({}, state, {
                multi: !state.multi
            });
        case "INIT_SETTINGS":
            return (0, _extends3.default)({}, state, {
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }