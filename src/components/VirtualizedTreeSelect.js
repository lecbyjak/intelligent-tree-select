import React, {Component} from "react";
import Select, {components} from "react-select";
import PropTypes from "prop-types";
import Option from "./Option";
import Constants from "./utils/Constants";
import {FixedSizeList as List} from "react-window";
import {arraysAreEqual, getLabel, optionListsAreEqual, sanitizeArray} from "./utils/Utils";

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

class VirtualizedTreeSelect extends Component {
  constructor(props, context) {
    super(props, context);

    this._processOptions = this._processOptions.bind(this);
    this._expandSelectedValues = this._expandSelectedValues.bind(this);
    this._focusSelectedOption = this._focusSelectedOption.bind(this);
    this._focusOption = this._focusOption.bind(this);
    this.filterOption = this.filterOption.bind(this);
    this._onInputChange = this._onInputChange.bind(this);
    this.filterValues = this.filterValues.bind(this);
    this._onOptionToggle = this._onOptionToggle.bind(this);
    this._findOption = this._findOption.bind(this);
    this._findOptionWithParent = this._findOptionWithParent.bind(this);
    this._onOptionClose = this._onOptionClose.bind(this);
    this._removeChildrenFromToggled = this._removeChildrenFromToggled.bind(this);
    this._onOptionSelect = this._onOptionSelect.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this.focus = this.focus.bind(this);
    this.matchCheck = this.props.matchCheck || this.matchCheckFull;
    this.data = {};
    this.searchString = "";
    /**
     * State used to prevent repeating the same automatic scroll when the list is remounted.
     */
    this.focusedOptionScrollState = {
      lastScrolledKey: null,
      suppressScroll: false,
    };
    /**
     * List of expanded options
     */
    this.toggledOptions = [];
    this.state = {
      options: [],
      initialExpansion: false,
    };
    this.select = React.createRef();
  }

  componentDidMount() {
    this._processOptions();
    this._expandSelectedValues();
    this.setState({}, () => this._focusSelectedOption(true));
  }

  componentDidUpdate(prevProps) {
    if (!optionListsAreEqual(this.props.value, prevProps.value, this.props.valueKey)) {
      this._processOptions();
      this._expandSelectedValues();
      this.setState({}, () => this._focusSelectedOption(true));
    } else if (this.props.update > prevProps.update) {
      // capture the currently focused option
      const prevFocused = this.select.current && this.select.current.state.focusedOption;
      // Prevents scrolling while options are re-processed after a new page is loaded
      this.focusedOptionScrollState.suppressScroll = true;
      this._processOptions();
      this._expandSelectedValues();

      this.setState({}, () => {
        this.focusedOptionScrollState.suppressScroll = false;
        if (prevFocused) {
          const optionToFocus = this._findOption(this.state.options, prevFocused);
          if (optionToFocus) {
            this.focusedOptionScrollState.lastScrolledKey = getOptionScrollKey(optionToFocus, this.props.valueKey);
            this._focusOption(optionToFocus);
          }
        } else {
          this.setState({}, this._focusSelectedOption);
        }
      });
    }
  }

  /**
   * Focuses the first selected option from {@link #props.value}
   *
   * @private
   */
  _focusSelectedOption(forceScroll = false) {
    if (!this.props.value || !Array.isArray(this.props.value) || this.props.value.length === 0) {
      return;
    }

    const targetValue = this.props.value[0];
    const option = this._findOption(this.state.options, targetValue);
    if (option) {
      // Initial load and value change should always scroll to the selected option
      if (forceScroll) {
        this.focusedOptionScrollState.lastScrolledKey = null;
      }
      this._focusOption(option);
    }
  }

  focus() {
    this.select.current.focus();
  }

  blurInput() {
    if (this.select.current) {
      this.select.current.blur();
    }
  }

  resetOptions() {
    this.setState({options: []});
  }

  _processOptions() {
    this.data = {};
    const keys = [];
    this.props.options.forEach((option) => {
      const optionID = option[this.props.valueKey];
      // Value property is needed for correct rendering of selected options
      option.value = optionID;
      this.data[optionID] = option;
      keys.push(optionID);
    });

    let options;

    if (this.props.renderAsTree) {
      // Utilize the fact that set has stable iteration order (~ insertion order)
      const sortedArr = new Set();
      keys.forEach((key) => {
        let option = this.data[key];
        if (!option.parent) {
          this._calculateDepth(key, 0, null, new Set(), sortedArr);
        }
      });

      options = [...sortedArr];

      // Expands the whole tree on the initial render
      if (this.props.expanded && !this.state.initialExpansion && options.length > 0) {
        for (const option of options) {
          this.toggledOptions.push(option);
          option.expanded = true;
        }
        this.setState({initialExpansion: true});
      }
    } else {
      // Flat list processing - just use all options without hierarchy
      options = this.props.options.slice();
      for (const option of options) {
        option.depth = 0;
        option.parent = null;
        option.expanded = false;
        option.visible = true;
      }
    }

    this.setState({options});
  }

  /**
   * Iterates all selected values
   * and expands all their ancestors.
   *
   * @private
   */
  _expandSelectedValues() {
    if (!this.props.value || !Array.isArray(this.props.value) || this.props.value.length === 0) {
      return;
    }

    for (let option of this.props.value) {
      const optionId = option?.[this.props.valueKey] ?? option;
      let parentOption = this.data[optionId]?.parent;

      while (parentOption) {
        // try to lookup an option already present in toggledOptions
        let existingOption = this._findOption(this.toggledOptions, parentOption);
        // add to toggledOptions if not found
        if (existingOption == null) {
          this.toggledOptions.push(parentOption);
          existingOption = parentOption;
        }

        // Trigger loading children of the expanded option ONLY if closed
        if (!existingOption.expanded) {
          this.props.onOptionToggle(existingOption);
          existingOption.expanded = true;
        }

        // move to the next parent
        parentOption = existingOption.parent;
      }
    }
  }

  /**
   * Finds the {@code searchedOption} in the given {@code dataset}
   * by matching the {@link #props.valueKey}
   *
   * @param dataset the array to search
   * @param searchedOption the option to lookup
   * @returns {any|null} the found option or null
   * @private
   */
  _findOption(dataset, searchedOption) {
    if (!searchedOption || !dataset) return null;
    const targetKey = searchedOption[this.props.valueKey] ?? searchedOption;
    let options = dataset.filter((el) => el[this.props.valueKey] === targetKey);
    if (options.length === 0) return null;
    if (searchedOption.path) {
      return options.find((option) => arraysAreEqual(option.path, searchedOption.path)) || options[0];
    }
    return options[0];
  }

  _findOptionWithParent(dataset, searchedOptionKey, parent) {
    let options = dataset.filter((el) => el[this.props.valueKey] === searchedOptionKey);
    return options.find((el) => el?.parent === parent);
  }

  _calculateDepth(key, depth, parent, visited, sortedArr) {
    let option = this.data[key];
    if (!option || visited.has(key)) {
      return;
    }
    //Checks whether the array of items already contain an option with the same valueKey (ID)
    if (sortedArr.has(option)) {
      //Deep copy of option, needed to distinguish option for multiple subtrees
      option = structuredClone(option);
    }

    sortedArr.add(option);
    visited.add(key);

    //Sets the idempotent properties
    option.depth = depth;
    option.parent = parent;
    option.path = [...visited];
    option.expanded = !!this._findOption(this.toggledOptions, option);

    //It can happen that the option is already loaded in the state
    //If so, set the correct expanded value from the state options
    //It is needed to check its full path to determine whether it is the correct option
    let existingOption = this._findOption(this.state.options, option);
    if (existingOption) {
      option.expanded = existingOption.expanded;
    }

    option[this.props.childrenKey].forEach((childID) => {
      // Create a new set for each child to avoid modifying the parent's visited set - prevent only loops in one tree branch
      this._calculateDepth(childID, depth + 1, option, new Set(visited), sortedArr);
    });
  }

  filterOption(candidate, inputValue) {
    const option = candidate.data;
    inputValue = inputValue.trim().toLowerCase();

    if (!this.props.renderAsTree) {
      return inputValue.length === 0 || option.visible !== false;
    }

    if (inputValue.length === 0) {
      return !option.parent || option.parent?.expanded;
    } else {
      return option.visible;
    }
  }

  filterValues(searchInput) {
    // when the fetch is delayed, it can cause incorrect filter render, this prevents it from happening
    if (this.select.current.inputRef.value !== searchInput) {
      searchInput = this.select.current.inputRef.value;
    }

    if (searchInput === "") return;

    const matches = [];
    let firstMatch = true;
    for (let option of this.state.options) {
      if (this.matchCheck(searchInput, getLabel(option, this.props.labelKey, this.props.getOptionLabel))) {
        option.visible = true;
        matches.push(option);
        if (firstMatch) {
          this._focusOption(option);
          firstMatch = false;
        }
      } else {
        option.visible = false;
      }
    }
    for (let match of matches) {
      while (match.parent !== null) {
        match = match.parent;
        match.expanded = true;
        match.visible = true;
      }
    }
    this.forceUpdate();
  }

  matchCheckFull(searchInput, optionLabel) {
    return optionLabel.toLowerCase().indexOf(searchInput.toLowerCase()) !== -1;
  }

  _onInputChange(input) {
    // Make the expensive calculation only when input has been really changed
    if (this.searchString === input) {
      return;
    }
    if (input.length !== 0) {
      this.filterValues(input);
    }

    this.searchString = input;
    this.props.onInputChange(input);
    // Collapses items which were expanded by the search
    if (input.length === 0) {
      for (let option of this.state.options) {
        option.expanded = !!this._findOption(this.toggledOptions, option);
      }
    }
  }

  _removeChildrenFromToggled(option) {
    if (option === undefined) return;
    for (const subTermId of option[this.props.childrenKey]) {
      const subTerm = this._findOptionWithParent(this.state.options, subTermId, option);
      const toggledItem = this._findOption(this.toggledOptions, subTerm);
      this.toggledOptions = this.toggledOptions.filter((term) => term !== toggledItem);
      this._removeChildrenFromToggled(subTerm);
    }
  }

  _onOptionClose(option) {
    if (option === undefined) return;
    option.expanded = false;
    this._focusOption(option);
    for (const subTermId of option[this.props.childrenKey]) {
      const subTerm = this._findOptionWithParent(this.state.options, subTermId, option);
      this._onOptionClose(subTerm);
    }
  }

  _onOptionToggle(option) {
    // disables option expansion/collapse when search string is present
    if (this.searchString !== "") {
      return;
    }
    this.props.onOptionToggle(option);

    if (option.expanded) {
      this._onOptionClose(option);
    } else {
      option.expanded = true;
    }

    // Adds/removes references for toggled items
    if (option.expanded) {
      this.toggledOptions.push(option);
    } else {
      const toggledItem = this._findOption(this.toggledOptions, option);
      this.toggledOptions = this.toggledOptions.filter((el) => el !== toggledItem);
      this._removeChildrenFromToggled(option);
    }

    this._focusOption(option);
  }

  //When selecting an option, we want to ensure that the path to it is expanded
  //Path is saved in toggledOptions
  _onOptionSelect(props) {
    props.selectOption(props.data);
  }

  //When using custom option, it is needed to set focusedOption manually
  _focusOption(option) {
    if (this.select.current) {
      this.select.current.setState({focusedOption: option});
    }
  }

  _onKeyDown(event) {
    if (event.key === " " && !this.searchString) {
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
  }

  render() {
    const props = this.props;
    const styles = this._prepareStyles();
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
        options={this.state.options}
        focusedOptionScrollState={this.focusedOptionScrollState}
        onOptionToggle={this._onOptionToggle}
        onOptionSelect={this._onOptionSelect}
        onOptionHover={this._focusOption}
        onKeyDown={this._onKeyDown}
        focus={this.focus}
      />
    );
  }

  _prepareStyles() {
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
      ...this.props.styles,
    };
  }
}

// Wrapper for MenuList, it doesn't do anything, it is only needed for correct passing of the onScroll prop
const Menu = (props) => {
  return (
    <components.Menu
      {...props}
      innerProps={{
        ...props.innerProps,
        onScrollCapture: (e) => {
          props.selectProps.listProps.onScroll(e.target);
        },
      }}
    >
      {props.children}
    </components.Menu>
  );
};

// Component for efficient rendering
const MenuList = (props) => {
  const {children} = props;
  const {optionHeight, maxHeight, valueKey, focusedOptionScrollState} = props.selectProps;

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

  /// Scroll to the currently focused option
  React.useLayoutEffect(() => {
    if (!Array.isArray(children) || !listRef.current || focusedOptionScrollState.suppressScroll) {
      return;
    }

    /// The children element to which we should scroll
    let target = children.find((child) => child.props?.isFocused);
    if (!target || !target.props?.data) {
      return;
    }

    const optionData = target.props.data;

    const targetKey = getOptionScrollKey(optionData, valueKey);
    const targetIndex = values.indexOf(target);
    if (targetIndex === -1) {
      return;
    }

    if (focusedOptionScrollState.lastScrolledKey === targetKey) {
      return;
    }

    try {
      listRef.current.scrollToItem(targetIndex, "center");
      focusedOptionScrollState.lastScrolledKey = targetKey;
    } catch (e) {
      // if scroll fails it doesn't matter much
    }
  });

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
