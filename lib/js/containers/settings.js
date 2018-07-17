'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactstrap = require('reactstrap');

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _settingsActions = require('../actions/settings-actions');

var settingsAction = _interopRequireWildcard(_settingsActions);

var _modalWindow = require('../containers/modalWindow');

var _modalWindow2 = _interopRequireDefault(_modalWindow);

var _optionsActions = require('../actions/options-actions');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Settings = function (_Component) {
    _inherits(Settings, _Component);

    function Settings() {
        _classCallCheck(this, Settings);

        return _possibleConstructorReturn(this, (Settings.__proto__ || Object.getPrototypeOf(Settings)).apply(this, arguments));
    }

    _createClass(Settings, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(
                'div',
                { className: 'd-flex flex-column' },
                _react2.default.createElement(
                    'div',
                    { className: 'd-flex justify-content-between' },
                    _react2.default.createElement(_modalWindow2.default, { onOptionCreate: this.props.onOptionCreate }),
                    _react2.default.createElement(
                        _reactstrap.Button,
                        { color: 'link', onClick: function onClick() {
                                return _this2.props.toggleSettings();
                            } },
                        this.props.settings.settingsOpened ? "Hide filter" : "Show filter"
                    )
                ),
                _react2.default.createElement(
                    _reactstrap.Collapse,
                    { className: 'w-100', isOpen: this.props.settings.settingsOpened },
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
                                        _react2.default.createElement(_reactstrap.Input, { type: 'checkbox', name: 'multiselect', onClick: function onClick() {
                                                return _this2.props.toggleMultiselect();
                                            }, defaultChecked: this.props.settings.multi }),
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
                                        _react2.default.createElement(_reactstrap.Input, { type: 'checkbox', name: 'displayTermState', onClick: function onClick() {
                                                return _this2.props.toggleOptionStateDisplay();
                                            }, defaultChecked: this.props.settings.displayState }),
                                        ' ',
                                        'Display Term State'
                                    )
                                ),
                                _react2.default.createElement(
                                    _reactstrap.FormGroup,
                                    { check: true },
                                    _react2.default.createElement(
                                        _reactstrap.Label,
                                        { check: true },
                                        _react2.default.createElement(_reactstrap.Input, { type: 'checkbox', name: 'infoOnHover', onClick: function onClick() {
                                                return _this2.props.toggleDisplayOptionInfoOnHover();
                                            }, defaultChecked: this.props.settings.displayInfoOnHover }),
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
                                        _react2.default.createElement(_reactstrap.Input, { type: 'checkbox', name: 'infoOnHover', onClick: function onClick() {
                                                return _this2.props.toggleRenderAsTree();
                                            }, defaultChecked: this.props.settings.renderAsTree }),
                                        ' ',
                                        'Render as tree'
                                    )
                                ),
                                this.props.settings.renderAsTree && _react2.default.createElement(
                                    _reactstrap.FormGroup,
                                    { check: true },
                                    _react2.default.createElement(
                                        _reactstrap.Label,
                                        { check: true },
                                        _react2.default.createElement(_reactstrap.Input, { type: 'checkbox', name: 'expanded', onClick: function onClick() {
                                                _this2.props.toggleExpanded();
                                                _this2.props.setExpandedForAll(!_this2.props.settings.expanded);
                                            }, defaultChecked: this.props.settings.expanded }),
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
    }]);

    return Settings;
}(_react.Component);

function mapStateToProps(state) {
    return {
        settings: state.settings
    };
}

function mapDispatchToProps(dispatch) {
    return (0, _redux.bindActionCreators)({
        toggleSettings: settingsAction.toggleSettings,
        toggleExpanded: settingsAction.toggleExpanded,
        toggleOptionStateDisplay: settingsAction.toggleOptionStateDisplay,
        toggleDisplayOptionInfoOnHover: settingsAction.toggleDisplayOptionInfoOnHover,
        toggleRenderAsTree: settingsAction.toggleRenderAsTree,
        toggleMultiselect: settingsAction.toggleMultiselect,
        setExpandedForAll: _optionsActions.setExpandedForAll
    }, dispatch);
}

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Settings);