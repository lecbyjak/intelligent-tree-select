import React, {Component} from 'react';
import TooltipItem from "./tooltipItem";


class ResultItem extends Component {

    _getWarningIcon() {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                <g className="nc-icon-wrapper" fill="#f67d12">
                    <path
                        d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                </g>
            </svg>
        )
    }

    _getTogglePlusIcon() {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <g className="nc-icon-wrapper" fill="#444444">
                    <path
                        d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </g>
            </svg>
        )
    }

    _getToggleMinusIcon() {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <g className="nc-icon-wrapper" fill="#444444">
                    <path
                        d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"/>
                </g>
            </svg>
        )
    }

    _handleButtonClick() {
        this.props.option.expanded = !this.props.option.expanded;
        this.props.onToggleClick();
    }

    getCollapseButton() {

        let button = null;

        if (this.props.option.expanded) {
            button = this._getToggleMinusIcon()
        } else {
            button = this._getTogglePlusIcon()
        }
        return (
            <span onClick={() => this._handleButtonClick()} className={"toggleButton"}>
                {button}
            </span>
        )
    }

    _getHash(str) {
        var hash = 0, i, chr;
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

        return (
            <div style={this.props.style} className={this.props.className} onMouseEnter={this.props.onMouseEnter} >

                {this.props.settings.renderAsTree &&
                    <div style={{width: '16px'}}>
                        {button}
                    </div>
                }

                <TooltipItem id={"tooltip-"+this._getHash(value)}
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



            </div>
        )
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
