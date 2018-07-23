import React, {Component} from 'react';
import {Button, Card, CardBody, Collapse, Form, FormGroup, Input, Label} from "reactstrap";
import ModalForm from '../containers/modalForm'
import PropTypes from "prop-types";

class Settings extends Component {


    constructor(props, context) {
        super(props, context);

        this._toggleSettings = this._toggleSettings.bind(this);

        this.state = {
            open: false
        }
    }

    _toggleSettings() {
        this.setState({open: !this.state.open})
    }

    render() {
        const data = this.props.data;
        return (
            <div className="d-flex flex-column">

                <div className="d-flex justify-content-between">
                    <ModalForm onOptionCreate={this.props.onOptionCreate}
                               data={this.props.formData}
                    />
                    <Button color="link" onClick={this._toggleSettings}>
                        {(this.state.open ? "Hide filter" : "Show filter")}
                    </Button>
                </div>

                <Collapse className="w-100" isOpen={this.state.open}>
                    <Card>
                        <CardBody>
                            <Form>
                                <FormGroup check>
                                    <Label check>
                                        <Input type="checkbox" name="multiselect"
                                               onClick={() => this.props.onSettingsChange({multi: !data.multi})}
                                               defaultChecked={data.multi}/>{' '}
                                        Multiselect
                                    </Label>
                                </FormGroup>

                                <FormGroup check>
                                    <Label check>
                                        <Input type="checkbox" name="displayTermState"
                                               onClick={() => this.props.onSettingsChange({displayState: !data.displayState})}
                                               defaultChecked={data.displayState}/>{' '}
                                        Display Term State
                                    </Label>
                                </FormGroup>

                                <FormGroup check>
                                    <Label check>
                                        <Input type="checkbox" name="infoOnHover"
                                               onClick={() => this.props.onSettingsChange({displayInfoOnHover: !data.displayInfoOnHover})}
                                               defaultChecked={data.displayInfoOnHover}/>{' '}
                                        Show info on hover
                                    </Label>
                                </FormGroup>

                                <FormGroup check>
                                    <Label check>
                                        <Input type="checkbox" name="infoOnHover"
                                               onClick={() => this.props.onSettingsChange({renderAsTree: !data.renderAsTree})}
                                               defaultChecked={data.renderAsTree}/>{' '}
                                        Render as tree
                                    </Label>
                                </FormGroup>

                                {data.renderAsTree &&
                                <FormGroup check>
                                    <Label check>
                                        <Input type="checkbox" name="expanded"
                                               onClick={() => this.props.onSettingsChange({expanded: !data.expanded})}
                                               defaultChecked={data.expanded}/>{' '}
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



export default Settings;

Settings.propTypes = {
  data: PropTypes.object.isRequired,
  formData: PropTypes.object.isRequired,
  onOptionCreate: PropTypes.func.isRequired,
  onSettingsChange: PropTypes.func.isRequired
};