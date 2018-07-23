'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

const createRendered = render => field => {
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

const createGroupRendered = render => field => {
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
const RenderInput = createRendered(field => {
    let attributes = {};
    if (field.meta.touched) attributes.valid = field.meta.valid;
    return _react2.default.createElement(_reactstrap.Input, _extends({ type: "text" }, field.input, { autoComplete: "off", placeholder: field.label }, attributes));
});

const RenderGroupInput = createGroupRendered(field => {
    let attributes = {};
    if (field.meta.touched) attributes.valid = field.meta.valid;
    return _react2.default.createElement(_reactstrap.Input, _extends({ type: "text" }, field.input, { autoComplete: "off", placeholder: field.label }, attributes));
});

const errClass = {
    border: 1 + "px solid #dc3545",
    'borderRadius': 4 + 'px'
};

const RenderSelect = createRendered(field => {
    let attributes = {};
    if (field.multi) attributes.multi = true;
    if (field.joinValues) attributes.joinValues = true;
    if (field.meta.touched) attributes.valid = field.meta.valid;
    return _react2.default.createElement(_reactVirtualizedSelect2.default, _extends({
        className: !field.meta.valid ? "is-invalid" : "",
        style: !field.meta.valid ? errClass : {},
        options: field.options,
        filterOptions: field.filterOptions,
        placeholder: field.placeholder,
        labelKey: field.labelKey,
        valueKey: field.valueKey
    }, attributes, field.input, {
        onBlur: () => field.input.onBlur(field.input.value)
    }));
});

const renderMembers = ({ fields, meta: { touched, error } }) => _react2.default.createElement(
    _reactstrap.FormGroup,
    null,
    _react2.default.createElement(
        _reactstrap.Button,
        { type: 'button', onClick: () => fields.push({}), color: 'primary', size: 'sm' },
        'Add term property'
    ),
    touched && error && _react2.default.createElement(
        'span',
        null,
        error
    ),
    fields.map((member, index) => _react2.default.createElement(
        _reactstrap.FormGroup,
        { key: index, className: "d-flex justify-content-between align-items-center m-1" },
        _react2.default.createElement(_reduxForm.Field, {
            name: `${member}.key`,
            component: RenderGroupInput,
            label: 'Property Key' }),
        _react2.default.createElement(_reduxForm.Field, {
            name: `${member}.value`,
            component: RenderGroupInput,
            label: 'Property value' }),
        _react2.default.createElement(
            'span',
            { onClick: () => fields.remove(index), style: { pointer: 'cursor' }, className: 'Select-clear-zone',
                title: 'Remove term property', 'aria-label': 'Remove term property' },
            _react2.default.createElement(
                'span',
                { className: 'Select-clear', style: { fontSize: 24 + 'px' } },
                '\xD7'
            )
        )
    ))
);

class NewTermModalForm extends _react.Component {

    componentWillMount() {
        //this.props.dispatch(initialize('newTerm', {termLabel: this.props.defaultInputValue}));
        this.options = this.props.options;
        this.filter = (0, _reactSelectFastFilterOptions2.default)({
            options: this.options,
            valueKey: this.props.settings.valueKey,
            labelKey: this.props.settings.labelKey
        });
    }

    render() {
        return _react2.default.createElement(
            _reactstrap.Form,
            { onSubmit: this.props.handleSubmit(this.props.submitForm) },
            _react2.default.createElement(
                _reactstrap.ModalHeader,
                { toggle: () => this.props.toggleModalWindow() },
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
                    { color: 'link', onClick: () => this.props.toggleModalFormAdvancedOptions() },
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
                    { color: 'secondary', type: 'button', onClick: () => {
                            this.props.toggleModalWindow();
                        }, disabled: this.props.submitting },
                    'Cancel'
                )
            )
        );
    }

}

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