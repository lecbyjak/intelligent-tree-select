'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactstrap = require('reactstrap');

var _reactHighlightWords = require('react-highlight-words');

var _reactHighlightWords2 = _interopRequireDefault(_reactHighlightWords);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TooltipItem extends _react.Component {

    constructor(props) {
        super(props);
        this.state = {
            tooltipOpen: false
        };
    }

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        });
    }

    _getProvidersName(providers) {
        let names = [];
        providers.forEach(provider => names.push(provider.name));
        return names.join(", ");
    }

    render() {
        return _react2.default.createElement(
            'div',
            { id: 'Tooltip-' + this.props.id, onClick: this.props.onClick, className: "result-item" },
            _react2.default.createElement(_reactHighlightWords2.default, {
                highlightClassName: 'highlighted',
                searchWords: [this.props.searchString],
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
                    toggle: () => this.toggle(), delay: { "show": 300, "hide": 0 },
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
}

exports.default = TooltipItem;