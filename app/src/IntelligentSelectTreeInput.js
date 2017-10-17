import React, {Component} from 'react';
import './css/App.css';
import {Button, Checkbox, Collapse, FormGroup, Well} from "react-bootstrap";

class IntelligentSelectTreeInput extends Component {


    constructor(props) {
        super(props);
        console.log(props);
        this.state = {}
    }

    getFilter() {
        return (
            <div>
                <Button bsStyle="link" onClick={() => this.setState({filterOpened: !this.state.filterOpened})}>Show
                    filter</Button>
                <Collapse in={this.state.filterOpened}>
                    <div>
                        <Well>
                            <FormGroup>
                                <Checkbox inline inputRef={ref => { this.state.providersVisible = ref; }}>
                                    Show providers/info
                                </Checkbox>
                                {' '}
                                <Checkbox inline inputRef={ref => { this.state.collapseAll = ref; }}>
                                    Collapse all
                                </Checkbox>
                            </FormGroup>
                        </Well>
                    </div>
                </Collapse>
            </div>
        )
    }

    getInput() {
        return (
            <div className="input-group box border-secondary" id="autocomplete-inputbox-0">
                <input type="text" className="form-control" placeholder="Search for..."
                       autoComplete="off" spellCheck="false" role="combobox"
                       aria-autocomplete="list" aria-expanded="false"
                       aria-labelledby="search-input" aria-owns="autocomplete-listbox-0" dir="auto"/>
                <span className="input-group-btn">
                    <div data-delay='{ "show": 400, "hide": 100 }' data-toggle="tooltip"
                         data-placement="right"
                         data-template='<div class="tooltip" role="tooltip"><div class="arrow d-flex bg-info"></div><div class="tooltip-inner bg-info"></div></div>'
                         title="Didn´t find your term? Add new one.">
                        <button type="button"
                                className="btn btn-primary d-flex justify-content-center align-items-center"
                                data-toggle="modal" data-target="#formModal">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                                <g className="nc-icon-wrapper" fill="#ffffff">
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                </g>
                            </svg>
                        </button>
                    </div>
                </span>


            </div>
        )
    }

    getResults() {
        return (
            <div className="border border-secondary border-top-0 box result-area" id="autocomplete-listbox-0"
                 role="listbox">
                <div className="container">
                    results here
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className="container-fluid">
                {this.getFilter()}
                {this.getInput()}
                {this.getResults()}
            </div>
        )
    }
}


export default IntelligentSelectTreeInput;
