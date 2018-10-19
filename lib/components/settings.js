'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactstrap = require('reactstrap');

var _modalWindow = require('./modalWindow');

var _modalWindow2 = _interopRequireDefault(_modalWindow);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Settings extends _react.Component {

  render() {
    return _react2.default.createElement(
      'div',
      { className: 'd-flex justify-content-between' },
      _react2.default.createElement(_modalWindow2.default, { onOptionCreate: this.props.onOptionCreate,
        formData: this.props.formData,
        formComponent: this.props.formComponent,
        openButtonTooltipLabel: this.props.openButtonTooltipLabel,
        openButtonLabel: this.props.openButtonLabel
      })
    );
  }
}

exports.default = Settings;


Settings.propTypes = {
  formData: _propTypes2.default.object.isRequired,
  onOptionCreate: _propTypes2.default.func.isRequired
};