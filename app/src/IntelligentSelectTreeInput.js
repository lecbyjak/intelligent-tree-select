import React, {Component} from 'react';
import './css/App.css';
import Filter from "./components/Filter";
import {Button, Container, Input, InputGroup} from "reactstrap";
import ModalForm from "./components/ModalForm";
import ResultItem from "./components/ResultItem";
import OptionsUtils from "./utils/OptionsUtils";
import SearchHistory from "./utils/SearchHistory";
import Settings from "./utils/Settings";
import PropTypes from "prop-types";

class IntelligentSelectTreeInput extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentSearch: "",
            relevantResults: [],
            options: [],
            focused: false,
        };
        this.clicked = false;

        this.settings = new Settings(this.props.filterBy,
            this.props.termLifetime,
            this.props.displayTermState,
            this.props.displayTermCategory,
            this.props.displayParent,
            this.props.compactMode,
        );
        this.optionsUtils = new OptionsUtils(this.settings);
        this.searchHistory = new SearchHistory(this.settings)
    }

    componentDidMount() {
        let width = document.getElementById("autocomplete-inputbox-0").offsetWidth;
        document.getElementById("autocomplete-listbox-0").style.minWidth = width + 'px';

        let options = [];
        for (let i = 0; i < this.props.providers.length; i++) {
            if (this.props.providers[i].type === ProviderTypeEnum.OPTIONS) {
                options = options.concat(this.props.providers[i].value);
            }
        }
        this.optionsUtils.processOptions(this.optionsUtils.mergeOptions(options));

        this.autocompleteDropdown.addEventListener('mouseenter', () => this.clicked = true);
        this.autocompleteDropdown.addEventListener('mouseleave', () => this.clicked = false);

    }

    filterResults(options) {
        return options.filter(option => option.label.toLowerCase().indexOf(this.state.currentSearch.toLowerCase()) !== -1)
    }

    setCurrentSearch(newSearch) {
        this.setState({currentSearch: newSearch});
        this.handleFocus();
    }

    getRelevantResults() {
        //TODO get data from providers
        if (this.state.focused) {

            let data = this.searchHistory.getResultsFromHistory(this.state.currentSearch);
            if (data.length === 0){
                data = this.searchHistory.getResultsFromHistory(this.state.currentSearch.slice(0, -1));
                if (data.length === 0){
                    data = this.optionsUtils.getAllProcessedOptions()
                }
                 data = this.filterResults(data);
                 this.searchHistory.addToHistory(this.state.currentSearch, data);
            }

            let resultItems = [];
            for (let i = 0; i < data.length; i++) {
                let resultOption = data[i];
                resultItems.push(
                    <ResultItem hasChild={true} tooltipLabel={resultOption.label}
                                label={resultOption.label} termCategory={resultOption.category}
                                id={i} key={i}
                                badgeLabel={"external"} badgeColor={"primary"}
                                tooltipLabelWarning={"not verified"} innerClassNameWarning={"text-dark bg-warning"}
                                onClickFnc={this.setCurrentSearch.bind(this)}
                                settings={this.settings}
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
        this.setState({focused: true});
        this.autocompleteInput.focus()
    }

    handleBlur() {
        if (!this.clicked) {
            this.setState({focused: false})
        }
    }

    clearInput() {
        this.setState({currentSearch: ""})
    }

    render() {
        let clearButton = () => {
            if (this.state.currentSearch.length > 0 && this.state.currentSearch !== " ") {
                return (
                    <Button color={'link'} className={'text-secondary'} onClick={() => this.clearInput()}>
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
            <div className="container-fluid" ref={(div) => {
                this.autocompleteComponent = div;
            }}>
                <Filter settings={this.settings}/>

                <InputGroup id={"autocomplete-inputbox-0"}>
                    <Input placeholder="Search ..." type="text" name="search" id="searchInput" autoComplete={"off"}
                           value={this.state.currentSearch}
                           onChange={e => this.setState({currentSearch: e.target.value.trim()})}
                           onFocus={() => this.handleFocus()}
                           onBlur={() => this.handleBlur()}
                           innerRef={(input) => this.autocompleteInput = input}
                    />
                    {clearButton()}
                    <ModalForm optionsUtils={this.optionsUtils}/>
                </InputGroup>

                <div className="border border-secondary border-top-0 box result-area" ref={(div) => {
                    this.autocompleteDropdown = div
                }} id={"autocomplete-listbox-0"}>
                    {this.getRelevantResults()}
                </div>
            </div>
        )
    }

}

const ProviderTypeEnum = {
    OPTIONS: Symbol('OPTIONS'),
    GET_ALL: Symbol('GET_ALL'),
    SEARCH: Symbol('SEARCH'),
};

IntelligentSelectTreeInput.defaultProps = {
    termLifetime: "0d0h5m0s",
    displayTermState: false,
    displayTermCategory: false,
    displayParent: false,
    compactMode: false,
};

IntelligentSelectTreeInput.propTypes = {
    filterBy: PropTypes.oneOfType([
        PropTypes.string.isRequired,
        PropTypes.func.isRequired,
    ]).isRequired,
    providers: PropTypes.arrayOf(PropTypes.shape({
        type: ProviderTypeEnum.isRequired,
        value: PropTypes.oneOfType([
            PropTypes.string.isRequired,
            PropTypes.array.isRequired,
        ]),
    })).isRequired,
    termLifetime: PropTypes.string,
    displayTermState: PropTypes.bool,
    displayTermCategory: PropTypes.bool,
    displayParent: PropTypes.bool,
    compactMode: PropTypes.bool,
};

export {IntelligentSelectTreeInput, ProviderTypeEnum};
