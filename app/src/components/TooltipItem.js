import React from 'react';
import {Col, Tooltip} from 'reactstrap';

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

    static defaultProps = {
        label: 'label',
        tooltipPlacement: 'bottom',
        tooltipLabel: 'tooltip',
        tooltipDelay: {"show": 50, "hide": 50},
    }

    render() {
        return (
                <Col xs={this.props.colAttribute} id={'Tooltip-' + this.props.id}>
                    {this.props.label}
                    <Tooltip className={this.props.tooltipClassName} innerClassName={this.props.tooltipInnerClassName}
                             placement={this.props.tooltipPlacement} isOpen={this.state.tooltipOpen}
                             target={'Tooltip-' + this.props.id}
                             toggle={this.toggle} delay={this.props.tooltipDelay}>
                        {this.props.tooltipLabel}
                    </Tooltip>
                </Col>
        );
    }
}

export default TooltipItem;