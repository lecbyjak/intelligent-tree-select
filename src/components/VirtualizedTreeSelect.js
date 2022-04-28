import React, {Component} from 'react';
import Select, {components} from "react-select";
import PropTypes from 'prop-types'
import Option from "./Option";
import Constants from "./utils/Constants";
import {FixedSizeList as List} from "react-window";

class VirtualizedTreeSelect extends Component {

  constructor(props, context) {
    super(props, context);

    this._processOptions = this._processOptions.bind(this);
    this.filterOption = this.filterOption.bind(this);
    this._onInputChange = this._onInputChange.bind(this);
    this._filterValues = this._filterValues.bind(this);
    this._onOptionToggle = this._onOptionToggle.bind(this);
    this.matchCheck = this.props.matchCheck || this.matchCheckFull;
    this.data = {};
    this.searchString = '';
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
      return !option.parent || this.data[option.parent].expanded;
    } else {
      return option.visible;
    }

  }

  _filterValues(searchInput) {
    const matches = []
    for (let option of this.state.options) {
      if (this.matchCheck(searchInput, option[this.props.labelKey])) {
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
  }

  matchCheckFull(searchInput, optionLabel) {
    return optionLabel.toLowerCase().indexOf(searchInput.toLowerCase()) !== -1
  }


  _onInputChange(input) {
    //Make the expensive calculation only when input has been really changed
    if (this.searchString !== input && input.length !== 0) {
      this._filterValues(input);
    }
    this.searchString = input;
    if ("onInputChange" in this.props) {
      this.props.onInputChange(input);
    }
  }

  _onOptionToggle(option) {
    // disables option expansion/collapsion when search string is present
    if (this.searchString !== "") return;
    if ("onOptionToggle" in this.props) {
      this.props.onOptionToggle(option);
    }
  }

  render() {
    const props = this.props;
    const styles = this._prepareStyles();
    const filterOptions = props.filterOptions || this.filterOption;

    return <Select ref={this.select}
                   {...props}
                   styles={styles}
                   menuIsOpen={this.props.isMenuOpen ? this.props.isMenuOpen : undefined}
                   filterOption={filterOptions}
                   onInputChange={this._onInputChange}
                   getOptionLabel={(option) => option[props.labelKey]}
                   components={{Option: Option, MenuList: MenuList}}
                   isMulti={props.multi}
                   blurInputOnSelect={false}
                   options={this.state.options}
                   formatOptionLabel={this.props.valueRenderer}
                   autoFocus={true}
                   onOptionToggle={this._onOptionToggle}


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
      noOptionsMessage: (provided, state) => ({
        ...provided,
        paddingLeft: '16px',
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

// Component for efficient rendering
class MenuList extends Component {
  render() {
    const {children, maxHeight} = this.props;
    const {optionHeight} = this.props.selectProps;

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
      >
        {({index, style}) => <div style={style}>{values[index]}</div>}
      </List>
    );
  }
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
  hideSelectedOptions: PropTypes.bool
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
  hideSelectedOptions: false
};

export {VirtualizedTreeSelect};
