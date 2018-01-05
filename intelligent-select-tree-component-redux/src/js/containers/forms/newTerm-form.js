import React, {Component} from 'react'
import {Field, FieldArray, reduxForm} from 'redux-form'
import {Button, Collapse, Form, FormFeedback, FormGroup, Input, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import validate from './newTerm-form-validate'
import {toggleModalFormAdvancedOptions, toggleModalWindow} from "../../actions/other-actions";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";

import VirtualizedSelect from 'react-virtualized-select';
import createFilterOptions from 'react-select-fast-filter-options';

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
            <VirtualizedSelect
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

class NewTermModalForm extends Component {

    componentWillMount() {
        //this.props.dispatch(initialize('newTerm', {termLabel: this.props.defaultInputValue}));
        this.options = this.props.options;
        this.filter = createFilterOptions({
            options: this.options,
            valueKey: this.props.settings.valueKey,
            labelKey: this.props.settings.labelKey
        })
    }


    render() {
        return (
            <Form onSubmit={this.props.handleSubmit(this.props.submitForm)}>

                <ModalHeader toggle={() => this.props.toggleModalWindow()}>
                    Create new term
                </ModalHeader>

                <ModalBody>
                    <Field name="termLabel" label={"Label (required)"} component={RenderInput}/>
                    <Field name="termID" label={"Term ID (required)"} component={RenderInput}/>
                    <Field name="termCategories" label={"Categories"} component={RenderInput}/>
                    <Field name="termDescription" label={"Description"} component={RenderInput}/>


                    <Button color="link" onClick={() => this.props.toggleModalFormAdvancedOptions()}>
                        {(this.props.modalFormAdvancedOptionsVisible ? "Hide advanced options" : "Show advanced options")}
                    </Button>

                    <Collapse isOpen={this.props.modalFormAdvancedOptionsVisible}>

                        <Field name={"parent-term"}
                               options={this.options}
                               filterOptions={this.filter}
                               placeholder={"Select parent ..."}
                               component={RenderSelect}
                               labelKey={this.props.settings.labelKey}
                               valueKey={this.props.settings.valueKey}
                        />

                        <Field name={"child-terms"}
                               options={this.options}
                               filterOptions={this.filter}
                               placeholder={"Select children ..."}
                               multi
                               joinValues
                               component={RenderSelect}
                               labelKey={this.props.settings.labelKey}
                               valueKey={this.props.settings.valueKey}
                        />

                        <FieldArray name="termProperties" component={renderMembers}/>

                    </Collapse>
                </ModalBody>

                <ModalFooter>
                    <Button color="primary" type="submit" disabled={this.props.submitting}>Submit</Button>{' '}
                    <Button color="secondary" type="button" onClick={() => {
                        this.props.toggleModalWindow()
                    }} disabled={this.props.submitting}>Cancel</Button>
                </ModalFooter>

            </Form>
        )
    }

}


function mapStateToProps(state) {
    return {
        defaultInputValue: state.other.currentSearch,
        options: state.options.options,
        settings: state.settings,
        modalFormAdvancedOptionsVisible: state.other.modalFormAdvancedOptionsVisible,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        toggleModalWindow: toggleModalWindow,
        toggleModalFormAdvancedOptions: toggleModalFormAdvancedOptions,
    }, dispatch)
}

export default reduxForm({
    // a unique name for the form
    form: 'newTerm',
    validate,
})(connect(mapStateToProps, mapDispatchToProps)(NewTermModalForm))
