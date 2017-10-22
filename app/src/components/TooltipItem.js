import React from 'react';
import {Col, Tooltip} from 'reactstrap';
import PropTypes from "prop-types";

class TooltipItem extends React.Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            tooltipOpen: false
        };
    }

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        });
    }

    render() {
        return (
            <Col className={"p-0 pl-1 pr-1"} xs={this.props.colAttribute} id={'Tooltip-' + this.props.id}>
                {this.props.label}
                <Tooltip className={this.props.tooltipClassName} innerClassName={this.props.tooltipInnerClassName}
                         placement={this.props.tooltipPlacement} isOpen={this.state.tooltipOpen}
                         target={'Tooltip-' + this.props.id} autohide={false}
                         toggle={this.toggle} delay={this.props.tooltipDelay}>
                    {this.props.tooltipLabel}
                </Tooltip>
            </Col>
        );
    }
}


TooltipItem.propTypes = {
    colAttribute: PropTypes.string,
    tooltipClassName: PropTypes.string,
    tooltipInnerClassName: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    tooltipPlacement: PropTypes.oneOf(["bottom", "right", "top", "left"]),
    tooltipLabel: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    tooltipDelay: PropTypes.oneOfType([
        PropTypes.shape({show: PropTypes.number, hide: PropTypes.number}),
        PropTypes.number
    ]),
};


TooltipItem.defaultProps = {
    label: 'label',
    tooltipPlacement: 'bottom',
    tooltipLabel: 'tooltip',
    tooltipDelay: {"show": 50, "hide": 50},
};

export default TooltipItem;