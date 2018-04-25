import connect from "react-redux/es/connect/connect";
import {bindActionCreators} from "redux";
import React, {Component} from 'react';
import {Button, InputGroupButton, Modal, Tooltip} from "reactstrap";
import {toggleModalWindow, toggleModalWindowButtonTooltip} from "../actions/other-actions";
import {addNewOptions} from "../actions/options-actions";
import NewTermModalForm from "./forms/newTerm-form";

class ModalWindow extends Component {

    constructor(props) {
        super(props);
        this.id = 'Modal_form_open_button';
    }

    _createNewOption() {

        // let newTerm2 = this.state.termProperties.reduce(function (result, elem) {
        //     result[elem.key] = elem.value;
        //     return result;
        // }, {});
        //
        // let newTerm = {
        //     "@id": this.termID.value,
        //     [this.props.optionsUtils.settings.filterBy]: this.termLabel.value,
        //     "@type": this.termCategories.value.split(","),
        //     "parent": this.state.selectedParent,
        //     "subTerm": this._getSelectedChildren(),
        //     "state": optionStateEnum.NEW,
        // };
        // newTerm = Object.assign(newTerm, newTerm2);
        // //console.log(newTerm);
        //
        // this.props.optionsUtils.addNewOptions([newTerm], "local data");
        // if (this.props.optionsUtils.settings.forceAdding) {
        //     this.props.history.invalidateHistory()
        // }

        console.log('submitted');
        console.log(this.props.form.newTerm.values)
        console.log('term created')

        this.props.toggleModalWindow()
    }


    render() {
        return (
            <InputGroupButton>
                <Button color={"link"} className={"d-flex justify-content-center  align-items-center"}
                        onClick={() => this.props.toggleModalWindow()}
                        id={this.id}>Create new option</Button>

                <Tooltip innerClassName={"bg-light text-dark border border-dark"} delay={{show: 300, hide: 100}}
                         placement="right" isOpen={this.props.other.modalWindowButtonTooltipVisible}
                         target={this.id} toggle={() => this.props.toggleModalWindowButtonTooltip()}>
                    {this.props.tooltipLabel}
                </Tooltip>

                {this.props.other.modalWindowVisible &&
                    <Modal backdrop={"static"} isOpen={this.props.other.modalWindowVisible} toggle={() => this.props.toggleModalWindow()}>

                        <NewTermModalForm submitForm={() => this._createNewOption()} />

                    </Modal>
                 }

            </InputGroupButton>
        )
    }
}

ModalWindow.defaultProps = {
    tooltipLabel: 'Didn´t find your term? Add new one.'
};

function mapStateToProps(state) {
    return {
        options: state.options,
        settings: state.settings,
        form: state.form,
        other: state.other,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        toggleModalWindow: toggleModalWindow,
        addNewOptions: addNewOptions,
        toggleModalWindowButtonTooltip: toggleModalWindowButtonTooltip,
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalWindow);