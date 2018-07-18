"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactstrap = require("reactstrap");

var _tooltipItem = require("./tooltipItem");

var _tooltipItem2 = _interopRequireDefault(_tooltipItem);

var _reactRedux = require("react-redux");

var _redux = require("redux");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ResultItem = function (_Component) {
    (0, _inherits3.default)(ResultItem, _Component);

    function ResultItem() {
        (0, _classCallCheck3.default)(this, ResultItem);
        return (0, _possibleConstructorReturn3.default)(this, (ResultItem.__proto__ || (0, _getPrototypeOf2.default)(ResultItem)).apply(this, arguments));
    }

    (0, _createClass3.default)(ResultItem, [{
        key: "_getWarningIcon",
        value: function _getWarningIcon() {
            return _react2.default.createElement(
                "svg",
                { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24" },
                _react2.default.createElement(
                    "g",
                    { className: "nc-icon-wrapper", fill: "#f67d12" },
                    _react2.default.createElement("path", {
                        d: "M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" })
                )
            );
        }
    }, {
        key: "_getTogglePlusIcon",
        value: function _getTogglePlusIcon() {
            return _react2.default.createElement(
                "svg",
                { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24" },
                _react2.default.createElement(
                    "g",
                    { className: "nc-icon-wrapper", fill: "#444444" },
                    _react2.default.createElement("path", {
                        d: "M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" })
                )
            );
        }
    }, {
        key: "_getToggleMinusIcon",
        value: function _getToggleMinusIcon() {
            return _react2.default.createElement(
                "svg",
                { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24" },
                _react2.default.createElement(
                    "g",
                    { className: "nc-icon-wrapper", fill: "#444444" },
                    _react2.default.createElement("path", {
                        d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z" })
                )
            );
        }
    }, {
        key: "_handleButtonClick",
        value: function _handleButtonClick() {
            this.props.option.expanded = !this.props.option.expanded;
            this.props.onToggleClick();
        }
    }, {
        key: "getCollapseButton",
        value: function getCollapseButton() {
            var _this2 = this;

            var button = null;

            if (this.props.option.expanded) {
                button = this._getToggleMinusIcon();
            } else {
                button = this._getTogglePlusIcon();
            }
            return _react2.default.createElement(
                "span",
                { onClick: function onClick() {
                        return _this2._handleButtonClick();
                    }, className: "toggleButton" },
                button
            );
        }
    }, {
        key: "_getHash",
        value: function _getHash(str) {
            var hash = 0,
                i,
                chr;
            if (str.length === 0) return hash;
            for (i = 0; i < str.length; i++) {
                chr = str.charCodeAt(i);
                hash = (hash << 5) - hash + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        }
    }, {
        key: "render",
        value: function render() {
            var button = null;
            var option = this.props.option;
            if (option[option.providers[0].childrenKey].length > 0) {
                button = this.getCollapseButton();
            }
            var style = {};
            style.width = option.depth * 16 + 'px';

            var label = option[option.providers[0].labelKey];
            if (!(typeof label === 'string' || label instanceof String)) {
                label = option.providers[0].labelValue(label);
            }
            var value = option[option.providers[0].valueKey];

            return _react2.default.createElement(
                "div",
                { style: this.props.style, className: this.props.className, onMouseEnter: this.props.onMouseEnter },
                this.props.settings.renderAsTree && _react2.default.createElement("div", { style: style }),
                this.props.settings.renderAsTree && _react2.default.createElement(
                    "div",
                    { style: { width: '16px' } },
                    button
                ),
                _react2.default.createElement(_tooltipItem2.default, { id: "tooltip-" + this._getHash(value),
                    option: option,
                    label: label,
                    value: value,
                    currentSearch: this.props.currentSearch,
                    onClick: this.props.onClick,
                    hoverActive: this.props.settings.displayInfoOnHover
                }),
                option.state.label && this.props.settings.displayState && _react2.default.createElement(
                    "div",
                    { className: "p-0 pl-1 pr-1", xs: "auto" },
                    _react2.default.createElement(
                        _reactstrap.Badge,
                        {
                            color: option.state.color },
                        option.state.label
                    )
                )
            );
        }
    }]);
    return ResultItem;
}(_react.Component);

ResultItem.defaultProps = {
    tooltipPlacement: 'bottom',
    tooltipLabel: 'tooltip',
    tooltipDelay: { "show": 50, "hide": 50 },
    termCategory: [],
    badgeLabel: '',
    badgeColor: 'primary'
};

function mapStateToProps(state) {
    return {
        options: state.options,
        currentSearch: state.other.currentSearch,
        settings: state.settings
    };
}

function mapDispatchToProps(dispatch) {
    return (0, _redux.bindActionCreators)({}, dispatch);
}

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ResultItem);