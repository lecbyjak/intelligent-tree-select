"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _Icons = require("./Icons");

var _tooltipItem = _interopRequireDefault(require("./tooltipItem"));

var _Utils = require("./utils/Utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Option = props => {
  const classes = (0, _classnames.default)("VirtualizedSelectOption", {
    "VirtualizedSelectFocusedOption": props.isFocused,
    "VirtualizedSelectDisabledOption": props.isDisabled,
    "VirtualizedSelectSelectedOption": props.isSelected
  });
  const events = props.isDisabled ? {} : {
    onClick: () => props.selectOption(props.data)
  };
  let button = null;

  if (props.data[props.selectProps.childrenKey].length > 0) {
    button = getExpandButton(() => props.selectProps.onOptionToggle(props.data), props.data.expanded);
  }

  const value = props.data[props.selectProps.valueKey];
  return /*#__PURE__*/_react.default.createElement("div", {
    ref: props.innerRef,
    className: classes
  }, props.selectProps.renderAsTree && /*#__PURE__*/_react.default.createElement("div", {
    style: {
      width: '16px'
    }
  }, button), /*#__PURE__*/_react.default.createElement(_tooltipItem.default, {
    id: "tooltip-" + (0, _Utils.hashCode)(value),
    option: props.data,
    label: props.label,
    value: value,
    onClick: () => props.selectOption(props.data),
    searchString: props.selectProps.inputValue,
    hoverActive: props.selectProps.displayInfoOnHover,
    tooltipKey: props.selectProps.tooltipKey
  }), props.data.fetchingChild && /*#__PURE__*/_react.default.createElement("span", {
    className: "Select-loading-zone",
    "aria-hidden": "true",
    style: {
      'paddingLeft': '5px'
    }
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "Select-loading"
  })));
};

function getExpandButton(onToggle, expanded) {
  return /*#__PURE__*/_react.default.createElement("span", {
    onClick: onToggle,
    className: "toggleButton"
  }, expanded ? /*#__PURE__*/_react.default.createElement(_Icons.ToggleMinusIcon, null) : /*#__PURE__*/_react.default.createElement(_Icons.TogglePlusIcon, null));
}

var _default = Option;
exports.default = _default;