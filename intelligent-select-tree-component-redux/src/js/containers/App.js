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
import {addNewOptions, addSelectedOption, addToHistory, toggleExpanded} from "../actions/options-actions";
import {setCurrentSearchInput} from "../actions/other-actions";
import PropTypes from "prop-types";

class App extends Component {

    static propTypes = {
        displayState: PropTypes.bool,
        displayInfoOnHover: PropTypes.bool,
        expanded: PropTypes.bool,
        renderAsTree: PropTypes.bool,
        multi: PropTypes.bool,
        async: PropTypes.bool,
        treeDataSimpleMode: PropTypes.bool,

        labelKey: PropTypes.string,
        valueKey: PropTypes.string,
        childrenKey: PropTypes.string,
        parentKey: PropTypes.string,

        options: PropTypes.array,

        providers: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                response: PropTypes.func.isRequired,
                toJsonArr: PropTypes.func,

                treeDataSimpleMode: PropTypes.bool,
                labelKey: PropTypes.string,
                labelValue: PropTypes.func,
                valueKey: PropTypes.string,
                childrenKey: PropTypes.string,
                parentKey: PropTypes.string,
            }).isRequired,
        )
    };

    static defaultProps = {
        options: [],
        treeDataSimpleMode: false,
        displayState: false,
        displayInfoOnHover: false,
        expanded: true,
        renderAsTree: true,
        multi: true,
        labelKey: 'label',
        valueKey: 'value',
        childrenKey: 'children',
        termLifetime: "5m",

    };


    componentWillMount() {
        this.settings = {
            displayState: this.props.displayState,
            displayInfoOnHover: this.props.displayInfoOnHover,
            expanded: this.props.expanded,
            renderAsTree: this.props.renderAsTree,
            multi: this.props.multi,
            labelKey: this.props.labelKey,
            valueKey: this.props.valueKey,
            childrenKey: this.props.childrenKey,
        };
        this.isLoadingExternally = false;
        this.fetching = false;
        this.props.initSettings(this.settings);

        if ("localOptions" in this.props) {
            let localProvider = {
                name: "Local data",
                labelKey: this.props.labelKey,
                valueKey: this.props.valueKey,
                childrenKey: this.props.childrenKey,
                labelValue: this.props.labelValue,
            };
            let options = this._preProcessOptions(this.props.localOptions, localProvider);
            this.props.addNewOptions(options)
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

    _getResultsFromHistory(searchString) {
        searchString = searchString.toLowerCase();
        let history = this.props.history;

        for (let i = 0; i < history.length; i++) {
            if (history[i].searchString.toLowerCase() === searchString) {
                if (Date.now() < history[i].validTo) {
                    return history[i].data
                }
            }
        }
        return []
    }

    _simplyfyData(responseData,valueKey, childrenKey) {
        let result = [];
        if (!responseData || responseData.length === 0) return result;



        for (let i=0; i<responseData.length; i++ ){
            //deep clone
            let data = JSON.parse(JSON.stringify(responseData[i]));
            result = result.concat(this._simplyfyData(data[childrenKey],valueKey, childrenKey));
            data[childrenKey] = data[childrenKey].map(xdata => xdata[valueKey]);
            result = result.concat(data);
        }

        return result
    }

    static _parseTermLifetime(value) {
        let termLifetime = {
            days: 0,
            hours: 0,
            minutes: 30,
            seconds: 0,
        };
        if (/^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/.test(value)) {
            let tmp = /^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/.exec(value);
            termLifetime = {
                days: parseInt(tmp[1], 10),
                hours: parseInt(tmp[2], 10),
                minutes: parseInt(tmp[3], 10),
                seconds: parseInt(tmp[4], 10),
            };
        } else {
            throw new Error("Invalid termLifetime. Expecting format: e.g. 1d10h5m6s ")
        }
        return termLifetime
    }

    static _getValidForInSec(termLifetime) {
        termLifetime = App._parseTermLifetime(termLifetime);
        let res = 0;
        res += (isNaN(termLifetime.seconds) ? 0 : termLifetime.seconds);
        res += (isNaN(termLifetime.minutes) ? 0 : termLifetime.minutes * 60);
        res += (isNaN(termLifetime.hours) ? 0 : termLifetime.hours * 60 * 60);
        res += (isNaN(termLifetime.days) ? 0 : termLifetime.days * 60 * 60 * 24);
        return res * 1000
    }

    async _getResponses(searchString) {
        let responses = [];
        const promises = this.props.providers.map(async (provider) => {
                let responseData = await provider.response(searchString);
                let simpleData = false;
                if ("treeDataSimpleMode" in provider) {
                    simpleData = provider.treeDataSimpleMode;
                }
                responses.push({provider, simpleData, responseData});
                //console.log("_getResponses for: ", provider.name, "finished")
            }
        );

        await Promise.all(promises);
        return responses;
    }

    _onInputChange(searchString) {
        if (searchString) {
            let historyData = [];
            for (let i = searchString.length; i > 0; i--) {
                if (historyData.length > 0) break;
                let substring = searchString.substring(0, i);
                historyData = this._getResultsFromHistory(substring);
            }

            if (historyData.length === 0 && !this.fetching) {
                this.isLoadingExternally = true;
                this.forceUpdate();

                let data = [];

                this.fetching = this._getResponses().then(responses => {
                    //TODO response toJSON
                        console.log('addToHistory call', responses);
                        this.props.addToHistory(searchString, responses, Date.now() + App._getValidForInSec(this.props.termLifetime));

                        responses.forEach((response) => {
                            //default value for this attributes
                            response.provider.labelKey = response.provider.labelKey ? response.provider.labelKey : 'label';
                            response.provider.valueKey = response.provider.valueKey ? response.provider.valueKey : 'value';
                            response.provider.childrenKey = response.provider.childrenKey ? response.provider.childrenKey : 'children';

                            if (response.simpleData) {
                                data = data.concat(this._preProcessOptions(response.responseData, response.provider));
                            } else {
                                let simplifiedData = this._simplyfyData(response.responseData, response.provider.valueKey, response.provider.childrenKey);
                                data = data.concat(this._preProcessOptions(simplifiedData, response.provider));
                            }
                        });
                        this.props.addNewOptions(data);
                        this.isLoadingExternally = false;
                        this.fetching = false;
                        this.forceUpdate();
                    }
                );
            }
        }

        this.props.setCurrentSearchInput(searchString);
        if ("onInputChange" in this.props) {
            this.props.onInputChange(searchString);
        }
    }

    //custom renderer
    _optionRenderer({focusedOption, focusOption, key, option, selectValue, style, valueArray, onToggleClick}) {

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

        const events = option.disabled? {} : {
            onClick: () => selectValue(option),
            onMouseEnter: () => focusOption(option),
            onToggleClick: () => onToggleClick()
        };

        return (
            <ResultItem
                className={className.join(' ')}
                key={key}
                style={style}
                option={option}
                {...events}
            />
        )
    }


    _filterOptions(options, filter, selectedOptions) {
        //TODO improve
        let now = new Date().getTime();
        //console.log("Filter Options options start");

        const filtered = filter? options.filter(option => {
            let label = option[option.providers[0].labelKey];
                if (typeof label === 'string' || label instanceof String){
                    return label.toLowerCase().indexOf(filter.toLowerCase()) !== -1
                }else{
                    return option.providers[0].labelValue(label).toLowerCase().indexOf(filter.toLowerCase()) !== -1
                }
        }) : options;


        let filteredWithParents = filtered;
        filtered.forEach(option => {
            const valueKey = option.providers[0].valueKey;
            const index = filteredWithParents.findIndex((obj) => obj[valueKey] === option[valueKey]);
            let indexParent = options.findIndex((obj) => obj[valueKey] === option.parent);
            while (indexParent >= 0){
                const parent = options[indexParent];
                if (filteredWithParents.includes(parent)) break;
                filteredWithParents.splice(index, 0, parent);
                indexParent = options.findIndex((obj) => obj[valueKey] === parent.parent);
            }
        });

        for (let index = 0; index < filteredWithParents.length; index++){
            if (!filteredWithParents[index].expanded){
                filteredWithParents = filteredWithParents.filter(option => {
                    if (option.graph === filteredWithParents[index].graph) return true;
                    return !option.graph.toString().startsWith(filteredWithParents[index].graph.toString());
                })
            }
        }
        if (Array.isArray(selectedOptions) && selectedOptions.length) {
            const selectedValues = selectedOptions.map((option) => option[option.providers[0].valueKey]);

            return filtered.filter(
                (option) => !selectedValues.includes(option[option.providers[0].valueKey])
            )
        }

        //console.log("Filter Options end in: ", new Date().getTime() - now, "ms");
        return filteredWithParents;
    }

    render() {

        let attributes = {};
        if (this.props.providers.length > 0){
            attributes.filterOptions = (options, filter, currentValues) => this._filterOptions(options, filter, currentValues)
        }

        return (
            <div className="container-fluid">
                <Settings/>
                <VirtualizedTreeSelect
                    name="react-virtualized-tree-select"

                    onChange={(selectValue) => this.props.addSelectedOption(selectValue)}
                    value={this.props.selectedOptions}

                    optionRenderer={this._optionRenderer}

                    isLoading={this.isLoadingExternally}

                    {...this.props}
                    onInputChange={(input) => this._onInputChange(input)}
                    options={this.props.options}
                    {...this.props.settings}
                    {...attributes}
                />

            </div>
        )
    }

}

const optionStateEnum = {
    MERGED: {label: 'Merged', color: 'warning', tooltip: ''},
    EXTERNAL: {label: 'External', color: 'primary', tooltip: ''},
    NEW: {label: 'New', color: 'success', tooltip: 'not verified'},
    LOCAL: {label: 'Local', color: 'secondary', tooltip: ''},
};


function mapStateToProps(state) {
    return {
        options: state.options.cashedOptions,
        history: state.options.history,
        selectedOptions: state.options.selectedOptions,
        other: state.other,
        settings: state.settings,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        initSettings: initSettings,
        addNewOptions: addNewOptions,
        toggleExpanded: toggleExpanded,
        addSelectedOption: addSelectedOption,
        setCurrentSearchInput: setCurrentSearchInput,
        addToHistory: addToHistory,
    }, dispatch)
}

const IntelligentTreeSelectComponent = connect(mapStateToProps, mapDispatchToProps)(App);

export {IntelligentTreeSelectComponent, optionStateEnum};
