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

  constructor(props, context) {
    super(props, context);

    this._toggleSettings = this._toggleSettings.bind(this);

    this.state = {
      open: false
    };
  }

  _toggleSettings() {
    this.setState({ open: !this.state.open });
  }

  render() {
    const data = this.props.data;
    return _react2.default.createElement(
      'div',
      { className: 'd-flex flex-column' },
      _react2.default.createElement(
        'div',
        { className: 'd-flex justify-content-between' },
        _react2.default.createElement(_modalWindow2.default, { onOptionCreate: this.props.onOptionCreate,
          formData: this.props.formData,
          formComponent: this.props.formComponent
        }),
        _react2.default.createElement(
          _reactstrap.Button,
          { color: 'link', onClick: this._toggleSettings },
          this.state.open ? "Hide filter" : "Show filter"
        )
      ),
      _react2.default.createElement(
        _reactstrap.Collapse,
        { className: 'w-100', isOpen: this.state.open },
        _react2.default.createElement(
          _reactstrap.Card,
          null,
          _react2.default.createElement(
            _reactstrap.CardBody,
            null,
            _react2.default.createElement(
              _reactstrap.Form,
              null,
              _react2.default.createElement(
                _reactstrap.FormGroup,
                { check: true },
                _react2.default.createElement(
                  _reactstrap.Label,
                  { check: true },
                  _react2.default.createElement(_reactstrap.Input, { type: 'checkbox', name: 'multiselect',
                    onClick: () => this.props.onSettingsChange({ multi: !data.multi }),
                    defaultChecked: data.multi }),
                  ' ',
                  'Multiselect'
                )
              ),
              _react2.default.createElement(
                _reactstrap.FormGroup,
                { check: true },
                _react2.default.createElement(
                  _reactstrap.Label,
                  { check: true },
                  _react2.default.createElement(_reactstrap.Input, { type: 'checkbox', name: 'infoOnHover',
                    onClick: () => this.props.onSettingsChange({ displayInfoOnHover: !data.displayInfoOnHover }),
                    defaultChecked: data.displayInfoOnHover }),
                  ' ',
                  'Show info on hover'
                )
              ),
              _react2.default.createElement(
                _reactstrap.FormGroup,
                { check: true },
                _react2.default.createElement(
                  _reactstrap.Label,
                  { check: true },
                  _react2.default.createElement(_reactstrap.Input, { type: 'checkbox', name: 'infoOnHover',
                    onClick: () => this.props.onSettingsChange({ renderAsTree: !data.renderAsTree }),
                    defaultChecked: data.renderAsTree }),
                  ' ',
                  'Render as tree'
                )
              ),
              data.renderAsTree && _react2.default.createElement(
                _reactstrap.FormGroup,
                { check: true },
                _react2.default.createElement(
                  _reactstrap.Label,
                  { check: true },
                  _react2.default.createElement(_reactstrap.Input, { type: 'checkbox', name: 'expanded',
                    onClick: () => this.props.onSettingsChange({ expanded: !data.expanded }),
                    defaultChecked: data.expanded }),
                  ' ',
                  'Expanded'
                )
              )
            )
          )
        )
      )
    );
  }
}

exports.default = Settings;


Settings.propTypes = {
  data: _propTypes2.default.object.isRequired,
  formData: _propTypes2.default.object.isRequired,
  onOptionCreate: _propTypes2.default.func.isRequired,
  onSettingsChange: _propTypes2.default.func.isRequired
};