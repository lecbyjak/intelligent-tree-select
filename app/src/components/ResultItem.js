import React, {Component} from 'react';
import {Badge, Button, Col, Collapse, Row} from "reactstrap";
import TooltipItem from "./TooltipItem";
import PropTypes from "prop-types";


class ResultItem extends Component {

    constructor(props) {
        super(props);
        this.state = {collapse: this.props.compactMode};
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

    getAllChilds(){
        //TODO implement this method
        return (
            [
                {
                    id: "http://onto.fel.cvut.cz/ontologies/eccairs/aviation-3.4.0.2/vl-a-430/v-104-child",
                    type: [
                        "http://onto.fel.cvut.cz/ontologies/eccairs/occurrence-category"
                    ],
                    comment: "Usage Notes:\r\n• Applicable both to aircraft under tow by winch or by another aircraft or to aircraft executing towing.\r\n• To be used in events only after reaching airborne phase.\r\n• Includes loss of control because of entering the towing aircraft's wake turbulence and events where of airspeed is out of limits during tow.",
                    name: "104 - GTOW: Glider towing related events - child",
                },
                {
                    id: "http://onto.fel.cvut.cz/ontologies/eccairs/aviation-3.4.0.2/vl-a-430/v-105 - child",
                    type: [
                        "http://onto.fel.cvut.cz/ontologies/eccairs/occurrence-category"
                    ],
                    comment: "Usage notes:  \r\n\r\nIncludes: \r\n- Crewmembers unable to perform duties due to illness. \r\n- Medical emergencies due to illness involving any person on board an aircraft, including passengers and crew. \r\n\r\nDoes NOT include: \r\n- Injuries sustained during flight operations. Injuries are coded as— \r\no WSTRW for injuries sustained as a result of thunderstorms or wind shear, \r\no TURB for injuries sustained as a result of turbulence (excluding turbulence caused by wind shear and/or thunderstorms), \r\no SEC for injuries resulting from intentional acts (suicide, homicide, acts of violence, or self-inflicted injury), \r\no CABIN for any injury sustained on an aircraft not occurring as a result of any events above, such as sprains, cuts, or burns resulting from normal cabin operations (handling bags, operating galley equipment, etc.) \r\n- Injuries, temporary blindness, or other incapacitation resulting from laser attacks, which are coded as SEC. \r\n\r\n\r\nCrossover to/from other occurrence categories: \r\n- Medical emergencies involving persons other than crew members or a medical evacuation patient were coded as CABIN before October 2013. All medical emergencies are now coded as MED. \r\n",
                    name: "105 - MED: Medical - child",

                }
            ]
        )
    }

    getChildRowElem() {
        let allChilds = this.getAllChilds();
        let resultItems = [];
        for (let i = 0; i < allChilds.length; i++) {
            let resultOption = allChilds[i];
            resultItems.push(
                <ResultItem hasChild={false} tooltipLabel={resultOption.label}
                            label={resultOption.label}
                            id={this.props.id +"-"+i} key={this.props.id +"-"+i}
                            onClickFnc={this.props.onClickFnc}
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
        if (this.props.hasChild) {
            button = this.getCollapseButton();
            child = this.getChildRowElem();
        }

        return (
            <div>
                <Row>
                    <div className={"empty d-flex"} style={{width: 26}}>
                        {button}
                    </div>
                    <Col className={"border list-group-item-action d-flex justify-content-start align-items-center p-0"} onClick={()=>this.props.onClickFnc(this.props.label)}>

                        <TooltipItem id={this.props.id + '-1'} label={this.props.label}
                                     className={"result-item"}
                                     tooltipLabel={this.props.tooltipLabel}
                                     tooltipClassName={this.props.tooltipClassName}
                                     tooltipInnerClassName={this.props.tooltipInnerClassName}
                                     tooltipPlacement={"bottom"} style={{maxWidth : 420}} />

                        {this.props.tooltipLabelWarning &&
                        <TooltipItem id={this.props.id + '-2'} colAttribute={"auto"} label={this.getWarningIcon()}
                                     tooltipLabel={this.props.tooltipLabelWarning}
                                     tooltipClassName={this.props.className}
                                     tooltipInnerClassName={this.props.innerClassNameWarning}
                                     tooltipPlacement={"bottom"}
                                     tooltipDelay={{"show": 200, "hide": 100}}/>
                        }

                        {this.props.badgeLabel && this.props.displayTermState &&
                        <Col className={"p-0 pl-1 pr-1"} xs="auto"><Badge
                            color={this.props.badgeColor}>{this.props.badgeLabel}</Badge></Col>
                        }
                        {this.props.termCategory && this.props.displayTermCategory &&
                        <TooltipItem id={this.props.id + '-3'} colAttribute={"auto"} style={{maxWidth : 150}} label={this.props.termCategory.toString()}
                                     tooltipLabel={this.props.termCategory.toString()} tooltipClassName={"bg-light"}
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
    // termCategory: 'term category',
    // badgeLabel: 'external',
    badgeColor: 'primary',
};

export default ResultItem