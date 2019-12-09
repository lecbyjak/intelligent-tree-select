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
        this._onClick = this._onClick.bind(this);
    }

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        });
    }

    _getTooltipData() {
        if (this.props.tooltipKey) {
            return this.props.option[this.props.tooltipKey];
        }
        const keys = Object.keys(this.props.option);
        return keys.map((key, index) => {
            let data = "";
            const property = this.props.option[key];
            if (Array.isArray(property)) {
                data = property.length.toString();
                data += property.length === 1 ? ' record' : ' records';
            } else {
                data = JSON.stringify(property);
            }
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
                data,
                ' '
            );
        });
    }

    _onClick(e) {
        this.setState({ tooltipOpen: false });
        this.props.onClick(e);
    }

    render() {
        return _react2.default.createElement(
            'div',
            { id: 'Tooltip-' + this.props.id, className: "result-item", onClick: this._onClick },
            _react2.default.createElement(_reactHighlightWords2.default, {
                highlightClassName: 'highlighted',
                searchWords: [this.props.searchString],
                autoEscape: true,
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