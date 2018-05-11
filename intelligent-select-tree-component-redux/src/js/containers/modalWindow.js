import connect from "react-redux/es/connect/connect";
import {bindActionCreators} from "redux";
import React, {Component} from 'react';
import {Button, InputGroupButton, Modal, Tooltip} from "reactstrap";
import {toggleModalWindow, toggleModalWindowButtonTooltip} from "../actions/other-actions";
import {addNewOptions} from "../actions/options-actions";
import NewTermModalForm from "./forms/newTerm-form";
import {optionStateEnum} from "./App";

class ModalWindow extends Component {

    constructor(props) {
        super(props);
        this.id = 'Modal_form_open_button';
    }

    _getIDs(children){
        if (!children) return [];
        let ids = JSON.parse(JSON.stringify(children));
        return ids.map(obj => obj[this.props.settings.valueKey])
    }

    _createNewOption() {

        const values = this.props.form.newTerm.values;
        const settings = this.props.settings;

        let localProvider = {
            name: "Local data",
            labelKey: settings.labelKey,
            valueKey: settings.valueKey,
            childrenKey: settings.childrenKey,
            labelValue: null,
        };

        let properties = {};
        if (values.termProperties) {
            properties = values.termProperties.reduce(function (result, elem) {
                result[elem.key] = elem.value;
                return result;
            }, {});
        }

        let children = this._getIDs(values['child-terms']);
        let parent = '';
        if (values['parent-term']) parent = values['parent-term'][settings.valueKey];

        let option = {};
        option[settings.valueKey] = values['termID'];
        option[settings.labelKey] = values['termLabel'];
        option[settings.childrenKey] = children;
        option['parent'] = parent;
        option['description'] = values['termDescription'];

        Object.assign(option, properties);
        option['state'] = optionStateEnum.NEW;
        option['providers'] = [localProvider];


        this.props.onOptionCreate(option);
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