import React, {Component} from 'react';
import Select from "react-select";
import 'react-virtualized/styles.css';
import PropTypes from 'prop-types'
import Option from "./Option";
import Constants from "./utils/Constants";

class VirtualizedTreeSelect extends Component {

  constructor(props, context) {
    super(props, context);

    this._processOptions = this._processOptions.bind(this);
    this.filterOption = this.filterOption.bind(this);
    this._onInputChange = this._onInputChange.bind(this);
    this._lookForTextInTree = this._lookForTextInTree.bind(this);
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
      option.value = option[this.props.valueKey]
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
      const id = candidate.data[this.props.valueKey];
      return this._lookForTextInTree(id, inputValue)
    }
  }


  _lookForTextInTree(id, inputValue) {
    const curr = this.data[id]
    if (!curr)
      return false
    if (curr[this.props.labelKey].toLowerCase().indexOf(inputValue) !== -1)
      return true
    let match = false;
    for (const children of curr.subTerm) {
      if (this._lookForTextInTree(children, inputValue)) {
        match = true;
        break;
      }
    }
    return match;
  }

  _onInputChange(input) {
    this.searchString = input;
    if ("onInputChange" in this.props) {
      this.props.onInputChange(input);
    }
  }

  render() {
    const props = this.props;
    const styles = this._prepareStyles();
    const filterOptions = props.filterOptions || this.filterOption;

    return <Select ref={this.select}
                   {...props}
                   style={styles}
                   filterOption={filterOptions}
                   onInputChange={this._onInputChange}
                   getOptionLabel={(option) => option[props.labelKey]}
                   components={{Option: Option}}
                   isMulti={props.multi}
                   blurInputOnSelect={false}
                   options={this.state.options}
    />
  }

  _prepareStyles() {
    return {
      menu: (provided) => ({
        overflow: "hidden",
        maxHeight: this.props.maxHeight,
        ...provided
      }),
      menuContainer: (provided) => ({
        maxHeight: this.props.maxHeight,
        ...provided
      })
    };
  }
}

VirtualizedTreeSelect.propTypes = {
  childrenKey: PropTypes.string,
  expanded: PropTypes.bool,
  filterOptions: PropTypes.func,
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
  isMenuOpen: undefined,
  maxHeight: 300,
  minHeight: 0,
  multi: false,
  renderAsTree: true,
  hideSelectedOptions: false
};

export {VirtualizedTreeSelect};
