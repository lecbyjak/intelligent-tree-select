"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _modalWindow = _interopRequireDefault(require("./modalWindow"));

var _propTypes = _interopRequireDefault(require("prop-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class Settings extends _react.Component {
  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "d-flex justify-content-between"
    }, /*#__PURE__*/_react.default.createElement(_modalWindow.default, {
      onOptionCreate: this.props.onOptionCreate,
      formData: this.props.formData,
      formComponent: this.props.formComponent,
      openButtonTooltipLabel: this.props.openButtonTooltipLabel,
      openButtonLabel: this.props.openButtonLabel
    }));
  }

}

var _default = Settings;
exports.default = _default;
Settings.propTypes = {
  formData: _propTypes.default.object.isRequired,
  onOptionCreate: _propTypes.default.func.isRequired
};