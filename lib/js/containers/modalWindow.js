"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

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

var ModalWindow = function (_Component) {
    (0, _inherits3.default)(ModalWindow, _Component);

    function ModalWindow(props) {
        (0, _classCallCheck3.default)(this, ModalWindow);

        var _this = (0, _possibleConstructorReturn3.default)(this, (ModalWindow.__proto__ || (0, _getPrototypeOf2.default)(ModalWindow)).call(this, props));

        _this.id = 'Modal_form_open_button';
        return _this;
    }

    (0, _createClass3.default)(ModalWindow, [{
        key: "_getIDs",
        value: function _getIDs(children) {
            var _this2 = this;

            if (!children) return [];
            var ids = JSON.parse((0, _stringify2.default)(children));
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

            (0, _assign2.default)(option, properties);
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