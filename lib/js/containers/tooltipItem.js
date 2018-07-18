'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactstrap = require('reactstrap');

var _reactHighlightWords = require('react-highlight-words');

var _reactHighlightWords2 = _interopRequireDefault(_reactHighlightWords);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TooltipItem = function (_Component) {
    (0, _inherits3.default)(TooltipItem, _Component);

    function TooltipItem(props) {
        (0, _classCallCheck3.default)(this, TooltipItem);

        var _this = (0, _possibleConstructorReturn3.default)(this, (TooltipItem.__proto__ || (0, _getPrototypeOf2.default)(TooltipItem)).call(this, props));

        _this.state = {
            tooltipOpen: false
        };
        return _this;
    }

    (0, _createClass3.default)(TooltipItem, [{
        key: 'toggle',
        value: function toggle() {
            this.setState({
                tooltipOpen: !this.state.tooltipOpen
            });
        }
    }, {
        key: '_getProvidersName',
        value: function _getProvidersName(providers) {
            var names = [];
            providers.forEach(function (provider) {
                return names.push(provider.name);
            });
            return names.join(", ");
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(
                'div',
                { id: 'Tooltip-' + this.props.id, onClick: this.props.onClick, className: "result-item" },
                _react2.default.createElement(_reactHighlightWords2.default, {
                    highlightClassName: 'highlighted',
                    searchWords: [this.props.currentSearch],
                    autoEscape: false,
                    textToHighlight: this.props.label,
                    highlightTag: "span"
                }),
                _react2.default.createElement(
                    _reactstrap.Tooltip,
                    { innerClassName: "VirtualizedTreeSelectTooltip",
                        style: { left: "400px!important" },
                        placement: 'right', isOpen: this.props.hoverActive && this.state.tooltipOpen,
                        target: 'Tooltip-' + this.props.id, autohide: false,
                        toggle: function toggle() {
                            return _this2.toggle();
                        }, delay: { "show": 300, "hide": 0 },
                        modifiers: {
                            preventOverflow: {
                                escapeWithReference: true
                            }
                        }
                    },
                    _react2.default.createElement(
                        'b',
                        null,
                        'Label: '
                    ),
                    ' ',
                    this.props.label,
                    ' ',
                    _react2.default.createElement('br', null),
                    _react2.default.createElement(
                        'b',
                        null,
                        'Value: '
                    ),
                    this.props.value,
                    ' ',
                    _react2.default.createElement('br', null),
                    _react2.default.createElement(
                        'b',
                        null,
                        'Providers: '
                    ),
                    this._getProvidersName(this.props.option.providers),
                    _react2.default.createElement('br', null)
                )
            );
        }
    }]);
    return TooltipItem;
}(_react.Component);

exports.default = TooltipItem;