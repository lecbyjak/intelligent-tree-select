import React, {Component} from 'react';
import {
  Button,
  Collapse, Form,
  FormFeedback,
  FormGroup,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Tooltip
} from "reactstrap";
import {VirtualizedTreeSelect} from "./VirtualizedTreeSelect";
import {Field, FieldArray, reduxForm} from "redux-form";
import validate from "./forms/newTerm-form-validate";
import createFilterOptions from "react-select-fast-filter-options";

const createRendered = render => (field) => {
    return (
        <FormGroup>
            {render(field)}
            <FormFeedback>{field.meta.error}</FormFeedback>
        </FormGroup>
    )
};

const createGroupRendered = render => (field) => {
    return (
        <span>
            {render(field)}
            <FormFeedback>{field.meta.error}</FormFeedback>
        </span>
    )
};
const RenderInput = createRendered((field) => {
        let attributes = {};
        if (field.meta.touched) attributes.valid = field.meta.valid;
        return <Input type={"text"} {...field.input} autoComplete={"off"} placeholder={field.label} {...attributes} />
    }
);

const RenderGroupInput = createGroupRendered((field) => {
        let attributes = {};
        if (field.meta.touched) attributes.valid = field.meta.valid;
        return <Input type={"text"} {...field.input} autoComplete={"off"} placeholder={field.label} {...attributes} />
    }
);

const errClass = {
    border: 1 + "px solid #dc3545",
    'borderRadius': 4 + 'px',
};

const RenderSelect = createRendered((field) => {
        let attributes = {};
        if (field.multi) attributes.multi = true;
        if (field.joinValues) attributes.joinValues = true;
        if (field.meta.touched) attributes.valid = field.meta.valid;
        return (
            <VirtualizedTreeSelect
                className={(!field.meta.valid) ? "is-invalid" : ""}
                style={(!field.meta.valid) ? errClass : {}}
                options={field.options}
                filterOptions={field.filterOptions}
                placeholder={field.placeholder}
                labelKey={field.labelKey}
                valueKey={field.valueKey}
                {...attributes}
                {...field.input}
                onBlur={() => field.input.onBlur(field.input.value)}
            />)
    }
);

const renderMembers = ({fields, meta: {touched, error}}) => (
    <FormGroup>
        <Button type="button" onClick={() => fields.push({})} color={'primary'} size="sm">
            Add term property
        </Button>
        {touched && error && <span>{error}</span>}

        {fields.map((member, index) =>
            <FormGroup key={index} className={"d-flex justify-content-between align-items-center m-1"}>
                <Field
                    name={`${member}.key`}
                    component={RenderGroupInput}
                    label="Property Key"/>
                <Field
                    name={`${member}.value`}
                    component={RenderGroupInput}
                    label="Property value"/>

                <span onClick={() => fields.remove(index)} style={{pointer: 'cursor'}} className="Select-clear-zone"
                      title="Remove term property" aria-label="Remove term property">
                    <span className="Select-clear" style={{fontSize: 24 + 'px'}}>×</span>
                </span>
            </FormGroup>
        )}

    </FormGroup>
);

class ModalForm extends Component {

    constructor(props) {
        super(props);
        this.id = 'Modal_form_open_button';

        this._toggleModal = this._toggleModal.bind(this);
        this._createNewOption = this._createNewOption.bind(this);

        this.state = {
            tooltipVisible: false,
            modalVisible: false,
            modalAdvancedSectionVisible: false,
        }
    }

    componentWillMount() {
        this.options = this.props.data.options;
        this.filter = createFilterOptions({
            options: this.options,
            valueKey: this.props.data.valueKey,
            labelKey: this.props.data.labelKey
        })
    }

    _getIDs(children) {
        if (!children) return [];
        let ids = JSON.parse(JSON.stringify(children));
        return ids.map(obj => obj[this.props.data.valueKey])
    }

    _toggleModal() {
        this.setState({modalVisible: !this.state.modalVisible})
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
        this.props.toggleModalWindow()
    }


    render() {
        return (
            <div>
                <Button color={"link"} className={"d-flex justify-content-center  align-items-center"}
                        onClick={this._toggleModal}
                        id={this.id}>Create new option</Button>

                <Tooltip innerClassName={"bg-light text-dark border border-dark"} delay={{show: 300, hide: 100}}
                         placement="right" isOpen={this.state.tooltipVisible}
                         target={this.id} toggle={() => this.setState({tooltipVisible: !this.state.tooltipVisible})}>
                    Didn´t find your term? Add new one.
                </Tooltip>

                {this.state.modalVisible &&
                <Modal backdrop={"static"} isOpen={this.state.modalVisible} toggle={this._toggleModal}>

                    <Form onSubmit={this._createNewOption}>

                        <ModalHeader toggle={this._toggleModal}>
                            Create new term
                        </ModalHeader>

                        <ModalBody>
                            <Field name="termLabel" label={"Label (required)"} component={RenderInput}/>
                            <Field name="termID" label={"Term ID (required)"} component={RenderInput}/>
                            <Field name="termDescription" label={"Description"} component={RenderInput}/>


                            <Button color="link"
                                    onClick={() => this.setState({modalAdvancedSectionVisible: !this.state.modalAdvancedSectionVisible})}>
                                {(this.state.modalAdvancedSectionVisible ? "Hide advanced options" : "Show advanced options")}
                            </Button>

                            <Collapse isOpen={this.state.modalAdvancedSectionVisible}>

                                <Field name={"parent-term"}
                                       options={this.options}
                                       filterOptions={this.filter}
                                       placeholder={"Select parent ..."}
                                       component={RenderSelect}
                                       labelKey={this.props.data.labelKey}
                                       valueKey={this.props.data.valueKey}
                                />

                                <Field name={"child-terms"}
                                       options={this.options}
                                       filterOptions={this.filter}
                                       placeholder={"Select children ..."}
                                       multi
                                       joinValues
                                       component={RenderSelect}
                                       labelKey={this.props.data.labelKey}
                                       valueKey={this.props.data.valueKey}
                                />

                                <FieldArray name="termProperties" component={renderMembers}/>

                            </Collapse>
                        </ModalBody>

                        <ModalFooter>
                            <Button color="primary" type="submit" disabled={this.props.submitting}>Submit</Button>{' '}
                            <Button color="secondary" type="button" onClick={this._toggleModal}
                                    disabled={this.props.submitting}>Cancel</Button>
                        </ModalFooter>

                    </Form>

                </Modal>
                }

            </div>
        )
    }
}


export default reduxForm({
    // a unique name for the form
    form: 'newTerm',
    validate,
})(ModalForm);
