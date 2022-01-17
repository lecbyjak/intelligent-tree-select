import React, {Component} from 'react';
import Select from "react-select";
import 'react-virtualized/styles.css';
import PropTypes from 'prop-types'
import Option from "./Option";
import {getLabel} from "./utils/Utils";
import Constants from "./utils/Constants";

class VirtualizedTreeSelect extends Component {

  constructor(props, context) {
    super(props, context);

    this._processOptions = this._processOptions.bind(this);
    this._filterOptions = this._filterOptions.bind(this);
    this._onInputChange = this._onInputChange.bind(this);
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
    let optionID;
    this.data = {};
    this.props.options.forEach(option => {
      option.expanded = (option.expanded === undefined) ? this.props.expanded : option.expanded;
      optionID = option[this.props.valueKey];
      this.data[optionID] = option;
    });

    const keys = Object.keys(this.data);
    let options = [];
    keys.forEach(xkey => {
      let option = this.data[xkey];
      if (!option.parent) this._calculateDepth(xkey, 0, null, new Set());
    });
    keys.forEach(xkey => {
      let option = this.data[xkey];
      if (option.depth === 0) this._sort(options, xkey, new Set());
    });

    this.setState({options: options});
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
  _filterOption(candidate, inputValue) {
    const matches = inputValue.trim().length === 0 || candidate.label.toLowerCase().indexOf(inputValue.toLowerCase());
    if (matches) {
      return true;
    }
    // TODO Return true for options whose descendant matches.
  }

  _filterOptions(options, filter) {
    const doesMatch = option => {
      let label = getLabel(option, this.props.labelKey, this.props.getOptionLabel);
      return label.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
    }
    let filtered = filter.trim().length === 0 ? options : options.filter(doesMatch);


    let filteredWithParents = [];

    function resolveInsertionIndex(options, parentIndex) {
      if (parentIndex === -1) {
        return -1;
      }
      let index = parentIndex + 1;
      let depth = options[parentIndex].depth;
      while (index < options.length && options[index].depth > depth) {
        index++;
      }
      return index;
    }

    // get parent options for filtered options
    filtered.forEach(option => {
      let parent = option.parent && option.parent.length > 0 ? this.data[option.parent] : null;
      const toInsert = [];
      let parentIndex = -1;

      while (parent) {
        if (filteredWithParents.includes(parent)) {
          if (filter.trim().length > 0 && doesMatch(parent)) {
            parent.expanded = true;
          }
          parentIndex = filteredWithParents.indexOf(parent);
          break;
        }
        parent.expanded = true;
        toInsert.unshift(parent);
        parent = parent.parent ? parent.parent.length > 0 ? this.data[parent.parent] : null : null;
      }
      if (!filteredWithParents.includes(option)) {
        toInsert.push(option);
      }
      const insertionIndex = resolveInsertionIndex(filteredWithParents, parentIndex);
      for (let i = 0; i < toInsert.length; i++) {
        if (insertionIndex > 0) {
          filteredWithParents.splice(insertionIndex + i, 0, toInsert[i]);
        } else {
          filteredWithParents.push(toInsert[i]);
        }
      }
    });

    //remove all hidden options
    const hidden = [];
    for (let i = 0; i < filteredWithParents.length; i++) {
      const item = filteredWithParents[i];
      let parent = item.parent;
      while (parent && parent.length > 0) {
        // Consider option hidden also if its parent cannot be found (workaround for multiple parents)
        if (!this.data[parent] || !this.data[parent].expanded) {
          hidden.push(item);
          break;
        }
        parent = this.data[parent].parent;
      }
    }
    filteredWithParents = filteredWithParents.filter(v => !hidden.includes(v));
    return filteredWithParents;

  }

  _onInputChange(input) {
    this.searchString = input;
    if ("onInputChange" in this.props) {
      this.props.onInputChange(input);
    }
  }

  render() {
    const styles = this._prepareStyles();
    const filterOptions = this.props.filterOptions || this._filterOption;

    return <Select ref={this.select}
                   style={styles}
                   filterOption={filterOptions}
                   options={this.state.options}
                   onInputChange={this._onInputChange}
                   getOptionLabel={(option) => option[this.props.labelKey]}
                   components={{Option: Option}}
                   isMulti={this.props.multi}
                   {...this.props}
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
  valueKey: PropTypes.string
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
};

export {VirtualizedTreeSelect};
