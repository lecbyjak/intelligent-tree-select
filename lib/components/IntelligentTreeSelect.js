"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IntelligentTreeSelect = void 0;

var _react = _interopRequireWildcard(require("react"));

var _settings = _interopRequireDefault(require("./settings"));

var _VirtualizedTreeSelect = require("./VirtualizedTreeSelect");

var _resultItem = _interopRequireDefault(require("./resultItem"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _Utils = require("./utils/Utils");

var _Constants = _interopRequireDefault(require("./utils/Constants"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

class IntelligentTreeSelect extends _react.Component {
  constructor(props, context) {
    super(props, context);
    this.fetching = false;
    this.completedNodes = {};
    this.history = [];
    this.searchString = '';
    this._onOptionCreate = this._onOptionCreate.bind(this);
    this._valueRenderer = this._valueRenderer.bind(this);
    this._optionRenderer = this._optionRenderer.bind(this);
    this._addSelectedOption = this._addSelectedOption.bind(this);
    this._onInputChange = this._onInputChange.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this.state = {
      expanded: this.props.expanded,
      multi: this.props.multi,
      options: [],
      selectedOptions: '',
      isLoadingExternally: false,
      update: 0
    };
  }

  componentDidMount() {
    let data = [];

    if (this.props.name && this.props.fetchOptions) {
      data = this._retrieveCachedData();
    }

    if (data.length === 0) {
      data = this.props.options;
    }

    if (!this.props.simpleTreeData) {
      data = this._simplifyData(this.props.options);
    }

    this._addNewOptions(data);

    this._loadOptions();
  }

  _retrieveCachedData() {
    let cachedData = window.localStorage.getItem(this.props.name);

    if (cachedData) {
      cachedData = JSON.parse(cachedData);
      return cachedData.validTo > Date.now() ? cachedData.data : [];
    }
  }

  _loadOptions() {
    if (this.state.options.length === 0 && this.props.fetchOptions) {
      if (!this.fetching) {
        this.setState({
          isLoadingExternally: true
        });
        let data = [];
        this.fetching = this._getResponse('', '', this.props.fetchLimit, 0).then(response => {
          if (!this.props.simpleTreeData) {
            data = this._simplifyData(response);
          } else {
            data = response;
          }

          this.fetching = false;

          this._addNewOptions(data);

          this.setState({
            isLoadingExternally: false
          });
        });
      }
    }
  }
  /**
   * Resets the option, forcing the component to reload them from the server/reload them from props.
   */


  resetOptions() {
    if (this.props.fetchOptions) {
      this.setState({
        options: []
      }, () => {
        // Reload options after reset
        this._loadOptions();
      });
    } else {
      this.setState({
        options: []
      }, () => {
        // Reset options from props
        this._addNewOptions(this.props.options);
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.fetchOptions && prevProps.options !== this.props.options) {
      this.setState({
        options: []
      }, () => {
        // Reset options from props
        this._addNewOptions(this.props.options);
      });
    }
  }

  _isInHistory(searchString) {
    searchString = searchString.toLowerCase();

    for (let i = 0; i < this.history.length; i++) {
      if (this.history[i].searchString.toLowerCase() === searchString) {
        if (Date.now() < this.history[i].validTo) {
          return true;
        }
      }
    }

    return false;
  }

  _simplifyData(responseData) {
    let result = [];
    const {
      valueKey,
      childrenKey
    } = this.props;
    if (!responseData || responseData.length === 0) return result;

    for (let i = 0; i < responseData.length; i++) {
      //deep clone
      let data = JSON.parse(JSON.stringify(responseData[i]));
      result = result.concat(this._simplifyData(data[childrenKey], valueKey, childrenKey));

      if (data[childrenKey]) {
        data[childrenKey] = Array.isArray(data[childrenKey]) ? data[childrenKey].map(xdata => xdata[valueKey]) : data[childrenKey][valueKey];
      }

      result = result.concat(data);
    }

    return result;
  }

  _parseOptionLifetime(value) {
    let optionLifetime = {
      days: 0,
      hours: 0,
      minutes: 30,
      seconds: 0
    };

    if (/^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/.test(value)) {
      let tmp = /^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/.exec(value);
      optionLifetime = {
        days: parseInt(tmp[1], 10),
        hours: parseInt(tmp[2], 10),
        minutes: parseInt(tmp[3], 10),
        seconds: parseInt(tmp[4], 10)
      };
    } else {
      throw new Error('Invalid optionLifetime. Expecting format: e.g. 1d10h5m6s ');
    }

    return optionLifetime;
  }

  _getValidForInSec(optionLifetime) {
    optionLifetime = this._parseOptionLifetime(optionLifetime);
    let res = 0;
    res += isNaN(optionLifetime.seconds) ? 0 : optionLifetime.seconds;
    res += isNaN(optionLifetime.minutes) ? 0 : optionLifetime.minutes * 60;
    res += isNaN(optionLifetime.hours) ? 0 : optionLifetime.hours * 60 * 60;
    res += isNaN(optionLifetime.days) ? 0 : optionLifetime.days * 60 * 60 * 24;
    return res * 1000;
  }

  _getRootNodesCount() {
    let count = 0;
    this.state.options.forEach(option => {
      if (option.depth === 0) count++;
    });
    return count;
  }

  async _getResponse(searchString, optionID, limit, offset, option) {
    return this.props.fetchOptions ? await this.props.fetchOptions({
      searchString,
      optionID,
      limit,
      offset,
      option
    }) : [];
  }

  _onInputChange(searchString) {
    if (searchString && this.props.fetchOptions) {
      let dataCached = false;

      for (let i = searchString.length; i > 0; i--) {
        if (dataCached) break;
        let substring = searchString.substring(0, i);
        dataCached = this._isInHistory(substring);
      }

      if (!dataCached && !this.fetching) {
        this.setState({
          isLoadingExternally: true
        });
        let data = [];
        let offset = 0;
        this.state.options.forEach(option => {
          if (option.depth === 0) offset++;
        }); //TODO figure out how to get all parents for matching node

        this.fetching = this._getResponse(searchString, '', this.props.fetchLimit, offset).then(response => {
          if (!this.props.simpleTreeData) {
            data = this._simplifyData(response);
          } else {
            data = response;
          }

          this._addToHistory(searchString, Date.now() + this._getValidForInSec(this.props.optionLifetime));

          this.fetching = false;

          this._addNewOptions(data);

          this.setState({
            isLoadingExternally: false
          });
        });
      }
    }

    this.searchString = searchString;

    if ('onInputChange' in this.props) {
      this.props.onInputChange(searchString);
    }
  }

  _onScroll(data) {
    const {
      clientHeight,
      scrollHeight,
      scrollTop
    } = data;

    if (scrollHeight - scrollTop <= 2.5 * clientHeight && !this.fetching) {
      // this.fetching = true;
      let totalOptionsHeight = 0;
      let topOptionIndex = 0;

      for (topOptionIndex; topOptionIndex < this.state.options.length; topOptionIndex++) {
        const option = this.state.options[topOptionIndex];
        totalOptionsHeight += this.props.optionHeight instanceof Function ? this.props.optionHeight({
          option
        }) : this.props.optionHeight;

        if (totalOptionsHeight >= scrollTop) {
          break;
        }
      }

      const topOption = this.state.options[topOptionIndex];
      let parentOption = this.state.options.find(option => option[this.props.valueKey] === topOption.parent);
      let offset = parentOption ? parentOption[this.props.childrenKey].length : this._getRootNodesCount();
      let parentOptionValue = parentOption ? parentOption[this.props.valueKey] : 'root';

      if (!this.completedNodes[parentOptionValue]) {
        this.setState({
          isLoadingExternally: true
        }); //fetch child options that are not completed

        this.fetching = this._getResponse('', topOption.parent, this.props.fetchLimit, offset, topOption).then(response => {
          if (!this.props.simpleTreeData) {
            data = this._simplifyData(response);
          } else {
            data = response;
          }

          if (data.length < this.props.fetchLimit) {
            //fetch parent options
            this.completedNodes[parentOptionValue] = true;
          }

          this.fetching = false;

          this._addNewOptions(data);

          this.setState({
            isLoadingExternally: false
          });
        });
      }
    }
  }

  _onOptionToggle(option) {
    if (!option.expanded) {
      option.expanded = true;

      let dataCached = this._isInHistory(option[this.props.valueKey]);

      if (!dataCached) {
        this.setState({
          isLoadingExternally: true
        });
        option.fetchingChild = true;
        let data = [];

        this._getResponse('', option[this.props.valueKey], this.props.fetchLimit, 0, option).then(response => {
          if (!this.props.simpleTreeData) {
            data = this._simplifyData(response);
          } else {
            data = response;
          }

          if (data.length < this.props.fetchLimit) {
            this.completedNodes[option[this.props.valueKey]] = true;
          }

          this._addToHistory(option[this.props.valueKey], Date.now() + this._getValidForInSec(this.props.optionLifetime));

          delete option.fetchingChild;
          this.state.options.forEach(o => {
            if (o[this.props.valueKey] === option[this.props.valueKey]) {
              o.expanded = true;
            }
          });

          this._addNewOptions(data);

          this.setState({
            isLoadingExternally: false
          });
        });
      }
    } else {
      option.expanded = false;
    }

    this.forceUpdate();
  }

  _optionRenderer({
    focusedOption,
    focusOption,
    key,
    option,
    selectValue,
    optionStyle,
    valueArray,
    toggleOption,
    searchString
  }) {
    const className = (0, _classnames.default)("VirtualizedSelectOption", {
      "VirtualizedSelectFocusedOption": option === focusedOption,
      "VirtualizedSelectDisabledOption": option.disabled,
      "VirtualizedSelectSelectedOption": valueArray && valueArray.indexOf(option) >= 0
    }, option.className);
    const events = option.disabled ? {} : {
      onClick: () => selectValue(option),
      onMouseEnter: () => focusOption(option),
      onToggleClick: () => toggleOption(option)
    };
    return /*#__PURE__*/_react.default.createElement(_resultItem.default, _extends({
      className: className,
      key: key,
      style: optionStyle,
      option: option,
      childrenKey: this.props.childrenKey,
      valueKey: this.props.valueKey,
      labelKey: this.props.labelKey,
      getOptionLabel: this.props.getOptionLabel,
      tooltipKey: this.props.tooltipKey,
      settings: {
        searchString,
        renderAsTree: this.props.renderAsTree,
        displayInfoOnHover: this.props.displayInfoOnHover
      }
    }, events));
  }

  static _isURL(str) {
    return str.startsWith("https://") || str.startsWith("http://");
  }

  _valueRenderer(option) {
    const {
      valueKey,
      labelKey,
      getOptionLabel
    } = this.props;
    const value = option[valueKey];
    const label = (0, _Utils.getLabel)(option, labelKey, getOptionLabel);
    if (IntelligentTreeSelect._isURL(value)) return /*#__PURE__*/_react.default.createElement("a", {
      href: value,
      target: "_blank"
    }, label);
    return label;
  }

  _onOptionCreate(option) {
    if (option.parent) {
      this._addChildrenToParent(option[this.props.valueKey], option.parent);
    }

    this._addNewOptions([option]);

    if ('onOptionCreate' in this.props) {
      this.props.onOptionCreate(option);
    }
  }

  _addNewOptions(newOptions) {
    const {
      valueKey,
      childrenKey,
      fetchOptions,
      name
    } = this.props;

    const _toArray = object => {
      if (!Array.isArray(object[childrenKey])) {
        if (object[childrenKey]) object[childrenKey] = [object[childrenKey]];else object[childrenKey] = [];
      }

      return object;
    };

    const x = this.state.options;
    let options = x.concat(newOptions);
    let mergedArr = []; //merge options

    while (options.length > 0) {
      let currOption = options.shift();
      currOption = _toArray(currOption);
      let conflicts = options.filter(object => {
        return object[valueKey] === currOption[valueKey];
      });
      conflicts.forEach(conflict => {
        conflict = _toArray(conflict);
        options.splice(options.findIndex(el => el[valueKey] === conflict[valueKey]), 1);
      });
      mergedArr.push(Object.assign({}, currOption, ...conflicts.reverse()));
    }

    if (name && fetchOptions) {
      window.localStorage.setItem(name, JSON.stringify({
        validTo: Date.now() + this._getValidForInSec(this.props.optionLifetime),
        data: options
      }));
    }

    this.setState({
      options: mergedArr,
      update: ++this.state.update
    });
  }

  _addChildrenToParent(childrenID, parentID) {
    let parentOption = this.state.options.find(x => x[this.props.valueKey] === parentID);
    let children = parentOption[this.props.childrenKey];
    if (children.indexOf(childrenID) === -1) children.push(childrenID);
  }

  _addSelectedOption(selectedOptions) {
    this.setState({
      selectedOptions
    });
  }

  _addToHistory(searchString, validTo) {
    this.history.unshift({
      searchString,
      validTo
    });
  }

  render() {
    let listProps = {};
    listProps.onScroll = this.props.onScroll || this._onScroll;
    const optionRenderer = this.props.optionRenderer || this._optionRenderer;
    const valueRenderer = this.props.valueRenderer || this._valueRenderer;
    const me = this;

    function optionRendererWrapper(params) {
      const args = Object.assign(params, {
        toggleOption: me._onOptionToggle.bind(me),
        searchString: me.searchString
      });
      return optionRenderer(args);
    } // Ensure optionRendererWrapper is not overridden by the props version


    const propsToPass = Object.assign({}, this.props);
    delete propsToPass.optionRenderer;
    delete propsToPass.onScroll;
    return /*#__PURE__*/_react.default.createElement("div", null, this.props.showSettings && /*#__PURE__*/_react.default.createElement(_settings.default, {
      onOptionCreate: this._onOptionCreate,
      formComponent: this.props.formComponent,
      openButtonLabel: this.props.openButtonLabel,
      openButtonTooltipLabel: this.props.openButtonTooltipLabel,
      formData: {
        labelKey: this.props.labelKey,
        valueKey: this.props.valueKey,
        childrenKey: this.props.childrenKey,
        options: this.state.options,
        onOptionCreate: this._onOptionCreate
      }
    }), /*#__PURE__*/_react.default.createElement(_VirtualizedTreeSelect.VirtualizedTreeSelect, _extends({
      name: "react-virtualized-tree-select",
      onChange: this._addSelectedOption,
      value: this.state.selectedOptions,
      optionRenderer: optionRendererWrapper,
      valueRenderer: valueRenderer
    }, propsToPass, {
      expanded: this.state.expanded,
      renderAsTree: this.props.renderAsTree,
      multi: this.state.multi,
      isLoading: this.state.isLoadingExternally,
      onInputChange: this._onInputChange,
      options: this.state.options,
      listProps: listProps,
      update: this.state.update
    })));
  }

}

exports.IntelligentTreeSelect = IntelligentTreeSelect;
IntelligentTreeSelect.propTypes = {
  isMenuOpen: _propTypes.default.bool,
  childrenKey: _propTypes.default.string,
  displayInfoOnHover: _propTypes.default.bool,
  expanded: _propTypes.default.bool,
  fetchLimit: _propTypes.default.number,
  fetchOptions: _propTypes.default.func,
  labelKey: _propTypes.default.string,
  getOptionLabel: _propTypes.default.func,
  multi: _propTypes.default.bool,
  name: _propTypes.default.string,
  onInputChange: _propTypes.default.func,
  onOptionCreate: _propTypes.default.func,
  optionHeight: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.func]),
  options: _propTypes.default.array,
  renderAsTree: _propTypes.default.bool,
  showSettings: _propTypes.default.bool,
  simpleTreeData: _propTypes.default.bool,
  optionLifetime: _propTypes.default.string,
  valueKey: _propTypes.default.string,
  tooltipKey: _propTypes.default.string,
  optionRenderer: _propTypes.default.func,
  valueRenderer: _propTypes.default.func
};
IntelligentTreeSelect.defaultProps = {
  childrenKey: _Constants.default.CHILDREN_KEY,
  labelKey: _Constants.default.LABEL_KEY,
  valueKey: _Constants.default.VALUE_KEY,
  displayInfoOnHover: false,
  showSettings: true,
  expanded: false,
  multi: true,
  options: [],
  renderAsTree: true,
  isMenuOpen: false,
  simpleTreeData: true,
  optionLifetime: '5m',
  fetchLimit: 100,
  optionHeight: 25
};