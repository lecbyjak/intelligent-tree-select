import React, {Component} from 'react';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, Tooltip} from "reactstrap";

class ModalForm extends Component {

    constructor(props) {
        let time = Date.now();
        super(props);
        this.state = {
            modal: false,
            tooltipOpen: false,
            id: 'ModalFormButton_' + time,
        };
    }


    static defaultProps = {
            buttonColor: 'primary',
            tooltipLabel: 'Didn´t find your term? Add new one.'
    };

    getButtonLabel() {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                <g className="nc-icon-wrapper" fill="#ffffff">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </g>
            </svg>
        )
    }

    render() {
        return (
            <div>
                <Button color={this.props.buttonColor} className={"d-flex justify-content-center  align-items-center"}
                        onClick={() => {this.setState({modal: true}); this.setState({tooltipOpen: false})}} id={this.state.id}>{this.getButtonLabel()}</Button>
                <Tooltip innerClassName={"bg-light text-dark border border-dark"} delay={{show: 300, hide: 100}} placement="right" isOpen={this.state.tooltipOpen}
                         target={this.state.id} toggle={() => {this.setState({tooltipOpen: !this.state.tooltipOpen});}}>
                    {this.props.tooltipLabel}
                </Tooltip>
                <Modal backdrop={"static"} isOpen={this.state.modal} toggle={() => {this.setState({modal: false});}}>
                    <ModalHeader toggle={() => {this.setState({modal: false})}}>Modal title</ModalHeader>
                    <ModalBody>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
                        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
                        non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => {this.setState({modal: false})}}>Do Something</Button>{' '}
                        <Button color="secondary" onClick={() => {this.setState({modal: false})}}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}


export default ModalForm;