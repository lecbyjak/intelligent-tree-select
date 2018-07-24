import React, {Component} from 'react';

import Highlighter from 'react-highlight-words'
import {AutoSizer, List} from "react-virtualized";

import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css'
import 'react-virtualized-select/styles.css'
import 'bootstrap/dist/css/bootstrap.css';

import PropTypes from 'prop-types'
import Select from './Select'


class VirtualizedTreeSelect extends Component {
  
  constructor(props, context) {
    super(props, context);
    
    this._renderMenu = this._renderMenu.bind(this);
    this._processOptions = this._processOptions.bind(this);
    this._filterOptions = this._filterOptions.bind(this);
    this._optionRenderer = this._optionRenderer.bind(this);
    this._setListRef = this._setListRef.bind(this);
    this._setSelectRef = this._setSelectRef.bind(this);
    this.data = {};
    this.searchString = '';
    this.state = {
      options: []
    };
  }
  
  componentDidMount() {
    this._processOptions()
  }
  
  componentDidUpdate(prevProps) {
    if (this.props.options.length !== prevProps.options.length || this.props.expanded !== prevProps.expanded) {
      this._processOptions();
      this.forceUpdate()
    }
  }
  
  _processOptions() {
    //let now = new Date().getTime();
    let optionID;
    this.data = {};
    this.props.options.forEach(option => {
      option.expanded = this.props.expanded;
      optionID = option[option.providers[0].valueKey];
      this.data[optionID] = option;
    });
    
    const keys = Object.keys(this.data);
    let sortedArr = [];
    keys.forEach(xkey => {
      let option = this.data[xkey];
      if (!option.parent) sortedArr = this._getSortedOptionsWithDepthAndParent(sortedArr, xkey, 0, null);
    });
    
    
    this.setState({options: sortedArr});
    //console.log("Process options (",sortedArr.length ,") end in: ", new Date().getTime() - now, "ms");
  }
  
  _getSortedOptionsWithDepthAndParent(sortedArr, key, depth, parentKey) {
    let option = this.data[key];
    
    option.depth = depth;
    if (!option.parent) option.parent = parentKey;
    
    sortedArr.push(option);
    
    option[option.providers[0].childrenKey].forEach(childID => {
      this._getSortedOptionsWithDepthAndParent(sortedArr, childID, depth + 1, key);
      
    });
    
    return sortedArr;
  }
  
  _optionRenderer({focusedOption, focusOption, key, option, labelKey, selectValue, optionStyle, valueArray}) {
    
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
          textToHighlight={option[labelKey]}
          highlightTag={"span"}
        />
      
      </div>
    )
  }
  
  // See https://github.com/JedWatson/react-select/#effeciently-rendering-large-lists-with-windowing
  _renderMenu({focusedOption, focusOption, labelKey, onSelect, options, selectValue, valueArray}) {
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
        onSelect,
        option,
        optionIndex: index,
        optionStyle,
        selectValue: onSelect,
        style,
        valueArray,
      })
    }
    
    return (
      <AutoSizer disableHeight>
        {({width}) => (
          <List
            className='VirtualSelectGrid'
            height={height}
            ref={this._setListRef}
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
    //let now = new Date().getTime();
    
    let filtered = options.filter(option => {
      let label = option[option.providers[0].labelKey];
      if (typeof label === 'string' || label instanceof String) {
        return label.toLowerCase().indexOf(filter.toLowerCase()) !== -1
      } else {
        return option.providers[0].labelValue(label).toLowerCase().indexOf(filter.toLowerCase()) !== -1
      }
    });
    
    
    let filteredWithParents = [];
    let index = 0;
    filtered.forEach(option => {
      filteredWithParents.push(option);
      let parent = option.parent ? option.parent.length > 0 ? this.data[option.parent] : null : null;
      
      while (parent) {
        if (filteredWithParents.includes(parent)) break;
        filteredWithParents.splice(index, 0, parent);
        parent = parent.parent ? parent.parent.length > 0 ? this.data[parent.parent] : null : null;
      }
      index = filteredWithParents.length;
    });
    
    for (let i = 0; i < filteredWithParents.length; i++) {
      if (!filteredWithParents[i].expanded) {
        let depth = filteredWithParents[i].depth;
        while (true) {
          let option = filteredWithParents[i + 1];
          if (option && option.depth > depth) filteredWithParents.splice(i + 1, 1);
          else break;
        }
      }
    }
    
    // Uncomment to not show selected options
    
    // if (Array.isArray(selectedOptions) && selectedOptions.length) {
    //     const selectedValues = selectedOptions.map((option) => option[option.providers[0].valueKey]);
    //
    //     return filtered.filter(
    //         (option) => !selectedValues.includes(option[option.providers[0].valueKey])
    //     )
    // }
    
    //console.log("Filter options (",options.length ,") end in: ", new Date().getTime() - now, "ms");
    return filteredWithParents;
    
  }
  
  _calculateListHeight({options}) {
    const {maxHeight} = this.props;
    
    let height = 0;
    
    for (let optionIndex = 0; optionIndex < options.length; optionIndex++) {
      let option = options[optionIndex];
      
      height += this._getOptionHeight({option});
      
      if (height > maxHeight) {
        return maxHeight
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
  
  _setListRef(ref) {
    this._listRef = ref
  }
  
  _setSelectRef(ref) {
    this._selectRef = ref
  }
  
  _onInputChange(input){
    this.searchString = input;
    if ("onInputChange" in this.props) {
      this.props.onInputChange(input);
    }
  }
  
  render() {
    let menuStyle = this.props.menuStyle || {};
    menuStyle.overflow = 'hidden';
    const menuRenderer = this.props.menuRenderer || this._renderMenu;
    const filterOptions = this.props.filterOptions || this._filterOptions;
    
    return (
      <Select
        joinValues={!!this.props.multi}
        menuStyle={menuStyle}
        ref={this._setSelectRef}
        menuRenderer={menuRenderer}
        filterOptions={filterOptions}
        {...this.props}
        onInputChange={(input) => this._onInputChange(input)}
        options={this.state.options}
      />
    )
  }
  
  
}

VirtualizedTreeSelect.propTypes = {
  childrenKey: PropTypes.string,
  expanded: PropTypes.bool,
  isMenuOpen: PropTypes.bool,
  listProps: PropTypes.object,
  maxHeight: PropTypes.number,
  menuRenderer: PropTypes.func,
  optionHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  optionLeftOffset: PropTypes.number,
  renderAsTree: PropTypes.bool,
};

VirtualizedTreeSelect.defaultProps = {
  childrenKey: 'children',
  options: [],
  optionHeight: 25,
  optionLeftOffset: 16,
  expanded: false,
  isMenuOpen: false,
  maxHeight: 200,
  multi: false,
  renderAsTree: true,
};

export {VirtualizedTreeSelect};
