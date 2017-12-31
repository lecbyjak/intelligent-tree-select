import React, {Component} from 'react';

import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css'
import 'react-virtualized-select/styles.css'
import 'bootstrap/dist/css/bootstrap.css';
import '../../css/App.css';

import Settings from '../containers/settings'
import VirtualizedTreeSelect from "./virtualizedTreeSelect";
import {initSettings} from "../actions/settings-actions";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {addNewOptions, addSelectedOption} from "../actions/options-actions";
import {setCurrentSearchInput} from "../actions/other-actions";
import VirtualizedSelect from "react-virtualized-select";

class App extends Component {


    componentWillMount(){
        this.settings = {
            context: this.props.context,
            displayState: this.props.displayState,
            displayInfoOnHover: this.props.displayInfoOnHover,
            expanded: this.props.expanded,
            renderAsTree: this.props.renderAsTree,
            multi: this.props.multi,
        };

        this.props.initSettings(this.settings);

        for (let i = 0; i < this.props.providers.length; i++) {
            if (this.props.providers[i].type === ProviderTypeEnum.OPTIONS) {
                let processedOptions = this._processOptions(this.props.providers[i].value, "local data");
                this.props.addNewOptions(processedOptions);
            }
        }
    }

    _processOptions(options, provider) {
        return options.map(option => {

            let keys = [];
            for (let k in option) keys.push(k);

            let children = (this.props.childrenKey)? option[this.props.childrenKey]: options['children']
            if (!Array.isArray(children)) {
                if (children) children = [children];
                else children = []
            }

            return {
                ...option,
                id: (this.props.valueKey)? option[this.props.valueKey]: options['value'],
                label: (this.props.labelKey)? option[this.props.labelKey]: options['label'],
                parent: (keys.includes('parent')) ? option['parent'] : "",
                children: children,
                state: (keys.includes('state')) ? option['state'] : optionStateEnum.EXTERNAL,
                providers: [provider],
                expanded: this.props.expanded,
            };

        })
    }


    render() {
        return (
            <div className="container-fluid">
                <Settings/>
                <VirtualizedTreeSelect
                    name="react-virtualized-tree-select"
                    onChange={(selectValue) => this.props.addSelectedOption(selectValue)}
                    value={this.props.selectedOptions}
                    {...this.props}
                    {...this.props.settings}
                />
            </div>
        )
    }

}

const ProviderTypeEnum = {
    OPTIONS: Symbol('OPTIONS'),
    GET_ALL: Symbol('GET_ALL'),
    SEARCH: Symbol('SEARCH'),
};

const optionStateEnum = {
    MERGED: {label: 'Merged', color: 'warning', tooltip: ''},
    EXTERNAL: {label: 'External', color: 'primary', tooltip: ''},
    NEW: {label: 'New', color: 'success', tooltip: 'not verified'},
    LOCAL: {label: 'Local', color: 'secondary', tooltip: ''},
};

App.defaultProps = {
    context: "",
    displayState: false,
    displayInfoOnHover: false,
    expanded: false,
    renderAsTree: true,
    multi: true,
};


function mapStateToProps(state) {
    return {
        options: state.options.options,
        selectedOptions: state.options.selectedOptions,
        other: state.other,
        settings: state.settings,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        initSettings: initSettings,
        addNewOptions: addNewOptions,
        addSelectedOption: addSelectedOption,
        setCurrentSearchInput: setCurrentSearchInput,
    }, dispatch)
}

const IntelligentTreeSelectComponent = connect(mapStateToProps, mapDispatchToProps)(App);

export {IntelligentTreeSelectComponent, ProviderTypeEnum, optionStateEnum};
