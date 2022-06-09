import {VirtualizedTreeSelect} from "../VirtualizedTreeSelect";
import React, {Component} from "react";

import {Form, BasicText, asField, Scope} from 'informed';
import {Button, Collapse, FormFeedback, FormGroup, Input, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {validateLengthMin3, validateLengthMin5, validateNotSameAsParent} from "./newOptionValidate";
import classNames from "classnames";
import ResultItem from "../resultItem";

const ErrorText = asField(({fieldState, ...props}) => {
    let attributes = {};
    if (fieldState.touched) {
      if (fieldState.error) attributes.invalid = true;
      else attributes.valid = true;
    }
    return (
      <FormGroup>
        <Input type={"text"} autoComplete={"off"} placeholder={props.label} {...attributes}
               onChange={(e) => props.fieldApi.setValue(e.target.value)}
        />
        {fieldState.error ? (<FormFeedback style={{color: 'red'}}>{fieldState.error}</FormFeedback>) : null}
      </FormGroup>
    )
  }
);

const ErrorGroupText = asField(({fieldState, ...props}) => {
    let attributes = {};
    if (fieldState.touched) {
      if (fieldState.error) attributes.invalid = true;
      else attributes.valid = true;
    }
    return (
      <span>
        <Input type={"text"} autoComplete={"off"} placeholder={props.label} {...attributes}
               onChange={(e) => props.fieldApi.setValue(e.target.value)}
        />
        {fieldState.error ? (<FormFeedback style={{color: 'red'}}>{fieldState.error}</FormFeedback>) : null}
      </span>
    )
  }
);

const TextInput = asField(({fieldState, ...props}) => {
    return (
      <FormGroup>
        <Input type={"text"} autoComplete={"off"} placeholder={props.label}
               onChange={(e) => props.fieldApi.setValue(e.target.value)}
        />
      </FormGroup>
    )
  }
);


const Select = asField(({fieldState, ...props}) => {
    return (<FormGroup>
      <VirtualizedTreeSelect
        // onChange={(value) => props.fieldApi.setValue(value)}
        // value={props.fieldApi.getValue()}
        {...props}
        style={fieldState.error ? {border: 'solid 1px red'} : null}
      />
      {fieldState.error ? (
        <FormFeedback style={{color: 'red', display: 'block'}}>{fieldState.error}</FormFeedback>) : null}
    </FormGroup>)
  }
);


class NewOptionForm extends Component {

  constructor(props) {
    super(props);

    this._createNewOption = this._createNewOption.bind(this);
    this.filterParentOptions = this.filterParentOptions.bind(this);
    this.filterChildrenOptions = this.filterChildrenOptions.bind(this);
    this._addSelectedOptionParent = this._addSelectedOptionParent.bind(this);
    this._addSelectedOptionChildren = this._addSelectedOptionChildren.bind(this);
    this._optionRenderer = this._optionRenderer.bind(this);
    this.state = {
      siblings: [],
      modalAdvancedSectionVisible: false,
      optionsParent: '',
      optionsChildren: '',
    }
  }

  filterParentOptions(options, filter, selectedOptions) {
    let filtered = options.filter(option => {
      let label = option[this.props.labelKey];
      return label.toLowerCase().indexOf(filter.toLowerCase()) !== -1
    });
    return filtered
  }

  filterChildrenOptions(options, filter, selectedOptions) {
    let filtered = options.filter(option => {
      let label = option[this.props.labelKey];
      return (label.toLowerCase().indexOf(filter.toLowerCase()) !== -1) && !option.parent
    });
    return filtered
  }

  _addSelectedOptionParent(optionsParent) {
    this.setState({optionsParent});
  }

  _addSelectedOptionChildren(optionsChildren) {
    this.setState({optionsChildren});
  }

  _optionRenderer({
                    focusedOption,
                    focusOption,
                    key,
                    option,
                    selectValue,
                    optionStyle,
                    valueArray,
                    toggleOption,
                    searchString
                  }) {

    const className = classNames("VirtualizedSelectOption", {
      "VirtualizedSelectFocusedOption": option === focusedOption,
      "VirtualizedSelectDisabledOption": option.disabled,
      "VirtualizedSelectSelectedOption": valueArray && valueArray.indexOf(option) >= 0
    }, option.className);

    const events = option.disabled ? {} : {
      onClick: () => selectValue(option),
      onMouseEnter: () => focusOption(option),
      onToggleClick: () => toggleOption(option),
    };

    return (
      <ResultItem
        className={className}
        key={key}
        style={optionStyle}
        option={option}
        childrenKey={this.props.childrenKey}
        valueKey={this.props.valueKey}
        labelKey={this.props.labelKey}
        getOptionLabel={this.props.getOptionLabel}
        tooltipKey={this.props.tooltipKey}
        settings={{
          searchString,
          renderAsTree: this.props.renderAsTree,
          displayInfoOnHover: this.props.displayInfoOnHover,
        }}
        {...events}
      />
    );
  }

  _getIDs(children) {
    if (!children) return [];
    let ids = JSON.parse(JSON.stringify(children));
    return ids.map(obj => obj[this.props.valueKey])
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
        siblings: [...prevState.siblings, {key: '', value: ''}]
      };
    });
  }

  render() {
    return (
      <Form id="new-option-form" onSubmit={this._createNewOption}>
        <ModalHeader toggle={this.props.toggleModal}>
          Create new term
        </ModalHeader>

        <ModalBody>
          <ErrorText field="optionLabel" id="optionLabel" label="Label (required)"
                     validate={validateLengthMin5}
                     validateOnChange
                     validateOnBlur
          />
          <ErrorText field="optionURI" if="optionURI" label="Option URI (required)"
                     validate={validateLengthMin5}
                     validateOnChange
                     validateOnBlur
          />
          <TextInput field="optionDescription" id="optionDescription" label="Description"/>


          <Button color="link"
                  onClick={() => this.setState({modalAdvancedSectionVisible: !this.state.modalAdvancedSectionVisible})}>
            {(this.state.modalAdvancedSectionVisible ? "Hide advanced options" : "Show advanced options")}
          </Button>


          <Collapse isOpen={this.state.modalAdvancedSectionVisible}>

            <Select field={"parentOption"}
                    options={this.props.options}
                    multi={false}
                    placeholder={"Select parent ..."}
                    labelKey={this.props.labelKey}
                    valueKey={this.props.valueKey}
                    childrenKey={this.props.childrenKey}
                    filterOptions={this.filterParentOptions}
                    expanded={true}
                    renderAsTree={false}
                    onChange={this._addSelectedOptionParent}
                    value={this.state.optionsParent}
                    optionRenderer={this._optionRenderer}
            />

            <Select field={"childOptions"}
                    options={this.props.options}
                    placeholder={"Select children ..."}
                    multi={true}
                    labelKey={this.props.labelKey}
                    valueKey={this.props.valueKey}
                    childrenKey={this.props.childrenKey}
                    filterOptions={this.filterChildrenOptions}
                    expanded={true}
                    renderAsTree={false}
                    validate={validateNotSameAsParent}
                    validateOnChange
                    validateOnBlur
                    onChange={this._addSelectedOptionChildren}
                    value={this.state.optionsChildren}
                    optionRenderer={this._optionRenderer}
            />

            <FormGroup>
              <Button type="button"
                      onClick={() => this.addSibling()}
                      color={'primary'} size="sm">
                Add option property
              </Button>
              {this.state.siblings.map((member, index) => (
                <FormGroup key={index} className={"d-flex justify-content-between align-items-center m-1"}>
                  <Scope scope={`siblings[${index}]`}>

                    <ErrorGroupText
                      key={`label-${index}`}
                      field="key"
                      label="Property Key"
                      validate={validateLengthMin3}
                      validateOnChange
                      validateOnBlur
                    />
                    <ErrorGroupText
                      key={`value-${index}`}
                      field="value"
                      label="Property value"
                      validate={validateLengthMin3}
                      validateOnChange
                      validateOnBlur
                    />
                  </Scope>

                  <span onClick={() => this.removeSibling(index)} style={{pointer: 'cursor'}}
                        className="Select-clear-zone"
                        title="Remove term property" aria-label="Remove term property">
                    <span className="Select-clear" style={{fontSize: 24 + 'px'}}>×</span>
                  </span>
                </FormGroup>
              ))}

            </FormGroup>

          </Collapse>
        </ModalBody>

        <ModalFooter>
          <Button color="primary" type="submit">Submit</Button>
          <Button color="secondary" type="button" onClick={this.props.toggleModal}>Cancel</Button>
        </ModalFooter>

      </Form>
    )
  }
}


export default NewOptionForm;
