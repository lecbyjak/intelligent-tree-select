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
        let resultOptons = this.props.optionsUtils.getAllOptions().map(option => {
            return (
                <option key={option['@id']}>{option['@id']}</option>
            )
        });
        return (
            <Input type="select" name="termParent" id="termParent"  value={this.state.selectedParent} onChange={e => this.setState({selectedParent: e.target.value})}>
                {resultOptons}
            </Input>
        )
    }

    _getChildren() {
        let resultOptons = this.props.optionsUtils.getAllOptions().map(option => {
            if (this.state.selectedParent === option['@id']) return null;
            return (
                <option key={option['@id']}>{option['@id']}</option>
            )
        });
        return (
            <Input type="select" name="termChildren" id="termChildren" multiple onChange={e => console.log('changed', e)}>
                 {resultOptons}
            </Input>
        )
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
                                Show advanced options
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