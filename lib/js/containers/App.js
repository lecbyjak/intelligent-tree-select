'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.optionStateEnum = exports.IntelligentTreeSelectComponent = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('react-select/dist/react-select.css');

require('react-virtualized/styles.css');

require('react-virtualized-select/styles.css');

require('bootstrap/dist/css/bootstrap.css');

require('../../App.css');

var _settings = require('../containers/settings');

var _settings2 = _interopRequireDefault(_settings);

var _virtualizedTreeSelect = require('./virtualizedTreeSelect');

var _virtualizedTreeSelect2 = _interopRequireDefault(_virtualizedTreeSelect);

var _resultItem = require('./resultItem');

var _resultItem2 = _interopRequireDefault(_resultItem);

var _settingsActions = require('../actions/settings-actions');

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _optionsActions = require('../actions/options-actions');

var _otherActions = require('../actions/other-actions');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _testFunctions = require('../utils/testFunctions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var App = function (_Component) {
    (0, _inherits3.default)(App, _Component);

    function App(props, context) {
        (0, _classCallCheck3.default)(this, App);

        var _this = (0, _possibleConstructorReturn3.default)(this, (App.__proto__ || (0, _getPrototypeOf2.default)(App)).call(this, props, context));

        _this._onOptionCreate = _this._onOptionCreate.bind(_this);
        _this._valueRenderer = _this._valueRenderer.bind(_this);
        _this._optionRenderer = _this._optionRenderer.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(App, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.settings = {
                displayState: this.props.displayState,
                displayInfoOnHover: this.props.displayInfoOnHover,
                expanded: this.props.expanded,
                renderAsTree: this.props.renderAsTree,
                multi: this.props.multi,
                labelKey: this.props.labelKey,
                valueKey: this.props.valueKey,
                childrenKey: this.props.childrenKey
            };
            this.fetching = false;
            this.props.initSettings(this.settings);

            if ("localOptions" in this.props) {
                var localProvider = {
                    name: "Local data",
                    labelKey: this.props.labelKey,
                    valueKey: this.props.valueKey,
                    childrenKey: this.props.childrenKey,
                    labelValue: this.props.labelValue
                };

                var data = this.props.localOptions;
                if (!this.props.simpleTreeData) {
                    var now = new Date().getTime();

                    data = this._simplyfyData(this.props.localOptions, localProvider.valueKey, localProvider.childrenKey);
                    console.log("Simplify options (", this.props.localOptions.length, ") end in: ", new Date().getTime() - now, "ms");
                }
                var options = this._preProcessOptions(data, localProvider);
                this.props.addNewOptions(options);
            }

            this.setState({ isLoadingExternally: false });
        }
    }, {
        key: '_preProcessOptions',
        value: function _preProcessOptions(options, provider) {
            return options.map(function (option) {
                return (0, _extends3.default)({}, option, {
                    state: option['state'] ? option['state'] : optionStateEnum.EXTERNAL,
                    providers: [provider]
                });
            });
        }
    }, {
        key: '_getResultsFromHistory',
        value: function _getResultsFromHistory(searchString) {
            searchString = searchString.toLowerCase();
            var history = this.props.history;

            for (var i = 0; i < history.length; i++) {
                if (history[i].searchString.toLowerCase() === searchString) {
                    if (Date.now() < history[i].validTo) {
                        return history[i].data;
                    }
                }
            }
            return [];
        }
    }, {
        key: '_simplyfyData',
        value: function _simplyfyData(responseData, valueKey, childrenKey) {
            var result = [];
            if (!responseData || responseData.length === 0) return result;

            for (var i = 0; i < responseData.length; i++) {
                //deep clone
                var data = JSON.parse((0, _stringify2.default)(responseData[i]));
                result = result.concat(this._simplyfyData(data[childrenKey], valueKey, childrenKey));
                data[childrenKey] = data[childrenKey].map(function (xdata) {
                    return xdata[valueKey];
                });
                result = result.concat(data);
            }

            return result;
        }
    }, {
        key: '_getResponses',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(searchString) {
                var _this2 = this;

                var responses, promises;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                responses = [];
                                promises = [];

                                this.props.providers.forEach(function () {
                                    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(provider) {
                                        var p;
                                        return _regenerator2.default.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        p = provider.response(searchString).then(function (responseData) {
                                                            if ("toJsonArr" in provider) {
                                                                responseData = provider.toJsonArr(responseData);
                                                            } else if (typeof responseData === 'string' || responseData instanceof String) {
                                                                if ((0, _testFunctions.isXML)(responseData)) responseData = (0, _testFunctions.xmlToJson)(responseData);else if ((0, _testFunctions.isJson)(responseData)) responseData = JSON.parse(responseData);else responseData = (0, _testFunctions.csvToJson)(responseData); //TODO may throw error
                                                            }

                                                            var simpleData = false;
                                                            if ("simpleTreeData" in provider) {
                                                                simpleData = provider.simpleTreeData;
                                                            }
                                                            responses.push({ provider: provider, simpleData: simpleData, responseData: responseData });
                                                            //console.log("_getResponses for: ", provider.name, "finished")
                                                        });

                                                        promises.push(p);

                                                    case 2:
                                                    case 'end':
                                                        return _context.stop();
                                                }
                                            }
                                        }, _callee, _this2);
                                    }));

                                    return function (_x2) {
                                        return _ref2.apply(this, arguments);
                                    };
                                }());

                                _context2.next = 5;
                                return _promise2.default.all(promises).catch(function (error) {
                                    return console.log(error);
                                });

                            case 5:
                                return _context2.abrupt('return', responses);

                            case 6:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function _getResponses(_x) {
                return _ref.apply(this, arguments);
            }

            return _getResponses;
        }()
    }, {
        key: '_onInputChange',
        value: function _onInputChange(searchString) {
            var _this3 = this;

            if (searchString && this.props.providers.length > 0) {
                var historyData = [];
                for (var i = searchString.length; i > 0; i--) {
                    if (historyData.length > 0) break;
                    var substring = searchString.substring(0, i);
                    historyData = this._getResultsFromHistory(substring);
                }

                if (historyData.length === 0 && !this.fetching) {
                    this.setState({ isLoadingExternally: true });
                    var data = [];

                    this.fetching = this._getResponses().then(function (responses) {

                        _this3.props.addToHistory(searchString, responses, Date.now() + App._getValidForInSec(_this3.props.termLifetime));

                        responses.forEach(function (response) {
                            //default value for this attributes
                            response.provider.labelKey = response.provider.labelKey ? response.provider.labelKey : 'label';
                            response.provider.valueKey = response.provider.valueKey ? response.provider.valueKey : 'value';
                            response.provider.childrenKey = response.provider.childrenKey ? response.provider.childrenKey : 'children';

                            if (response.simpleData) {
                                data = data.concat(_this3._preProcessOptions(response.responseData, response.provider));
                            } else {
                                var simplifiedData = _this3._simplyfyData(response.responseData, response.provider.valueKey, response.provider.childrenKey);
                                data = data.concat(_this3._preProcessOptions(simplifiedData, response.provider));
                            }
                        });

                        _this3.fetching = false;
                        _this3.props.addNewOptions(data);
                        _this3.setState({ isLoadingExternally: false });
                    });
                }
            }

            this.props.setCurrentSearchInput(searchString);
            if ("onInputChange" in this.props) {
                this.props.onInputChange(searchString);
            }
        }

        //custom renderer

    }, {
        key: '_optionRenderer',
        value: function _optionRenderer(_ref3) {
            var focusedOption = _ref3.focusedOption,
                focusOption = _ref3.focusOption,
                key = _ref3.key,
                option = _ref3.option,
                selectValue = _ref3.selectValue,
                style = _ref3.style,
                valueArray = _ref3.valueArray,
                _onToggleClick = _ref3.onToggleClick;


            var className = ['VirtualizedSelectOption'];

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

            var events = option.disabled ? {} : {
                onClick: function onClick() {
                    return selectValue(option);
                },
                onMouseEnter: function onMouseEnter() {
                    return focusOption(option);
                },
                onToggleClick: function onToggleClick() {
                    return _onToggleClick();
                }
            };

            return _react2.default.createElement(_resultItem2.default, (0, _extends3.default)({
                className: className.join(' '),
                key: key,
                style: style,
                option: option
            }, events));
        }
    }, {
        key: '_valueRenderer',
        value: function _valueRenderer(option, x) {
            if (Array.isArray(option)) {
                option = option[0];
            }
            var value = option[option.providers[0].valueKey];
            var label = option[option.providers[0].labelKey];

            if (App._isURL(value)) return _react2.default.createElement(
                'a',
                { href: value, target: '_blank' },
                label
            );
            return label;
        }
    }, {
        key: '_onOptionCreate',
        value: function _onOptionCreate(option) {

            this.props.addNewOptions([option]);
            if (option.parent) this.props.addChildrenToParent(option[option.providers[0].valueKey], option.parent);

            if ("onOptionCreate" in this.props) {
                this.props.onOptionCreate(option);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            return _react2.default.createElement(
                'div',
                { className: 'container-fluid' },
                _react2.default.createElement(_settings2.default, { onOptionCreate: this._onOptionCreate }),
                _react2.default.createElement(_virtualizedTreeSelect2.default, (0, _extends3.default)({
                    name: 'react-virtualized-tree-select',

                    onChange: function onChange(selectValue) {
                        return _this4.props.addSelectedOption(selectValue);
                    },
                    value: this.props.selectedOptions,

                    optionRenderer: this._optionRenderer,
                    valueRenderer: this._valueRenderer,

                    isLoading: this.state.isLoadingExternally

                }, this.props, {
                    onInputChange: function onInputChange(input) {
                        return _this4._onInputChange(input);
                    },
                    options: this.props.options
                }, this.props.settings))
            );
        }
    }], [{
        key: '_parseTermLifetime',
        value: function _parseTermLifetime(value) {
            var termLifetime = {
                days: 0,
                hours: 0,
                minutes: 30,
                seconds: 0
            };
            if (/^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/.test(value)) {
                var tmp = /^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/.exec(value);
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
    }, {
        key: '_getValidForInSec',
        value: function _getValidForInSec(termLifetime) {
            termLifetime = App._parseTermLifetime(termLifetime);
            var res = 0;
            res += isNaN(termLifetime.seconds) ? 0 : termLifetime.seconds;
            res += isNaN(termLifetime.minutes) ? 0 : termLifetime.minutes * 60;
            res += isNaN(termLifetime.hours) ? 0 : termLifetime.hours * 60 * 60;
            res += isNaN(termLifetime.days) ? 0 : termLifetime.days * 60 * 60 * 24;
            return res * 1000;
        }
    }, {
        key: '_isURL',
        value: function _isURL(str) {
            var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
            return pattern.test(str);
        }
    }]);
    return App;
}(_react.Component);

App.propTypes = {
    displayState: _propTypes2.default.bool,
    displayInfoOnHover: _propTypes2.default.bool,
    expanded: _propTypes2.default.bool,
    renderAsTree: _propTypes2.default.bool,
    multi: _propTypes2.default.bool,
    async: _propTypes2.default.bool,
    simpleTreeData: _propTypes2.default.bool,

    labelKey: _propTypes2.default.string,
    valueKey: _propTypes2.default.string,
    childrenKey: _propTypes2.default.string,
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
    }).isRequired)
};

App.defaultProps = {
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
    termLifetime: "5m"

};

var optionStateEnum = {
    MERGED: { label: 'Merged', color: 'warning', message: '' },
    EXTERNAL: { label: 'External', color: 'primary', message: '' },
    NEW: { label: 'New', color: 'success', message: 'not verified' },
    LOCAL: { label: 'Local', color: 'secondary', message: '' }
};

function mapStateToProps(state) {
    return {
        options: state.options.cashedOptions,
        history: state.options.history,
        selectedOptions: state.options.selectedOptions,
        other: state.other,
        settings: state.settings
    };
}

function mapDispatchToProps(dispatch) {
    return (0, _redux.bindActionCreators)({
        initSettings: _settingsActions.initSettings,
        addNewOptions: _optionsActions.addNewOptions,
        addChildrenToParent: _optionsActions.addChildrenToParent,
        toggleExpanded: _optionsActions.toggleExpanded,
        addSelectedOption: _optionsActions.addSelectedOption,
        setCurrentSearchInput: _otherActions.setCurrentSearchInput,
        addToHistory: _optionsActions.addToHistory
    }, dispatch);
}

var IntelligentTreeSelectComponent = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(App);

exports.IntelligentTreeSelectComponent = IntelligentTreeSelectComponent;
exports.optionStateEnum = optionStateEnum;