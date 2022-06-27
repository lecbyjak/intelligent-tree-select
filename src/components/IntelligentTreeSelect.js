import React, {Component} from 'react';

import {VirtualizedTreeSelect} from './VirtualizedTreeSelect';
import PropTypes from 'prop-types';
import {getLabel, isURL} from "./utils/Utils";
import Constants from "./utils/Constants";

class IntelligentTreeSelect extends Component {

  constructor(props, context) {
    super(props, context);

    this.fetching = false;
    this.completedNodes = {};
    this.history = [];
    this.searchString = '';

    this._onOptionCreate = this._onOptionCreate.bind(this);
    this._valueRenderer = this._valueRenderer.bind(this);
    this._addSelectedOption = this._addSelectedOption.bind(this);
    this._onInputChange = this._onInputChange.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onOptionToggle = this._onOptionToggle.bind(this);
    this._onOptionClose = this._onOptionClose.bind(this);

    this.state = {
      expanded: this.props.expanded,
      multi: this.props.multi,
      options: [],
      selectedOptions: '',
      isLoadingExternally: false,
      update: 0,
    };
    this.select = React.createRef();
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
        this._fetchOptions("", "", 0);
      }
    }
  }

  _fetchOptions(searchString, optionId, offset, topOption, callback) {
    this.setState({isLoadingExternally: true});
    this.fetching = this._getResponse(searchString, optionId, this.props.fetchLimit, offset, topOption).then(response => {
        let data;
        if (!this.props.simpleTreeData) {
          data = this._simplifyData(response);
        } else {
          data = response;
        }
        this.fetching = false;
        this._addNewOptions(data);
        this.setState({isLoadingExternally: false});
        if (callback) {
          callback(data);
        }
      },
    );
  }

  /**
   * Resets the option, forcing the component to reload them from the server/reload them from props.
   */
  resetOptions() {
    if (this.props.fetchOptions) {
      this.setState({options: []}, () => {
        // Reload options after reset
        this._loadOptions();
      });
    } else {
      this.setState({options: []}, () => {
        // Reset options from props
        this._addNewOptions(this.props.options);
      });
    }
  }

  /**
   * Focuses the select input.
   */
  focus() {
    if (this.select.current) {
      this.select.current.focus();
    }
  }

  /**
   * Blurs the select input.
   */
  blurInput() {
    if (this.select.current) {
      this.select.current.blurInput();
    }
  }

  /**
   * Gets the current options provided by this component.
   */
  getOptions() {
    return this.state.options.slice();
  }

  componentDidUpdate(prevProps) {
    if (!this.props.fetchOptions && prevProps.options !== this.props.options) {
      this.setState({options: []}, () => {
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
    const {valueKey, childrenKey} = this.props;

    if (!responseData || responseData.length === 0) return result;

    for (let i = 0; i < responseData.length; i++) {
      //deep clone
      let data = JSON.parse(JSON.stringify(responseData[i]));
      result = result.concat(
        this._simplifyData(data[childrenKey], valueKey, childrenKey));
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
      seconds: 0,
    };
    if (/^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/.test(value)) {
      let tmp = /^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/.exec(value);
      optionLifetime = {
        days: parseInt(tmp[1], 10),
        hours: parseInt(tmp[2], 10),
        minutes: parseInt(tmp[3], 10),
        seconds: parseInt(tmp[4], 10),
      };
    } else {
      throw new Error(
        'Invalid optionLifetime. Expecting format: e.g. 1d10h5m6s ');
    }
    return optionLifetime;
  }

  _getValidForInSec(optionLifetime) {
    optionLifetime = this._parseOptionLifetime(optionLifetime);
    let res = 0;
    res += (isNaN(optionLifetime.seconds) ? 0 : optionLifetime.seconds);
    res += (isNaN(optionLifetime.minutes) ? 0 : optionLifetime.minutes * 60);
    res += (isNaN(optionLifetime.hours) ? 0 : optionLifetime.hours * 60 * 60);
    res += (isNaN(optionLifetime.days) ? 0 : optionLifetime.days * 60 * 60 * 24);
    return res * 1000;
  }

  _getRootNodesCount() {
    let count = 0;
    this.state.options.forEach(option => {
      if (option.depth === 0) count++
    });
    return count
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
        let data = [];
        let offset = 0;

        this.state.options.forEach(option => {
          if (option.depth === 0) offset++;
        });

        if (this.searchTimer) {
          clearTimeout(this.searchTimer);
        }
        if (this.props.searchDelay) {
          this.searchTimer = setTimeout(() => {
            this._invokeSearch(searchString, offset);
          }, this.props.searchDelay);
        } else {
          this._invokeSearch(searchString, offset);
        }
      }
    }

    this.searchString = searchString;
    if ('onInputChange' in this.props) {
      this.props.onInputChange(searchString);
    }
  }

  _invokeSearch(searchString, offset) {
    this._fetchOptions(searchString, "", offset, undefined, () => {
      this._addToHistory(searchString, Date.now() + this._getValidForInSec(this.props.optionLifetime));
      this.select.current.filterValues(searchString);
    });
  }

  _onScroll(data) {
    const {clientHeight, scrollHeight, scrollTop} = data;

    if ((scrollHeight - scrollTop <= 2.5 * clientHeight) && !this.fetching) {

      // this.fetching = true;
      let totalOptionsHeight = 0;
      let topOptionIndex = 0;

      for (topOptionIndex; topOptionIndex < this.state.options.length; topOptionIndex++) {

        const option = this.state.options[topOptionIndex];

        totalOptionsHeight += this.props.optionHeight instanceof Function
          ? this.props.optionHeight({option})
          : this.props.optionHeight;

        if (totalOptionsHeight >= scrollTop) {
          break;
        }
      }

      const topOption = this.state.options[topOptionIndex];
      let parentOption = this.state.options.find(option => option[this.props.valueKey] === topOption.parent);
      let offset = parentOption ? parentOption[this.props.childrenKey].length : this._getRootNodesCount();
      let parentOptionValue = parentOption ? parentOption[this.props.valueKey] : 'root';

      if (!this.completedNodes[parentOptionValue]) {
        //fetch child options that are not completed
        this._fetchOptions("", topOption.parent, offset, topOption, (fetchedData) => {
          if (fetchedData.length < this.props.fetchLimit) {
            //fetch parent options
            this.completedNodes[parentOptionValue] = true;
          }
        });
      }
    }
  }

  _onOptionToggle(option) {
    if (!option.expanded) {
      option.expanded = true;
      let dataCached = this._isInHistory(option[this.props.valueKey]);

      if (!dataCached) {
        this.setState({isLoadingExternally: true});
        option.fetchingChild = true;
        let data = [];

        this._getResponse('', option[this.props.valueKey], this.props.fetchLimit, 0, option).then(response => {

            if (!this.props.simpleTreeData) {
              data = this._simplifyData(response);
            } else {
              data = response;
            }

            if (data.length < this.props.fetchLimit) {
              this.completedNodes[option[this.props.valueKey]] = true
            }

            this._addToHistory(option[this.props.valueKey], Date.now() + this._getValidForInSec(this.props.optionLifetime));

            delete option.fetchingChild;

            this._addNewOptions(data);
            this.setState({isLoadingExternally: false});
          },
        );

      }
    } else {
      this._onOptionClose(option)
    }
    this.forceUpdate();
  }

  _onOptionClose(option) {
    if (option === undefined)
      return;

    option.expanded = false;
    for (const subTermId of option[this.props.childrenKey]) {
      const subTerm = this.state.options.find((term) => term[this.props.valueKey] === subTermId);
      this._onOptionClose(subTerm)
    }
  }

  _valueRenderer(option) {
    if (this.props.valueRenderer) {
      if(typeof option == "string"){
        option = this.state.options.find((term) => term[this.props.valueKey] === option);
      }
      return this.props.valueRenderer(option);
    }
    const {valueKey, labelKey, getOptionLabel} = this.props;
    const value = option[valueKey];
    const label = getLabel(option, labelKey, getOptionLabel);

    if (isURL(value)) return (
      <a href={value} target="_blank">{label}</a>
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
    const {valueKey, childrenKey, fetchOptions, name} = this.props;
    const _toArray = (object) => {

      if (!Array.isArray(object[childrenKey])) {
        if (object[childrenKey]) object[childrenKey] = [object[childrenKey]];
        else object[childrenKey] = [];
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
        options.splice(options.findIndex(el => el[valueKey] === conflict[valueKey]), 1);
      });
      mergedArr.push(Object.assign({}, currOption, ...conflicts.reverse()));
    }

    if (name && fetchOptions) {
      window.localStorage.setItem(name,
        JSON.stringify(
          {
            validTo: Date.now() + this._getValidForInSec(this.props.optionLifetime),
            data: options,
          },
        ),
      );
    }

    this.setState({options: mergedArr, update: ++this.state.update});
  }

  _addChildrenToParent(childrenID, parentID) {

    let parentOption = this.state.options.find(
      x => x[this.props.valueKey] === parentID);
    let children = parentOption[this.props.childrenKey];
    if (children.indexOf(childrenID) === -1) children.push(childrenID);
  }

  _addSelectedOption(selectedOptions) {
    this.setState({selectedOptions});
  }

  _addToHistory(searchString, validTo) {
    this.history.unshift({searchString, validTo});
  }

  render() {

    let listProps = {};
    listProps.onScroll = this.props.onScroll || this._onScroll;
    const valueRenderer = this._valueRenderer;
    const propsToPass = Object.assign({}, this.props);
    delete propsToPass.valueRenderer;
    delete propsToPass.onScroll;

    return (

      <div>
        <VirtualizedTreeSelect
          ref={this.select}
          name="react-virtualized-tree-select"

          onChange={this._addSelectedOption}
          value={this.state.selectedOptions}

          valueRenderer={valueRenderer}

          {...propsToPass}
          menuIsOpen={this.props.isMenuOpen}
          expanded={this.state.expanded}
          renderAsTree={this.props.renderAsTree}
          multi={this.state.multi}
          isLoading={this.state.isLoadingExternally}
          onInputChange={this._onInputChange}
          options={this.state.options}
          listProps={listProps}
          update={this.state.update}
          onOptionToggle={this._onOptionToggle}
        />
      </div>
    );
  }

}

IntelligentTreeSelect.propTypes = {
  isMenuOpen: PropTypes.bool,
  childrenKey: PropTypes.string,
  displayInfoOnHover: PropTypes.bool,
  expanded: PropTypes.bool,
  fetchLimit: PropTypes.number,
  fetchOptions: PropTypes.func,
  matchCheck: PropTypes.func,
  labelKey: PropTypes.string,
  getOptionLabel: PropTypes.func,
  multi: PropTypes.bool,
  name: PropTypes.string,
  onInputChange: PropTypes.func,
  onOptionCreate: PropTypes.func,
  optionHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  options: PropTypes.array,
  renderAsTree: PropTypes.bool,
  simpleTreeData: PropTypes.bool,
  optionLifetime: PropTypes.string,
  valueKey: PropTypes.string,
  tooltipKey: PropTypes.string,
  optionRenderer: PropTypes.func,
  valueRenderer: PropTypes.func,
  searchDelay: PropTypes.number,
  hideSelectedOptions: PropTypes.bool
};

IntelligentTreeSelect.defaultProps = {
  childrenKey: Constants.CHILDREN_KEY,
  labelKey: Constants.LABEL_KEY,
  valueKey: Constants.VALUE_KEY,
  displayInfoOnHover: false,
  expanded: false,
  multi: true,
  options: [],
  renderAsTree: true,
  isMenuOpen: false,
  simpleTreeData: true,
  optionLifetime: '5m',
  fetchLimit: 100,
  optionHeight: 25,
  hideSelectedOptions: false
};

export {IntelligentTreeSelect};
