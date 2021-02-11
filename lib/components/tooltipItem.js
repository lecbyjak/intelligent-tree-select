"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _reactstrap = require("reactstrap");

var _reactHighlightWords = _interopRequireDefault(require("react-highlight-words"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class TooltipItem extends _react.Component {
  constructor(props) {
    super(props);
    this.state = {
      tooltipOpen: false
    };
    this._onClick = this._onClick.bind(this);
  }

  toggle() {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen
    });
  }

  _getTooltipData() {
    if (this.props.tooltipKey) {
      return this.props.option[this.props.tooltipKey];
    }

    const keys = Object.keys(this.props.option);
    return keys.map((key, index) => {
      let data;
      const property = this.props.option[key];

      if (Array.isArray(property)) {
        data = property.length.toString();
        data += property.length === 1 ? ' record' : ' records';
      } else {
        data = JSON.stringify(property);
      }

      return /*#__PURE__*/_react.default.createElement("div", {
        key: index
      }, /*#__PURE__*/_react.default.createElement("b", null, key, ": "), " ", data, " ");
    });
  }

  _onClick(e) {
    this.setState({
      tooltipOpen: false
    });
    this.props.onClick(e);
  }

  render() {
    const itemId = 'Tooltip-' + this.props.id;
    return /*#__PURE__*/_react.default.createElement("div", {
      id: itemId,
      className: "result-item",
      onClick: this._onClick
    }, /*#__PURE__*/_react.default.createElement(_reactHighlightWords.default, {
      highlightClassName: "highlighted",
      searchWords: [this.props.searchString],
      autoEscape: true,
      textToHighlight: this.props.label,
      highlightTag: "span"
    }), this.props.hoverActive && /*#__PURE__*/_react.default.createElement(_reactstrap.Tooltip, {
      innerClassName: "VirtualizedTreeSelectTooltip",
      placement: 'auto',
      isOpen: this.state.tooltipOpen,
      target: itemId,
      autohide: false,
      toggle: () => this.toggle(),
      delay: {
        "show": 300,
        "hide": 0
      },
      modifiers: {
        preventOverflow: {
          escapeWithReference: false
        }
      }
    }, this._getTooltipData()));
  }

}

var _default = TooltipItem;
exports.default = _default;