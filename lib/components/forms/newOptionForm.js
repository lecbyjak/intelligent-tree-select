"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _VirtualizedTreeSelect = require("../VirtualizedTreeSelect");

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _informed = require("informed");

var _reactstrap = require("reactstrap");

var _newOptionValidate = require("./newOptionValidate");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

const ErrorText = (0, _informed.asField)((_ref) => {
  let { fieldState } = _ref,
      props = _objectWithoutProperties(_ref, ["fieldState"]);

  let attributes = {};
  if (fieldState.touched) {
    if (fieldState.error) attributes.invalid = true;else attributes.valid = true;
  }
  return _react2.default.createElement(
    _reactstrap.FormGroup,
    null,
    _react2.default.createElement(_reactstrap.Input, _extends({ type: "text", autoComplete: "off", placeholder: props.label }, attributes, {
      onChange: e => props.fieldApi.setValue(e.target.value)
    })),
    fieldState.error ? _react2.default.createElement(
      _reactstrap.FormFeedback,
      { style: { color: 'red' } },
      fieldState.error
    ) : null
  );
});

const ErrorGroupText = (0, _informed.asField)((_ref2) => {
  let { fieldState } = _ref2,
      props = _objectWithoutProperties(_ref2, ["fieldState"]);

  let attributes = {};
  if (fieldState.touched) {
    if (fieldState.error) attributes.invalid = true;else attributes.valid = true;
  }
  return _react2.default.createElement(
    "span",
    null,
    _react2.default.createElement(_reactstrap.Input, _extends({ type: "text", autoComplete: "off", placeholder: props.label }, attributes, {
      onChange: e => props.fieldApi.setValue(e.target.value)
    })),
    fieldState.error ? _react2.default.createElement(
      _reactstrap.FormFeedback,
      { style: { color: 'red' } },
      fieldState.error
    ) : null
  );
});

const TextInput = (0, _informed.asField)((_ref3) => {
  let { fieldState } = _ref3,
      props = _objectWithoutProperties(_ref3, ["fieldState"]);

  return _react2.default.createElement(
    _reactstrap.FormGroup,
    null,
    _react2.default.createElement(_reactstrap.Input, { type: "text", autoComplete: "off", placeholder: props.label,
      onChange: e => props.fieldApi.setValue(e.target.value)
    })
  );
});

const Select = (0, _informed.asField)((_ref4) => {
  let { fieldState } = _ref4,
      props = _objectWithoutProperties(_ref4, ["fieldState"]);

  return _react2.default.createElement(
    _reactstrap.FormGroup,
    null,
    _react2.default.createElement(_VirtualizedTreeSelect.VirtualizedTreeSelect, _extends({
      onChange: value => props.fieldApi.setValue(value),
      value: props.fieldApi.getValue()
    }, props, {
      style: fieldState.error ? { border: 'solid 1px red' } : null
    })),
    fieldState.error ? _react2.default.createElement(
      _reactstrap.FormFeedback,
      { style: { color: 'red', display: 'block' } },
      fieldState.error
    ) : null
  );
});

class NewOptionForm extends _react.Component {

  constructor(props) {
    super(props);

    this._createNewOption = this._createNewOption.bind(this);
    this.filterParentOptions = this.filterParentOptions.bind(this);
    this.filterChildrenOptions = this.filterChildrenOptions.bind(this);

    this.state = {
      siblings: [],
      modalAdvancedSectionVisible: false
    };
  }

  filterParentOptions(options, filter, selectedOptions) {
    let filtered = options.filter(option => {
      let label = option[this.props.labelKey];
      return label.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
    });
    return filtered;
  }

  filterChildrenOptions(options, filter, selectedOptions) {
    let filtered = options.filter(option => {
      let label = option[this.props.labelKey];
      return label.toLowerCase().indexOf(filter.toLowerCase()) !== -1 && !option.parent;
    });
    return filtered;
  }

  _getIDs(children) {
    if (!children) return [];
    let ids = JSON.parse(JSON.stringify(children));
    return ids.map(obj => obj[this.props.valueKey]);
  }

  _createNewOption(data) {

    let properties = {};
    if (data.siblings) {
      properties = data.siblings.reduce(function (result, elem) {
        result[elem.key] = elem.value;
        return result;
      }, {});
    }

    let children = this._getIDs(data.childOptions);
    let parent = '';
    if (data.parentOption) parent = data.parentOption[this.props.valueKey];

    let option = {};
    option[this.props.valueKey] = data.optionURI;
    option[this.props.labelKey] = data.optionLabel;
    option[this.props.childrenKey] = children;
    option['parent'] = parent;
    if (data.optionDescription) option['description'] = data.optionDescription;

    Object.assign(option, properties);

    this.props.toggleModal();
    this.props.onOptionCreate(option);
  }

  removeSibling(index) {
    this.setState(prevState => {
      const siblings = [...prevState.siblings];
      siblings.splice(index, 1);
      return {
        siblings
      };
    });
  }

  addSibling() {
    this.setState(prevState => {
      return {
        siblings: [...prevState.siblings, { key: '', value: '' }]
      };
    });
  }

  render() {
    return _react2.default.createElement(
      _informed.Form,
      { id: "new-option-form", onSubmit: this._createNewOption },
      _react2.default.createElement(
        _reactstrap.ModalHeader,
        { toggle: this.props.toggleModal },
        "Create new term"
      ),
      _react2.default.createElement(
        _reactstrap.ModalBody,
        null,
        _react2.default.createElement(ErrorText, { field: "optionLabel", id: "optionLabel", label: "Label (required)",
          validate: _newOptionValidate.validateLengthMin5,
          validateOnChange: true,
          validateOnBlur: true
        }),
        _react2.default.createElement(ErrorText, { field: "optionURI", "if": "optionURI", label: "Option URI (required)",
          validate: _newOptionValidate.validateLengthMin5,
          validateOnChange: true,
          validateOnBlur: true
        }),
        _react2.default.createElement(TextInput, { field: "optionDescription", id: "optionDescription", label: "Description" }),
        _react2.default.createElement(
          _reactstrap.Button,
          { color: "link",
            onClick: () => this.setState({ modalAdvancedSectionVisible: !this.state.modalAdvancedSectionVisible }) },
          this.state.modalAdvancedSectionVisible ? "Hide advanced options" : "Show advanced options"
        ),
        _react2.default.createElement(
          _reactstrap.Collapse,
          { isOpen: this.state.modalAdvancedSectionVisible },
          _react2.default.createElement(Select, { field: "parentOption",
            options: this.props.options,
            multi: false,
            placeholder: "Select parent ...",
            labelKey: this.props.labelKey,
            valueKey: this.props.valueKey,
            childrenKey: this.props.childrenKey,
            filterOptions: this.filterParentOptions,
            expanded: true,
            renderAsTree: false
          }),
          _react2.default.createElement(Select, { field: "childOptions",
            options: this.props.options,
            placeholder: "Select children ...",
            multi: true,
            labelKey: this.props.labelKey,
            valueKey: this.props.valueKey,
            childrenKey: this.props.childrenKey,
            filterOptions: this.filterChildrenOptions,
            expanded: true,
            renderAsTree: false,
            validate: _newOptionValidate.validateNotSameAsParent,
            validateOnChange: true,
            validateOnBlur: true
          }),
          _react2.default.createElement(
            _reactstrap.FormGroup,
            null,
            _react2.default.createElement(
              _reactstrap.Button,
              { type: "button",
                onClick: () => this.addSibling(),
                color: 'primary', size: "sm" },
              "Add option property"
            ),
            this.state.siblings.map((member, index) => _react2.default.createElement(
              _reactstrap.FormGroup,
              { key: index, className: "d-flex justify-content-between align-items-center m-1" },
              _react2.default.createElement(
                _informed.Scope,
                { scope: `siblings[${index}]` },
                _react2.default.createElement(ErrorGroupText, {
                  key: `label-${index}`,
                  field: "key",
                  label: "Property Key",
                  validate: _newOptionValidate.validateLengthMin3,
                  validateOnChange: true,
                  validateOnBlur: true
                }),
                _react2.default.createElement(ErrorGroupText, {
                  key: `value-${index}`,
                  field: "value",
                  label: "Property value",
                  validate: _newOptionValidate.validateLengthMin3,
                  validateOnChange: true,
                  validateOnBlur: true
                })
              ),
              _react2.default.createElement(
                "span",
                { onClick: () => this.removeSibling(index), style: { pointer: 'cursor' },
                  className: "Select-clear-zone",
                  title: "Remove term property", "aria-label": "Remove term property" },
                _react2.default.createElement(
                  "span",
                  { className: "Select-clear", style: { fontSize: 24 + 'px' } },
                  "\xD7"
                )
              )
            ))
          )
        )
      ),
      _react2.default.createElement(
        _reactstrap.ModalFooter,
        null,
        _react2.default.createElement(
          _reactstrap.Button,
          { color: "primary", type: "submit" },
          "Submit"
        ),
        ' ',
        _react2.default.createElement(
          _reactstrap.Button,
          { color: "secondary", type: "button", onClick: this.props.toggleModal },
          "Cancel"
        )
      )
    );
  }
}

exports.default = NewOptionForm;