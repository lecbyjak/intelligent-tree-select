"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactstrap = require("reactstrap");

var _VirtualizedTreeSelect = require("./VirtualizedTreeSelect");

var _reduxForm = require("redux-form");

var _newTermFormValidate = require("./forms/newTerm-form-validate");

var _newTermFormValidate2 = _interopRequireDefault(_newTermFormValidate);

var _reactSelectFastFilterOptions = require("react-select-fast-filter-options");

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
        "span",
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
    return _react2.default.createElement(_VirtualizedTreeSelect.VirtualizedTreeSelect, _extends({
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
        { type: "button", onClick: () => fields.push({}), color: 'primary', size: "sm" },
        "Add term property"
    ),
    touched && error && _react2.default.createElement(
        "span",
        null,
        error
    ),
    fields.map((member, index) => _react2.default.createElement(
        _reactstrap.FormGroup,
        { key: index, className: "d-flex justify-content-between align-items-center m-1" },
        _react2.default.createElement(_reduxForm.Field, {
            name: `${member}.key`,
            component: RenderGroupInput,
            label: "Property Key" }),
        _react2.default.createElement(_reduxForm.Field, {
            name: `${member}.value`,
            component: RenderGroupInput,
            label: "Property value" }),
        _react2.default.createElement(
            "span",
            { onClick: () => fields.remove(index), style: { pointer: 'cursor' }, className: "Select-clear-zone",
                title: "Remove term property", "aria-label": "Remove term property" },
            _react2.default.createElement(
                "span",
                { className: "Select-clear", style: { fontSize: 24 + 'px' } },
                "\xD7"
            )
        )
    ))
);

class ModalForm extends _react.Component {

    constructor(props) {
        super(props);
        this.id = 'Modal_form_open_button';

        this._toggleModal = this._toggleModal.bind(this);
        this._createNewOption = this._createNewOption.bind(this);

        this.state = {
            tooltipVisible: false,
            modalVisible: false,
            modalAdvancedSectionVisible: false
        };
    }

    componentWillMount() {
        this.options = this.props.data.options;
        this.filter = (0, _reactSelectFastFilterOptions2.default)({
            options: this.options,
            valueKey: this.props.data.valueKey,
            labelKey: this.props.data.labelKey
        });
    }

    _getIDs(children) {
        if (!children) return [];
        let ids = JSON.parse(JSON.stringify(children));
        return ids.map(obj => obj[this.props.data.valueKey]);
    }

    _toggleModal() {
        this.setState({ modalVisible: !this.state.modalVisible });
    }

    _createNewOption() {

        const values = this.props.form.newTerm.values;

        let properties = {};
        if (values.termProperties) {
            properties = values.termProperties.reduce(function (result, elem) {
                result[elem.key] = elem.value;
                return result;
            }, {});
        }

        let children = this._getIDs(values['child-terms']);
        let parent = '';
        if (values['parent-term']) parent = values['parent-term'][this.props.data.valueKey];

        let option = {};
        option[this.props.data.valueKey] = values['termID'];
        option[this.props.data.labelKey] = values['termLabel'];
        option[this.props.data.childrenKey] = children;
        option['parent'] = parent;
        option['description'] = values['termDescription'];

        Object.assign(option, properties);

        this.props.onOptionCreate(option);
        this.props.toggleModalWindow();
    }

    render() {
        return _react2.default.createElement(
            "div",
            null,
            _react2.default.createElement(
                _reactstrap.Button,
                { color: "link", className: "d-flex justify-content-center  align-items-center",
                    onClick: this._toggleModal,
                    id: this.id },
                "Create new option"
            ),
            _react2.default.createElement(
                _reactstrap.Tooltip,
                { innerClassName: "bg-light text-dark border border-dark", delay: { show: 300, hide: 100 },
                    placement: "right", isOpen: this.state.tooltipVisible,
                    target: this.id, toggle: () => this.setState({ tooltipVisible: !this.state.tooltipVisible }) },
                "Didn\xB4t find your term? Add new one."
            ),
            this.state.modalVisible && _react2.default.createElement(
                _reactstrap.Modal,
                { backdrop: "static", isOpen: this.state.modalVisible, toggle: this._toggleModal },
                _react2.default.createElement(
                    _reactstrap.Form,
                    { onSubmit: this._createNewOption },
                    _react2.default.createElement(
                        _reactstrap.ModalHeader,
                        { toggle: this._toggleModal },
                        "Create new term"
                    ),
                    _react2.default.createElement(
                        _reactstrap.ModalBody,
                        null,
                        _react2.default.createElement(_reduxForm.Field, { name: "termLabel", label: "Label (required)", component: RenderInput }),
                        _react2.default.createElement(_reduxForm.Field, { name: "termID", label: "Term ID (required)", component: RenderInput }),
                        _react2.default.createElement(_reduxForm.Field, { name: "termDescription", label: "Description", component: RenderInput }),
                        _react2.default.createElement(
                            _reactstrap.Button,
                            { color: "link",
                                onClick: () => this.setState({ modalAdvancedSectionVisible: !this.state.modalAdvancedSectionVisible }) },
                            this.state.modalAdvancedSectionVisible ? "Hide advanced options" : "Show advanced options"
                        ),
                        _react2.default.createElement(
                            _reactstrap.Collapse,
                            { isOpen: this.state.modalAdvancedSectionVisible },
                            _react2.default.createElement(_reduxForm.Field, { name: "parent-term",
                                options: this.options,
                                filterOptions: this.filter,
                                placeholder: "Select parent ...",
                                component: RenderSelect,
                                labelKey: this.props.data.labelKey,
                                valueKey: this.props.data.valueKey
                            }),
                            _react2.default.createElement(_reduxForm.Field, { name: "child-terms",
                                options: this.options,
                                filterOptions: this.filter,
                                placeholder: "Select children ...",
                                multi: true,
                                joinValues: true,
                                component: RenderSelect,
                                labelKey: this.props.data.labelKey,
                                valueKey: this.props.data.valueKey
                            }),
                            _react2.default.createElement(_reduxForm.FieldArray, { name: "termProperties", component: renderMembers })
                        )
                    ),
                    _react2.default.createElement(
                        _reactstrap.ModalFooter,
                        null,
                        _react2.default.createElement(
                            _reactstrap.Button,
                            { color: "primary", type: "submit", disabled: this.props.submitting },
                            "Submit"
                        ),
                        ' ',
                        _react2.default.createElement(
                            _reactstrap.Button,
                            { color: "secondary", type: "button", onClick: this._toggleModal,
                                disabled: this.props.submitting },
                            "Cancel"
                        )
                    )
                )
            )
        );
    }
}

exports.default = (0, _reduxForm.reduxForm)({
    // a unique name for the form
    form: 'newTerm',
    validate: _newTermFormValidate2.default
})(ModalForm);