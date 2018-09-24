'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IntelligentTreeSelect = undefined;

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
      displayInfoOnHover: this.props.displayInfoOnHover,
      expanded: this.props.expanded,
      renderAsTree: this.props.renderAsTree,
      multi: this.props.multi,
      options: [],
      selectedOptions: '',
      isLoadingExternally: false
    };
  }

  componentWillMount() {
    this.fetching = false;
    this.completedNodes = {};
    this.history = [];
    let data = [];
    this.searchString = '';
    this.key = this.props.name || this._getRandomKey();

    if (!this.props.name) {
      window.onunload = () => window.localStorage.removeItem(this.key);
    }

    let cashedData = window.localStorage.getItem(this.key);
    if (cashedData) {
      cashedData = JSON.parse(cashedData);
      if (cashedData.validTo > Date.now()) data = cashedData.data;
    }
    if (data.length === 0) data = this.props.options;

    if (!this.props.simpleTreeData) data = this._simplyfyData(this.props.options);

    this._addNewOptions(data);
    this.setState({ isLoadingExternally: false });
  }

  componentWillUnmount() {
    if (!this.props.name) window.localStorage.removeItem(this.key);
  }

  componentDidMount() {
    if (this.state.options.length === 0 && this.props.fetchOptions) {
      if (!this.fetching) {
        this.setState({ isLoadingExternally: true });
        let data = [];
        let offset = 0;

        this.state.options.forEach(option => {
          if (option.depth === 0) offset++;
        });

        //TODO figure out how to get all parents for matching node
        this.fetching = this._getResponse('', '', this.props.fetchLimit, offset).then(response => {

          if (!this.props.simpleTreeData) {
            data = this._simplyfyData(response);
          } else {
            data = response;
          }
          this.fetching = false;
          this._addNewOptions(data);
          this.setState({ isLoadingExternally: false });
        });
      }
    }
  }

  _getRandomKey() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

    return 'cashed_data_' + text;
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

  _simplyfyData(responseData) {
    let result = [];
    const { valueKey, childrenKey } = this.props;

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

  async _getResponse(searchString, optionID, limit, offset) {
    return this.props.fetchOptions ? await this.props.fetchOptions({ searchString, optionID, limit, offset }) : [];
  }

  _onInputChange(searchString) {
    if (searchString && this.props.fetchOptions) {

      let dataCashed = false;
      for (let i = searchString.length; i > 0; i--) {
        if (dataCashed) break;
        let substring = searchString.substring(0, i);
        dataCashed = this._isInHistory(substring);
      }

      if (!dataCashed && !this.fetching) {
        this.setState({ isLoadingExternally: true });
        let data = [];
        let offset = 0;

        this.state.options.forEach(option => {
          if (option.depth === 0) offset++;
        });

        //TODO figure out how to get all parents for matching node
        this.fetching = this._getResponse(searchString, '', this.props.fetchLimit, offset).then(response => {

          if (!this.props.simpleTreeData) {
            data = this._simplyfyData(response);
          } else {
            data = response;
          }

          this._addToHistory(searchString, Date.now() + this._getValidForInSec(this.props.optionLifetime));
          this.fetching = false;
          this._addNewOptions(data);
          this.setState({ isLoadingExternally: false });
        });
      }
    }

    this.searchString = searchString;
    if ('onInputChange' in this.props) {
      this.props.onInputChange(searchString);
    }
  }

  _onScroll(data) {
    const { clientHeight, scrollHeight, scrollTop } = data;

    if (scrollHeight - scrollTop <= 2.5 * clientHeight && !this.fetching) {

      this.fetching = true;
      let totalOptionsHeight = 0;
      let topOptionIndex = 0;

      for (topOptionIndex; topOptionIndex < this.state.options.length; topOptionIndex++) {

        const option = this.state.options[topOptionIndex];

        totalOptionsHeight += this.props.optionHeight instanceof Function ? this.props.optionHeight({ option }) : this.props.optionHeight;

        if (totalOptionsHeight >= scrollTop) {
          break;
        }
      }

      const topOption = this.state.options[topOptionIndex];
      let parentOption = this.state.options.find(option => option[this.props.valueKey] === topOption.parent);
      let offset = parentOption ? parentOption[this.props.childrenKey].length : this._getRootNodesCount();
      let parentOptionValue = parentOption ? parentOption[this.props.valueKey] : 'root';

      if (!this.completedNodes[parentOptionValue]) {
        this.setState({ isLoadingExternally: true });
        //fetch child options that are not completed
        this.fetching = this._getResponse('', topOption.parent, this.props.fetchLimit, offset).then(response => {

          if (!this.props.simpleTreeData) {
            data = this._simplyfyData(response);
          } else {
            data = response;
          }

          if (data.length < this.props.fetchLimit) {
            //fetch parent options
            this.completedNodes[parentOptionValue] = true;
            let totalOptionFetched = data.length;

            parentOption = parentOption ? this.state.options.find(option => option[this.props.valueKey] === parentOption.parent) : null;
            offset = parentOption ? parentOption[this.props.childrenKey].length : this._getRootNodesCount();
            parentOptionValue = parentOption ? parentOption[this.props.valueKey] : 'root';

            while (parentOption) {
              if (!this.completedNodes[parentOptionValue]) {

                //fetch child options that are not completed
                this.fetching = this._getResponse('', topOption.parent, this.props.fetchLimit - totalOptionFetched, offset).then(response => {

                  if (!this.props.simpleTreeData) {
                    data = this._simplyfyData(response);
                  } else {
                    data = response;
                  }

                  this.fetching = false;
                  this._addNewOptions(data);
                });
              }
            }
          }

          this.fetching = false;
          this._addNewOptions(data);
          this.setState({ isLoadingExternally: false });
        });
      }
    }
  }

  _onOptionExpand(option) {
    if (option.expanded) {

      let dataCashed = this._isInHistory(option[this.props.valueKey]);

      if (!dataCashed) {
        this.setState({ isLoadingExternally: true });
        option.fetchingChild = true;
        let data = [];

        this._getResponse('', option[this.props.valueKey], this.props.fetchLimit, 0).then(response => {

          if (!this.props.simpleTreeData) {
            data = this._simplyfyData(response);
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
          this.setState({ isLoadingExternally: false });
        });
      }
    }
    this.forceUpdate();
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
      onToggleClick: () => this._onOptionExpand(option)
    };

    return _react2.default.createElement(_resultItem2.default, _extends({
      className: className.join(' '),
      key: key,
      style: optionStyle,
      option: option,
      childrenKey: this.props.childrenKey,
      valueKey: this.props.valueKey,
      labelKey: this.props.labelKey,
      labelValue: this.props.labelValue,
      settings: {
        searchString: this.searchString,
        renderAsTree: this.state.renderAsTree,
        displayInfoOnHover: this.state.displayInfoOnHover
      }
    }, events));
  }

  static _isURL(str) {
    return str.startsWith("https://") || str.startsWith("http://");
  }

  _valueRenderer(option, x) {
    const value = option[this.props.valueKey];
    const label = option[this.props.labelKey];

    if (IntelligentTreeSelect._isURL(value)) return _react2.default.createElement(
      'a',
      { href: value, target: '_blank' },
      label
    );
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
    const { valueKey, childrenKey } = this.props;
    const _toArray = object => {

      if (!Array.isArray(object[childrenKey])) {
        if (object[childrenKey]) object[childrenKey] = [object[childrenKey]];else object[childrenKey] = [];
      }
      return object;
    };

    const x = this.state.options;
    let options = x.concat(newOptions);
    let mergedArr = [];

    //merge options
    while (options.length > 0) {
      let currOption = options.shift();

      currOption = _toArray(currOption);

      let conflicts = options.filter(object => {
        return object[valueKey] === currOption[valueKey];
      });
      conflicts.forEach(conflict => {
        conflict = _toArray(conflict);
        let a = currOption[childrenKey];
        let b = conflict[childrenKey];
        currOption[childrenKey] = a.concat(b.filter(item => a.indexOf(item) < 0));
      });
      mergedArr.push(Object.assign({}, ...conflicts.reverse(), currOption));
      conflicts.forEach(conflict => options.splice(options.findIndex(el => el[valueKey] === conflict[valueKey]), 1));
    }

    window.localStorage.setItem(this.key, JSON.stringify({
      validTo: Date.now() + this._getValidForInSec(this.props.optionLifetime),
      data: mergedArr
    }));

    this.setState({ options: mergedArr });
  }

  _onSettingsChange(payload) {
    if (payload.hasOwnProperty('expanded')) {
      //TODO fetch data
      this.state.options.forEach(option => option.expanded = payload.expanded);
      payload.options = this.state.options;
    }

    this.setState(_extends({}, payload));
  }

  _addChildrenToParent(childrenID, parentID) {

    let parentOption = this.state.options.find(x => x[this.props.valueKey] === parentID);
    let children = parentOption[this.props.childrenKey];
    if (children.indexOf(childrenID) === -1) children.push(childrenID);
  }

  _addSelectedOption(selectedOptions) {
    this.setState({ selectedOptions });
  }

  _addToHistory(searchString, validTo) {
    this.history.unshift({ searchString, validTo });
  }

  render() {

    let listProps = {};
    listProps.onScroll = this.props.onScroll || this._onScroll;
    return _react2.default.createElement(
      'div',
      { className: 'container-fluid' },
      this.props.showSettings && _react2.default.createElement(_settings2.default, { onOptionCreate: this._onOptionCreate,
        onSettingsChange: this._onSettingsChange,
        data: {
          displayInfoOnHover: this.state.displayInfoOnHover,
          expanded: this.state.expanded,
          renderAsTree: this.state.renderAsTree,
          multi: this.state.multi
        },
        formComponent: this.props.formComponent,
        filterComponent: this.props.filterComponent,
        openButtonLabel: this.props.openButtonLabel,
        openButtonTooltipLabel: this.props.openButtonTooltipLabel,
        formData: {
          labelKey: this.props.labelKey || 'label',
          valueKey: this.props.valueKey || 'value',
          childrenKey: this.props.childrenKey || 'children',
          options: this.state.options,
          onOptionCreate: this._onOptionCreate
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
        isLoading: this.state.isLoadingExternally,
        onInputChange: this._onInputChange,
        options: this.state.options,
        listProps: listProps
      }))
    );
  }

}

IntelligentTreeSelect.propTypes = {
  isMenuOpen: _propTypes2.default.bool,
  childrenKey: _propTypes2.default.string,
  displayInfoOnHover: _propTypes2.default.bool,
  expanded: _propTypes2.default.bool,
  fetchLimit: _propTypes2.default.number,
  fetchOptions: _propTypes2.default.func,
  formComponent: _propTypes2.default.func,
  filterComponent: _propTypes2.default.func,
  labelKey: _propTypes2.default.string,
  labelValue: _propTypes2.default.func,
  multi: _propTypes2.default.bool,
  name: _propTypes2.default.string,
  onInputChange: _propTypes2.default.func,
  onOptionCreate: _propTypes2.default.func,
  optionHeight: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.func]),
  options: _propTypes2.default.array,
  renderAsTree: _propTypes2.default.bool,
  showSettings: _propTypes2.default.bool,
  simpleTreeData: _propTypes2.default.bool,
  optionLifetime: _propTypes2.default.string,
  valueKey: _propTypes2.default.string
};

IntelligentTreeSelect.defaultProps = {
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

exports.IntelligentTreeSelect = IntelligentTreeSelect;