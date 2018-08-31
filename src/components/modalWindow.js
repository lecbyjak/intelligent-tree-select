import React, {Component} from 'react';
import { Button, Modal, Tooltip } from "reactstrap";
import NewOptionForm from "./forms/newOptionForm";

class ModalWindow extends Component {

    constructor(props) {
        super(props);
        this.id = 'Modal_form_open_button';

        this._toggleModal = this._toggleModal.bind(this);

        this.state = {
            tooltipVisible: false,
            modalVisible: false,
        }
    }

    _toggleModal() {
        this.setState({modalVisible: !this.state.modalVisible})
    }

    render() {
        const FormComponent = this.props.formComponent || NewOptionForm;
        const openButtonTooltipLabel = this.props.openButtonTooltipLabel || 'Create new option';
        const openButtonLabel = this.props.openButtonLabel || 'Didn´t find your term? Create new one.';

        return (
            <div>
                <Button color={"link"}
                        onClick={this._toggleModal}
                        id={this.id}>{openButtonLabel}</Button>

                <Tooltip innerClassName={"bg-light text-dark border border-dark"} delay={{show: 300, hide: 100}}
                         placement="right" isOpen={this.state.tooltipVisible}
                         target={this.id} toggle={() => this.setState({tooltipVisible: !this.state.tooltipVisible})}>
                  {openButtonTooltipLabel}
                </Tooltip>

                <Modal backdrop={"static"} isOpen={this.state.modalVisible} toggle={this._toggleModal}>

                  <FormComponent onOptionCreate={this.props.formData.onOptionCreate}
                                 toggleModal={this._toggleModal}
                                 options={this.props.formData.options}
                                 labelKey={this.props.formData.labelKey}
                                 valueKey={this.props.formData.valueKey}
                                 childrenKey={this.props.formData.childrenKey}
                  />

                </Modal>
            </div>
        )
    }
}


export default ModalWindow;
