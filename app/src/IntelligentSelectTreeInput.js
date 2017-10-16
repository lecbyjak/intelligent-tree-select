import React, {Component} from 'react';
import './css/App.css';

class IntelligentSelectTreeInput extends Component {
    getFilter() {
        return (
            <div>
                <a className="d-flex flex-d-flex-reverse" data-toggle="collapse" href="#collapseFilter"
                   aria-expanded="false" aria-controls="collapseExample">Show filter</a>
                <div className="collapse" id="collapseFilter">
                    <div className="card card-body d-block">
                        <input type="checkbox" id="showProviders" name="show" value="providers" checked/>
                        <label htmlFor="showProviders">Show providers/info</label>
                        <div className="w-100"/>
                        <input type="checkbox" id="collapseAll" name="collapse" value="collapseAll" checked/>
                        <label htmlFor="collapseAll">Collapse all</label>
                    </div>
                </div>
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
                         data-template='<div class="tooltip" role="tooltip"><div class="arrow bg-light"></div><div class="tooltip-inner bg-light"></diinfo border border-darkdiv>'
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

                    <!--RESULT 1-->
                    <div className="row">
                        <div className="empty d-flex justify-content-center align-items-center"
                             style="width: 26px">

                        </div>
                        <div className="col border list-group-item-action d-flex justify-content-start align-items-center">
                            <div className="col" data-toggle="tooltip" data-placement="bottom"
                                 title="Result 1 Providers or some info">Result 1
                            </div>

                            <div className="col-auto" data-delay='{ "show": 200, "hide": 100 }' data-toggle="tooltip"
                                 data-placement="bottom"
                                 data-template='<div class="tooltip" role="tooltip"><div class="arrow bg-warning"></div><div class="tooltip-inner bg-warning text-dark border border-dark"></div></div>'
                                 title="This is new term, that should not be verified.">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                                    <g className="nc-icon-wrapper" fill="#f67d12">
                                        <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                                    </g>
                                </svg>
                            </div>
                            <div class="col-auto badge badge-secondary">new</div>
                            <div class="col-auto text-truncate" style="max-width: 120px" data-toggle="tooltip"
                                 data-placement="right"
                                 title="term category/type"
                                 data-template='<div class="tooltip" role="tooltip"><div class="arrow bg-light"></div><div class="tooltip-inner bg-light text-dark border border-dark"></div></div>'>
                                term category/type
                            </div>
                        </div>
                    </div>

                    <!--RESULT 2-->
                    <div className="row">
                        <div className="empty d-flex justify-content-center align-items-center"
                             style="width: 26px">
                            <a data-toggle="collapse" href="#sub_result-id"
                               aria-expanded="false"
                               aria-controls="sub_result-id">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                                    <g className="nc-icon-wrapper" fill="#444444">
                                        <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                                    </g>
                                </svg>
                            </a>

                        </div>
                        <div className="col border list-group-item-action d-flex justify-content-start align-items-center">
                            <div className="col" data-toggle="tooltip" data-placement="bottom"
                                 title="Result 2 Providers or some info">Result 2
                            </div>
                            <div className="col-auto text-truncate" style="max-width: 120px" data-toggle="tooltip"
                                 data-placement="right"
                                 title="term category/type"
                                 data-template='<div class="tooltip" role="tooltip"><div class="arrow bg-light"></div><div class="tooltip-inner bg-light text-dark border border-dark"></div></div>'>
                                term category/type
                            </div>
                        </div>
                    </div>

                    <div className="sub-results collapse ml-3" id="sub_result-id">
                        <!--SUB RESULT 2-->
                        <div className="row">
                            <div className="empty d-flex justify-content-center align-items-center"
                                 style="width: 26px">
                                <a data-toggle="collapse" href="#sub_sub_result2-id"
                                   aria-expanded="false"
                                   aria-controls="sub_sub_result2-id">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                                        <g className="nc-icon-wrapper" fill="#444444">
                                            <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                                        </g>
                                    </svg>
                                </a>
                            </div>
                            <div
                                className="col border list-group-item-action d-flex justify-content-start align-items-center">
                                <div className="col" data-toggle="tooltip" data-placement="bottom"
                                     title="Sub Result 2 Providers or some info">Sub Result 2
                                </div>
                                <div className="col-auto text-truncate" style="max-width: 120px" data-toggle="tooltip"
                                     data-placement="right"
                                     title="term category/type"
                                     data-template='<div class="tooltip" role="tooltip"><div class="arrow bg-light"></div><div class="tooltip-inner bg-light text-dark border border-dark"></div></div>'>
                                    term category/type
                                </div>
                            </div>
                        </div>

                        <div className="sub-results collapse ml-3" id="sub_sub_result2-id">
                            <!--SUB SUB RESULT 2-->
                            <div className="row">
                                <div className="empty d-flex justify-content-center align-items-center"
                                     style="width: 26px">
                                </div>
                                <div
                                    className="col border list-group-item-action d-flex justify-content-end align-items-center">
                                    <div className="col result-text" data-toggle="tooltip" data-placement="bottom"
                                         title="Sub Sub Result 2 Providers or some info"> Vestibulumtristique orci a
                                        imperdiet aliquet. Nulla eu
                                    </div>

                                    <div className="col-auto badge badge-info">external</div>
                                    <div className="col-auto text-truncate" style="max-width: 120px" data-toggle="tooltip"
                                         data-placement="right"
                                         title="term category/type"
                                         data-template='<div class="tooltip" role="tooltip"><div class="arrow bg-light"></div><div class="tooltip-inner bg-light text-dark border border-dark"></div></div>'>
                                        term category/type
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!--SUB RESULT 2.1-->
                        <div className="row">
                            <div className="empty d-flex justify-content-center align-items-center"
                                 style="width: 26px">
                                <a data-toggle="collapse" href="#sub_sub_result21-id"
                                   aria-expanded="false"
                                   aria-controls="sub_sub_result21-id">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                                        <g className="nc-icon-wrapper" fill="#444444">
                                            <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                                        </g>
                                    </svg>
                                </a>
                            </div>
                            <div
                                className="col border list-group-item-action d-flex justify-content-start align-items-center">
                                <div className="col" data-toggle="tooltip" data-placement="bottom"
                                     title="Sub Result 2 Providers or some info">Sub Result 2.1
                                </div>
                                <div className="col-auto text-truncate" style="max-width: 120px" data-toggle="tooltip"
                                     data-placement="right"
                                     title="term category/type"
                                     data-template='<div class="tooltip" role="tooltip"><div class="arrow bg-light"></div><div class="tooltip-inner bg-light text-dark border border-dark"></div></div>'>
                                    term category/type
                                </div>
                            </div>
                        </div>

                        <div className="sub-results collapse ml-3" id="sub_sub_result21-id">
                            <!--SUB SUB RESULT 2-->
                            <div className="row">
                                <div className="empty d-flex justify-content-center align-items-center"
                                     style="width: 26px">
                                </div>
                                <div
                                    className="col border list-group-item-action d-flex justify-content-start align-items-center">
                                    <div className="col" data-toggle="tooltip" data-placement="bottom"
                                         title="Sub Sub Result 2 Providers or some info">Sub Sub Result 2.1
                                    </div>

                                    <div className="col-auto badge badge-info">external</div>
                                    <div className="col-auto text-truncate" style="max-width: 120px" data-toggle="tooltip"
                                         data-placement="right"
                                         title="term category/type"
                                         data-template='<div class="tooltip" role="tooltip"><div class="arrow bg-light"></div><div class="tooltip-inner bg-light text-dark border border-dark"></div></div>'>
                                        term category/type
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
