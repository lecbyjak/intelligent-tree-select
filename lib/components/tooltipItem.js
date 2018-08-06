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

    _getTooltipData() {
        const keys = Object.keys(this.props.option);
        return keys.map((key, index) => {
            return _react2.default.createElement(
                'div',
                { key: index },
                _react2.default.createElement(
                    'b',
                    null,
                    key,
                    ': '
                ),
                ' ',
                this.props.option[key],
                ' '
            );
        });
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
            this.props.hoverActive && _react2.default.createElement(
                _reactstrap.Tooltip,
                { innerClassName: "VirtualizedTreeSelectTooltip",
                    style: { left: "400px!important" },
                    placement: 'left', isOpen: this.state.tooltipOpen,
                    target: 'Tooltip-' + this.props.id, autohide: false,
                    toggle: () => this.toggle(), delay: { "show": 300, "hide": 0 },
                    modifiers: {
                        preventOverflow: {
                            escapeWithReference: false
                        }
                    }
                },
                this._getTooltipData()
            )
        );
    }
}

exports.default = TooltipItem;