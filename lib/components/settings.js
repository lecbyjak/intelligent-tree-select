"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _modalWindow = _interopRequireDefault(require("./modalWindow"));

var _propTypes = _interopRequireDefault(require("prop-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Settings = props => {
  const {
    onOptionCreate,
    formData,
    formComponent,
    openButtonTooltipLabel,
    openButtonLabel
  } = props;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "d-flex justify-content-between"
  }, /*#__PURE__*/_react.default.createElement(_modalWindow.default, {
    onOptionCreate: onOptionCreate,
    formData: formData,
    formComponent: formComponent,
    openButtonTooltipLabel: openButtonTooltipLabel,
    openButtonLabel: openButtonLabel
  }));
};

Settings.propTypes = {
  formData: _propTypes.default.object.isRequired,
  onOptionCreate: _propTypes.default.func.isRequired
};
var _default = Settings;
exports.default = _default;