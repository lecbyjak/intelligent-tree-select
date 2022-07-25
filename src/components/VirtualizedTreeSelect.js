import React, {Component} from "react";
import Select, {components} from "react-select";
import PropTypes from "prop-types";
import Option from "./Option";
import Constants from "./utils/Constants";
import {FixedSizeList as List} from "react-window";
import {getLabel} from "./utils/Utils";

class VirtualizedTreeSelect extends Component {
  constructor(props, context) {
    super(props, context);

    this._processOptions = this._processOptions.bind(this);
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
    this.matchCheck = this.props.matchCheck || this.matchCheckFull;
    this.data = {};
    this.searchString = "";
    this.toggledOptions = [];
    this.state = {
      options: [],
    };
    this.select = React.createRef();
  }

  componentDidMount() {
    this._processOptions();
  }

  componentDidUpdate(prevProps) {
    if (this.props.update > prevProps.update) {
      this._processOptions();
    }
  }

  focus() {
    if (this.select.current) {
      this.select.current.focus();
    }
  }

  blurInput() {
    if (this.select.current) {
      this.select.current.blur();
    }
  }

  _processOptions() {
    this.data = {};
    const keys = [];
    this.props.options.forEach((option) => {
      const optionID = option[this.props.valueKey];
      this.data[optionID] = option;
      keys.push(optionID);
    });
    const sortedArr = [];
    keys.forEach((key) => {
      let option = this.data[key];
      if (!option.parent) {
        this._calculateDepth(key, 0, null, new Set(), sortedArr);
      }
    });

    let options = sortedArr;

    // Value property is needed for correct rendering of selected options
    options.forEach((option) => {
      option.value = option[this.props.valueKey];
    });

    this.setState({options});
  }

  _findOption(dataset, searchedOption) {
    let options = dataset.filter((el) => el[this.props.valueKey] === searchedOption[this.props.valueKey]);
    let existingOption;
    if (options && searchedOption.parent) {
      existingOption = options.find(
        (el) => el?.parent[this.props.valueKey] === searchedOption.parent[this.props.valueKey]
      );
    } else {
      existingOption = options.length === 1 ? options[0] : null;
    }
    return existingOption;
  }

  _findOptionWithParent(dataset, searchedOptionKey, parent) {
    let options = dataset.filter((el) => el[this.props.valueKey] === searchedOptionKey);
    return options.find((el) => el?.parent[this.props.valueKey] === parent[this.props.valueKey]);
  }

  _calculateDepth(key, depth, parent, visited, sortedArr) {
    let option = this.data[key];
    if (!option || visited.has(key)) {
      return;
    }

    if (sortedArr.includes(option)) {
      //Deep copy of option, needed to distinguish option for multiple subtrees
      option = JSON.parse(JSON.stringify(option));
    }

    sortedArr.push(option);
    visited.add(key);
    option.depth = depth;
    option.parent = parent;

    //If the item already present, set the correct expanded value
    let existingOption = this._findOption(this.state.options, option);
    if (existingOption) {
      option.expanded = existingOption.expanded;
    }

    option[this.props.childrenKey].forEach((childID) => {
      this._calculateDepth(childID, depth + 1, option, visited, sortedArr);
    });
  }

  filterOption(candidate, inputValue) {
    const option = candidate.data;
    inputValue = inputValue.trim().toLowerCase();
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
    for (let option of this.state.options) {
      if (this.matchCheck(searchInput, getLabel(option, this.props.labelKey, this.props.getOptionLabel))) {
        option.visible = true;
        matches.push(option);
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
    if (this.searchString !== input && input.length !== 0) {
      this.filterValues(input);
    }

    this.searchString = input;
    if ("onInputChange" in this.props) {
      this.props.onInputChange(input);
    }
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
    for (const subTermId of option[this.props.childrenKey]) {
      const subTerm = this._findOptionWithParent(this.state.options, subTermId, option);
      this._onOptionClose(subTerm);
    }
  }

  _onOptionToggle(option) {
    // disables option expansion/collapsion when search string is present
    if (this.searchString !== "") {
      return;
    }
    if ("onOptionToggle" in this.props) {
      this.props.onOptionToggle(option);
    }

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
    const isSelected = props.isSelected;

    if (isSelected) return;

    let parent = props.data.parent;
    while (parent) {
      let option = this._findOption(this.toggledOptions, parent);
      if (!option) {
        parent.expanded = true;
        this.toggledOptions.push(parent);
      }
      parent = option?.parent ?? parent.parent;
    }
  }

  //When using custom option, it is needed to set focusedOption manually
  _onOptionHover(option) {
    this.select.current.setState({focusedOption: option});
  }

  render() {
    const props = this.props;
    const styles = this._prepareStyles();
    const filterOptions = props.filterOptions || this.filterOption;
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
        }}
        isMulti={props.multi}
        blurInputOnSelect={false}
        options={this.state.options}
        onOptionToggle={this._onOptionToggle}
        onOptionSelect={this._onOptionSelect}
        onOptionHover={this._onOptionHover}
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
      }),
      noOptionsMessage: (provided, state) => ({
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
    };
  }
}

// Wrapper for MenuList, it doesn't do anything, it is only needed for correct pass of the onScroll prop
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
  const {optionHeight, maxHeight} = props.selectProps;

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

  return (
    <List height={height} itemCount={values.length} itemSize={optionHeight} overscanCount={30}>
      {({index, style}) => <div style={style}>{values[index]}</div>}
    </List>
  );
};

VirtualizedTreeSelect.propTypes = {
  autoFocus: PropTypes.bool,
  childrenKey: PropTypes.string,
  expanded: PropTypes.bool,
  filterOptions: PropTypes.func,
  matchCheck: PropTypes.func,
  isMenuOpen: PropTypes.bool,
  labelKey: PropTypes.string,
  getOptionLabel: PropTypes.func,
  getOptionValue: PropTypes.func,
  maxHeight: PropTypes.number,
  menuStyle: PropTypes.object,
  minHeight: PropTypes.number,
  multi: PropTypes.bool,
  onInputChange: PropTypes.func,
  optionHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  optionLeftOffset: PropTypes.number,
  optionRenderer: PropTypes.func,
  options: PropTypes.array,
  renderAsTree: PropTypes.bool,
  valueKey: PropTypes.string,
  hideSelectedOptions: PropTypes.bool,
  menuIsFloating: PropTypes.bool,
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
};

export {VirtualizedTreeSelect};
