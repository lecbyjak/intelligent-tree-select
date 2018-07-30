'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.optionStateEnum = exports.IntelligentTreeSelect = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _VirtualizedTreeSelect = require('./VirtualizedTreeSelect');

var _resultItem = require('./resultItem');

var _resultItem2 = _interopRequireDefault(_resultItem);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _testFunctions = require('./utils/testFunctions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class IntelligentTreeSelect extends _react.Component {

    constructor(props, context) {
        super(props, context);

        this._onOptionCreate = this._onOptionCreate.bind(this);
        this._valueRenderer = this._valueRenderer.bind(this);
        this._optionRenderer = this._optionRenderer.bind(this);
        this._addSelectedOption = this._addSelectedOption.bind(this);
        this._onSettingsChange = this._onSettingsChange.bind(this);
        this._onInputChange = this._onInputChange.bind(this);
        this._onScroll = this._onScroll.bind(this);

        this.state = {
            displayState: this.props.displayState,
            displayInfoOnHover: this.props.displayInfoOnHover,
            expanded: this.props.expanded,
            renderAsTree: this.props.renderAsTree,
            multi: this.props.multi,
            options: [],
            selectedOptions: [],
            isLoadingExternally: false
        };
    }

    componentWillMount() {
        this.fetching = false;
        this.history = [];
        this.searchString = "";

        if ("localOptions" in this.props) {
            let localProvider = {
                name: "Local data",
                labelKey: this.props.labelKey,
                valueKey: this.props.valueKey,
                childrenKey: this.props.childrenKey,
                labelValue: this.props.labelValue
            };

            let data = this.props.localOptions;
            if (!this.props.simpleTreeData) {
                data = this._simplyfyData(this.props.localOptions, localProvider.valueKey, localProvider.childrenKey);
            }
            let options = this._preProcessOptions(data, localProvider);
            this._addNewOptions(options);
        }

        this.setState({ isLoadingExternally: false });
    }

    _preProcessOptions(options, provider) {
        return options.map(option => {
            return _extends({}, option, {
                state: option['state'] ? option['state'] : optionStateEnum.EXTERNAL,
                providers: [provider]
            });
        });
    }

    _getResultsFromHistory(searchString) {
        searchString = searchString.toLowerCase();

        for (let i = 0; i < this.history.length; i++) {
            if (this.history[i].searchString.toLowerCase() === searchString) {
                if (Date.now() < this.history[i].validTo) {
                    return this.history[i].data;
                }
            }
        }
        return [];
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

        return result;
    }

    _parseTermLifetime(value) {
        let termLifetime = {
            days: 0,
            hours: 0,
            minutes: 30,
            seconds: 0
        };
        if (/^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/.test(value)) {
            let tmp = /^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/.exec(value);
            termLifetime = {
                days: parseInt(tmp[1], 10),
                hours: parseInt(tmp[2], 10),
                minutes: parseInt(tmp[3], 10),
                seconds: parseInt(tmp[4], 10)
            };
        } else {
            throw new Error("Invalid termLifetime. Expecting format: e.g. 1d10h5m6s ");
        }
        return termLifetime;
    }

    _getValidForInSec(termLifetime) {
        termLifetime = this._parseTermLifetime(termLifetime);
        let res = 0;
        res += isNaN(termLifetime.seconds) ? 0 : termLifetime.seconds;
        res += isNaN(termLifetime.minutes) ? 0 : termLifetime.minutes * 60;
        res += isNaN(termLifetime.hours) ? 0 : termLifetime.hours * 60 * 60;
        res += isNaN(termLifetime.days) ? 0 : termLifetime.days * 60 * 60 * 24;
        return res * 1000;
    }

    _getResponses(searchString) {
        var _this = this;

        return _asyncToGenerator(function* () {
            let responses = [];
            let promises = [];
            _this.props.providers.forEach((() => {
                var _ref = _asyncToGenerator(function* (provider) {

                    let p = provider.response(searchString).then(function (responseData) {
                        if ("toJsonArr" in provider) {
                            responseData = provider.toJsonArr(responseData);
                        } else if (typeof responseData === 'string' || responseData instanceof String) {
                            if ((0, _testFunctions.isXML)(responseData)) responseData = (0, _testFunctions.xmlToJson)(responseData);else if ((0, _testFunctions.isJson)(responseData)) responseData = JSON.parse(responseData);else responseData = (0, _testFunctions.csvToJson)(responseData); //TODO may throw error
                        }

                        let simpleData = false;
                        if ("simpleTreeData" in provider) {
                            simpleData = provider.simpleTreeData;
                        }
                        responses.push({ provider, simpleData, responseData });
                        //console.log("_getResponses for: ", provider.name, "finished")
                    });
                    promises.push(p);
                });

                return function (_x) {
                    return _ref.apply(this, arguments);
                };
            })());

            yield Promise.all(promises).catch(function (error) {
                return console.log(error);
            });
            return responses;
        })();
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
                this.setState({ isLoadingExternally: true });
                let data = [];

                this.fetching = this._getResponses().then(responses => {

                    this._addToHistory(searchString, responses, Date.now() + this._getValidForInSec(this.props.termLifetime));

                    responses.forEach(response => {
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
                    this.setState({ isLoadingExternally: false });
                });
            }
        }

        this.searchString = searchString;
        if ("onInputChange" in this.props) {
            this.props.onInputChange(searchString);
        }
    }

    _onScroll(data) {
        const { clientHeight, scrollHeight, scrollTop } = data;
    }

    _optionRenderer({ focusedOption, focusOption, key, option, selectValue, optionStyle, valueArray }) {

        const className = ['VirtualizedSelectOption'];

        if (option === focusedOption) {
            className.push('VirtualizedSelectFocusedOption');
        }

        if (option.disabled) {
            className.push('VirtualizedSelectDisabledOption');
        }

        if (valueArray && valueArray.indexOf(option) >= 0) {
            className.push('VirtualizedSelectSelectedOption');
        }

        if (option.className) {
            className.push(option.className);
        }

        const events = option.disabled ? {} : {
            onClick: () => selectValue(option),
            onMouseEnter: () => focusOption(option),
            onToggleClick: () => this.forceUpdate()
        };

        return _react2.default.createElement(_resultItem2.default, _extends({
            className: className.join(' '),
            key: key,
            style: optionStyle,
            option: option,
            settings: {
                searchString: this.searchString,
                renderAsTree: this.state.renderAsTree,
                displayInfoOnHover: this.state.displayInfoOnHover,
                displayState: this.state.displayState
            }
        }, events));
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
            option = option[0];
        }
        const value = option[option.providers[0].valueKey];
        const label = option[option.providers[0].labelKey];

        if (IntelligentTreeSelect._isURL(value)) return _react2.default.createElement(
            'a',
            { href: value, target: '_blank' },
            label
        );
        return label;
    }

    _onOptionCreate(option) {
        // TODO remove?
        this._addNewOptions([option]);
        if (option.parent) this._addChildrenToParent(option[option.providers[0].valueKey], option.parent);

        if ("onOptionCreate" in this.props) {
            this.props.onOptionCreate(option);
        }
    }

    _addNewOptions(newOptions) {
        const _toArray = object => {
            let childrenKey = object.providers[0].childrenKey;

            if (!Array.isArray(object[childrenKey])) {
                if (object[childrenKey]) object[childrenKey] = [object[childrenKey]];else object[childrenKey] = [];
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
                return object[object.providers[0].valueKey] === currOption[currOption.providers[0].valueKey];
            });
            conflicts.forEach(conflict => {
                conflict = _toArray(conflict);
                let a = currOption[currOption.providers[0].childrenKey];
                let b = conflict[conflict.providers[0].childrenKey];
                currOption[currOption.providers[0].childrenKey] = a.concat(b.filter(item => a.indexOf(item) < 0));
            });
            mergedArr.push(Object.assign({}, ...conflicts.reverse(), currOption));
            if (currOption.providers.length > 0) currOption.state = optionStateEnum.MERGED;
            conflicts.forEach(conflict => options.splice(options.findIndex(el => el[el.providers[0].valueKey] === conflict[conflict.providers[0].valueKey]), 1));
        }

        this.setState({ options: mergedArr });
    }

    _onSettingsChange(payload) {
        if (payload.hasOwnProperty('expanded')) {
            this.state.options.forEach(option => option.expanded = payload.expanded);
            payload.options = this.state.options;
        }

        this.setState(_extends({}, payload));
    }

    _addChildrenToParent(childrenID, parentID) {

        let parentOption = this.state.options.find(x => x[x.providers[0].valueKey] === parentID);
        let children = parentOption[parentOption.providers[0].childrenKey];
        if (children.indexOf(childrenID) === -1) children.push(childrenID);

        this.setState({ options: this.state.options });
    }

    _addSelectedOption(selectedOptions) {
        this.setState({ selectedOptions });
    }

    _addToHistory(searchString, data, validTo) {
        this.history.unshift({ searchString, data, validTo });
    }

    render() {

        let listProps = {};
        listProps.onScroll = this.props.onScroll || this._onScroll;
        return _react2.default.createElement(
            'div',
            { className: 'container-fluid' },
            _react2.default.createElement(_settings2.default, { onOptionCreate: this._onOptionCreate,
                onSettingsChange: this._onSettingsChange,
                data: {
                    displayState: this.state.displayState,
                    displayInfoOnHover: this.state.displayInfoOnHover,
                    expanded: this.state.expanded,
                    renderAsTree: this.state.renderAsTree,
                    multi: this.state.multi
                },
                formData: {
                    labelKey: this.props.labelKey || 'label',
                    valueKey: this.props.valueKey || 'value',
                    childrenKey: this.props.childrenKey || 'children',
                    data: this.state.options
                }
            }),
            _react2.default.createElement(_VirtualizedTreeSelect.VirtualizedTreeSelect, _extends({
                name: 'react-virtualized-tree-select',

                onChange: this._addSelectedOption,
                value: this.state.selectedOptions,

                optionRenderer: this._optionRenderer,
                valueRenderer: this._valueRenderer

            }, this.props, {
                expanded: this.state.expanded,
                renderAsTree: this.state.renderAsTree,
                multi: this.state.multi,
                isMenuOpen: true,
                isLoading: this.state.isLoadingExternally,
                onInputChange: this._onInputChange,
                options: this.state.options,
                listProps: listProps
            }))
        );
    }
}

IntelligentTreeSelect.propTypes = {
    displayState: _propTypes2.default.bool,
    displayInfoOnHover: _propTypes2.default.bool,
    labelValue: _propTypes2.default.func,
    onOptionCreate: _propTypes2.default.func,
    options: _propTypes2.default.array,
    providers: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        name: _propTypes2.default.string.isRequired,
        response: _propTypes2.default.func.isRequired,
        toJsonArr: _propTypes2.default.func,

        simpleTreeData: _propTypes2.default.bool,
        labelKey: _propTypes2.default.string,
        labelValue: _propTypes2.default.func,
        valueKey: _propTypes2.default.string,
        childrenKey: _propTypes2.default.string
    }).isRequired),
    renderAsTree: _propTypes2.default.bool,
    simpleTreeData: _propTypes2.default.bool
};

IntelligentTreeSelect.defaultProps = {
    displayState: false,
    displayInfoOnHover: false,
    expanded: true,
    multi: true,
    options: [],
    renderAsTree: true,
    simpleTreeData: true,
    termLifetime: "5m"
};

const optionStateEnum = {
    MERGED: { label: 'Merged', color: 'warning', message: '' },
    EXTERNAL: { label: 'External', color: 'primary', message: '' },
    NEW: { label: 'New', color: 'success', message: 'not verified' },
    LOCAL: { label: 'Local', color: 'secondary', message: '' }
};

exports.IntelligentTreeSelect = IntelligentTreeSelect;
exports.optionStateEnum = optionStateEnum;