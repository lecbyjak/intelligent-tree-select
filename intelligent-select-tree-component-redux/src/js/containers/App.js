import React, {Component} from 'react';

import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css'
import 'react-virtualized-select/styles.css'
import 'bootstrap/dist/css/bootstrap.css';
import '../../css/App.css';

import Settings from '../containers/settings'
import VirtualizedTreeSelect from "./virtualizedTreeSelect";
import ResultItem from './resultItem'
import {initSettings} from "../actions/settings-actions";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {addNewOptions, addSelectedOption} from "../actions/options-actions";
import {setCurrentSearchInput} from "../actions/other-actions";

class App extends Component {


    componentWillMount(){
        this.settings = {
            context: this.props.context,
            displayState: this.props.displayState,
            displayInfoOnHover: this.props.displayInfoOnHover,
            expanded: this.props.expanded,
            renderAsTree: this.props.renderAsTree,
            multi: this.props.multi,
            labelKey: this.props.labelKey,
            valueKey: this.props.valueKey,
            childrenKey: this.props.childrenKey,
        };

        this.props.initSettings(this.settings);

        for (let i = 0; i < this.props.providers.length; i++) {
            if (this.props.providers[i].type === ProviderTypeEnum.OPTIONS) {
                let preProcessedOptions = this._preProcessOptions(this.props.providers[i].value, "local data");
                this.props.addNewOptions(preProcessedOptions, this.props.labelKey, this.props.valueKey, this.props.childrenKey);
            }
        }
    }

    _preProcessOptions(options, provider) {
        return options.map(option => {

            return {
                ...option,
                state: (option['state']) ? option['state'] : optionStateEnum.EXTERNAL,
                providers: [provider],

            };

        })
    }

    //custom renderer
    _optionRenderer ({ focusedOption, focusOption, key, labelKey, option, selectValue, style, valueArray, onTooggleClick, childrenKey}) {

        const className = ['VirtualizedSelectOption'];

        if (option === focusedOption) {
            className.push('VirtualizedSelectFocusedOption')
        }

        if (option.disabled) {
            className.push('VirtualizedSelectDisabledOption')
        }

        if (valueArray && valueArray.indexOf(option) >= 0) {
            className.push('VirtualizedSelectSelectedOption')
        }

        if (option.className) {
            className.push(option.className)
        }

        const events = option.disabled
            ? {}
            : {
                onClick: () => selectValue(option),
                onMouseEnter: () => focusOption(option)
            };

        return (
            <ResultItem
                className={className.join(' ')}
                key={key}
                style={style}
                option={option}
                label={option[labelKey]}
                hasChildren={!!(option[childrenKey].length)}
                {...events}
                onTooggleClick={onTooggleClick}
            />
        )
    }


    render() {
        return (
            <div className="container-fluid">
                <Settings/>
                    <VirtualizedTreeSelect
                    name="react-virtualized-tree-select"
                    onChange={(selectValue) => this.props.addSelectedOption(selectValue)}
                    onInputChange={(x) => this.props.setCurrentSearchInput(x)}
                    value={this.props.selectedOptions}
                    options={this.props.options}

                    optionRenderer={this._optionRenderer}

                    expanded={this.props.expanded}
                    renderAsTree={this.props.renderAsTree}

                    valueKey={this.props.valueKey}
                    labelKey={this.props.labelKey}
                    childrenKey={this.props.childrenKey}

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
    expanded: true,
    renderAsTree: true,
    multi: true,
    labelKey: 'label',
    valueKey: 'value',
    childrenKey: 'children',
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
