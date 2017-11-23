import React, {Component} from 'react';
import {
    Button,
    Col,
    Collapse,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    InputGroupButton,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Tooltip
} from "reactstrap";
import {optionStateEnum} from "../utils/OptionsUtils";

class ModalForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            nestedModal: false,
            closeAll: false,
            tooltipOpen: false,
            collapse: false,
            invalidID: false,
            invalidLabel: false,
            selectedParent: '',
            termProperties: [],
        };
        this.termPropertiesValid = [];
        this.id = 'ModalFormButton_' + Date.now();
    }

    toggleNested() {
        this.setState({
            nestedModal: !this.state.nestedModal,
            closeAll: false
        });
    }

    toggleAll() {
        this.setState({
            nestedModal: !this.state.nestedModal,
            closeAll: true
        });
    }

    _addNewTermProperty = () => {
        this.termPropertiesValid = this.termPropertiesValid.concat([{key: false, value: false}]);
        this.setState({termProperties: this.state.termProperties.concat([{key: '', value: ''}])});
    };

    _removeTermProperty = (idx) => () => {
        this.termPropertiesValid = this.termPropertiesValid.filter((s, sidx) => idx !== sidx);
        this.setState({termProperties: this.state.termProperties.filter((s, sidx) => idx !== sidx)});
    };

    _handlePropertyKeyChange = (idx) => (evt) => {
        const newTermProperties = this.state.termProperties.map((shareholder, sidx) => {
            if (idx !== sidx) return shareholder;
            return {...shareholder, key: evt.target.value};
        });
        this.setState({termProperties: newTermProperties});

        this.termPropertiesValid = this.termPropertiesValid.map((shareholder, sidx) => {
            if (idx !== sidx) return shareholder;
            return {...shareholder, key: (evt.target.value.length > 0)};

        });
    };

    _handlePropertyValueChange = (idx) => (evt) => {
        const newTermProperties = this.state.termProperties.map((shareholder, sidx) => {
            if (idx !== sidx) return shareholder;
            return {...shareholder, value: evt.target.value};
        });
        this.setState({termProperties: newTermProperties});

        this.termPropertiesValid = this.termPropertiesValid.map((shareholder, sidx) => {
            if (idx !== sidx) return shareholder;
            return {...shareholder, value: (evt.target.value.length > 0)};
        });
    };

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
        let resultOptions = [];
        resultOptions.push(<option key={"default"} defaultValue value={''}>Select Parent</option>);
        resultOptions.push(this.props.optionsUtils.getAllProcessedOptions().map(option => {
            return (
                <option key={option['id']} title={option['id']}>{option['label']}</option>
            )
        }));
        return (
            <Input type="select" name="termParent" innerRef={(el) => this.termParent = el}
                   onChange={() => {
                       let selectedValue = this.termParent.options[this.termParent.selectedIndex].title;
                       this.setState({selectedParent: selectedValue})
                   }
                   }>
                {resultOptions}
            </Input>
        )
    }

    _getChildren() {
        let resultOptions = [];
        resultOptions.push(<option key={"default"} defaultValue>{''}</option>);
        resultOptions.push(this.props.optionsUtils.getAllProcessedOptions().map(option => {
            if (this.state.selectedParent === option['id']) return null;
            return (
                <option key={option['id']} title={option['id']}>{option['label']}</option>
            )
        }));
        return (
            <Input type="select" name="termChildren" innerRef={(el) => this.termChild = el} multiple>
                {resultOptions}
            </Input>
        )
    }

    _getSelectedChildren() {
        let selected1 = [];
        for (let i = 0; i < this.termChild.length; i++) {
            if (this.termChild.options[i].selected && this.termChild.options[i].value.length > 0) {
                selected1.push(this.termChild.options[i].title);
            }
        }
        return selected1
    }

    _validate() {
        const invalidLabel = this.termLabel.value.length <= 3;
        const invalidID = this.termID.value.length <= 2;
        this.setState({invalidLabel: false, invalidID: false});
        if (invalidLabel) {
            this.setState({invalidLabel: true});
        }
        if (invalidID) {
            this.setState({invalidID: true});
        }

        this.validation = true;

        if (this._validatePropertiesInputs() && !invalidLabel && !invalidID) {
            this._createNewTerm();
            this.setState({modal: false});
            this._removeTermProperties()

        }
    }

    _removeTermProperties() {
        this.setState({termProperties: []});
        this.termPropertiesValid = []
    }

    _validateClose() {
        if (this.termID.value.length !== 0 || this.termLabel.value.length !== 0) this.toggleNested();
        else {
            this.setState({modal: false});
            this._removeTermProperties()
        }
    }

    _createNewTerm() {
        let newTerm2 = this.state.termProperties.reduce(function (result, elem) {
            result[elem.key] = elem.value;
            return result;
        }, {});

        let newTerm = {
            "@id": this.termID.value,
            [this.props.optionsUtils.settings.filterBy]: [{
                "@language": "en",
                "@value": this.termLabel.value
            }],
            "@type": this.termCategories.value.split(","),
            "@parent": this.state.selectedParent,
            "@children": this._getSelectedChildren(),
            "state": optionStateEnum.NEW,
        };
        newTerm = Object.assign(newTerm, newTerm2);
        //console.log(newTerm);

        this.props.optionsUtils.addNewOptions([newTerm], "local data");
        if (this.props.optionsUtils.settings.forceAdding){
            this.props.history.invalidateHistory()
        }
        console.log('term created')
    }

    _validatePropertiesInputs() {
        let status = true;
        for (let i = 0; i < this.properties.childNodes.length; i++) {
            let keyText = this.properties.childNodes[i].childNodes[0].value;
            let valueText = this.properties.childNodes[i].childNodes[2].value;

            if (valueText.length === 0 || keyText.length === 0) {
                status = false
            }
        }
        return status
    }

    render() {
        return (
            <InputGroupButton>
                <Button color={this.props.buttonColor} className={"d-flex justify-content-center  align-items-center"}
                        onClick={() => this.setState({
                            modal: true,
                            tooltipOpen: false,
                            invalidID: false,
                            invalidLabel: false,
                            invalidProperties: false,
                        })}
                        id={this.id}>{ModalForm._getButtonLabel()}</Button>
                <Tooltip innerClassName={"bg-light text-dark border border-dark"} delay={{show: 300, hide: 100}}
                         placement="right" isOpen={this.state.tooltipOpen}
                         target={this.id} toggle={() => {
                    this.setState({tooltipOpen: !this.state.tooltipOpen})
                }}>
                    {this.props.tooltipLabel}
                </Tooltip>

                <Modal backdrop={"static"} isOpen={this.state.modal} toggle={() => {
                    this.setState({modal: false});
                    this._removeTermProperties()
                }}>
                    <ModalHeader toggle={() => {
                        this.setState({modal: false});
                        this._removeTermProperties()
                    }}>New term</ModalHeader>
                    <ModalBody>
                        <Form>
                            <FormGroup>
                                <Label for="termLabel">Term label</Label>
                                <Input type="text" name="termLabel" innerRef={(el) => this.termLabel = el}
                                       placeholder="Term label" autoComplete={"off"} defaultValue={""}
                                       valid={(this.state.invalidLabel || this.value)? !this.state.invalidLabel: undefined}/>
                                <FormFeedback>Label have to be entered with minimum length of 4 characters</FormFeedback>
                            </FormGroup>
                            <FormGroup>
                                <Label for="termID">Term ID</Label>
                                <Input type="text" name="termID" innerRef={(el) => this.termID = el}
                                       placeholder="Term ID" autoComplete={"off"} defaultValue={""}
                                       valid={(this.state.invalidID || this.value)? !this.state.invalidID : undefined}/>
                                <FormFeedback>ID have to be entered with minimum length of 3 characters</FormFeedback>
                            </FormGroup>

                            <FormGroup>
                                <Label for="termID">Term Categories</Label>
                                <Input type="text" name="termCategories" innerRef={(el) => this.termCategories = el}
                                       placeholder="Term Categories" autoComplete={"off"}/>
                            </FormGroup>

                            <Button color="link" onClick={() => this.setState({collapse: !this.state.collapse})}>
                                {(this.state.collapse ? "Hide advanced options" : "Show advanced options")}
                            </Button>
                            <Collapse isOpen={this.state.collapse}>
                                <FormGroup>
                                    <Label for="termParent">Term parent</Label>
                                    {this._getParents()}
                                </FormGroup>

                                <FormGroup>
                                    <Label for="termChildren">Term children</Label>
                                    {this._getChildren()}
                                </FormGroup>


                                <div ref={el => this.properties = el}>
                                    {this.state.termProperties.map((termProperty, idx) => (
                                        <FormGroup key={idx}
                                                   className={"d-flex justify-content-between align-items-center m-1"}>
                                            <Input
                                                type="text"
                                                placeholder={`Term property key ${idx + 1}`}
                                                value={termProperty.key}
                                                onChange={this._handlePropertyKeyChange(idx)}
                                                valid={this.termPropertiesValid[idx].key}
                                            />

                                            <Col/>
                                            <Input
                                                type="text"
                                                placeholder={`Term property value`}
                                                value={termProperty.value}
                                                onChange={this._handlePropertyValueChange(idx)}
                                                valid={this.termPropertiesValid[idx].value}
                                            />
                                            <Col/>
                                            <Button type="button" onClick={this._removeTermProperty(idx)}
                                                    color="link" size={"sm"} className={"d-flex m-auto"}>
                                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
                                                     xmlnsXlink="http://www.w3.org/1999/xlink"
                                                     x="0px" y="0px" viewBox="0 0 16 16" xmlSpace="preserve" width="20"
                                                     height="20">
                                                    <g className="nc-icon-wrapper trashIcon" fill="#cc0000">
                                                        <rect className={"trashIcon"} data-color="color-2" x="5" y="7"
                                                              fill="#dc3545" width="2"
                                                              height="6"/>
                                                        <rect className={"trashIcon"} data-color="color-2" x="9" y="7"
                                                              fill="#dc3545" width="2"
                                                              height="6"/>
                                                        <path className={"trashIcon"} fill="#dc3545"
                                                              d="M12,1c0-0.6-0.4-1-1-1H5C4.4,0,4,0.4,4,1v2H0v2h1v10c0,0.6,0.4,1,1,1h12c0.6,0,1-0.4,1-1V5h1V3h-4V1z M6,2h4 v1H6V2z M13,5v9H3V5H13z"/>
                                                    </g>
                                                </svg>
                                            </Button>
                                        </FormGroup>

                                    ))}
                                </div>
                                <Button type="button" color={'primary'} onClick={() => this._addNewTermProperty()}
                                        size="sm">Add new term property</Button>
                            </Collapse>
                        </Form>

                        <Modal isOpen={this.state.nestedModal} toggle={() => this.toggleNested()} onClosed={() => {
                            if (this.state.closeAll) {
                                this.setState({modal: false});
                                this._removeTermProperties()
                            }
                        }}>
                            <ModalHeader>Confirm</ModalHeader>
                            <ModalBody>Do you really want to close?</ModalBody>
                            <ModalFooter>
                                <Button color="primary" onClick={() => this.toggleNested()}>NO</Button>{' '}
                                <Button color="secondary" onClick={() => this.toggleAll()}>YES</Button>
                            </ModalFooter>
                        </Modal>

                    </ModalBody>
                    <ModalFooter>

                        <Button color="primary" onClick={() => this._validate()}>Create new term</Button>{' '}
                        <Button color="secondary" onClick={() => this._validateClose()}>Cancel</Button>
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