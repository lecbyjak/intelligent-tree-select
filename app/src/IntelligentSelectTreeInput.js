import React, {Component} from 'react';
import './css/App.css';
import Filter from "./components/Filter";
import {Container, Input, InputGroup, InputGroupAddon} from "reactstrap";
import ModalForm from "./components/ModalForm";
import ResultItem from "./components/ResultItem";
import * as ReactDOM from "react-dom";


class IntelligentSelectTreeInput extends Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount(){
        let width = document.getElementById("autocomplete-inputbox-0").offsetWidth;
        document.getElementById("autocomplete-listbox-0").style.width = width+'px';
    }

    render() {
        return (
            <div className="container-fluid">
                <Filter/>

                <InputGroup id={"autocomplete-inputbox-0"}>
                    <Input placeholder="Search ..." />
                    <InputGroupAddon className={"p-0"}>
                        <ModalForm/>
                    </InputGroupAddon>
                </InputGroup>


                <div className="border border-secondary border-top-0 box result-area" id={"autocomplete-listbox-0"} role="listbox">
                    <Container>
                        //TODO add logic constructor render ResultItem
                        <ResultItem hasChild={true} label={"result 1"} id={1} />
                        <ResultItem hasChild={true} label={"result 2"} id={2}/>
                        <ResultItem hasChild={true} label={"result 3"} id={3}/>
                    </Container>
                </div>

            </div>
        )
    }
}


export default IntelligentSelectTreeInput;
