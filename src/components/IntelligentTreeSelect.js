import React, {Component} from "react";

import {VirtualizedTreeSelect} from "./VirtualizedTreeSelect";
import PropTypes from "prop-types";
import {isURL, monotonicAssign, sanitizeArray} from "./utils/Utils";
import Constants from "./utils/Constants";

class IntelligentTreeSelect extends Component {
  constructor(props, context) {
    super(props, context);

    this.fetching = false;
    this.completedNodes = {};
    this.history = [];
    this.searchString = "";

    this._valueRenderer = this._valueRenderer.bind(this);
    this._addSelectedOption = this._addSelectedOption.bind(this);
    this._onInputChange = this._onInputChange.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onOptionToggle = this._onOptionToggle.bind(this);
    this._finalizeSelectedOptions = this._finalizeSelectedOptions.bind(this);

    this.state = {
      expanded: this.props.expanded,
      multi: this.props.multi,
      options: [],
      selectedOptions: [],
      passedValue: this.props.value || [],
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
    this.fetching = this._getResponse(searchString, optionId, this.props.fetchLimit, offset, topOption).then(
      (response) => {
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
      }
    );
  }

  // If the values are controlled from the outside, it is needed to map them properly to options which Select knows
  static getDerivedStateFromProps(props, state) {
    if (!props.valueIsControlled) return state;

    if (!props.value) {
      state.passedValue = [];
      state.selectedOptions = [];
      return state;
    }

    const values = sanitizeArray(props.value);
    const selectedOpt = sanitizeArray(state.selectedOptions);
    const modifiedPassedValue = [];
    const modifiedSelectedOptions = [];
    for (const valueElement of values) {
      const key = valueElement[props.valueKey] ?? valueElement;
      const opt = selectedOpt.find((term) => term[props.valueKey] === key);
      if (opt) {
        modifiedSelectedOptions.push(opt);
      } else {
        modifiedPassedValue.push(key);
      }
    }
    state.passedValue = modifiedPassedValue;
    state.selectedOptions = modifiedSelectedOptions;

    return state;
  }

  /**
   * Resets the option, forcing the component to reload them from the server/reload them from props.
   */
  resetOptions() {
    this.history = [];
    this.setState({options: []}, () => {
      if (this.select.current) {
        this.select.current.resetOptions();
      }
      if (this.props.fetchOptions) {
        this._loadOptions();
      } else {
        this._addNewOptions(this.props.options);
      }
    });
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

  _isInHistory(searchValue) {
    searchValue = searchValue.toString().toLowerCase();

    for (let i = 0; i < this.history.length; i++) {
      if (this.history[i].searchString.toLowerCase() === searchValue) {
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
      result = result.concat(data);
      const childrenArr = sanitizeArray(data[childrenKey]);
      if (childrenArr.length > 0) {
        result = result.concat(this._simplifyData(childrenArr));
        data[childrenKey] = childrenArr.map((xdata) => xdata[valueKey]);
      }
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
      throw new Error("Invalid optionLifetime. Expecting format: e.g. 1d10h5m6s ");
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
    this.state.options.forEach((option) => {
      if (option.depth === 0) count++;
    });
    return count;
  }

  async _getResponse(searchString, optionID, limit, offset, option) {
    return this.props.fetchOptions
      ? await this.props.fetchOptions({
          searchString,
          optionID,
          limit,
          offset,
          option,
        })
      : [];
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
        let offset = 0;

        this.state.options.forEach((option) => {
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
    if (this.props.onInputChange !== undefined) {
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

    if (scrollHeight - scrollTop <= 2.5 * clientHeight && !this.fetching && this.props.fetchOptions) {
      // this.fetching = true;
      let totalOptionsHeight = 0;
      let topOptionIndex = 0;

      for (topOptionIndex; topOptionIndex < this.state.options.length; topOptionIndex++) {
        const option = this.state.options[topOptionIndex];

        totalOptionsHeight +=
          this.props.optionHeight instanceof Function ? this.props.optionHeight({option}) : this.props.optionHeight;

        if (totalOptionsHeight >= scrollTop) {
          break;
        }
      }

      const topOption = this.state.options[topOptionIndex];
      let parentOption = this.state.options.find((option) => option[this.props.valueKey] === topOption.parent);
      let offset = parentOption ? parentOption[this.props.childrenKey].length : this._getRootNodesCount();
      let parentOptionValue = parentOption ? parentOption[this.props.valueKey] : "root";

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
      let dataCached = this._isInHistory(option[this.props.valueKey]);

      if (!dataCached) {
        this.setState({isLoadingExternally: true});
        option.fetchingChild = true;
        let data = [];

        this._getResponse("", option[this.props.valueKey], this.props.fetchLimit, 0, option).then((response) => {
          if (!this.props.simpleTreeData) {
            data = this._simplifyData(response);
          } else {
            data = response;
          }

          if (data.length < this.props.fetchLimit) {
            this.completedNodes[option[this.props.valueKey]] = true;
          }

          this._addToHistory(
            option[this.props.valueKey],
            Date.now() + this._getValidForInSec(this.props.optionLifetime)
          );

          delete option.fetchingChild;

          if (data.length > 0) {
            this._addNewOptions(data);
          }
          this.setState({isLoadingExternally: false});
        });
      }
    }
    this.forceUpdate();
  }

  _valueRenderer({children, data}) {
    if (this.props.valueRenderer) {
      // On initial render, there can be empty options
      if (!children) return null;
      return this.props.valueRenderer(children, data);
    }
    const value = data[this.props.valueKey].toString();

    if (isURL(value)) {
      return (
        <a href={value} target="_blank">
          {children}
        </a>
      );
    }
    return children;
  }

  _addNewOptions(newOptions) {
    const {childrenKey, fetchOptions, name, optionLifetime} = this.props;

    let mergedArr;
    if (this.state.options.length === 0) {
      newOptions.forEach((no) => (no[childrenKey] = sanitizeArray(no[childrenKey])));
      mergedArr = newOptions;
    } else {
      mergedArr = this._mergeOptionArrays(this.state.options, newOptions);
    }

    if (name && fetchOptions) {
      window.localStorage.setItem(
        name,
        JSON.stringify({
          validTo: Date.now() + this._getValidForInSec(optionLifetime),
          data: mergedArr,
        })
      );
    }

    if (newOptions.length > 0) {
      this._finalizeSelectedOptions(newOptions, mergedArr);
    }

    this.setState({options: mergedArr, update: ++this.state.update});
  }

  _mergeOptionArrays(originalOptions, newOptions) {
    const {valueKey, childrenKey} = this.props;
    let options = originalOptions.concat(newOptions);
    let mergedArr = [];

    //merge options
    while (options.length > 0) {
      let currOption = options.shift();

      currOption[childrenKey] = sanitizeArray(currOption[childrenKey]);

      const conflicts = [];
      const optionsToReplace = [];
      options.forEach((object) => {
        if (object[valueKey] === currOption[valueKey]) {
          object[childrenKey] = sanitizeArray(object[childrenKey]);
          conflicts.push(object);
        } else {
          optionsToReplace.push(object);
        }
      });
      mergedArr.push(monotonicAssign({}, currOption, ...conflicts.reverse()));
      options = optionsToReplace;
    }
    return mergedArr;
  }

  //Check if new options contain selected value
  _finalizeSelectedOptions(addedOptions, parsedOptions) {
    const foundOptions = [];
    let previouslySelected = sanitizeArray(this.state.passedValue);
    let newSelected = sanitizeArray(this.state.selectedOptions);
    for (const selectedOpt of previouslySelected) {
      const key = selectedOpt[this.props.valueKey] ?? selectedOpt;
      const option = addedOptions.find((term) => term[this.props.valueKey] === key);
      if (!option) continue;
      foundOptions.push(key);
      const optionParsed = parsedOptions.find((term) => term[this.props.valueKey] === key);
      newSelected.push(optionParsed);
    }
    this._addSelectedOption(newSelected);

    //remove already found options
    for (const foundOption of foundOptions) {
      previouslySelected = previouslySelected.filter((term) => {
        return term !== foundOption;
      });
    }

    this.setState({passedValue: previouslySelected});
  }

  _addChildrenToParent(childrenID, parentID) {
    let parentOption = this.state.options.find((x) => x[this.props.valueKey] === parentID);
    let children = parentOption[this.props.childrenKey];
    if (children.indexOf(childrenID) === -1) children.push(childrenID);
  }

  _onChange(options) {
    this._addSelectedOption(options);
    if (this.props.onChange) {
      this.props.onChange(options);
    }
  }

  _addSelectedOption(selectedOptions) {
    this.setState({selectedOptions});
  }

  _addToHistory(searchString, validTo) {
    this.history.unshift({searchString: searchString.toString(), validTo});
  }

  render() {
    let listProps = {};
    listProps.onScroll = this.props.onScroll || this._onScroll;
    listProps.ref = this.select;
    const valueRenderer = this._valueRenderer;
    const propsToPass = Object.assign({}, this.props);
    delete propsToPass.valueRenderer;
    delete propsToPass.onScroll;
    delete propsToPass.value;
    delete propsToPass.onChange;

    return (
      <div>
        <VirtualizedTreeSelect
          ref={this.select}
          styles={this.props.styles}
          name="react-virtualized-tree-select"
          onChange={this._onChange}
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
          noOptionsMessage={() => this.props.noResultsText}
          loadingMessage={() => this.props.loadingText}
        />
      </div>
    );
  }
}

IntelligentTreeSelect.propTypes = {
  onChange: PropTypes.func,
  autoFocus: PropTypes.bool,
  isMenuOpen: PropTypes.bool,
  childrenKey: PropTypes.string,
  expanded: PropTypes.bool,
  fetchLimit: PropTypes.number,
  fetchOptions: PropTypes.func,
  matchCheck: PropTypes.func,
  labelKey: PropTypes.string,
  getOptionLabel: PropTypes.func,
  getOptionValue: PropTypes.func,
  multi: PropTypes.bool,
  name: PropTypes.string,
  onInputChange: PropTypes.func,
  optionHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  options: PropTypes.array,
  renderAsTree: PropTypes.bool,
  simpleTreeData: PropTypes.bool,
  optionLifetime: PropTypes.string,
  valueKey: PropTypes.string,
  optionRenderer: PropTypes.func,
  valueRenderer: PropTypes.func,
  searchDelay: PropTypes.number,
  hideSelectedOptions: PropTypes.bool,
  menuIsFloating: PropTypes.bool,
  valueIsControlled: PropTypes.bool,
  isClearable: PropTypes.bool,
  styles: PropTypes.object,
  titleKey: PropTypes.string,
};

IntelligentTreeSelect.defaultProps = {
  autoFocus: false,
  childrenKey: Constants.CHILDREN_KEY,
  labelKey: Constants.LABEL_KEY,
  valueKey: Constants.VALUE_KEY,
  expanded: false,
  multi: true,
  options: [],
  renderAsTree: true,
  isMenuOpen: false,
  simpleTreeData: true,
  optionLifetime: "5m",
  fetchLimit: 100,
  optionHeight: 25,
  hideSelectedOptions: false,
  menuIsFloating: true,
  valueIsControlled: true,
  isClearable: true,
  styles: {},
  titleKey: "title",
};

export {IntelligentTreeSelect};
