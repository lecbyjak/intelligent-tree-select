import React, {Component} from 'react';
import Select, {components} from "react-select";
import PropTypes from 'prop-types'
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
    this._removeChildrenFromToggled = this._removeChildrenFromToggled.bind(this);
    this._onOptionSelect = this._onOptionSelect.bind(this);
    this.matchCheck = this.props.matchCheck || this.matchCheckFull;
    this.data = {};
    this.searchString = '';
    this.toggledOptions = [];
    this.state = {
      options: []
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
    this.props.options.forEach(option => {
      option.expanded = (option.expanded === undefined) ? this.props.expanded : option.expanded;
      const optionID = option[this.props.valueKey];
      this.data[optionID] = option;
      keys.push(optionID);
    });

    keys.forEach(key => {
      let option = this.data[key];
      if (!option.parent) {
        this._calculateDepth(key, 0, null, new Set());
      }
    });
    let options = [];
    keys.filter(key => this.data[key].depth === 0).forEach(key => {
      this._sort(options, key, new Set());
    });

    // Value property is needed for correct rendering of selected options
    options.forEach((option) => {
      option.value = option[this.props.valueKey];
    })

    this.setState({options});
  }

  _calculateDepth(key, depth, parentKey, visited) {
    let option = this.data[key];
    if (!option || visited.has(key)) {
      return;
    }
    visited.add(key);
    option.depth = depth;
    if (!option.parent) {
      option.parent = parentKey;
    }
    option[this.props.childrenKey].forEach(childID => {
      this._calculateDepth(childID, depth + 1, key, visited);
    });
  }

  _sort(sortedArr, key, visited) {
    let option = this.data[key];
    if (!option || visited.has(key)) {
      return;
    }
    visited.add(key);
    sortedArr.push(option);

    option[this.props.childrenKey].forEach(childID => {
      this._sort(sortedArr, childID, visited);
    });

    return sortedArr;
  }

  filterOption(candidate, inputValue) {
    const option = candidate.data;
    inputValue = inputValue.trim().toLowerCase();
    if (inputValue.length === 0) {
      return !option.parent || this.data[option.parent]?.expanded;
    } else {
      return option.visible;
    }

  }

  filterValues(searchInput) {
    // when the fetch is delayed, it can cause incorrect filter render, this prevents it from happening
    if (this.select.current.inputRef.value !== searchInput) {
      return;
    }

    const matches = []
    for (let option of this.state.options) {
      if (this.matchCheck(searchInput, getLabel(option, this.props.labelKey, this.props.getOptionLabel))) {
        option.visible = true;
        matches.push(option)
      } else {
        option.visible = false;
      }
    }
    for (let match of matches) {
      while (match.parent !== null) {
        match = this.data[match.parent];
        match.expanded = true;
        match.visible = true;
      }
    }
    this.forceUpdate();
  }

  matchCheckFull(searchInput, optionLabel) {
    return optionLabel.toLowerCase().indexOf(searchInput.toLowerCase()) !== -1
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
        option.expanded = !!this.toggledOptions.find(element => element[this.props.valueKey] === option[this.props.valueKey]);
      }
    }
  }

  _removeChildrenFromToggled(option) {
    if (option === undefined)
      return;
    for (const subTermId of option[this.props.childrenKey]) {
      const subTerm = this.state.options.find((term) => term[this.props.valueKey] === subTermId);
      this.toggledOptions = this.toggledOptions.filter((term) => term[this.props.valueKey] !== subTermId);
      this._removeChildrenFromToggled(subTerm)
    }
  }

  _onOptionToggle(option) {
    // disables option expansion/collapsion when search string is present
    if (this.searchString !== "") return;
    if ("onOptionToggle" in this.props) {
      this.props.onOptionToggle(option);
    }
    // Adds/removes references for toggled items
    if (option.expanded) {
      this.toggledOptions.push(option);
    } else {
      this.toggledOptions = this.toggledOptions.filter(el => el[this.props.valueKey] !== option[this.props.valueKey]);
      this._removeChildrenFromToggled(option);
    }
  }

  //When selecting an option, we want to ensure that the path to it is expanded
  //Path is saved in toggledOptions
  _onOptionSelect(props) {
    props.selectOption(props.data);
    let optionId = props.value;
    const isSelected = props.isSelected;

    if (isSelected)
      return

    let option = this.data[optionId];
    let parent = this.data[option.parent];
    while (parent) {
      if (!this.toggledOptions.find((el) => el[this.props.valueKey] === parent[this.props.valueKey])) {
        parent.expanded = true;
        this.toggledOptions.push(parent);
      }
      parent = this.data[parent.parent];
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
    return <Select ref={this.select}
                   {...props}
                   styles={styles}
                   menuIsOpen={this.props.isMenuOpen ? this.props.isMenuOpen : undefined}
                   filterOption={filterOptions}
                   onInputChange={this._onInputChange}
                   getOptionLabel={(option) => getLabel(option, props.labelKey, props.getOptionLabel)}
                   components={{Option: optionRenderer, Menu: Menu, MenuList: MenuList}}
                   isMulti={props.multi}
                   blurInputOnSelect={false}
                   options={this.state.options}
                   formatOptionLabel={this.props.valueRenderer}
                   autoFocus={true}
                   onOptionToggle={this._onOptionToggle}
                   onOptionSelect={this._onOptionSelect}
                   onOptionHover={this._onOptionHover}

    />
  }

  _prepareStyles() {
    return {
      dropdownIndicator: (provided, state) => ({
        ...provided,
        transform: state.selectProps.menuIsOpen && 'rotate(180deg)',
        display: !state.selectProps.isMenuOpen ? 'block' : 'none'
      }),
      indicatorSeparator: (provided, state) => ({
        ...provided,
        display: !state.selectProps.isMenuOpen ? 'block' : 'none'
      }),
      multiValue: (base) => ({
        ...base,
        backgroundColor: 'rgba(0, 126, 255, 0.08)',
        border: '1px solid #c2e0ff'
      }),
      multiValueRemove: (base) => ({
        ...base,
        color: '#007eff',
        cursor: 'pointer',
        borderLeft: '1px solid rgba(0,126,255,.24)',
        "&:hover": {
          backgroundColor: 'rgba(0,113,230,.08)',
          color: '#0071e6'
        }
      }),
      noOptionsMessage: (provided, state) => ({
        ...provided,
        paddingLeft: '16px',
      }),
      menu: (provided, state) => ({
        ...provided,
        position: state.selectProps.menuIsFloating? "absolute" : "relative"
      }),
      valueContainer: (provided, state) => ({
        ...provided,
        display: state.hasValue ? 'flex' : 'inline-grid',
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
        ...props.innerProps, onScrollCapture: (e) => {
          props.selectProps.listProps.onScroll(e.target)
        }
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
    height = Math.min(maxHeight, optionHeight * values.length)
  } else {
    values = [<components.NoOptionsMessage {...children.props} children={children.props.children}/>];
    height = 40;
  }


  return (
    <List
      height={height}
      itemCount={values.length}
      itemSize={optionHeight}
      overscanCount={30}
    >
      {({index, style}) => <div style={style}>{values[index]}</div>}
    </List>
  );
}

VirtualizedTreeSelect.propTypes = {
  childrenKey: PropTypes.string,
  expanded: PropTypes.bool,
  filterOptions: PropTypes.func,
  matchCheck: PropTypes.func,
  isMenuOpen: PropTypes.bool,
  labelKey: PropTypes.string,
  getOptionLabel: PropTypes.func,
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
