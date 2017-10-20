import React, {Component} from 'react';
import {Button, Card, CardBody, Collapse, Form, FormGroup, Input, Label} from "reactstrap";

class Filter extends Component {


    constructor(props) {
        super(props);
        this.state = {filterOpened: false}
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
                                        <Input type="checkbox" />{' '}
                                        Show providers/info
                                    </Label>
                                </FormGroup>
                                <FormGroup check>
                                    <Label check>
                                        <Input type="checkbox" />{' '}
                                        Show all
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