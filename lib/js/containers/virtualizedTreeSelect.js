'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _resultItem = require('./resultItem');

var _resultItem2 = _interopRequireDefault(_resultItem);

var _reactVirtualized = require('react-virtualized');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Select = require('./Select');

var _Select2 = _interopRequireDefault(_Select);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VirtualizedTreeSelect = function (_Component) {
    _inherits(VirtualizedTreeSelect, _Component);

    function VirtualizedTreeSelect(props, context) {
        _classCallCheck(this, VirtualizedTreeSelect);

        var _this = _possibleConstructorReturn(this, (VirtualizedTreeSelect.__proto__ || Object.getPrototypeOf(VirtualizedTreeSelect)).call(this, props, context));

        _this._renderMenu = _this._renderMenu.bind(_this);
        _this._processOptions = _this._processOptions.bind(_this);
        _this._filterOptions = _this._filterOptions.bind(_this);
        _this._optionRenderer = _this._optionRenderer.bind(_this);
        _this._setListRef = _this._setListRef.bind(_this);
        _this._setSelectRef = _this._setSelectRef.bind(_this);
        _this.data = {};
        _this.options = [];
        return _this;
    }

    _createClass(VirtualizedTreeSelect, [{
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            if (this.props.options.length !== prevProps.options.length || this.props.expanded !== prevProps.expanded) {
                this._processOptions();
                this.forceUpdate();
            }
        }
    }, {
        key: '_processOptions',
        value: function _processOptions() {
            var _this2 = this;

            var now = new Date().getTime();

            var optionID = void 0;
            this.data = {};
            this.props.options.forEach(function (option) {
                option.expanded = _this2.props.expanded;
                optionID = option[option.providers[0].valueKey];
                _this2.data[optionID] = option;
            });

            var keys = Object.keys(this.data);
            var sortedArr = [];
            keys.forEach(function (xkey) {
                var option = _this2.data[xkey];
                if (!option.parent) sortedArr = _this2._getSortedOptionsWithDepthAndParent(sortedArr, xkey, 0, null);
            });

            this.options = sortedArr;

            console.log("Process options (", sortedArr.length, ") end in: ", new Date().getTime() - now, "ms");
        }
    }, {
        key: '_getSortedOptionsWithDepthAndParent',
        value: function _getSortedOptionsWithDepthAndParent(sortedArr, key, depth, parentKey) {
            var _this3 = this;

            var option = this.data[key];

            option.depth = depth;
            if (!option.parent) option.parent = parentKey;

            sortedArr.push(option);

            option[option.providers[0].childrenKey].forEach(function (childID) {
                _this3._getSortedOptionsWithDepthAndParent(sortedArr, childID, depth + 1, key);
            });

            return sortedArr;
        }
    }, {
        key: '_optionRenderer',
        value: function _optionRenderer(_ref) {
            var focusedOption = _ref.focusedOption,
                focusOption = _ref.focusOption,
                key = _ref.key,
                option = _ref.option,
                labelKey = _ref.labelKey,
                selectValue = _ref.selectValue,
                style = _ref.style,
                valueArray = _ref.valueArray,
                _onToggleClick = _ref.onToggleClick;


            var className = ['VirtualizedSelectOption'];

            if (option === focusedOption) {
                className.push('VirtualizedSelectFocusedOption');
            }

            if (option.disabled) {
                className.push('VirtualizedSelectDisabledOption');
            }

            if (valueArray && valueArray.indexOf(option) >= 0) {
                className.push('VirtualizedSelectSelectedOption');
            }

            if (option.className) {
                className.push(option.className);
            }

            var events = option.disabled ? {} : {
                onClick: function onClick() {
                    return selectValue(option);
                },
                onMouseEnter: function onMouseEnter() {
                    return focusOption(option);
                },
                onToggleClick: function onToggleClick() {
                    return _onToggleClick();
                }
            };

            return (
                //TODO default
                _react2.default.createElement(_resultItem2.default, _extends({
                    className: className.join(' '),
                    key: key,
                    style: style,
                    option: option
                }, events))
            );
        }

        // See https://github.com/JedWatson/react-select/#effeciently-rendering-large-lists-with-windowing

    }, {
        key: '_renderMenu',
        value: function _renderMenu(_ref2) {
            var _this4 = this;

            var focusedOption = _ref2.focusedOption,
                focusOption = _ref2.focusOption,
                labelKey = _ref2.labelKey,
                onSelect = _ref2.onSelect,
                options = _ref2.options,
                selectValue = _ref2.selectValue,
                valueArray = _ref2.valueArray;
            var _props = this.props,
                listProps = _props.listProps,
                optionRenderer = _props.optionRenderer,
                childrenKey = _props.childrenKey;

            var focusedOptionIndex = options.indexOf(focusedOption);
            var height = this._calculateListHeight({ options: options });
            var innerRowRenderer = optionRenderer || this._optionRenderer;
            var onToggleClick = this.forceUpdate.bind(this);

            function wrappedRowRenderer(_ref3) {
                var index = _ref3.index,
                    key = _ref3.key,
                    style = _ref3.style;

                var option = options[index];

                return innerRowRenderer({
                    focusedOption: focusedOption,
                    focusedOptionIndex: focusedOptionIndex,
                    focusOption: focusOption,
                    key: key,
                    labelKey: labelKey,
                    onSelect: onSelect,
                    option: option,
                    optionIndex: index,
                    options: options,
                    selectValue: onSelect,
                    style: style,
                    valueArray: valueArray,
                    onToggleClick: onToggleClick,
                    childrenKey: childrenKey
                });
            }
            return _react2.default.createElement(
                _reactVirtualized.AutoSizer,
                { disableHeight: true },
                function (_ref4) {
                    var width = _ref4.width;
                    return _react2.default.createElement(_reactVirtualized.List, _extends({
                        className: 'VirtualSelectGrid',
                        height: height,
                        ref: _this4._setListRef,
                        rowCount: options.length,
                        rowHeight: function rowHeight(_ref5) {
                            var index = _ref5.index;
                            return _this4._getOptionHeight({
                                option: options[index]
                            });
                        },
                        rowRenderer: wrappedRowRenderer,
                        scrollToIndex: focusedOptionIndex,
                        width: width
                    }, listProps));
                }
            );
        }
    }, {
        key: '_filterOptions',
        value: function _filterOptions(options, filter, selectedOptions) {
            var _this5 = this;

            var now = new Date().getTime();

            var filtered = options.filter(function (option) {
                var label = option[option.providers[0].labelKey];
                if (typeof label === 'string' || label instanceof String) {
                    return label.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
                } else {
                    return option.providers[0].labelValue(label).toLowerCase().indexOf(filter.toLowerCase()) !== -1;
                }
            });

            var filteredWithParents = [];
            var index = 0;
            filtered.forEach(function (option) {
                filteredWithParents.push(option);
                var parent = option.parent ? option.parent.length > 0 ? _this5.data[option.parent] : null : null;

                while (parent) {
                    if (filteredWithParents.includes(parent)) break;
                    filteredWithParents.splice(index, 0, parent);
                    parent = parent.parent ? parent.parent.length > 0 ? _this5.data[parent.parent] : null : null;
                }
                index = filteredWithParents.length;
            });

            for (var i = 0; i < filteredWithParents.length; i++) {
                if (!filteredWithParents[i].expanded) {
                    var depth = filteredWithParents[i].depth;
                    while (true) {
                        var option = filteredWithParents[i + 1];
                        if (option && option.depth > depth) filteredWithParents.splice(i + 1, 1);else break;
                    }
                }
            }

            if (Array.isArray(selectedOptions) && selectedOptions.length) {
                var selectedValues = selectedOptions.map(function (option) {
                    return option[option.providers[0].valueKey];
                });

                return filtered.filter(function (option) {
                    return !selectedValues.includes(option[option.providers[0].valueKey]);
                });
            }

            //console.log("Filter options (",options.length ,") end in: ", new Date().getTime() - now, "ms");
            return filteredWithParents;
        }
    }, {
        key: '_calculateListHeight',
        value: function _calculateListHeight(_ref6) {
            var options = _ref6.options;
            var maxHeight = this.props.maxHeight;


            var height = 0;

            for (var optionIndex = 0; optionIndex < options.length; optionIndex++) {
                var option = options[optionIndex];

                height += this._getOptionHeight({ option: option });

                if (height > maxHeight) {
                    return maxHeight;
                }
            }

            return height;
        }
    }, {
        key: '_getOptionHeight',
        value: function _getOptionHeight(_ref7) {
            var option = _ref7.option;
            var optionHeight = this.props.optionHeight;


            return optionHeight instanceof Function ? optionHeight({ option: option }) : optionHeight;
        }
    }, {
        key: '_setListRef',
        value: function _setListRef(ref) {
            this._listRef = ref;
        }
    }, {
        key: '_setSelectRef',
        value: function _setSelectRef(ref) {
            this._selectRef = ref;
        }
    }, {
        key: 'render',
        value: function render() {

            return _react2.default.createElement(_Select2.default, _extends({
                closeOnSelect: false,
                removeSelected: false,

                joinValues: !!this.props.multi,
                menuStyle: { overflow: 'hidden' },
                ref: this._setSelectRef,
                menuRenderer: this._renderMenu,
                filterOptions: this._filterOptions
            }, this.props, {
                options: this.options,
                isMenuOpen: true
            }));
        }
    }]);

    return VirtualizedTreeSelect;
}(_react.Component);

VirtualizedTreeSelect.propTypes = {
    async: _propTypes2.default.bool,
    listProps: _propTypes2.default.object,
    maxHeight: _propTypes2.default.number,
    optionHeight: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.func]),
    optionRenderer: _propTypes2.default.func,
    selectComponent: _propTypes2.default.func
};

VirtualizedTreeSelect.defaultProps = {
    options: [],
    async: false,
    maxHeight: 200,
    optionHeight: 25,
    expanded: false,
    renderAsTree: true,
    childrenKey: 'children',
    valueKey: 'value',
    labelKey: 'label'
};

exports.default = VirtualizedTreeSelect;