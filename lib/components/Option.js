"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _Icons = require("./Icons");

var _Utils = require("./utils/Utils");

var _reactHighlightWords = _interopRequireDefault(require("react-highlight-words"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

const Option = (props) => {
  const classes = (0, _classnames.default)("VirtualizedSelectOption", {
    VirtualizedSelectDisabledOption: props.isDisabled,
    VirtualizedSelectSelectedOption: props.isSelected,
  });
  const events = props.isDisabled
    ? {}
    : {
        onClick: () => {
          props.selectProps.onOptionSelect(props);
        },
      };
  let button = null;

  if (props.data[props.selectProps.childrenKey].length > 0) {
    button = getExpandButton(props.selectProps.onOptionToggle, props.data);
  }

  const value = props.data[props.selectProps.valueKey];
  return /*#__PURE__*/ _react.default.createElement(
    "div",
    {
      ref: props.innerRef,
      className: classes,
      style: {
        marginLeft: `${props.data.depth * 16}px`,
      },
    },
    props.selectProps.renderAsTree &&
      /*#__PURE__*/ _react.default.createElement(
        "div",
        {
          style: {
            width: "16px",
          },
        },
        button
      ),
    /*#__PURE__*/ _react.default.createElement(
      "div",
      {
        id: "item-" + (0, _Utils.hashCode)(value),
        className: "result-item",
        onClick: events.onClick,
      },
      /*#__PURE__*/ _react.default.createElement(_reactHighlightWords.default, {
        highlightClassName: "highlighted",
        searchWords: [props.selectProps.inputValue],
        autoEscape: true,
        textToHighlight: props.label,
        highlightTag: "span",
      })
    ),
    props.data.fetchingChild &&
      /*#__PURE__*/ _react.default.createElement(
        "span",
        {
          className: "Select-loading-zone",
          "aria-hidden": "true",
          style: {
            paddingLeft: "5px",
          },
        },
        /*#__PURE__*/ _react.default.createElement("span", {
          className: "Select-loading",
        })
      )
  );
};

function getExpandButton(onToggle, option) {
  return /*#__PURE__*/ _react.default.createElement(
    "span",
    {
      onClick: () => onToggle(option),
      className: "toggleButton",
    },
    option.expanded
      ? /*#__PURE__*/ _react.default.createElement(_Icons.ToggleMinusIcon, null)
      : /*#__PURE__*/ _react.default.createElement(_Icons.TogglePlusIcon, null)
  );
}

var _default = Option;
exports.default = _default;
