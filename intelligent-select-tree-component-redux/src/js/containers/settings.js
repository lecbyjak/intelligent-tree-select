import React, {Component} from 'react';
import {Button, Card, CardBody, Collapse, Form, FormGroup, Input, Label} from "reactstrap";
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux'
import * as settingsAction from "../actions/settings-actions";
import ModalWindow from '../containers/modalWindow'
import {setExpandedForAll} from "../actions/options-actions";


class Settings extends Component {

    render() {
        return (
            <div className="d-flex flex-column">

                <div className="d-flex justify-content-between">
                    <ModalWindow onOptionCreate={this.props.onOptionCreate} />
                    <Button color="link" onClick={() => this.props.toggleSettings()}>
                        {(this.props.settings.settingsOpened? "Hide filter":"Show filter")}
                    </Button>
                </div>

                <Collapse className="w-100" isOpen={this.props.settings.settingsOpened}>
                    <Card>
                        <CardBody>
                            <Form >
                                <FormGroup check>
                                    <Label check>
                                        <Input type="checkbox" name="multiselect" onClick={() => this.props.toggleMultiselect()} defaultChecked={this.props.settings.multi} />{' '}
                                        Multiselect
                                    </Label>
                                </FormGroup>

                                <FormGroup check>
                                    <Label check>
                                        <Input type="checkbox" name="displayTermState"  onClick={() => this.props.toggleOptionStateDisplay()} defaultChecked={this.props.settings.displayState} />{' '}
                                        Display Term State
                                    </Label>
                                </FormGroup>

                                <FormGroup check>
                                    <Label check>
                                        <Input type="checkbox" name="infoOnHover" onClick={() => this.props.toggleDisplayOptionInfoOnHover()} defaultChecked={this.props.settings.displayInfoOnHover} />{' '}
                                        Show info on hover
                                    </Label>
                                </FormGroup>

                                <FormGroup check>
                                    <Label check>
                                        <Input type="checkbox" name="infoOnHover" onClick={() => this.props.toggleRenderAsTree()} defaultChecked={this.props.settings.renderAsTree} />{' '}
                                        Render as tree
                                    </Label>
                                </FormGroup>

                                {this.props.settings.renderAsTree &&
                                    <FormGroup check>
                                        <Label check>
                                            <Input type="checkbox" name="expanded" onClick={() => {
                                                this.props.toggleExpanded();
                                                this.props.setExpandedForAll(!this.props.settings.expanded);
                                            }} defaultChecked={this.props.settings.expanded} />{' '}
                                            Expanded
                                        </Label>
                                    </FormGroup>
                                }

                            </Form>
                        </CardBody>
                    </Card>
                </Collapse>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        settings: state.settings,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        toggleSettings: settingsAction.toggleSettings,
        toggleExpanded: settingsAction.toggleExpanded,
        toggleOptionStateDisplay: settingsAction.toggleOptionStateDisplay,
        toggleDisplayOptionInfoOnHover: settingsAction.toggleDisplayOptionInfoOnHover,
        toggleRenderAsTree: settingsAction.toggleRenderAsTree,
        toggleMultiselect: settingsAction.toggleMultiselect,
        setExpandedForAll: setExpandedForAll,
    }, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps)(Settings);