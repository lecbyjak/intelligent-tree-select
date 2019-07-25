import React, {Component} from 'react';
import TooltipItem from "./tooltipItem";
import {ToggleMinusIcon, TogglePlusIcon} from "./Icons";


class ResultItem extends Component {

    getCollapseButton() {
        return <span onClick={this.props.onToggleClick} className={"toggleButton"}>
                {this.props.option.expanded ? <ToggleMinusIcon/> : <TogglePlusIcon/>}
            </span>;
    }

    static _getHash(str) {
        let hash = 0, i, chr;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
            chr   = str.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };

    render() {
        let button = null;
        let {option, childrenKey, valueKey, labelKey, labelValue} = this.props;
        if (option[childrenKey].length > 0) {
            button = this.getCollapseButton();
        }

        let label = option[labelKey];
        if (!(typeof label === 'string' || label instanceof String)){
            label = labelValue(label)
        }
        let value = option[valueKey];

        return <div style={this.props.style} className={this.props.className} onMouseEnter={this.props.onMouseEnter} >

                {this.props.settings.renderAsTree &&
                    <div style={{width: '16px'}}>
                        {button}
                    </div>
                }

                <TooltipItem id={"tooltip-" + ResultItem._getHash(value)}
                             option={option}
                             label={label}
                             value={value}
                             onClick={this.props.onClick}
                             searchString={this.props.settings.searchString}
                             hoverActive={this.props.settings.displayInfoOnHover}
                             tooltipKey={this.props.tooltipKey}
                />

              {option.fetchingChild &&
              <span className="Select-loading-zone" aria-hidden="true" style={{'paddingLeft': '5px'}}>
                <span className="Select-loading" />
              </span>
              }
            </div>;
    }
}


ResultItem.defaultProps = {
    tooltipPlacement: 'bottom',
    tooltipLabel: 'tooltip',
    tooltipDelay: {"show": 50, "hide": 50},
    termCategory: [],
    badgeLabel: '',
    badgeColor: 'primary',
};

export default ResultItem;
