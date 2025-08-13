"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.VirtualizedTreeSelect = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactSelect = _interopRequireWildcard(require("react-select"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _Option = _interopRequireDefault(require("./Option"));
var _Constants = _interopRequireDefault(require("./utils/Constants"));
var _reactWindow = require("react-window");
var _Utils = require("./utils/Utils");
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : {default: e};
}
function _getRequireWildcardCache(e) {
  if ("function" != typeof WeakMap) return null;
  var r = new WeakMap(),
    t = new WeakMap();
  return (_getRequireWildcardCache = function (e) {
    return e ? t : r;
  })(e);
}
function _interopRequireWildcard(e, r) {
  if (!r && e && e.__esModule) return e;
  if (null === e || ("object" != typeof e && "function" != typeof e)) return {default: e};
  var t = _getRequireWildcardCache(r);
  if (t && t.has(e)) return t.get(e);
  var n = {__proto__: null},
    a = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var u in e)
    if ("default" !== u && {}.hasOwnProperty.call(e, u)) {
      var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
      i && (i.get || i.set) ? Object.defineProperty(n, u, i) : (n[u] = e[u]);
    }
  return (n.default = e), t && t.set(e, n), n;
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r &&
      (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })),
      t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2
      ? ownKeys(Object(t), !0).forEach(function (r) {
          _defineProperty(e, r, t[r]);
        })
      : Object.getOwnPropertyDescriptors
      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
      : ownKeys(Object(t)).forEach(function (r) {
          Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
  }
  return e;
}
function _defineProperty(e, r, t) {
  return (
    (r = _toPropertyKey(r)) in e
      ? Object.defineProperty(e, r, {value: t, enumerable: !0, configurable: !0, writable: !0})
      : (e[r] = t),
    e
  );
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _extends() {
  return (
    (_extends = Object.assign
      ? Object.assign.bind()
      : function (n) {
          for (var e = 1; e < arguments.length; e++) {
            var t = arguments[e];
            for (var r in t) ({}.hasOwnProperty.call(t, r) && (n[r] = t[r]));
          }
          return n;
        }),
    _extends.apply(null, arguments)
  );
}
class VirtualizedTreeSelect extends _react.Component {
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
    this.focus = this.focus.bind(this);
    this.matchCheck = this.props.matchCheck || this.matchCheckFull;
    this.data = {};
    this.searchString = "";
    this.toggledOptions = [];
    this.state = {
      options: [],
      initialExpansion: false,
    };
    this.select = /*#__PURE__*/ _react.default.createRef();
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
    this.select.current.focus();
  }
  blurInput() {
    if (this.select.current) {
      this.select.current.blur();
    }
  }
  resetOptions() {
    this.setState({
      options: [],
    });
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
        this.setState({
          initialExpansion: true,
        });
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
    this.setState({
      options,
    });
  }
  _findOption(dataset, searchedOption) {
    if (!searchedOption || !dataset) return null;
    let options = dataset.filter((el) => el[this.props.valueKey] === searchedOption[this.props.valueKey]);
    for (const option of options) {
      if ((0, _Utils.arraysAreEqual)(option.path, searchedOption.path)) {
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
      this._calculateDepth(childID, depth + 1, option, visited, sortedArr);
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
      if (this.matchCheck(searchInput, (0, _Utils.getLabel)(option, this.props.labelKey, this.props.getOptionLabel))) {
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
    if (this.searchString !== input && input.length !== 0) {
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
    this.select.current.setState({
      focusedOption: option,
    });
  }
  render() {
    const props = this.props;
    const styles = this._prepareStyles();
    const filterOptions = props.filterOption || this.filterOption;
    const optionRenderer = this.props.optionRenderer || _Option.default;
    return /*#__PURE__*/ _react.default.createElement(
      _reactSelect.default,
      _extends(
        {
          ref: this.select,
        },
        props,
        {
          styles: styles,
          menuIsOpen: this.props.isMenuOpen ? this.props.isMenuOpen : undefined,
          filterOption: filterOptions,
          onInputChange: this._onInputChange,
          getOptionLabel: (option) => (0, _Utils.getLabel)(option, props.labelKey, props.getOptionLabel),
          getOptionValue: props.getOptionValue ? props.getOptionValue : (option) => option[props.valueKey],
          components: {
            Option: optionRenderer,
            Menu: Menu,
            MenuList: MenuList,
            MultiValueLabel: this.props.valueRenderer,
            SingleValue: this.props.valueRenderer,
          },
          isMulti: props.multi,
          blurInputOnSelect: false,
          options: this.state.options,
          onOptionToggle: this._onOptionToggle,
          onOptionSelect: this._onOptionSelect,
          onOptionHover: this._onOptionHover,
          focus: this.focus,
        }
      )
    );
  }
  _prepareStyles() {
    return _objectSpread(
      {
        dropdownIndicator: (provided, state) =>
          _objectSpread(
            _objectSpread({}, provided),
            {},
            {
              transform: state.selectProps.menuIsOpen && "rotate(180deg)",
              display: !state.selectProps.isMenuOpen ? "flex" : "none",
            }
          ),
        indicatorSeparator: (provided, state) =>
          _objectSpread(
            _objectSpread({}, provided),
            {},
            {
              display: !state.selectProps.isMenuOpen ? "flex" : "none",
            }
          ),
        multiValue: (base) =>
          _objectSpread(
            _objectSpread({}, base),
            {},
            {
              backgroundColor: "rgba(0, 126, 255, 0.08)",
              border: "1px solid #c2e0ff",
              paddingLeft: _Constants.default.VALUE_MARGIN_X,
            }
          ),
        multiValueRemove: (base) =>
          _objectSpread(
            _objectSpread({}, base),
            {},
            {
              color: "#007eff",
              cursor: "pointer",
              borderLeft: "1px solid rgba(0,126,255,.24)",
              "&:hover": {
                backgroundColor: "rgba(0,113,230,.08)",
                color: "#0071e6",
              },
              marginLeft: _Constants.default.VALUE_MARGIN_X,
            }
          ),
        noOptionsMessage: (provided) =>
          _objectSpread(
            _objectSpread({}, provided),
            {},
            {
              paddingLeft: "16px",
            }
          ),
        menu: (provided, state) =>
          _objectSpread(
            _objectSpread({}, provided),
            {},
            {
              position: state.selectProps.menuIsFloating ? "absolute" : "relative",
            }
          ),
        valueContainer: (provided, state) =>
          _objectSpread(
            _objectSpread({}, provided),
            {},
            {
              display: state.hasValue ? "flex" : "inline-grid",
            }
          ),
        input: (provided) =>
          _objectSpread(
            _objectSpread({}, provided),
            {},
            {
              input: {
                opacity: "1 !important",
              },
            }
          ),
      },
      this.props.styles
    );
  }
}

// Wrapper for MenuList, it doesn't do anything, it is only needed for correct passing of the onScroll prop
exports.VirtualizedTreeSelect = VirtualizedTreeSelect;
const Menu = (props) => {
  return /*#__PURE__*/ _react.default.createElement(
    _reactSelect.components.Menu,
    _extends({}, props, {
      innerProps: _objectSpread(
        _objectSpread({}, props.innerProps),
        {},
        {
          onScrollCapture: (e) => {
            props.selectProps.listProps.onScroll(e.target);
          },
        }
      ),
    }),
    props.children
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
    values = [
      /*#__PURE__*/ _react.default.createElement(
        _reactSelect.components.NoOptionsMessage,
        _extends({}, children.props, {
          children: children.props.children,
        })
      ),
    ];
    height = 40;
  }
  return /*#__PURE__*/ _react.default.createElement(
    _reactWindow.FixedSizeList,
    {
      height: height,
      itemCount: values.length,
      itemSize: optionHeight,
      overscanCount: 30,
    },
    ({index, style}) =>
      /*#__PURE__*/ _react.default.createElement(
        "div",
        {
          style: style,
        },
        values[index]
      )
  );
};
VirtualizedTreeSelect.propTypes = {
  autoFocus: _propTypes.default.bool,
  childrenKey: _propTypes.default.string,
  expanded: _propTypes.default.bool,
  filterOption: _propTypes.default.func,
  matchCheck: _propTypes.default.func,
  isMenuOpen: _propTypes.default.bool,
  labelKey: _propTypes.default.string,
  getOptionLabel: _propTypes.default.func,
  getOptionValue: _propTypes.default.func,
  maxHeight: _propTypes.default.number,
  menuStyle: _propTypes.default.object,
  minHeight: _propTypes.default.number,
  multi: _propTypes.default.bool,
  onInputChange: _propTypes.default.func.isRequired,
  optionHeight: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.func]),
  optionLeftOffset: _propTypes.default.number,
  optionRenderer: _propTypes.default.func,
  options: _propTypes.default.array,
  renderAsTree: _propTypes.default.bool,
  valueKey: _propTypes.default.string,
  hideSelectedOptions: _propTypes.default.bool,
  menuIsFloating: _propTypes.default.bool,
  styles: _propTypes.default.object,
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
  renderAsTree: true,
  hideSelectedOptions: false,
  menuIsFloating: true,
  styles: {},
};
