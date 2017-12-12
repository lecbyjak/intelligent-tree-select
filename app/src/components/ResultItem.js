import React, {Component} from 'react';
import {Badge, Button, Col, Collapse, Row} from "reactstrap";
import TooltipItem from "./TooltipItem";
import PropTypes from "prop-types";


class ResultItem extends Component {

    constructor(props) {
        super(props);
        let mode = this.props.settings.compactMode;
        this.state = {collapse: mode};
    }

    toggle() {
        document.getElementById('searchInput').focus();
        this.setState({collapse: !this.state.collapse});
    }


    getWarningIcon() {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                <g className="nc-icon-wrapper" fill="#f67d12">
                    <path
                        d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                </g>
            </svg>
        )
    }

    getTogglePlusIcon() {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <g className="nc-icon-wrapper" fill="#444444">
                    <path
                        d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </g>
            </svg>
        )
    }

    getToggleMinusIcon() {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <g className="nc-icon-wrapper" fill="#444444">
                    <path
                        d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"/>
                </g>
            </svg>
        )
    }

    getCollapseButton() {

        let button = null;

        if (this.state.collapse) {
            button = this.getToggleMinusIcon()
        } else {
            button = this.getTogglePlusIcon()
        }
        return (
            <Button color="link" onClick={() =>{this.toggle()} } className={"p-0 m-auto"}>
                {button}
            </Button>
        )
    }

    getChildRowElem() {
        let resultItems = [];
        for (let i = 0; i < this.props.resultOption.subTerm.length; i++) {
            let resultOption = this.props.resultOption.subTerm[i];
            resultItems.push(
                <ResultItem resultOption={resultOption}
                            id={this.props.id +"-"+i} key={this.props.id +"-"+i}
                            onClickFnc={this.props.onClickFnc}
                            settings={this.props.settings}
                />
            )
        }
        return (
            <Collapse isOpen={this.state.collapse}>
                <div className="sub-results ml-3">
                    {resultItems}
                </div>
            </Collapse>
        )
    }


    render() {
        let button = null;
        let child = null;
        if (this.props.resultOption.subTerm.length > 0) {
            button = this.getCollapseButton();
            child = this.getChildRowElem();
        }

        return (
            <div>
                <Row>
                    <div className={"empty d-flex"} style={{width: 26}}>
                        {button}
                    </div>
                    <Col className={"border list-group-item-action d-flex justify-content-start align-items-center p-0"} onClick={()=>this.props.onClickFnc(this.props.resultOption.label)}>

                        <TooltipItem id={this.props.id + '-1'} label={this.props.resultOption.label}
                                     className={"result-item"}
                                     tooltipLabel={this.props.resultOption.label}
                                     tooltipClassName={this.props.tooltipClassName}
                                     tooltipInnerClassName={this.props.tooltipInnerClassName}
                                     tooltipDelay={{"show": 300, "hide": 0}}
                                     tooltipPlacement={"bottom"} style={{maxWidth : 420}} />
                        {this.props.resultOption.state.tooltip &&
                        <TooltipItem id={this.props.id + '-2'} colAttribute={"auto"} label={this.getWarningIcon()}
                                     tooltipLabel={this.props.resultOption.state.tooltip}
                                     tooltipClassName={this.props.className}
                                     tooltipInnerClassName={this.props.innerClassNameWarning}
                                     tooltipPlacement={"bottom"}
                                     tooltipDelay={{"show": 200, "hide": 100}}/>
                        }

                        {this.props.resultOption.state.label && this.props.settings.displayTermState &&
                        <Col className={"p-0 pl-1 pr-1"} xs="auto"><Badge
                            color={this.props.resultOption.state.color}>{this.props.resultOption.state.label}</Badge></Col>
                        }
                        {this.props.resultOption.category && this.props.settings.displayTermCategory &&
                        <TooltipItem id={this.props.id + '-3'} colAttribute={"auto"} style={{maxWidth : 150}} label={this.props.resultOption.category.toString()}
                                     tooltipLabel={this.props.resultOption.category.toString()} tooltipClassName={"bg-light"}
                                     tooltipInnerClassName={"bg-light text-dark border border-dark"}
                                     className={"result-item"}
                                     tooltipPlacement={"right"}/>
                        }

                    </Col>
                </Row>
                {child}
            </div>
        )
    }
}

ResultItem.propTypes = {
    label: PropTypes.string,
    tooltipPlacement: PropTypes.oneOf(["bottom", "right", "top", "left"]),
    tooltipLabel: PropTypes.string,
    tooltipDelay: PropTypes.oneOfType([
        PropTypes.shape({show: PropTypes.number, hide: PropTypes.number}),
        PropTypes.number
    ]),
    termCategory: PropTypes.array,
    badgeLabel: PropTypes.string,
    badgeColor: PropTypes.string,
};


ResultItem.defaultProps = {
    label: 'label',
    tooltipPlacement: 'bottom',
    tooltipLabel: 'tooltip',
    tooltipDelay: {"show": 50, "hide": 50},
    termCategory: [],
    badgeLabel: '',
    badgeColor: 'primary',
};

export default ResultItem