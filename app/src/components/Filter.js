import React, {Component} from 'react';
import {Button, Card, CardBody, Collapse, Form, FormGroup, Input, Label} from "reactstrap";

class Filter extends Component {


    constructor(props) {
        super(props);
        this.state = {filterOpened: false, lastChange: Date.now()}
    }

    render() {
        return (
            <div className="d-flex flex-column align-items-end">
                <Button color="link" onClick={() => this.setState({filterOpened: !this.state.filterOpened})}>Show
                    filter</Button>
                <Collapse className="w-100" isOpen={this.state.filterOpened}>
                    <Card>
                        <CardBody>
                            <Form >
                                <FormGroup check>
                                    <Label check>
                                        <Input type="checkbox" name="displayTermState" onChange={() => {this.props.settings.displayTermState = !this.props.settings.displayTermState; this.setState({lastChange: Date.now()})}} checked={this.props.settings.displayTermState}/>{' '}
                                        Display Term State
                                    </Label>
                                </FormGroup>
                                <FormGroup check>
                                    <Label check>
                                        <Input type="checkbox" name="compactMode" onChange={() => {this.props.settings.compactMode = !this.props.settings.compactMode; this.setState({lastChange: Date.now()})}} checked={this.props.settings.compactMode}/>{' '}
                                        Show all
                                    </Label>
                                </FormGroup>
                                <FormGroup check>
                                    <Label check>
                                        <Input type="checkbox" name="displayTermCategory" onChange={() => {this.props.settings.displayTermCategory = !this.props.settings.displayTermCategory; this.setState({lastChange: Date.now()})}} checked={this.props.settings.displayTermCategory}/>{' '}
                                        Display Term Category
                                    </Label>
                                </FormGroup>
                            </Form>
                        </CardBody>
                    </Card>
                </Collapse>
            </div>
        )
    }
}

export default Filter