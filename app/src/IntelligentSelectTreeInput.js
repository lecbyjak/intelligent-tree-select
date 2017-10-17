import React, {Component} from 'react';
import './css/App.css';
import {Button, Card, CardBody, Collapse, Form, FormGroup, Input, Label} from "reactstrap";

class IntelligentSelectTreeInput extends Component {

    constructor(props) {
        super(props);
        console.log(props);
        this.state = {}
    }

    getInitialState() {
        return {show: false};
    }


    getFilter() {
        return (
            <div className="d-flex flex-column align-items-end">
                <Button color="link" onClick={() => this.setState({filterOpened: !this.state.filterOpened})}>Show
                    filter</Button>
                <Collapse className="w-100" isOpen={this.state.filterOpened}>
                    <Card>
                        <CardBody>
                            <Form>
                                <FormGroup check inline>
                                    <Label check>
                                        <Input type="checkbox" innerRef={ref => { this.state.providersVisible = ref; }}/>{' '}
                                        Show providers/info
                                    </Label>
                                </FormGroup>
                                <FormGroup check inline>
                                    <Label check>
                                        <Input type="checkbox" innerRef={ref => { this.state.showAll = ref; }}/>{' '}
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

    getInput() {
        // const tooltip = (
        //     <Tooltip id="addNewTerm">Didn´t find your term? Add new one.</Tooltip>
        // );
        // return (
        //     <form id="autocomplete-inputbox-0">
        //
        //         <FormGroup>
        //             <InputGroup>
        //                 <FormControl type="text"/>
        //                 <InputGroup.Addon className={"p-0"}>
        //                     <OverlayTrigger placement="right" overlay={tooltip} delayShow={400} delayHide={100}
        //                                     onEntering={this.entering} trigger={["hover"]}>
        //                         <Button bsStyle="primary" onClick={() => this.setState({show: true})}>
        //                             <Glyphicon glyph="plus"/>
        //                         </Button>
        //                     </OverlayTrigger>
        //                 </InputGroup.Addon>
        //             </InputGroup>
        //         </FormGroup>
        //     </form>
        // )
    }

    entering = (e) => {
        e.children[1].className += " bg-info text-dark font-weight-bold";
    };

    getModal() {
        // return (
        //     <Modal backdrop={"static"} show={this.state.show} onHide={() => this.setState({show: false})}>
        //         <Modal.Header>
        //             <Modal.Title>Create new term</Modal.Title>
        //         </Modal.Header>
        //         <Modal.Body>
        //             <h4>Text in a modal</h4>
        //             <p>Duis mollis, est non commodo luctus, nisi erat porttitor ligula.</p>
        //
        //         </Modal.Body>
        //         <Modal.Footer>
        //             <Button onClick={() => this.setState({show: false})}>Close</Button>
        //             <Button bsStyle="primary" onClick={() => this.setState({show: false})}>Save changes</Button>
        //         </Modal.Footer>
        //     </Modal>
        // )
    }

    getResults() {
        return (
            <div className="border border-secondary border-top-0 box result-area" id="autocomplete-listbox-0"
                 role="listbox">
                <div className="container">
                    results here
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className="container-fluid">
                {this.getFilter()}
                {this.getInput()}
                {this.getResults()}
                {this.getModal()}
            </div>
        )
    }
}


export default IntelligentSelectTreeInput;
