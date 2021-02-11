"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _tooltipItem = _interopRequireDefault(require("./tooltipItem"));

var _Icons = require("./Icons");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class ResultItem extends _react.Component {
  getCollapseButton() {
    return /*#__PURE__*/_react.default.createElement("span", {
      onClick: this.props.onToggleClick,
      className: "toggleButton"
    }, this.props.option.expanded ? /*#__PURE__*/_react.default.createElement(_Icons.ToggleMinusIcon, null) : /*#__PURE__*/_react.default.createElement(_Icons.TogglePlusIcon, null));
  }

  static _getHash(str) {
    let hash = 0,
        i,
        chr;
    if (str.length === 0) return hash;

    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }

    return hash;
  }

  render() {
    let button = null;
    let {
      option,
      childrenKey,
      valueKey,
      labelKey,
      getOptionLabel
    } = this.props;

    if (option[childrenKey].length > 0) {
      button = this.getCollapseButton();
    }

    let label = getOptionLabel ? getOptionLabel(option) : option[labelKey];
    let value = option[valueKey];
    return /*#__PURE__*/_react.default.createElement("div", {
      style: this.props.style,
      className: this.props.className,
      onMouseEnter: this.props.onMouseEnter
    }, this.props.settings.renderAsTree && /*#__PURE__*/_react.default.createElement("div", {
      style: {
        width: '16px'
      }
    }, button), /*#__PURE__*/_react.default.createElement(_tooltipItem.default, {
      id: "tooltip-" + ResultItem._getHash(value),
      option: option,
      label: label,
      value: value,
      onClick: this.props.onClick,
      searchString: this.props.settings.searchString,
      hoverActive: this.props.settings.displayInfoOnHover,
      tooltipKey: this.props.tooltipKey
    }), option.fetchingChild && /*#__PURE__*/_react.default.createElement("span", {
      className: "Select-loading-zone",
      "aria-hidden": "true",
      style: {
        'paddingLeft': '5px'
      }
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "Select-loading"
    })));
  }

}

ResultItem.defaultProps = {
  tooltipPlacement: 'bottom',
  tooltipLabel: 'tooltip',
  tooltipDelay: {
    "show": 50,
    "hide": 50
  },
  termCategory: [],
  badgeLabel: '',
  badgeColor: 'primary'
};
var _default = ResultItem;
exports.default = _default;