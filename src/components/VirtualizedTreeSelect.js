import React, {Component} from "react";
import Select, {components} from "react-select";
import PropTypes from "prop-types";
import Option from "./Option";
import Constants from "./utils/Constants";
import {FixedSizeList as List} from "react-window";
import {arraysAreEqual, getLabel} from "./utils/Utils";

class VirtualizedTreeSelect extends Component {
  constructor(props, context) {
    super(props, context);

    this._processOptions = this._processOptions.bind(this);
    this._expandSelectedValues = this._expandSelectedValues.bind(this);
    this._onOptionHover = this._onOptionHover.bind(this);
    this.filterOption = this.filterOption.bind(this);
    this._onInputChange = this._onInputChange.bind(this);
    this.filterValues = this.filterValues.bind(this);
    this._onOptionToggle = this._onOptionToggle.bind(this);
    this._findOption = this._findOption.bind(this);
    this._findOptionWithParent = this._findOptionWithParent.bind(this);
    this._onOptionClose = this._onOptionClose.bind(this);
    this._removeChildrenFromToggled = this._removeChildrenFromToggled.bind(this);
    this._onOptionSelect = this._onOptionSelect.bind(this);
    this.focus = this.focus.bind(this);
    this.matchCheck = this.props.matchCheck || this.matchCheckFull;
    this.data = {};
    this.searchString = "";
    /**
     * List of expanded options
     */
    this.toggledOptions = [];
    this.state = {
      options: [],
      initialExpansion: false,
      /**
       * The element to which the menu should be scrolled
       */
      scrollTarget: null,
    };
    this.select = React.createRef();
    this.userInteracted = false;
  }

  componentDidMount() {
    this.userInteracted = false;
    this._processOptions();
    this._expandSelectedValues();
    this.forceUpdate();
  }

  componentDidUpdate(prevProps) {
    if (!arraysAreEqual(this.props.value, prevProps.value)) {
      this.userInteracted = false;
    }
    if (this.props.update > prevProps.update) {
      this._processOptions();
      this._expandSelectedValues();
      this.forceUpdate();
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
    if (!this.props.value || !Array.isArray(this.props.value)) return;

    for (let option of this.props.value) {
      const optionId = option[this.props.valueKey];
      let parentOption = this.data[optionId]?.parent;

      while (parentOption) {
        // try to lookup an option already present in toggledOptions
        let existingOption = this._findOption(this.toggledOptions, parentOption);
        // add to toggledOptions if not found
        if (existingOption == null) {
          this.toggledOptions.push(parentOption);
          existingOption = parentOption;
        }

        // Trigger loading children of the expanded option
        this.props.onOptionToggle(existingOption);
        existingOption.expanded = true;

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
    let options = dataset.filter((el) => el[this.props.valueKey] === searchedOption[this.props.valueKey]);
    for (const option of options) {
      if (arraysAreEqual(option.path, searchedOption.path)) {
        return option;
      }
    }
    return null;
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
    option.expanded = false;

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
          this._onOptionHover(option);
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
    this.userInteracted = true;
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
    this.userInteracted = true;
    option.expanded = false;
    for (const subTermId of option[this.props.childrenKey]) {
      const subTerm = this._findOptionWithParent(this.state.options, subTermId, option);
      this._onOptionClose(subTerm);
    }
  }

  _onOptionToggle(option) {
    this.userInteracted = true;
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
  }

  //When selecting an option, we want to ensure that the path to it is expanded
  //Path is saved in toggledOptions
  _onOptionSelect(props) {
    props.selectOption(props.data);

    this.userInteracted = false;
    this._expandSelectedValues();
    this.forceUpdate();
  }

  //When using custom option, it is needed to set focusedOption manually
  _onOptionHover(option) {
    this.select.current.setState({focusedOption: option});
    console.debug("onOptionHover", option);
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
        onOptionToggle={this._onOptionToggle}
        onOptionSelect={this._onOptionSelect}
        onOptionHover={this._onOptionHover}
        userInteracted={this.userInteracted}
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
  const {optionHeight, maxHeight, valueKey, userInteracted} = props.selectProps;

  /// React-Window List reference
  const listRef = React.useRef(null);

  // the unique key to which we scrolled last time
  const lastScrolledKeyRef = React.useRef(null);

  /**
   * The index of the element to which we scrolled last time.
   * This may change e.g. when new children are loaded, and we need to scroll again.
   */
  const lastScrolledIndexRef = React.useRef(null);

  /// whether the internal select detected user scroll
  const userScrolledRef = React.useRef(false);

  /// the last value of user interaction from the outer element
  const lastUserInteractedRef = React.useRef(false);

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

  /// Scroll to the currently selected option
  React.useLayoutEffect(() => {
    if (!Array.isArray(children) || !listRef.current) {
      return;
    }

    /// The children element to which we should scroll
    let target = children.find((child) => child.props?.isSelected);
    let usingFocused = false; // TODO scroll on focused
    if (!target || !target.props?.data) {
      return;
    }

    const optionData = target.props.data;

    const targetKey = optionData.path?.join(">") || optionData[valueKey];
    const targetIndex = values.indexOf(target);
    console.debug("target key", targetKey);
    if (targetIndex === -1) {
      return;
    }

    const userInteractedIsSame = userInteracted === lastUserInteractedRef.current;
    const userDidNotScroll = !userScrolledRef.current;
    const lastScrolledKeyIsSame = lastScrolledKeyRef.current === targetKey;
    const lastScrolledIndexIsSame = lastScrolledIndexRef.current === targetIndex;

    if (userInteractedIsSame && userDidNotScroll && lastScrolledKeyIsSame && lastScrolledIndexIsSame && !usingFocused) {
      // no change, do not scroll
      return;
    }

    console.debug("scrolling", userInteractedIsSame, userDidNotScroll, lastScrolledKeyIsSame, lastScrolledIndexIsSame);

    lastUserInteractedRef.current = userInteracted;
    lastScrolledKeyRef.current = targetKey;
    lastScrolledIndexRef.current = targetIndex;

    try {
      listRef.current.scrollToItem(targetIndex, "smart");
    } catch (e) {
      // if scroll fails it doesn't matter much
    }
  });

  return (
    <List
      ref={listRef}
      height={height}
      itemCount={values.length}
      itemSize={optionHeight}
      overscanCount={30}
      onWheel={() => {
        userScrolledRef.current = true;
      }}
      onTouchMove={() => {
        userScrolledRef.current = true;
      }}
      onMouseDown={() => {
        userScrolledRef.current = true;
      }}
      onKeyDown={() => {
        userScrolledRef.current = true;
      }}
    >
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
