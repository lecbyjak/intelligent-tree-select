import React, {PureComponent} from "react";
import debounce from "lodash.debounce";

import {VirtualizedTreeSelect} from "./VirtualizedTreeSelect";
import PropTypes from "prop-types";
import {getOptionId, isURL, monotonicAssign, optionListsAreEqual, sanitizeArray} from "./utils/Utils";
import Constants, {EMPTY_ARRAY} from "./utils/Constants";
import memoizeOne from "memoize-one";

class IntelligentTreeSelect extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.fetching = false;
    this.completedNodes = {};
    this.toggledNodes = {};

    /**
     * Allows to discard async response processing if the component was unmounted
     *
     * @type {number}
     */
    this.requestGeneration = 0;

    this.searchString = "";
    this.searchPage = 0;
    this.totalRequestedRootOptions = 0;

    this.state = {
      /**
       * Set of option ids for which there is a pending request fetching their children
       *
       * @type {Set<string>}
       */
      fetchingChild: new Set(),
      expanded: this.props.expanded,
      multi: this.props.multi,
      options: [],
      selectedOptions: [],

      /**
       * Options emitted by the latest controlled change.
       * Used to resolve selected values while search results replace the loaded options.
       *
       * @type {Object[]}
       */
      changedOptions: [],
      passedValue: this.props.value || [],
      isLoadingExternally: false,
      update: 0,
    };

    /**
     * Reference to {@link VirtualizedTreeSelect}
     *
     * @type {React.RefObject<VirtualizedTreeSelect>}
     */
    this.select = React.createRef();
    this.debouncedSearch = debounce(
      (searchString, offset) => this._invokeSearch(searchString, offset),
      props.searchDelay
    );
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

  componentWillUnmount() {
    this.requestGeneration += 1;
    this.debouncedSearch.cancel();
  }

  _retrieveCachedData = () => {
    let cachedData = window.localStorage.getItem(this.props.name);
    if (cachedData) {
      cachedData = JSON.parse(cachedData);
      return cachedData.validTo > Date.now() ? cachedData.data : [];
    }
  };

  _loadOptions = () => {
    if (this.state.options.length === 0 && this.props.fetchOptions) {
      if (!this.fetching) {
        this._fetchOptions("", "", 0);
      }
    }
  };

  /**
   * Checks whether there is a pending request for children of the given option.
   *
   * @param option the option to check
   * @returns {boolean} {@code true} when there is an active request for children of {@code option}
   */
  isOptionFetchingChild = (option) => {
    return this.state.fetchingChild.has(getOptionId(option, this.props.valueKey));
  };

  /**
   * Checks whether the option with the given option id is expanded
   *
   * @param option the option or its id
   * @returns {boolean} {@code true} when the option is expanded, false otherwise
   */
  isOptionExpanded = (option) => {
    if (this.select.current) {
      return this.select.current.isOptionExpanded(option);
    }
    return false;
  };

  _fetchOptions = (searchString, optionId, offset, topOption, callback) => {
    const requestGeneration = this.requestGeneration;
    this.setState({isLoadingExternally: true});
    this.fetching = this._getResponse(searchString, optionId, this.props.fetchLimit, offset, topOption).then(
      (response) => {
        if (requestGeneration !== this.requestGeneration) {
          return;
        }

        let data;
        if (!this.props.simpleTreeData) {
          data = this._simplifyData(response);
        } else {
          data = response;
        }
        this.fetching = false;
        if (!searchString && !optionId) {
          this.totalRequestedRootOptions = offset + this.props.fetchLimit;
        }
        this._addNewOptions(data);
        this.setState({isLoadingExternally: false});
        if (callback) {
          callback(data);
        }
      }
    );
  };

  // If the values are controlled from the outside, it is needed to map them properly to options which Select knows
  static getDerivedStateFromProps(props, state) {
    if (!props.valueIsControlled) {
      return null;
    }

    return IntelligentTreeSelect.deriveControlledValue(
      props.value,
      state.options,
      props.valueKey,
      props.multi,
      state.selectedOptions,
      state.changedOptions
    );
  }

  /**
   * Maps controlled values to loaded options, retaining options from the latest change
   * while search results replace the loaded options.
   */
  static deriveControlledValue = memoizeOne(
    (value, options, valueKey, multi, selectedOptions = EMPTY_ARRAY, changedOptions = EMPTY_ARRAY) => {
      if (value == null) {
        return {
          passedValue: [],
          selectedOptions: [],
        };
      }

      const values = sanitizeArray(value);
      const existingOptions = sanitizeArray(options);
      const modifiedPassedValue = [];
      const modifiedSelectedOptions = [];

      for (const valueElement of values) {
        const key = valueElement[valueKey] ?? valueElement;
        const opt =
          existingOptions.find((term) => term[valueKey] === key) ||
          (typeof valueElement === "object" && valueElement[valueKey] ? valueElement : null) ||
          // Search results can replace the option list without changing the selected values.
          changedOptions.find((term) => term[valueKey] === key) ||
          selectedOptions.find((term) => term[valueKey] === key);

        if (opt) {
          modifiedSelectedOptions.push(opt);
        } else {
          modifiedPassedValue.push(key);
        }
      }

      return {
        passedValue: !multi && modifiedPassedValue.length > 0 ? [modifiedPassedValue[0]] : modifiedPassedValue,
        selectedOptions:
          !multi && modifiedSelectedOptions.length > 0 ? [modifiedSelectedOptions[0]] : modifiedSelectedOptions,
      };
    },
    (aParams, bParams) => {
      const bValueKey = bParams[2];
      // value
      return (
        optionListsAreEqual(aParams[0], bParams[0], bValueKey) &&
        // options
        optionListsAreEqual(aParams[1], bParams[1], bValueKey) &&
        // valueKey
        aParams[2] === bParams[2] &&
        // multi
        aParams[3] === bParams[3] &&
        aParams[4] === bParams[4] &&
        aParams[5] === bParams[5]
      );
    }
  );

  /**
   * Resets the option, forcing the component to reload them from the server/reload them from props.
   */
  resetOptions = () => {
    this.totalRequestedRootOptions = 0;
    this.toggledNodes = {};
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
  };

  /**
   * Focuses the select input.
   */
  focus = () => {
    if (this.select.current) {
      this.select.current.focus();
    }
  };

  /**
   * Blurs the select input.
   */
  blurInput = () => {
    if (this.select.current) {
      this.select.current.blurInput();
    }
  };

  /**
   * Gets the current options provided by this component.
   */
  getOptions = () => {
    return this.state.options.slice();
  };

  componentDidUpdate(prevProps) {
    if (!this.props.fetchOptions && prevProps.options !== this.props.options) {
      this.setState({options: EMPTY_ARRAY}, () => {
        // Reset options from props
        this._addNewOptions(this.props.options);
      });
    }
  }

  _simplifyData = (responseData) => {
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
  };

  _parseOptionLifetime = (value) => {
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
  };

  _getValidForInSec = (optionLifetime) => {
    optionLifetime = this._parseOptionLifetime(optionLifetime);
    let res = 0;
    res += isNaN(optionLifetime.seconds) ? 0 : optionLifetime.seconds;
    res += isNaN(optionLifetime.minutes) ? 0 : optionLifetime.minutes * 60;
    res += isNaN(optionLifetime.hours) ? 0 : optionLifetime.hours * 60 * 60;
    res += isNaN(optionLifetime.days) ? 0 : optionLifetime.days * 60 * 60 * 24;
    return res * 1000;
  };

  hasActiveFetch = () => {
    return this.state.isLoadingExternally || this.state.fetchingChild.size > 0;
  };

  _getResponse = async (searchString, optionID, limit, offset, option) => {
    return this.props.fetchOptions
      ? await this.props.fetchOptions({
          searchString,
          optionID,
          limit,
          offset,
          option,
        })
      : [];
  };

  _onInputChange = (searchString) => {
    if (this.props.fetchOptions) {
      if (searchString) {
        if (!this.fetching) {
          if (searchString !== this.searchString) {
            this.searchPage = 0;
            this.completedNodes = {};
            if (this.state.options.length > 0) {
              this.setState({options: EMPTY_ARRAY});
            }
          }
          const offset = 0;

          this.debouncedSearch(searchString, offset);
        } else {
          if (this.select.current) {
            this.select.current.filterValues(searchString);
          }
        }
      } else {
        this.searchPage = 0;
        this.completedNodes = {};
        this.totalRequestedRootOptions = 0;
        if (this.searchString) {
          this.setState({options: EMPTY_ARRAY});
        }
        if (!this.fetching) {
          this.debouncedSearch.cancel();
          this.debouncedSearch("", 0);
          this.debouncedSearch.flush();
        } else if (this.select.current) {
          this.select.current.filterValues("");
        }
      }
    }

    this.searchString = searchString;
    if (this.props.onInputChange !== undefined) {
      this.props.onInputChange(searchString);
    }
  };

  _invokeSearch = (searchString, offset) => {
    const isSearch = !!searchString;
    const computedOffset = isSearch ? this.searchPage * this.props.fetchLimit : offset;
    this._fetchOptions(searchString, "", computedOffset, undefined, (data) => {
      if (isSearch) {
        const pageIsFull = Array.isArray(data) && data.length >= this.props.fetchLimit;
        if (pageIsFull) {
          this.searchPage += 1;
        } else {
          this.completedNodes["root"] = true;
        }
      }
      if (this.select.current) {
        this.select.current.filterValues(searchString);
      }
    });
  };

  _onScroll = (data) => {
    const {clientHeight, scrollHeight, scrollTop} = data;
    // TODO: Fix loading additional child option pages
    // This implementation is currently not working and the component does not load additional pages of child options
    //    Once fixing, note that .parent on option objects is no longer available from VirtualizedTreeSelect
    //    also consider moving such logic to VirtualizedTreeSelect

    if (!this.state.options.length) return;

    if (scrollHeight - scrollTop <= 2.5 * clientHeight && !this.fetching && this.props.fetchOptions) {
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
      let topOptionParentValue = topOption.parent ? topOption.parent[this.props.valueKey] : undefined;
      let parentOption = this.state.options.find((option) => option[this.props.valueKey] === topOptionParentValue);
      let offset = parentOption
        ? parentOption[this.props.childrenKey].length
        : this.searchString
        ? this.searchPage * this.props.fetchLimit
        : this.totalRequestedRootOptions;

      if (!this.completedNodes[topOptionParentValue || "root"]) {
        this._fetchOptions(this.searchString || "", topOptionParentValue, offset, topOption, (fetchedData) => {
          if (!topOption.parent && this.searchString) {
            if (Array.isArray(fetchedData) && fetchedData.length >= this.props.fetchLimit) {
              this.searchPage += 1;
            }
          }
          if (fetchedData.length < this.props.fetchLimit) {
            //fetch parent options
            this.completedNodes[topOptionParentValue || "root"] = true;
          }
        });
      }
    }
  };

  static addToFetchingChild(state, optionId) {
    const fetchingChild = new Set(state.fetchingChild);
    fetchingChild.add(optionId);
    Object.freeze(fetchingChild);
    return {fetchingChild};
  }

  static removeFromFetchingChild(state, optionId) {
    const fetchingChild = new Set(state.fetchingChild);
    fetchingChild.delete(optionId);
    Object.freeze(fetchingChild);
    return {fetchingChild};
  }

  _onOptionToggle = (option) => {
    if (!option || !this.select.current || !this.props.fetchOptions) {
      return;
    }
    const isExpanded = this.isOptionExpanded(option);
    if (!isExpanded) {
      const dataCached = this.toggledNodes[option[this.props.valueKey]] || false;
      const activeFetch = this.isOptionFetchingChild(option);
      if (dataCached || activeFetch) {
        return;
      }

      this.setState((state) => IntelligentTreeSelect.addToFetchingChild(state, option[this.props.valueKey]));

      let data = [];
      const requestGeneration = this.requestGeneration;

      this._getResponse(this.searchString || "", option[this.props.valueKey], this.props.fetchLimit, 0, option).then(
        (response) => {
          if (requestGeneration !== this.requestGeneration) {
            return;
          }

          if (!this.props.simpleTreeData) {
            data = this._simplifyData(response);
          } else {
            data = response;
          }

          if (data.length < this.props.fetchLimit) {
            this.completedNodes[option[this.props.valueKey]] = true;
          }

          this.toggledNodes[option[this.props.valueKey]] = true;

          if (data.length > 0) {
            this._addNewOptions(data);
          }
          this.setState((state) => IntelligentTreeSelect.removeFromFetchingChild(state, option[this.props.valueKey]));
        }
      );
    }
  };

  _valueRenderer = ({children, data}) => {
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
  };

  _addNewOptions = (newOptions) => {
    const {childrenKey, fetchOptions, name, optionLifetime} = this.props;

    let mergedArr;
    if (this.state.options.length === 0) {
      newOptions.forEach((no) => (no[childrenKey] = sanitizeArray(no[childrenKey])));
      mergedArr = [...sanitizeArray(newOptions)];
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

    Object.freeze(mergedArr);
    this.setState({options: mergedArr});
  };

  /**
   * Combines the currently available options with a newly loaded set of options.
   *
   * Options that have the same {@code valueKey} are treated as different versions of one option.
   * Defined fields from the new version override the old version while fields omitted from the new version are retained.
   * Every {@code childrenKey} field is also normalized to an array.
   *
   * The position of a merged option is determined by its last occurrence in the combined input.
   *
   * @param {Object[]} originalOptions options already held by the component
   * @param {Object[]} newOptions options from the newly loaded page
   * @returns {Object[]} merged options ordered by the last occurrence of each option
   */
  _mergeOptionArrays = (originalOptions, newOptions) => {
    const {valueKey, childrenKey} = this.props;
    let options = originalOptions.concat(newOptions);
    const mergedArr = [];

    while (options.length > 0) {
      const latestOption = options.pop();
      const matchingOptions = [];
      const nonMatchingOptions = [];

      // Remove earlier occurrences of this option from the remaining work and collect them in their original order.
      options.forEach((option) => {
        if (option[valueKey] === latestOption[valueKey]) {
          matchingOptions.push(option);
        } else {
          nonMatchingOptions.push(option);
        }
      });

      // Adding the latest occurrence reconstructs the complete group in its original loading order.
      matchingOptions.push(latestOption);
      matchingOptions.forEach((option) => {
        option[childrenKey] = sanitizeArray(option[childrenKey]);
      });

      const firstOption = matchingOptions[0];
      // Keep the original precedence when an input contains more than two occurrences of the same option.
      const duplicateOptions = matchingOptions.slice(1).reverse();
      const mergedOption = monotonicAssign({}, firstOption, ...duplicateOptions);
      mergedArr.push(mergedOption);
      options = nonMatchingOptions;
    }

    // Groups were discovered from right to left, so restore their loading order before returning them.
    return mergedArr.reverse();
  };

  //Check if new options contain selected value
  _finalizeSelectedOptions = (addedOptions, parsedOptions) => {
    const foundOptions = [];
    let previouslySelected = sanitizeArray(this.state.passedValue);
    let newSelected = sanitizeArray(this.state.selectedOptions);

    for (const selectedOpt of previouslySelected) {
      const key = selectedOpt[this.props.valueKey] ?? selectedOpt;
      const option = addedOptions.find((term) => term[this.props.valueKey] === key);
      if (!option) continue;
      foundOptions.push(key);
      const optionParsed = parsedOptions.find((term) => term[this.props.valueKey] === key);

      // prevent duplicates
      if (!newSelected.some((term) => term[this.props.valueKey] === key)) {
        newSelected = this.props.multi ? [...newSelected, optionParsed] : [optionParsed];
      }
    }
    this._addSelectedOption(newSelected);

    //remove already found options
    for (const foundOption of foundOptions) {
      previouslySelected = previouslySelected.filter((term) => {
        return term !== foundOption;
      });
    }

    Object.freeze(previouslySelected);
    this.setState({passedValue: previouslySelected});
  };

  _onChange = (options) => {
    let optionsArray = sanitizeArray(options);
    if (!this.props.valueIsControlled) {
      // updating internal state synchronously only when value is not controlled
      this._addSelectedOption(optionsArray);
    } else {
      // Retain options that may be removed when search results replace the loaded options.
      this.setState({changedOptions: optionsArray});
    }
    if (this.props.onChange) {
      this.props.onChange(options);
    }
  };

  _addSelectedOption = (selectedOptions) => {
    Object.freeze(selectedOptions);
    this.setState({selectedOptions});
  };

  _makeListProps = memoizeOne((onScroll, ref) => {
    return {
      onScroll,
      ref,
    };
  });

  render() {
    let listProps = this._makeListProps(this.props.onScroll || this._onScroll, this.select);
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
          isLoading={this.hasActiveFetch()}
          onInputChange={this._onInputChange}
          options={this.state.options}
          listProps={listProps}
          update={this.state.update}
          onOptionToggle={this._onOptionToggle}
          noOptionsMessage={() => this.props.noResultsText}
          loadingMessage={() => this.props.loadingText}
          isOptionFetchingChild={this.isOptionFetchingChild}
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
  searchDelay: 0,
};

export {IntelligentTreeSelect};
