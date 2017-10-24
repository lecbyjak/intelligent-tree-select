import React, {Component} from 'react';
import './css/App.css';
import Filter from "./components/Filter";
import {Button, Container, Input, InputGroup, Jumbotron} from "reactstrap";
import ModalForm from "./components/ModalForm";
import ResultItem from "./components/ResultItem";

const RDFS_LABEL = 'http://www.w3.org/2000/01/rdf-schema#label';
const RDFS_COMMENT = 'http://www.w3.org/2000/01/rdf-schema#comment';


class IntelligentSelectTreeInput extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentSearch: "",
            providers: props.providers,
            filterBy: props.filterBy,
            displayValue: props.displayValue,
            displayTermState: props.displayTermState,
            displayParent: props.displayParent,
            compactMode: props.compactMode,
            searchHistory: [],
            relevantResults: [],
            options: [],
            focused: false,
        };
        console.log('IntelligentSelectTreeInput state: ', this.state)
    }

    componentDidMount() {
        let width = document.getElementById("autocomplete-inputbox-0").offsetWidth;
        document.getElementById("autocomplete-listbox-0").style.minWidth = width + 'px';
        this.setState({options: this.processOptions(this.state.providers[0].destination)},
            () => {
                console.log('local options: ', this.state.options)
            });
        this.autocompleteComponent.addEventListener('click', (e)=> e.preventDefault());
        //document.addEventListener('click', ()=>{this.handleBlur()});

    }

    processOptions(options) {
        return options.map(option => {
            return {
                id: option['@id'],
                name: option[RDFS_LABEL][0]['@value'],
                description: option[RDFS_COMMENT][0]['@value']
            };
        });
    }

    filterResults() {
        return this.state.options.filter(option => option.name.toLowerCase().indexOf(this.state.currentSearch.toLowerCase()) !== -1)
    }

    getRelevantResults() {
        /*TODO all logic here*/
        if (this.state.currentSearch.length > 0 || this.state.focused) {
            let filteredResults = this.filterResults();
            let resultItems = [];
            for (let i = 0; i < filteredResults.length; i++) {
                let resultOption = filteredResults[i];
                let labelName = (resultOption.name.length > 60 ? resultOption.name.substring(0, 60) + '... ' : resultOption.name);
                resultItems.push(
                    <ResultItem hasChild={true} tooltipLabel={resultOption.name}
                                label={labelName}
                                id={i} key={i}
                                onClickFnc={() => {
                                    this.setState({currentSearch: resultOption.name});
                                }}
                                onClickCollapseButtonFnc={()=>this.handleFocus()}
                    />
                )
            }
            return (
                <Container>
                    {resultItems}
                </Container>
            )
        } else return ''
    }

    handleFocus() {
        console.log('handle focus')
        this.setState({focused: true});
    }

    handleBlur() {
        console.log('handle blur')
        // setTimeout(() => this.setState({focused: false}), 200)
        this.setState({focused: false})

    }

    clearInput() {
        this.setState({currentSearch: ""})
    }

    render() {
        let clearButton = () => {
            if (this.state.currentSearch.length > 0 && this.state.currentSearch !== " ") {
                return (
                    <Button color={'link'} className={'text-secondary'} onClick={()=>this.clearInput()}>
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                             x="0px" y="0px" viewBox="0 0 16 16" xmlSpace="preserve" width="16" height="16">
                            <g className="nc-icon-wrapper" fill="#444444">
                                <rect data-color="color-2" x="5" y="7" fill="#444444" width="2" height="6"/>
                                <rect data-color="color-2" x="9" y="7" fill="#444444" width="2" height="6"/>
                                <path fill="#444444"
                                      d="M12,1c0-0.6-0.4-1-1-1H5C4.4,0,4,0.4,4,1v2H0v2h1v10c0,0.6,0.4,1,1,1h12c0.6,0,1-0.4,1-1V5h1V3h-4V1z M6,2h4 v1H6V2z M13,5v9H3V5H13z"/>
                            </g>
                        </svg>
                    </Button>
                )
            }
        };

        return (
            <div className="container-fluid" ref={(input) => { this.autocompleteComponent = input; }}>
                <Filter/>

                <InputGroup id={"autocomplete-inputbox-0"}>
                    <Input placeholder="Search ..." type="text" name="search" id="searchInput"
                           value={this.state.currentSearch} autoComplete={"off"}
                           onChange={e => {
                               this.setState({currentSearch: e.target.value.trim()})
                           }}
                           onFocus={() => this.handleFocus()}

                    />
                    {clearButton()}
                    <ModalForm/>
                </InputGroup>


                <div className="border border-secondary border-top-0 box result-area" ref={(div) => { this.autocompleteDropdown = div}}  id={"autocomplete-listbox-0"}
                     role="listbox">
                    {this.getRelevantResults()}
                </div>


                <Jumbotron className={"fixed-bottom"}>
                    <h3>DEBUG:</h3>
                    <b>current input: </b> {this.state.currentSearch}
                    <br/>
                </Jumbotron>

            </div>
        )
    }

}


export default IntelligentSelectTreeInput;
