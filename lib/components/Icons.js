"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.TogglePlusIcon = exports.ToggleMinusIcon = void 0;
var _react = _interopRequireDefault(require("react"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
const TogglePlusIcon = () => {
  return /*#__PURE__*/ _react.default.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
    },
    /*#__PURE__*/ _react.default.createElement(
      "g",
      {
        className: "nc-icon-wrapper",
        fill: "#444444",
      },
      /*#__PURE__*/ _react.default.createElement("path", {
        d: "M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z",
      })
    )
  );
};
exports.TogglePlusIcon = TogglePlusIcon;
const ToggleMinusIcon = () => {
  return /*#__PURE__*/ _react.default.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
    },
    /*#__PURE__*/ _react.default.createElement(
      "g",
      {
        className: "nc-icon-wrapper",
        fill: "#444444",
      },
      /*#__PURE__*/ _react.default.createElement("path", {
        d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z",
      })
    )
  );
};
exports.ToggleMinusIcon = ToggleMinusIcon;
