import React, {Component} from 'react';
import {
    Button, Collapse, Form, FormGroup, Input, InputGroupButton, Label, Modal, ModalBody, ModalFooter, ModalHeader,
    Tooltip
} from "reactstrap";

class ModalForm extends Component {

    constructor(props) {
        let time = Date.now();
        super(props);
        this.state = {
            modal: false,
            tooltipOpen: false,
            collapse: false,
            selectedParent: '',
            id: 'ModalFormButton_' + time,
        };
    }

    static _getButtonLabel() {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                <g className="nc-icon-wrapper" fill="#ffffff">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </g>
            </svg>
        )
    }

    _getParents() {
        let resultOptons = [];
        resultOptons.push(<option key={"default"}></option>);
        resultOptons.push(this.props.optionsUtils.getAllProcessedOptions().map(option => {
            return (
                <option key={option['id']} title={option['id']}>{option['label']}</option>
            )
        }))
        return (
            <Input type="select" name="termParent" id="termParent"
                   onChange={() => {
                       let selectBox = document.getElementById("termParent");
                       let selectedValue = selectBox.options[selectBox.selectedIndex].title;
                       this.setState({selectedParent: selectedValue})
                   }
                   }>
                {resultOptons}
            </Input>
        )
    }

    _getChildren() {
        let resultOptons = [];
        resultOptons.push(<option key={"default"}></option>);
        resultOptons.push(this.props.optionsUtils.getAllProcessedOptions().map(option => {
            if (this.state.selectedParent === option['id']) return null;
            return (
                <option key={option['id']} title={option['id']}>{option['label']}</option>
            )
        }));
        return (
            <Input type="select" name="termChildren" id="termChildren" multiple>
                {resultOptons}
            </Input>
        )
    }

    _getSelectedChildren() {
        let select1 = document.getElementById("termChildren");
        let selected1 = [];
        for (let i = 0; i < select1.length; i++) {
            if (select1.options[i].selected) selected1.push(select1.options[i].value);
        }
        return selected1
    }

    _createNewTerm() {

    }

    render() {
        return (
            <InputGroupButton>
                <Button color={this.props.buttonColor} className={"d-flex justify-content-center  align-items-center"}
                        onClick={() => {
                            this.setState({modal: true});
                            this.setState({tooltipOpen: false})
                        }} id={this.state.id}>{ModalForm._getButtonLabel()}</Button>
                <Tooltip innerClassName={"bg-light text-dark border border-dark"} delay={{show: 300, hide: 100}}
                         placement="right" isOpen={this.state.tooltipOpen}
                         target={this.state.id} toggle={() => {
                    this.setState({tooltipOpen: !this.state.tooltipOpen});
                }}>
                    {this.props.tooltipLabel}
                </Tooltip>
                <Modal backdrop={"static"} isOpen={this.state.modal} toggle={() => {
                    this.setState({modal: false});
                }}>
                    <ModalHeader toggle={() => {
                        this.setState({modal: false})
                    }}>Modal title</ModalHeader>
                    <ModalBody>
                        <Form>
                            <FormGroup>
                                <Label for="termLabel">Term label</Label>
                                <Input type="text" name="termLabel" id="termLabel" placeholder="Term label"/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="termID">Term ID</Label>
                                <Input type="text" name="termID" id="termID" placeholder="Term ID"/>
                            </FormGroup>

                            <Button color="link" onClick={() => this.setState({collapse: !this.state.collapse})}>
                                {(this.state.collapse ? "Hide advanced options" : "Show advanced options")}
                            </Button>
                            <Collapse isOpen={this.state.collapse}>
                                <FormGroup>
                                    <Label for="termDesc">Term description</Label>
                                    <Input type="textarea" name="termDesc" id="termDesc"
                                           placeholder="Term description"/>
                                </FormGroup>

                                <FormGroup>
                                    <Label for="termParent">Term parent</Label>
                                    {this._getParents()}
                                </FormGroup>
                                <FormGroup>
                                    <Label for="termChildren">Term children</Label>
                                    {this._getChildren()}
                                </FormGroup>
                            </Collapse>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => {
                            this._createNewTerm();
                            this.setState({modal: false})
                        }}>Do Something</Button>{' '}
                        <Button color="secondary" onClick={() => {
                            this.setState({modal: false})
                        }}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </InputGroupButton>
        )
    }
}

ModalForm.defaultProps = {
    buttonColor: 'primary',
    tooltipLabel: 'Didn´t find your term? Add new one.'
};

export default ModalForm;