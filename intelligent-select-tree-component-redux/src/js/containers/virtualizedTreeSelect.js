import React, {Component} from 'react';

import ResultItem from './resultItem'
import createFilterOptions from "../utils/TreeNodeFastFilter"
import {AutoSizer, List} from "react-virtualized";

import PropTypes from 'prop-types'
import Select from 'react-select'


class VirtualizedTreeSelect extends Component {

    static propTypes = {
        async: PropTypes.bool,
        listProps: PropTypes.object,
        maxHeight: PropTypes.number,
        optionHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        optionRenderer: PropTypes.func,
        selectComponent: PropTypes.func
    };

    static defaultProps = {
        options: [],
        async: false,
        maxHeight: 200,
        optionHeight: 25,
        expanded: false,
        renderAsTree: true,
        childrenKey: 'children',
        parentKey: null,
        valueKey: 'value',
        labelKey: 'label',
    };

    constructor(props, context) {
        super(props, context);

        this._renderMenu = this._renderMenu.bind(this);
        this._optionRenderer = this._optionRenderer.bind(this);
        this._setListRef = this._setListRef.bind(this);
        this._setSelectRef = this._setSelectRef.bind(this);
    }


    componentDidUpdate(prevProps){
        if (this.props.options.length !== prevProps.options.length){
            this._processOptions();
            this.forceUpdate()
        }
    }

    /** See List#recomputeRowHeights */
    recomputeOptionHeights(index = 0) {
        if (this._listRef) {
            this._listRef.recomputeRowHeights(index)
        }
    }

    /** See Select#focus (in react-select) */
    focus() {
        if (this._selectRef) {
            return this._selectRef.focus()
        }
    }

    _processOptions() {
        let now = new Date().getTime();
        console.log("Process options start");

        let options = this.props.options;
        //Add parent value to options
        options.forEach((option) => {
            let children = option[option.providers[0].childrenKey];

            children.forEach((childID) => {
                const index = options.findIndex((obj) => {
                    return obj[obj.providers[0].valueKey] === childID
                });
                if (!options[index].parent) options[index].parent = option[option.providers[0].valueKey];
            })
        });
        let counter = 0;
        let sortedArr = [];
        //sort array, add other necessary properties
        options.forEach((option) => {
            option.expanded = this.props.expanded;
            if (!option.parent) {
                sortedArr = this._createGraph(options, option[option.providers[0].valueKey], 0, counter+"-", sortedArr);
                counter++
            }
        });
        this.options = sortedArr;

        console.log("Process options end in: ", new Date().getTime() - now, "ms");
    }

    _createGraph(options, key, depth, graph, sortedArr) {
        const index = options.findIndex((obj) => obj[obj.providers[0].valueKey] === key);
        let option =  options[index];

        option.depth = depth;
        option.graph = graph;

        let counter = 0;
        sortedArr.push(option);
        option[option.providers[0].childrenKey].forEach((child) => {
            sortedArr = this._createGraph(options, child, depth + 1, graph + counter + "-", sortedArr);
            counter++
        });
        return sortedArr
    }

    _optionRenderer({focusedOption, focusOption, key, option,  labelKey, selectValue, style, valueArray, onToggleClick}) {

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

        const events = option.disabled? {} : {
                onClick: () => selectValue(option),
                onMouseEnter: () => focusOption(option),
                onToggleClick: () => onToggleClick()
            };

        return (
            //TODO default
            <ResultItem
                className={className.join(' ')}
                key={key}
                style={style}
                option={option}
                {...events}
            />
        )
    }

    // See https://github.com/JedWatson/react-select/#effeciently-rendering-large-lists-with-windowing
    _renderMenu({focusedOption, focusOption, labelKey, onSelect, options, selectValue, valueArray}) {
        const {listProps, optionRenderer, childrenKey} = this.props;
        const focusedOptionIndex = options.indexOf(focusedOption);
        const height = this._calculateListHeight({options});
        const innerRowRenderer = optionRenderer || this._optionRenderer;
        const onToggleClick = this.forceUpdate.bind(this);


        function wrappedRowRenderer({index, key, style}) {
            const option = options[index];

            return innerRowRenderer({
                focusedOption,
                focusedOptionIndex,
                focusOption,
                key,
                labelKey,
                onSelect,
                option,
                optionIndex: index,
                options,
                selectValue: onSelect,
                style,
                valueArray,
                onToggleClick,
                childrenKey,
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

    _getSelectComponent() {
        const {async, selectComponent} = this.props;

        if (selectComponent) {
            return selectComponent
        } else if (async) {
            return Select.Async
        } else {
            return Select
        }
    }

    _setListRef(ref) {
        this._listRef = ref
    }

    _setSelectRef(ref) {
        this._selectRef = ref
    }


    render() {
        const SelectComponent = this._getSelectComponent();

        let attributes = {};
        if (this.props.renderAsTree && !this.props.filterOptions) attributes.filterOptions = createFilterOptions({
            options: this.options,
            valueKey: this.props.valueKey,
            labelKey: this.props.labelKey,
        });
        return (
            <SelectComponent
                closeOnSelect={false}
                removeSelected={false}

                joinValues={!!this.props.multi}
                menuStyle={{overflow: 'hidden'}}
                ref={this._setSelectRef}
                menuRenderer={this._renderMenu}
                {...this.props}
                options={this.options}
                {...attributes}
            />
        )
    }
}


export default VirtualizedTreeSelect;