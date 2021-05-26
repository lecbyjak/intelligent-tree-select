import React, {Component} from 'react';

import Highlighter from 'react-highlight-words';
import {AutoSizer, List} from "react-virtualized";

import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css';
import 'react-virtualized-select/styles.css';

import PropTypes from 'prop-types'
import Select from './Select'
import {getLabel} from "./utils/Utils";
import Constants from "./utils/Constants";

class VirtualizedTreeSelect extends Component {

  constructor(props, context) {
    super(props, context);

    this._renderMenu = this._renderMenu.bind(this);
    this._processOptions = this._processOptions.bind(this);
    this._filterOptions = this._filterOptions.bind(this);
    this._optionRenderer = this._optionRenderer.bind(this);
    this.data = {};
    this.searchString = '';
    this.state = {
      options: []
    };
    this.select = React.createRef();
  }

  componentDidMount() {
    this._processOptions()
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
      this.select.current.blurInput();
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

  _optionRenderer({
                    focusedOption,
                    focusOption,
                    key,
                    option,
                    labelKey,
                    getOptionLabel,
                    selectValue,
                    optionStyle,
                    valueArray
                  }) {

    const className = ['VirtualizedSelectOption'];

    if (option === focusedOption) {
      className.push('VirtualizedSelectFocusedOption')
    }

    if (option.disabled) {
      className.push('VirtualizedSelectDisabledOption')
    }

    if (valueArray && valueArray.indexOf(option) >= 0) {
      className.push('VirtualizedSelectSelectedOption')
    }

    if (option.className) {
      className.push(option.className)
    }

    const events = option.disabled ? {} : {
      onClick: () => selectValue(option),
      onMouseEnter: () => focusOption(option),
    };

    return (
      <div style={optionStyle} className={className.join(' ')}
           onMouseEnter={events.onMouseEnter}
           onClick={events.onClick}
           key={key}>

        <Highlighter
          highlightClassName='highlighted'
          searchWords={[this.searchString]}
          autoEscape={false}
          textToHighlight={getLabel(option, labelKey, getOptionLabel)}
          highlightTag={"span"}
        />

      </div>
    )
  }

  // See https://github.com/JedWatson/react-select/#effeciently-rendering-large-lists-with-windowing
  _renderMenu({
                focusedOption,
                focusOption,
                labelKey,
                getOptionLabel,
                onSelect,
                options,
                selectValue,
                valueArray,
                valueKey
              }) {
    const {listProps, optionRenderer, childrenKey, optionLeftOffset, renderAsTree} = this.props;
    const focusedOptionIndex = options.indexOf(focusedOption);
    const height = this._calculateListHeight({options});
    const innerRowRenderer = optionRenderer || this._optionRenderer;

    function wrappedRowRenderer({index, key, style}) {
      const option = options[index];
      let leftOffset = 0;
      if (renderAsTree) leftOffset = option.depth * optionLeftOffset;
      const optionStyle = {
        ...style,
        left: leftOffset
      };

      return innerRowRenderer({
        childrenKey,
        focusedOption,
        focusedOptionIndex,
        focusOption,
        key,
        labelKey,
        getOptionLabel,
        option,
        optionIndex: index,
        optionStyle,
        renderAsTree,
        selectValue: onSelect,
        valueArray,
        valueKey
      })
    }

    return (
      <AutoSizer disableHeight>
        {({width}) => (
          <List
            className='VirtualSelectGrid'
            height={height}
            rowCount={options.length}
            rowHeight={({index}) => this._getOptionHeight({
              option: options[index]
            })}
            rowRenderer={wrappedRowRenderer}
            scrollToIndex={focusedOptionIndex}
            width={width}
            {...listProps}
          />
        )}
      </AutoSizer>
    )
  }

  _filterOptions(options, filter, selectedOptions) {
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

    // Uncomment this to disable showing selected options

    // if (Array.isArray(selectedOptions) && selectedOptions.length) {
    //     const selectedValues = selectedOptions.map((option) => option[this.props.valueKey]);
    //
    //     return filtered.filter(
    //         (option) => !selectedValues.includes(option[this.props.valueKey])
    //     )
    // }

    //console.log("Filter options (",options.length ,") end in: ", new Date().getTime() - now, "ms");
    return filteredWithParents;

  }

  _calculateListHeight({options}) {
    const {maxHeight, minHeight} = this.props;

    let height = 0;

    for (let optionIndex = 0; optionIndex < options.length; optionIndex++) {
      let option = options[optionIndex];

      height += this._getOptionHeight({option});

      if (height > maxHeight) {
        return maxHeight
      }
      if (height < minHeight) {
        return minHeight
      }
    }


    return height
  }

  _getOptionHeight({option}) {
    const {optionHeight} = this.props;

    return optionHeight instanceof Function
      ? optionHeight({option})
      : optionHeight
  }

  _onInputChange(input) {
    this.searchString = input;
    if ("onInputChange" in this.props) {
      this.props.onInputChange(input);
    }
  }

  render() {
    let menuStyle = this.props.menuStyle || {};
    let menuContainerStyle = this.props.menuContainerStyle || {};
    menuStyle.overflow = 'hidden';
    menuStyle.maxHeight = this.props.maxHeight;
    menuContainerStyle.maxHeight = this.props.maxHeight;
    menuContainerStyle.position = this.props.isMenuOpen ? 'relative' : 'absolute';

    const menuRenderer = this.props.menuRenderer || this._renderMenu;
    const filterOptions = this.props.filterOptions || this._filterOptions;

    return <Select
      ref={this.select}
      joinValues={!!this.props.multi}
      menuStyle={menuStyle}
      menuContainerStyle={menuContainerStyle}
      menuRenderer={menuRenderer}
      filterOptions={filterOptions}
      {...this.props}
      onInputChange={(input) => this._onInputChange(input)}
      options={this.state.options}
    />;
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
  menuContainerStyle: PropTypes.any,
  menuRenderer: PropTypes.func,
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
