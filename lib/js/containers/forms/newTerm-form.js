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

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reduxForm = require('redux-form');

var _reactstrap = require('reactstrap');

var _newTermFormValidate = require('./newTerm-form-validate');

var _newTermFormValidate2 = _interopRequireDefault(_newTermFormValidate);

var _otherActions = require('../../actions/other-actions');

var _redux = require('redux');

var _reactRedux = require('react-redux');

var _reactVirtualizedSelect = require('react-virtualized-select');

var _reactVirtualizedSelect2 = _interopRequireDefault(_reactVirtualizedSelect);

var _reactSelectFastFilterOptions = require('react-select-fast-filter-options');

var _reactSelectFastFilterOptions2 = _interopRequireDefault(_reactSelectFastFilterOptions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createRendered = function createRendered(render) {
    return function (field) {
        return _react2.default.createElement(
            _reactstrap.FormGroup,
            null,
            render(field),
            _react2.default.createElement(
                _reactstrap.FormFeedback,
                null,
                field.meta.error
            )
        );
    };
};

var createGroupRendered = function createGroupRendered(render) {
    return function (field) {
        return _react2.default.createElement(
            'span',
            null,
            render(field),
            _react2.default.createElement(
                _reactstrap.FormFeedback,
                null,
                field.meta.error
            )
        );
    };
};
var RenderInput = createRendered(function (field) {
    var attributes = {};
    if (field.meta.touched) attributes.valid = field.meta.valid;
    return _react2.default.createElement(_reactstrap.Input, (0, _extends3.default)({ type: "text" }, field.input, { autoComplete: "off", placeholder: field.label }, attributes));
});

var RenderGroupInput = createGroupRendered(function (field) {
    var attributes = {};
    if (field.meta.touched) attributes.valid = field.meta.valid;
    return _react2.default.createElement(_reactstrap.Input, (0, _extends3.default)({ type: "text" }, field.input, { autoComplete: "off", placeholder: field.label }, attributes));
});

var errClass = {
    border: 1 + "px solid #dc3545",
    'borderRadius': 4 + 'px'
};

var RenderSelect = createRendered(function (field) {
    var attributes = {};
    if (field.multi) attributes.multi = true;
    if (field.joinValues) attributes.joinValues = true;
    if (field.meta.touched) attributes.valid = field.meta.valid;
    return _react2.default.createElement(_reactVirtualizedSelect2.default, (0, _extends3.default)({
        className: !field.meta.valid ? "is-invalid" : "",
        style: !field.meta.valid ? errClass : {},
        options: field.options,
        filterOptions: field.filterOptions,
        placeholder: field.placeholder,
        labelKey: field.labelKey,
        valueKey: field.valueKey
    }, attributes, field.input, {
        onBlur: function onBlur() {
            return field.input.onBlur(field.input.value);
        }
    }));
});

var renderMembers = function renderMembers(_ref) {
    var fields = _ref.fields,
        _ref$meta = _ref.meta,
        touched = _ref$meta.touched,
        error = _ref$meta.error;
    return _react2.default.createElement(
        _reactstrap.FormGroup,
        null,
        _react2.default.createElement(
            _reactstrap.Button,
            { type: 'button', onClick: function onClick() {
                    return fields.push({});
                }, color: 'primary', size: 'sm' },
            'Add term property'
        ),
        touched && error && _react2.default.createElement(
            'span',
            null,
            error
        ),
        fields.map(function (member, index) {
            return _react2.default.createElement(
                _reactstrap.FormGroup,
                { key: index, className: "d-flex justify-content-between align-items-center m-1" },
                _react2.default.createElement(_reduxForm.Field, {
                    name: member + '.key',
                    component: RenderGroupInput,
                    label: 'Property Key' }),
                _react2.default.createElement(_reduxForm.Field, {
                    name: member + '.value',
                    component: RenderGroupInput,
                    label: 'Property value' }),
                _react2.default.createElement(
                    'span',
                    { onClick: function onClick() {
                            return fields.remove(index);
                        }, style: { pointer: 'cursor' }, className: 'Select-clear-zone',
                        title: 'Remove term property', 'aria-label': 'Remove term property' },
                    _react2.default.createElement(
                        'span',
                        { className: 'Select-clear', style: { fontSize: 24 + 'px' } },
                        '\xD7'
                    )
                )
            );
        })
    );
};

var NewTermModalForm = function (_Component) {
    (0, _inherits3.default)(NewTermModalForm, _Component);

    function NewTermModalForm() {
        (0, _classCallCheck3.default)(this, NewTermModalForm);
        return (0, _possibleConstructorReturn3.default)(this, (NewTermModalForm.__proto__ || (0, _getPrototypeOf2.default)(NewTermModalForm)).apply(this, arguments));
    }

    (0, _createClass3.default)(NewTermModalForm, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            //this.props.dispatch(initialize('newTerm', {termLabel: this.props.defaultInputValue}));
            this.options = this.props.options;
            this.filter = (0, _reactSelectFastFilterOptions2.default)({
                options: this.options,
                valueKey: this.props.settings.valueKey,
                labelKey: this.props.settings.labelKey
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(
                _reactstrap.Form,
                { onSubmit: this.props.handleSubmit(this.props.submitForm) },
                _react2.default.createElement(
                    _reactstrap.ModalHeader,
                    { toggle: function toggle() {
                            return _this2.props.toggleModalWindow();
                        } },
                    'Create new term'
                ),
                _react2.default.createElement(
                    _reactstrap.ModalBody,
                    null,
                    _react2.default.createElement(_reduxForm.Field, { name: 'termLabel', label: "Label (required)", component: RenderInput }),
                    _react2.default.createElement(_reduxForm.Field, { name: 'termID', label: "Term ID (required)", component: RenderInput }),
                    _react2.default.createElement(_reduxForm.Field, { name: 'termDescription', label: "Description", component: RenderInput }),
                    _react2.default.createElement(
                        _reactstrap.Button,
                        { color: 'link', onClick: function onClick() {
                                return _this2.props.toggleModalFormAdvancedOptions();
                            } },
                        this.props.modalFormAdvancedOptionsVisible ? "Hide advanced options" : "Show advanced options"
                    ),
                    _react2.default.createElement(
                        _reactstrap.Collapse,
                        { isOpen: this.props.modalFormAdvancedOptionsVisible },
                        _react2.default.createElement(_reduxForm.Field, { name: "parent-term",
                            options: this.options,
                            filterOptions: this.filter,
                            placeholder: "Select parent ...",
                            component: RenderSelect,
                            labelKey: this.props.settings.labelKey,
                            valueKey: this.props.settings.valueKey
                        }),
                        _react2.default.createElement(_reduxForm.Field, { name: "child-terms",
                            options: this.options,
                            filterOptions: this.filter,
                            placeholder: "Select children ...",
                            multi: true,
                            joinValues: true,
                            component: RenderSelect,
                            labelKey: this.props.settings.labelKey,
                            valueKey: this.props.settings.valueKey
                        }),
                        _react2.default.createElement(_reduxForm.FieldArray, { name: 'termProperties', component: renderMembers })
                    )
                ),
                _react2.default.createElement(
                    _reactstrap.ModalFooter,
                    null,
                    _react2.default.createElement(
                        _reactstrap.Button,
                        { color: 'primary', type: 'submit', disabled: this.props.submitting },
                        'Submit'
                    ),
                    ' ',
                    _react2.default.createElement(
                        _reactstrap.Button,
                        { color: 'secondary', type: 'button', onClick: function onClick() {
                                _this2.props.toggleModalWindow();
                            }, disabled: this.props.submitting },
                        'Cancel'
                    )
                )
            );
        }
    }]);
    return NewTermModalForm;
}(_react.Component);

function mapStateToProps(state) {
    return {
        defaultInputValue: state.other.currentSearch,
        options: state.options.cashedOptions,
        settings: state.settings,
        modalFormAdvancedOptionsVisible: state.other.modalFormAdvancedOptionsVisible
    };
}

function mapDispatchToProps(dispatch) {
    return (0, _redux.bindActionCreators)({
        toggleModalWindow: _otherActions.toggleModalWindow,
        toggleModalFormAdvancedOptions: _otherActions.toggleModalFormAdvancedOptions
    }, dispatch);
}

exports.default = (0, _reduxForm.reduxForm)({
    // a unique name for the form
    form: 'newTerm',
    validate: _newTermFormValidate2.default
})((0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(NewTermModalForm));