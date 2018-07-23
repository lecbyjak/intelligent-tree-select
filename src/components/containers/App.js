import React, {Component} from 'react';

import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css'
import 'react-virtualized-select/styles.css'
import 'bootstrap/dist/css/bootstrap.css';
import '../../App.css';

import Settings from '../containers/settings'
import VirtualizedTreeSelect from "./virtualizedTreeSelect";
import ResultItem from './resultItem'
import PropTypes from "prop-types";
import {isXML, xmlToJson, isJson, csvToJson} from "../utils/testFunctions";

class IntelligentTreeSelect extends Component {


    constructor(props, context) {
        super(props, context);

        this._onOptionCreate = this._onOptionCreate.bind(this);
        this._valueRenderer = this._valueRenderer.bind(this);
        this._optionRenderer = this._optionRenderer.bind(this);
        this._addSelectedOption = this._addSelectedOption.bind(this);

        this.state = {
            displayState: this.props.displayState,
            displayInfoOnHover: this.props.displayInfoOnHover,
            expanded: this.props.expanded,
            renderAsTree: this.props.renderAsTree,
            multi: this.props.multi,
            options: [],
            selectedOptions: [],
            isLoadingExternally: false,
        }
    }

    componentWillMount() {
        this.fetching = false;
        this.history = [];
        this. searchString = "";

        if ("localOptions" in this.props) {
            let localProvider = {
                name: "Local data",
                labelKey: this.props.labelKey,
                valueKey: this.props.valueKey,
                childrenKey: this.props.childrenKey,
                labelValue: this.props.labelValue,
            };

            let data = this.props.localOptions;
            if (!this.props.simpleTreeData) {
                let now = new Date().getTime();

                data = this._simplyfyData(this.props.localOptions, localProvider.valueKey, localProvider.childrenKey);
                console.log("Simplify options (", this.props.localOptions.length, ") end in: ", new Date().getTime() - now, "ms");
            }
            let options = this._preProcessOptions(data, localProvider);
            this._addNewOptions(options)

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

        for (let i = 0; i < this.history.length; i++) {
            if (this.history[i].searchString.toLowerCase() === searchString) {
                if (Date.now() < this.history[i].validTo) {
                    return this.history[i].data
                }
            }
        }
        return []
    }

    _simplyfyData(responseData, valueKey, childrenKey) {
        let result = [];
        if (!responseData || responseData.length === 0) return result;

        for (let i = 0; i < responseData.length; i++) {
            //deep clone
            let data = JSON.parse(JSON.stringify(responseData[i]));
            result = result.concat(this._simplyfyData(data[childrenKey], valueKey, childrenKey));
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
        termLifetime = IntelligentTreeSelect._parseTermLifetime(termLifetime);
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

                    else if (typeof responseData === 'string' || responseData instanceof String) {
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

                        this._addToHistory(searchString, responses, Date.now() + IntelligentTreeSelect._getValidForInSec(this.props.termLifetime));

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
                        this._addNewOptions(data);
                        this.setState({isLoadingExternally: false});
                    }
                );
            }
        }

        this.searchString = searchString;
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

        const events = option.disabled ? {} : {
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
        const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return pattern.test(str);
    }

    _valueRenderer(option, x) {
        if (Array.isArray(option)) {
            option = option[0]
        }
        const value = option[option.providers[0].valueKey];
        const label = option[option.providers[0].labelKey];

        if (IntelligentTreeSelect._isURL(value)) return (
            <a href={value} target="_blank">{label}</a>
        );
        return label;
    }

    _onOptionCreate(option) {
        // TODO remove?
        this.props.addNewOptions([option]);
        if (option.parent) this.props.addChildrenToParent(option[option.providers[0].valueKey], option.parent);

        if ("onOptionCreate" in this.props) {
            this.props.onOptionCreate(option);
        }
    }

    _addNewOptions(newOptions){
        const _toArray = (object) => {
            let childrenKey = object.providers[0].childrenKey;

            if (!Array.isArray(object[childrenKey])) {
                if (object[childrenKey]) object[childrenKey] = [object[childrenKey]];
                else object[childrenKey] = []
            }
            return object;
        };

        let options = newOptions.concat(this.state.options);
        let mergedArr = [];

        //merge options
        while (options.length > 0) {
            let currOption = options.shift();

            currOption = _toArray(currOption);

            let conflicts = options.filter(object => {
                return object[object.providers[0].valueKey] === currOption[currOption.providers[0].valueKey]
            });
            conflicts.forEach(conflict => {
                conflict = _toArray(conflict);
                let a = currOption[currOption.providers[0].childrenKey];
                let b = conflict[conflict.providers[0].childrenKey];
                currOption[currOption.providers[0].childrenKey] = a.concat(b.filter((item) => a.indexOf(item) < 0));
            });
            mergedArr.push(Object.assign({}, ...conflicts.reverse(), currOption));
            if (currOption.providers.length > 0) currOption.state = optionStateEnum.MERGED;
            conflicts.forEach(conflict => options.splice(
                options.findIndex(el => el[el.providers[0].valueKey] === conflict[conflict.providers[0].valueKey]), 1)
            );
        }

        this.setState({options: mergedArr})
    }

    _onSettingsChange(payload) {

        if (payload.hasOwnProperty('expanded')){
            this.state.options.forEach(option => option.expanded = payload.expanded);
            payload.options = this.state.options;
        }

        this.setState(payload);
    }

    _addSelectedOption(selectedOptions){
        this.setState({selectedOptions})
    }

    _addToHistory(searchString, data, validTo){
        this.history.unshift({searchString, data, validTo})
    }

    render() {
        return (

            <div className="container-fluid">

                <Settings onOptionCreate={this._onOptionCreate}
                          onSettingsChange={this._onSettingsChange}
                          data={{
                              displayState: this.props.displayState,
                              displayInfoOnHover: this.props.displayInfoOnHover,
                              expanded: this.props.expanded,
                              renderAsTree: this.props.renderAsTree,
                              multi: this.props.multi,
                          }}
                          formData={{
                            labelKey: this.props.labelKey || 'label',
                            valueKey: this.props.valueKey || 'value',
                            childrenKey: this.props.childrenKey || 'children',
                            data: this.state.options,
                          }}
                />

                <VirtualizedTreeSelect
                    name="react-virtualized-tree-select"

                    onChange={this._addSelectedOption}
                    value={this.state.selectedOptions}

                    optionRenderer={this._optionRenderer}
                    valueRenderer={this._valueRenderer}

                    {...this.props}

                    isLoading={this.state.isLoadingExternally}
                    onInputChange={(input) => this._onInputChange(input)}
                    options={this.state.options}
                />

            </div>
        )
    }

}

IntelligentTreeSelect.propTypes = {
    displayState: PropTypes.bool,
    displayInfoOnHover: PropTypes.bool,
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
    ),
    renderAsTree: PropTypes.bool,
    simpleTreeData: PropTypes.bool,
};

IntelligentTreeSelect.defaultProps = {
    displayState: false,
    displayInfoOnHover: false,
    expanded: true,
    multi: true,
    options: [],
    renderAsTree: true,
    simpleTreeData: true,
    termLifetime: "5m",
};

const optionStateEnum = {
    MERGED: {label: 'Merged', color: 'warning', message: ''},
    EXTERNAL: {label: 'External', color: 'primary', message: ''},
    NEW: {label: 'New', color: 'success', message: 'not verified'},
    LOCAL: {label: 'Local', color: 'secondary', message: ''},
};


export {IntelligentTreeSelect, optionStateEnum};
