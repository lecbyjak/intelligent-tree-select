'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactstrap = require('reactstrap');

var _reactHighlightWords = require('react-highlight-words');

var _reactHighlightWords2 = _interopRequireDefault(_reactHighlightWords);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TooltipItem = function (_Component) {
    _inherits(TooltipItem, _Component);

    function TooltipItem(props) {
        _classCallCheck(this, TooltipItem);

        var _this = _possibleConstructorReturn(this, (TooltipItem.__proto__ || Object.getPrototypeOf(TooltipItem)).call(this, props));

        _this.state = {
            tooltipOpen: false
        };
        return _this;
    }

    _createClass(TooltipItem, [{
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