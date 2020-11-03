"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _tooltipItem = require("./tooltipItem");

var _tooltipItem2 = _interopRequireDefault(_tooltipItem);

var _Icons = require("./Icons");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ResultItem extends _react.Component {

  getCollapseButton() {
    return _react2.default.createElement(
      "span",
      { onClick: this.props.onToggleClick, className: "toggleButton" },
      this.props.option.expanded ? _react2.default.createElement(_Icons.ToggleMinusIcon, null) : _react2.default.createElement(_Icons.TogglePlusIcon, null)
    );
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
    let { option, childrenKey, valueKey, labelKey, getOptionLabel } = this.props;
    if (option[childrenKey].length > 0) {
      button = this.getCollapseButton();
    }

    let label = getOptionLabel ? getOptionLabel(option) : option[labelKey];
    let value = option[valueKey];

    return _react2.default.createElement(
      "div",
      { style: this.props.style, className: this.props.className, onMouseEnter: this.props.onMouseEnter },
      this.props.settings.renderAsTree && _react2.default.createElement(
        "div",
        { style: { width: '16px' } },
        button
      ),
      _react2.default.createElement(_tooltipItem2.default, { id: "tooltip-" + ResultItem._getHash(value),
        option: option,
        label: label,
        value: value,
        onClick: this.props.onClick,
        searchString: this.props.settings.searchString,
        hoverActive: this.props.settings.displayInfoOnHover,
        tooltipKey: this.props.tooltipKey
      }),
      option.fetchingChild && _react2.default.createElement(
        "span",
        { className: "Select-loading-zone", "aria-hidden": "true", style: { 'paddingLeft': '5px' } },
        _react2.default.createElement("span", { className: "Select-loading" })
      )
    );
  }
}

ResultItem.defaultProps = {
  tooltipPlacement: 'bottom',
  tooltipLabel: 'tooltip',
  tooltipDelay: { "show": 50, "hide": 50 },
  termCategory: [],
  badgeLabel: '',
  badgeColor: 'primary'
};

exports.default = ResultItem;