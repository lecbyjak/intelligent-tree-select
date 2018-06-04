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
import {
    addChildrenToParent,
    addNewOptions,
    addSelectedOption,
    addToHistory,
    toggleExpanded
} from "../actions/options-actions";
import {setCurrentSearchInput} from "../actions/other-actions";
import PropTypes from "prop-types";
import {isXML, xmlToJson, isJson, csvToJson} from "../utils/testFunctions";

class App extends Component {

    static propTypes = {
        displayState: PropTypes.bool,
        displayInfoOnHover: PropTypes.bool,
        expanded: PropTypes.bool,
        renderAsTree: PropTypes.bool,
        multi: PropTypes.bool,
        async: PropTypes.bool,
        simpleTreeData: PropTypes.bool,

        labelKey: PropTypes.string,
        valueKey: PropTypes.string,
        childrenKey: PropTypes.string,
        labelValue: PropTypes.func,
        onOptionCreate: PropTypes.func,

        options: PropTypes.array,
        providers: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                response: PropTypes.func.isRequired,
                toJsonArr: PropTypes.func,

                simpleTreeData: PropTypes.bool,
                labelKey: PropTypes.string,
                labelValue: PropTypes.func,
                valueKey: PropTypes.string,
                childrenKey: PropTypes.string
            }).isRequired,
        )
    };

    static defaultProps = {
        options: [],
        simpleTreeData: true,
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


    constructor(props, context) {
        super(props, context);
        this._onOptionCreate = this._onOptionCreate.bind(this);
        this._valueRenderer = this._valueRenderer.bind(this);
        this._optionRenderer = this._optionRenderer.bind(this);
    }

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

            let data = this.props.localOptions;
            if (!this.props.simpleTreeData){
                let now = new Date().getTime();

                data = this._simplyfyData(this.props.localOptions, localProvider.valueKey, localProvider.childrenKey);
                console.log("Simplify options (",this.props.localOptions.length ,") end in: ", new Date().getTime() - now, "ms");
            }
            let options = this._preProcessOptions(data, localProvider);
            this.props.addNewOptions(options)

        }

        this.setState({isLoadingExternally: false})
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
        let promises = [];
        this.props.providers.forEach(async (provider) => {

                let p = provider.response(searchString).then(responseData => {
                    if ("toJsonArr" in provider) {
                        responseData = provider.toJsonArr(responseData);
                    }

                    else if (typeof responseData === 'string' || responseData instanceof String){
                        if (isXML(responseData)) responseData = xmlToJson(responseData);
                        else if (isJson(responseData)) responseData = JSON.parse(responseData);
                        else responseData = csvToJson(responseData) //TODO may throw error
                    }

                    let simpleData = false;
                    if ("simpleTreeData" in provider) {
                        simpleData = provider.simpleTreeData;
                    }
                    responses.push({provider, simpleData, responseData});
                    //console.log("_getResponses for: ", provider.name, "finished")
                });
                promises.push(p);

            }
        );

        await Promise.all(promises).catch(error => console.log(error));
        return responses;
    }

    _onInputChange(searchString) {
        if (searchString && this.props.providers.length > 0) {
            let historyData = [];
            for (let i = searchString.length; i > 0; i--) {
                if (historyData.length > 0) break;
                let substring = searchString.substring(0, i);
                historyData = this._getResultsFromHistory(substring);
            }

            if (historyData.length === 0 && !this.fetching) {
                this.setState({isLoadingExternally: true});
                let data = [];

                this.fetching = this._getResponses().then(responses => {

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

                        this.fetching = false;
                        this.props.addNewOptions(data);
                        this.setState({isLoadingExternally: false});
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

    static _isURL(str) {
        const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return pattern.test(str);
    }

    _valueRenderer(option, x){
        if (Array.isArray(option)){
            option = option[0]
        }
        const value = option[option.providers[0].valueKey];
        const label = option[option.providers[0].labelKey];

        if (App._isURL(value)) return (
          <a href={value} target="_blank">{label}</a>
        );
        return label;
    }

    _onOptionCreate(option){

        this.props.addNewOptions([option]);
        if (option.parent)  this.props.addChildrenToParent(option[option.providers[0].valueKey], option.parent);

        if ("onOptionCreate" in this.props) {
            this.props.onOptionCreate(option);
        }
    }

    render() {
        return (
            <div className="container-fluid">
                <Settings onOptionCreate={this._onOptionCreate} />
                <VirtualizedTreeSelect
                    name="react-virtualized-tree-select"

                    onChange={(selectValue) => this.props.addSelectedOption(selectValue)}
                    value={this.props.selectedOptions}

                    optionRenderer={this._optionRenderer}
                    valueRenderer={this._valueRenderer}

                    isLoading={this.state.isLoadingExternally}

                    {...this.props}
                    onInputChange={(input) => this._onInputChange(input)}
                    options={this.props.options}
                    {...this.props.settings}
                />

            </div>
        )
    }

}

const optionStateEnum = {
    MERGED: {label: 'Merged', color: 'warning', message: ''},
    EXTERNAL: {label: 'External', color: 'primary', message: ''},
    NEW: {label: 'New', color: 'success', message: 'not verified'},
    LOCAL: {label: 'Local', color: 'secondary', message: ''},
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
        addChildrenToParent: addChildrenToParent,
        toggleExpanded: toggleExpanded,
        addSelectedOption: addSelectedOption,
        setCurrentSearchInput: setCurrentSearchInput,
        addToHistory: addToHistory,
    }, dispatch)
}

const IntelligentTreeSelectComponent = connect(mapStateToProps, mapDispatchToProps)(App);

export {IntelligentTreeSelectComponent, optionStateEnum};
