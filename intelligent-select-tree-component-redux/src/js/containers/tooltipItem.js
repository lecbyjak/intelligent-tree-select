import React, {Component} from 'react';
import {Tooltip} from 'reactstrap';
import Highlighter from 'react-highlight-words'

class TooltipItem extends Component {

    constructor(props){
        super(props);
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
            <div id={'Tooltip-' + this.props.id} onClick={this.props.onClick} className={"result-item"}>

                <Highlighter
                    highlightClassName='highlighted'
                    searchWords={[this.props.currentSearch]}
                    autoEscape={true}
                    textToHighlight={this.props.option.label}
                />

                <Tooltip innerClassName={"VirtualizedTreeSelectTooltip"}
                         placement={'bottom'} isOpen={this.props.hoverActive && this.state.tooltipOpen}
                         target={'Tooltip-' + this.props.id} autohide={false}
                         toggle={() => this.toggle()} delay={{"show": 300, "hide": 0}}
                >
                    <b>Label: </b> {this.props.option.label} <br/>
                    <b>Value: </b>{this.props.option.id} <br/>
                    <b>Providers: </b>{this.props.option.providers} <br/>
                    <b>Graph: </b>{this.props.option.graph} <br/>
                </Tooltip>
            </div>
        );
    }
}


export default TooltipItem;