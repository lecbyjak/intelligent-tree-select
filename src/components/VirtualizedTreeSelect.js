import React, {PureComponent, useCallback} from "react";
import Select, {components} from "react-select";
import PropTypes from "prop-types";
import Option from "./Option";
import Constants, {EMPTY_ARRAY, EMPTY_SET} from "./utils/Constants";
import {FixedSizeList as List} from "react-window";
import {arraysAreEqual, getLabel, getOptionId, optionListsAreEqual, sanitizeArray} from "./utils/Utils";
import OptionsProcessor from "./OptionsProcessor";
import memoizeOne from "memoize-one";

/**
 * Gets stable identifier for a focused option.
 *
 * @private
 */
function getOptionScrollKey(option, valueKey) {
  if (!option) {
    return undefined;
  }
  return option.path?.join(">") || option[valueKey];
}

class VirtualizedTreeSelect extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.matchCheck = this.props.matchCheck || this.matchCheckFull;

    /**
     * When {@link this.props.expanded} is enabled,
     * this value indicates whether the options were already initially expanded
     *
     * @type {boolean}
     */
    this.initialExpansion = false;

    /**
     * Object reference for keeping persistent scroll state for the {@link MenuList}
     *
     * @type {{lastKey: null|string, lastIndex: null|number}}
     */
    this.scrollState = {
      lastKey: null,
      lastIndex: null,
    };

    /**
     * Snapshot of {@link this.props.value}
     * from moment when the scroll to a selected option was performed
     *
     * @type {null | string[] | Object[]}
     */
    this.lastScrolledSelectedOptions = null;

    /**
     * React component state
     *
     * @type {Readonly<Object>}
     */
    this.state = {
      /**
       * List of expanded option ids
       *
       * @type {Readonly<Set<string>>}
       */
      toggledOptionIds: EMPTY_SET,

      /**
       * @type {Readonly<Object[]>}
       */
      processedOptions: EMPTY_ARRAY,

      /**
       * Current search input.
       * Controls filtering, temporary expansion of matching paths and whether manual option toggling is enabled.
       *
       * @type {string}
       */
      searchInput: "",
    };

    this.select = React.createRef();
  }

  componentDidMount() {
    this._processOptions();
  }

  componentDidUpdate(prevProps) {
    if (this.props.matchCheck !== prevProps.matchCheck) {
      this.matchCheck = this.props.matchCheck || this.matchCheckFull;
    }

    if (!optionListsAreEqual(this.props.value, prevProps.value, this.props.valueKey)) {
      this.lastScrolledSelectedOptions = null;
    }

    if (!optionListsAreEqual(this.props.options, prevProps.options, this.props.valueKey)) {
      // if options were changed, reprocess them and discard all options from the current state
      this._processOptions();
      return;
    }

    this._expandSelectedValues(this.props.value, this.state.processedOptions);
    this._scrollToSelectedValue();
  }

  focus = () => {
    this.select.current.focus();
  };

  blurInput = () => {
    if (this.select.current) {
      this.select.current.blur();
    }
  };

  resetOptions = () => {
    this.initialExpansion = false;
    this.lastScrolledSelectedOptions = null;
    this._expandSelectedValues.clear();
    this.setState({
      processedOptions: EMPTY_ARRAY,
      toggledOptionIds: EMPTY_SET,
    });
  };

  /**
   * Checks whether the option with the given option id is expanded, either by the user or temporarily because it is
   * an ancestor of a search result.
   *
   * @param option the option or its id
   * @returns {boolean} {@code true} when the option is expanded, false otherwise
   */
  isOptionExpanded = (option) => {
    const optionId = this._getOptionId(option);
    if (optionId == null) {
      return false;
    }
    const {expandedOptionIds} = this._getSearchMetadata(
      this.state.processedOptions,
      this.state.searchInput,
      this.props.valueKey,
      this.props.labelKey,
      this.props.getOptionLabel,
      this.matchCheck
    );
    return this.state.toggledOptionIds.has(optionId) || expandedOptionIds.has(optionId);
  };

  /**
   * Derives all display data needed for the current search.
   * Matching options and their ancestors are visible,
   * and ancestors are temporarily expanded so every matching path can be rendered.
   *
   * @param processedOptions {Object[]} processed options to search
   * @param searchInput {string} effective search input
   * @param valueKey {string} property containing the option id
   * @param labelKey {string} property containing the default option label
   * @param getOptionLabel {Function|undefined} optional custom label resolver
   * @param matchCheck {Function} function deciding whether an option label matches the input
   * @return {{visibleOptions: Set<Object>, expandedOptionIds: Set<string>, firstMatch: Object|null}}
   *          search-specific display data and the first direct match to focus
   * @private
   */
  _getSearchMetadata = memoizeOne((processedOptions, searchInput, valueKey, labelKey, getOptionLabel, matchCheck) => {
    const visibleOptions = new Set();
    const expandedOptionIds = new Set();
    let firstMatch = null;
    if (searchInput.trim().length > 0) {
      for (const option of processedOptions) {
        if (!matchCheck(searchInput, getLabel(option, labelKey, getOptionLabel))) {
          continue;
        }
        if (firstMatch === null) {
          firstMatch = option;
        }
        visibleOptions.add(option);

        let parent = option.parent;
        while (parent) {
          visibleOptions.add(parent);
          expandedOptionIds.add(getOptionId(parent, valueKey));
          parent = parent.parent;
        }
      }
    }
    Object.freeze(visibleOptions);
    Object.freeze(expandedOptionIds);
    Object.freeze(firstMatch);
    return {visibleOptions, expandedOptionIds, firstMatch};
  });

  /**
   * Processes options from properties into their copies and sets the processedOptions in the state
   * @private
   */
  _processOptions = () => {
    const {valueKey, childrenKey, options, renderAsTree, expanded} = this.props;

    const processor = new OptionsProcessor(valueKey, childrenKey);
    options.forEach(processor.register);

    if (renderAsTree) {
      processor.processWithDepths();
    } else {
      processor.processFlat();
    }

    const processedOptions = processor.getProcessedOptions();

    // initial expansion of options
    if (expanded && !this.initialExpansion) {
      const toggledOptionIds = new Set(processedOptions.map((o) => o[valueKey]));
      Object.freeze(toggledOptionIds);
      this.setState({toggledOptionIds});
      this.initialExpansion = true;
    }

    if (processedOptions.length === 0) {
      this.resetOptions();
    } else {
      this.setState({processedOptions}, this._getRestoreFocusedOptionCallback(processedOptions));
    }
  };

  /**
   * Captures snapshot of currently focused option and returns callback that updates the focused option
   * if it changed since capturing the snapshot.
   * Prevents the react-select from scrollig to the first option when the options array changes.
   *
   * @returns {(function(): void)}
   * @private
   */
  _getRestoreFocusedOptionCallback = (processedOptions) => {
    const focusedOption = this.select.current?.state.focusedOption;
    const completedValue = this.lastScrolledSelectedOptions;
    return () => {
      // react-select compares options by reference and otherwise falls back to the first row.
      const restoredOption = this._findOption(processedOptions, focusedOption);
      if (
        completedValue &&
        this.lastScrolledSelectedOptions === completedValue &&
        restoredOption &&
        this.select.current?.state.focusedOption !== restoredOption
      ) {
        this._focusOption(restoredOption);
      }
    };
  };

  /**
   * Explicitly accepts the current value to use memoization to cache the expansion.
   * Expands all ancestors of every selected value.
   *
   * @param selectedValues
   * @private
   */
  _expandSelectedValues = memoizeOne(
    (selectedValues, processedOptions) => {
      if (!Array.isArray(selectedValues) || !Array.isArray(processedOptions) || selectedValues.length === 0) {
        return;
      }
      const toggledOptionIds = new Set(this.state.toggledOptionIds);
      let updated = false;

      for (const option of selectedValues) {
        const optionId = this._getOptionId(option);
        if (optionId == null) {
          continue;
        }

        const processedSelectedOption = processedOptions.find((o) => o[this.props.valueKey] === optionId);
        if (processedSelectedOption != null) {
          updated = this._expandPathToOption(processedSelectedOption, processedOptions, toggledOptionIds) || updated;
        }
      }

      if (updated) {
        Object.freeze(toggledOptionIds);
        this.setState({toggledOptionIds});
      }
    },
    (aParams, bParams) => {
      return (
        // selectedValues
        optionListsAreEqual(aParams[0], bParams[0], this.props.valueKey) &&
        // processedOptions
        aParams[1] === bParams[1]
      );
    }
  );

  /**
   * Expands every ancestor of the given processed option.
   * The processed option and every ancestor is expected to have {@code parent} property with the respective
   * parent (again processed option) set
   *
   * @param processedOption {Object} processed option with parent set to another processed option
   * @param processedOptions {Object[]} array of processed option in which children should be looked up
   * @param toggledOptionIds {Set<string>} Set of toggled option ids to modify
   * @returns {boolean} {@code true} when the {@code toggledOptionIds} set was modified, {@code false} otherwise
   * @private
   */
  _expandPathToOption = (processedOption, processedOptions, toggledOptionIds) => {
    if (typeof processedOption !== "object" || !Array.isArray(processedOption.path)) {
      return false;
    }

    let updated = false;
    let processedParent = processedOption;
    while (processedParent) {
      const parentId = processedParent[this.props.valueKey];
      if (!toggledOptionIds.has(parentId)) {
        toggledOptionIds.add(parentId);
        this.props.onOptionToggle(processedParent);
        updated = true;
      }

      processedParent = this._findOption(processedOptions, processedParent.parent);
    }
    return updated;
  };

  _scrollToSelectedValue = () => {
    const selectedOptions = sanitizeArray(this.props.value);
    if (
      this.props.isLoading ||
      selectedOptions.length === 0 ||
      !this.select.current ||
      optionListsAreEqual(selectedOptions, this.lastScrolledSelectedOptions, this.props.valueKey)
    ) {
      return;
    }

    const processedOption = this._findOption(this.state.processedOptions, selectedOptions[0]);
    if (!processedOption) {
      return;
    }

    this._focusOption(processedOption);
    this.lastScrolledSelectedOptions = [...selectedOptions];
  };

  /**
   * Finds the {@code searchedOption} in the given {@code dataset}
   * by matching the {@link #props.valueKey}
   *
   * @param dataset the array to search
   * @param searchedOption the option to lookup
   * @returns {any|null} the found option or null
   * @private
   */
  _findOption = (dataset, searchedOption) => {
    if (!searchedOption || !dataset) return null;
    const targetKey = this._getOptionId(searchedOption);
    let options = dataset.filter((el) => el[this.props.valueKey] === targetKey);
    if (options.length === 0) return null;
    if (searchedOption.path) {
      return options.find((option) => arraysAreEqual(option.path, searchedOption.path)) || options[0];
    }
    return options[0];
  };

  /**
   * Decides whether the candidate option from react-select should be displayed.
   * With no search, tree visibility follows the persisted expansion state.
   * During a search, visibility comes from {@link _getSearchMetadata}.
   *
   * @param candidate {{data: Object}} react-select candidate containing the processed option
   * @param inputValue {string} current input supplied by react-select
   * @returns {boolean} whether the candidate should be rendered
   */
  filterOption = (candidate, inputValue) => {
    const processedOption = candidate.data;
    if (inputValue.trim().length === 0) {
      return !this.props.renderAsTree || !processedOption.parent || this.isOptionExpanded(processedOption.parent);
    }

    const {visibleOptions} = this._getSearchMetadata(
      this.state.processedOptions,
      inputValue,
      this.props.valueKey,
      this.props.labelKey,
      this.props.getOptionLabel,
      this.matchCheck
    );
    return visibleOptions.has(processedOption);
  };

  /**
   * Updates the search input and focuses its first match.
   *
   * @param searchInput {string} current search input
   * @private
   */
  _setSearchInput = (searchInput) => {
    this.setState({searchInput}, () => {
      const {firstMatch} = this._getSearchMetadata(
        this.state.processedOptions,
        this.state.searchInput,
        this.props.valueKey,
        this.props.labelKey,
        this.props.getOptionLabel,
        this.matchCheck
      );
      if (firstMatch) {
        this._focusOption(firstMatch);
      }
    });
  };

  /**
   * Sets the search string to the given value and filters the displayed options.
   * React-select's current input takes precedence over the requested value.
   *
   * @param searchInput {string} search input to set
   */
  filterValues = (searchInput) => {
    // when the fetch is delayed, it can cause incorrect filter render, this prevents it from happening
    const currentInput = this.select.current?.inputRef?.value;
    this._setSearchInput(currentInput ?? searchInput);
  };

  matchCheckFull = (searchInput, optionLabel) => {
    return optionLabel.toLowerCase().indexOf(searchInput.toLowerCase()) !== -1;
  };

  /**
   * Handles a new react-select input value.
   *
   * @param input {string} current react-select input value
   */
  _onInputChange = memoizeOne((input) => {
    this._setSearchInput(input);
    this.props.onInputChange(input);
  });

  _getOptionId = (option) => {
    return getOptionId(option, this.props.valueKey);
  };

  /**
   * Removes the processed option and all its children recursively from the given set of toggled option ids.
   *
   * @param processedOption the option to remove from toggledOptionIds along with all its children
   * @param toggledOptionIds the set of toggled option ids
   * @private
   */
  _removeFromToggled = (processedOption, toggledOptionIds) => {
    if (processedOption == null) {
      return;
    }

    const optionId = this._getOptionId(processedOption);
    if (!toggledOptionIds.has(optionId)) {
      // skip recursion for options that were not expanded
      return;
    }

    toggledOptionIds.delete(processedOption[this.props.valueKey]);

    for (const child of sanitizeArray(processedOption[this.props.childrenKey])) {
      const processedChild = this._findOption(this.state.processedOptions, child);
      this._removeFromToggled(processedChild, toggledOptionIds);
    }
  };

  _onOptionToggle = (processedOption) => {
    // disables option expansion/collapse when search input is present
    if (this.state.searchInput.trim().length > 0) {
      return;
    }

    this.props.onOptionToggle(processedOption);
    const toggledOptionIds = new Set(this.state.toggledOptionIds);
    const optionId = processedOption[this.props.valueKey];

    if (this.isOptionExpanded(optionId)) {
      this._removeFromToggled(processedOption, toggledOptionIds);
    } else {
      toggledOptionIds.add(optionId);
    }

    Object.freeze(toggledOptionIds);
    this.setState({toggledOptionIds});
    this._focusOption(processedOption);
  };

  //When selecting an option, we want to ensure that the path to it is expanded
  //Path is saved in toggledOptions
  _onOptionSelect = (props) => {
    props.selectOption(props.data);
  };

  //When using custom option, it is needed to set focusedOption manually
  _focusOption = (option) => {
    if (this.select.current) {
      this.scrollState.lastKey = null;
      this.scrollState.lastIndex = null;

      const processedOption = this._findOption(this.state.processedOptions, option) || option;
      this.select.current.setState({focusedOption: processedOption});
    }
  };

  _onKeyDown = (event) => {
    if (event.key === " ") {
      event.preventDefault();
      const focusedOption = this.select.current && this.select.current.state.focusedOption;

      if (focusedOption) {
        this._onOptionToggle(focusedOption);
      }
    }

    // Preserve any onKeyDown prop passed down from parent components
    if (this.props.onKeyDown) {
      this.props.onKeyDown(event);
    }
  };

  render() {
    const props = this.props;
    const styles = VirtualizedTreeSelect._prepareStyles(this.props.styles);
    const filterOptions = props.filterOption || this.filterOption;
    const optionRenderer = this.props.optionRenderer || Option;
    return (
      <Select
        ref={this.select}
        {...props}
        styles={styles}
        menuIsOpen={this.props.isMenuOpen ? this.props.isMenuOpen : undefined}
        filterOption={filterOptions}
        onInputChange={this._onInputChange}
        getOptionLabel={(option) => getLabel(option, props.labelKey, props.getOptionLabel)}
        getOptionValue={props.getOptionValue ? props.getOptionValue : (option) => option[props.valueKey]}
        components={{
          Option: optionRenderer,
          Menu: Menu,
          MenuList: MenuList,
          MultiValueLabel: this.props.valueRenderer,
          SingleValue: this.props.valueRenderer,
        }}
        isMulti={props.multi}
        blurInputOnSelect={false}
        options={this.state.processedOptions}
        onOptionToggle={this._onOptionToggle}
        onOptionSelect={this._onOptionSelect}
        onOptionHover={this._focusOption}
        onKeyDown={this._onKeyDown}
        focus={this.focus}
        isOptionExpanded={this.isOptionExpanded}
        scrollState={this.scrollState}
      />
    );
  }

  static _prepareStyles = memoizeOne((propStyles) => {
    return {
      dropdownIndicator: (provided, state) => ({
        ...provided,
        transform: state.selectProps.menuIsOpen && "rotate(180deg)",
        display: !state.selectProps.isMenuOpen ? "flex" : "none",
      }),
      indicatorSeparator: (provided, state) => ({
        ...provided,
        display: !state.selectProps.isMenuOpen ? "flex" : "none",
      }),
      multiValue: (base) => ({
        ...base,
        backgroundColor: "rgba(0, 126, 255, 0.08)",
        border: "1px solid #c2e0ff",
        paddingLeft: Constants.VALUE_MARGIN_X,
      }),
      multiValueRemove: (base) => ({
        ...base,
        color: "#007eff",
        cursor: "pointer",
        borderLeft: "1px solid rgba(0,126,255,.24)",
        "&:hover": {
          backgroundColor: "rgba(0,113,230,.08)",
          color: "#0071e6",
        },
        marginLeft: Constants.VALUE_MARGIN_X,
      }),
      noOptionsMessage: (provided) => ({
        ...provided,
        paddingLeft: "16px",
      }),
      menu: (provided, state) => ({
        ...provided,
        position: state.selectProps.menuIsFloating ? "absolute" : "relative",
      }),
      valueContainer: (provided, state) => ({
        ...provided,
        display: state.hasValue ? "flex" : "inline-grid",
      }),
      input: (provided) => ({
        ...provided,
        input: {
          opacity: "1 !important",
        },
      }),
      ...propStyles,
    };
  });
}

// Wrapper for MenuList, it doesn't do anything, it is only needed for correct passing of the onScroll prop
const Menu = (props) => {
  const onScrollCapture = useCallback(
    (e) => {
      props.selectProps.listProps.onScroll(e.target);
    },
    [props.selectProps.listProps.onScroll]
  );
  return (
    <components.Menu
      {...props}
      innerProps={{
        ...props.innerProps,
        onScrollCapture,
      }}
    >
      {props.children}
    </components.Menu>
  );
};

// Component for efficient rendering
const MenuList = (props) => {
  const {children} = props;
  const {optionHeight, maxHeight, valueKey, scrollState, isLoading} = props.selectProps;

  /// React-Window List reference
  const listRef = React.useRef(null);

  // We need to check whether the passed object contains items or loading/empty message
  let values;
  let height;
  if (Array.isArray(children)) {
    values = children;
    height = Math.min(maxHeight, optionHeight * values.length);
  } else {
    values = [<components.NoOptionsMessage {...children.props} children={children.props.children} />];
    height = 40;
  }

  const scrollTarget = Array.isArray(children) ? children.findLast((child) => child.props?.isFocused) : null;

  // Scroll to the currently focused option
  React.useLayoutEffect(() => {
    if (!Array.isArray(children) || !listRef.current || isLoading) {
      return;
    }

    /// The children element to which we should scroll
    if (!scrollTarget || !scrollTarget.props?.data) {
      return;
    }

    const optionData = scrollTarget.props.data;

    const targetKey = getOptionScrollKey(optionData, valueKey);
    const targetIndex = values.indexOf(scrollTarget);
    if (targetIndex === -1) {
      return;
    }

    if (scrollState.lastKey === targetKey && scrollState.lastIndex === targetIndex) {
      return;
    }

    try {
      listRef.current.scrollToItem(targetIndex, "auto");
      scrollState.lastKey = targetKey;
      scrollState.lastIndex = targetIndex;
    } catch (e) {
      // if scroll fails it doesn't matter much
    }
  }, [scrollTarget, scrollState, isLoading]);

  return (
    <List ref={listRef} height={height} itemCount={values.length} itemSize={optionHeight} overscanCount={30}>
      {({index, style}) => <div style={style}>{values[index]}</div>}
    </List>
  );
};

VirtualizedTreeSelect.propTypes = {
  autoFocus: PropTypes.bool,
  childrenKey: PropTypes.string,
  expanded: PropTypes.bool,
  filterOption: PropTypes.func,
  matchCheck: PropTypes.func,
  isMenuOpen: PropTypes.bool,
  labelKey: PropTypes.string,
  getOptionLabel: PropTypes.func,
  getOptionValue: PropTypes.func,
  maxHeight: PropTypes.number,
  menuStyle: PropTypes.object,
  minHeight: PropTypes.number,
  multi: PropTypes.bool,
  onInputChange: PropTypes.func.isRequired,
  optionHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  optionLeftOffset: PropTypes.number,
  optionRenderer: PropTypes.func,
  options: PropTypes.array,
  renderAsTree: PropTypes.bool,
  valueKey: PropTypes.string,
  hideSelectedOptions: PropTypes.bool,
  menuIsFloating: PropTypes.bool,
  styles: PropTypes.object,
};

VirtualizedTreeSelect.defaultProps = {
  childrenKey: Constants.CHILDREN_KEY,
  labelKey: Constants.LABEL_KEY,
  valueKey: Constants.VALUE_KEY,
  options: [],
  optionHeight: 25,
  optionLeftOffset: 16,
  expanded: false,
  isMenuOpen: false,
  maxHeight: 300,
  minHeight: 0,
  multi: false,
  renderAsTree: true,
  hideSelectedOptions: false,
  menuIsFloating: true,
  styles: {},
};

export {VirtualizedTreeSelect};
