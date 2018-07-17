"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _connect = require("react-redux/es/connect/connect");

var _connect2 = _interopRequireDefault(_connect);

var _redux = require("redux");

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactstrap = require("reactstrap");

var _otherActions = require("../actions/other-actions");

var _optionsActions = require("../actions/options-actions");

var _newTermForm = require("./forms/newTerm-form");

var _newTermForm2 = _interopRequireDefault(_newTermForm);

var _App = require("./App");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ModalWindow = function (_Component) {
    _inherits(ModalWindow, _Component);

    function ModalWindow(props) {
        _classCallCheck(this, ModalWindow);

        var _this = _possibleConstructorReturn(this, (ModalWindow.__proto__ || Object.getPrototypeOf(ModalWindow)).call(this, props));

        _this.id = 'Modal_form_open_button';
        return _this;
    }

    _createClass(ModalWindow, [{
        key: "_getIDs",
        value: function _getIDs(children) {
            var _this2 = this;

            if (!children) return [];
            var ids = JSON.parse(JSON.stringify(children));
            return ids.map(function (obj) {
                return obj[_this2.props.settings.valueKey];
            });
        }
    }, {
        key: "_createNewOption",
        value: function _createNewOption() {

            var values = this.props.form.newTerm.values;
            var settings = this.props.settings;

            var localProvider = {
                name: "Local data",
                labelKey: settings.labelKey,
                valueKey: settings.valueKey,
                childrenKey: settings.childrenKey,
                labelValue: null
            };

            var properties = {};
            if (values.termProperties) {
                properties = values.termProperties.reduce(function (result, elem) {
                    result[elem.key] = elem.value;
                    return result;
                }, {});
            }

            var children = this._getIDs(values['child-terms']);
            var parent = '';
            if (values['parent-term']) parent = values['parent-term'][settings.valueKey];

            var option = {};
            option[settings.valueKey] = values['termID'];
            option[settings.labelKey] = values['termLabel'];
            option[settings.childrenKey] = children;
            option['parent'] = parent;
            option['description'] = values['termDescription'];

            Object.assign(option, properties);
            option['state'] = _App.optionStateEnum.NEW;
            option['providers'] = [localProvider];

            this.props.onOptionCreate(option);
            this.props.toggleModalWindow();
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            return _react2.default.createElement(
                "div",
                null,
                _react2.default.createElement(
                    _reactstrap.Button,
                    { color: "link", className: "d-flex justify-content-center  align-items-center",
                        onClick: function onClick() {
                            return _this3.props.toggleModalWindow();
                        },
                        id: this.id },
                    "Create new option"
                ),
                _react2.default.createElement(
                    _reactstrap.Tooltip,
                    { innerClassName: "bg-light text-dark border border-dark", delay: { show: 300, hide: 100 },
                        placement: "right", isOpen: this.props.other.modalWindowButtonTooltipVisible,
                        target: this.id, toggle: function toggle() {
                            return _this3.props.toggleModalWindowButtonTooltip();
                        } },
                    this.props.tooltipLabel
                ),
                this.props.other.modalWindowVisible && _react2.default.createElement(
                    _reactstrap.Modal,
                    { backdrop: "static", isOpen: this.props.other.modalWindowVisible, toggle: function toggle() {
                            return _this3.props.toggleModalWindow();
                        } },
                    _react2.default.createElement(_newTermForm2.default, { submitForm: function submitForm() {
                            return _this3._createNewOption();
                        } })
                )
            );
        }
    }]);

    return ModalWindow;
}(_react.Component);

ModalWindow.defaultProps = {
    tooltipLabel: 'Didn´t find your term? Add new one.'
};

function mapStateToProps(state) {
    return {
        options: state.options,
        settings: state.settings,
        form: state.form,
        other: state.other
    };
}

function mapDispatchToProps(dispatch) {
    return (0, _redux.bindActionCreators)({
        toggleModalWindow: _otherActions.toggleModalWindow,
        addNewOptions: _optionsActions.addNewOptions,
        toggleModalWindowButtonTooltip: _otherActions.toggleModalWindowButtonTooltip
    }, dispatch);
}

exports.default = (0, _connect2.default)(mapStateToProps, mapDispatchToProps)(ModalWindow);