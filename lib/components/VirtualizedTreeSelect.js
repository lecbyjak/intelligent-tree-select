"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VirtualizedTreeSelect = void 0;

var _react = _interopRequireWildcard(require("react"));

var _reactSelect = _interopRequireDefault(require("react-select"));

require("react-virtualized/styles.css");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _Option = _interopRequireDefault(require("./Option"));

var _Utils = require("./utils/Utils");

var _Constants = _interopRequireDefault(require("./utils/Constants"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

class VirtualizedTreeSelect extends _react.Component {
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
    this.select = /*#__PURE__*/_react.default.createRef();
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
      option.expanded = option.expanded === undefined ? this.props.expanded : option.expanded;
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
    this.setState({
      options: options
    });
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
    } // TODO Return true for options whose descendant matches.

  }

  _filterOptions(options, filter) {
    const doesMatch = option => {
      let label = (0, _Utils.getLabel)(option, this.props.labelKey, this.props.getOptionLabel);
      return label.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
    };

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
    } // get parent options for filtered options


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
    }); //remove all hidden options

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
    return /*#__PURE__*/_react.default.createElement(_reactSelect.default, _extends({
      ref: this.select,
      style: styles,
      filterOption: filterOptions,
      options: this.state.options,
      onInputChange: this._onInputChange,
      getOptionLabel: option => option[this.props.labelKey],
      components: {
        Option: _Option.default
      },
      isMulti: this.props.multi
    }, this.props));
  }

  _prepareStyles() {
    return {
      menu: provided => _objectSpread({
        overflow: "hidden",
        maxHeight: this.props.maxHeight
      }, provided),
      menuContainer: provided => _objectSpread({
        maxHeight: this.props.maxHeight
      }, provided)
    };
  }

}

exports.VirtualizedTreeSelect = VirtualizedTreeSelect;
VirtualizedTreeSelect.propTypes = {
  childrenKey: _propTypes.default.string,
  expanded: _propTypes.default.bool,
  filterOptions: _propTypes.default.func,
  isMenuOpen: _propTypes.default.bool,
  labelKey: _propTypes.default.string,
  getOptionLabel: _propTypes.default.func,
  maxHeight: _propTypes.default.number,
  menuStyle: _propTypes.default.object,
  minHeight: _propTypes.default.number,
  multi: _propTypes.default.bool,
  onInputChange: _propTypes.default.func,
  optionHeight: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.func]),
  optionLeftOffset: _propTypes.default.number,
  optionRenderer: _propTypes.default.func,
  options: _propTypes.default.array,
  renderAsTree: _propTypes.default.bool,
  valueKey: _propTypes.default.string
};
VirtualizedTreeSelect.defaultProps = {
  childrenKey: _Constants.default.CHILDREN_KEY,
  labelKey: _Constants.default.LABEL_KEY,
  valueKey: _Constants.default.VALUE_KEY,
  options: [],
  optionHeight: 25,
  optionLeftOffset: 16,
  expanded: false,
  isMenuOpen: false,
  maxHeight: 300,
  minHeight: 0,
  multi: false,
  renderAsTree: true
};