import React, {Component} from 'react';
import {Tooltip} from 'reactstrap';
import Highlighter from 'react-highlight-words'

class TooltipItem extends Component {

    constructor(props){
        super(props);
        this.state = {
            tooltipOpen: false
        };
        this._onClick = this._onClick.bind(this);
    }

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen,
        });
    }

    _getTooltipData(){
      if (this.props.tooltipKey) {
        return this.props.option[this.props.tooltipKey];
      }
      const keys = Object.keys(this.props.option);
      return keys.map((key,index) => {
        let data ="";
        const property = this.props.option[key];
        if (Array.isArray(property)){
          data = property.length.toString();
          data += (property.length === 1)? ' record': ' records'
        } else{
          data = JSON.stringify(property);
        }
        return (<div key={index}><b>{key}: </b> {data} </div>)
      });
    }

    _onClick(e) {
      this.setState({tooltipOpen: false});
      this.props.onClick(e);
    }

    render() {
        return (
            <div id={'Tooltip-' + this.props.id} className={"result-item"} onClick={this._onClick} >

                <Highlighter
                    highlightClassName='highlighted'
                    searchWords={[this.props.searchString]}
                    autoEscape={false}
                    textToHighlight={this.props.label}
                    highlightTag={"span"}
                />

              {this.props.hoverActive &&
                <Tooltip innerClassName={"VirtualizedTreeSelectTooltip"}
                         style={{left: "400px!important"}}
                         placement={'left'} isOpen={this.state.tooltipOpen}
                         target={'Tooltip-' + this.props.id} autohide={false}
                         toggle={() => this.toggle()} delay={{"show": 300, "hide": 0}}
                         modifiers={{
                             preventOverflow: {
                                 escapeWithReference: false,
                             },
                         }}
                >
                  {this._getTooltipData()}
                </Tooltip>
              }
            </div>
        );
    }
}


export default TooltipItem;
