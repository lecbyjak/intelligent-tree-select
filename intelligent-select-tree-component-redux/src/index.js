import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import {IntelligentTreeSelectComponent} from './js/containers/App';
import {applyMiddleware, createStore} from 'redux';
import allReducers from './js/reducers'
import {Provider} from 'react-redux'
import {logger} from "redux-logger";

import myJSON from './data/options.json'
import myJSON2 from './data/options2.json'
import myJSON3 from './data/events.json'
import myJSON4 from './data/options3.json'

const middleware = applyMiddleware(logger);

const store = createStore(allReducers, middleware);

const provider1 = {
    name: "provider1",
    response: (searchInput) => new Promise((resolve) => setTimeout(resolve, 1500, myJSON3)),
    treeDataSimpleMode: true,
    labelKey: "http://www.w3.org/2000/01/rdf-schema#label",
    valueKey: "@id",
    childrenKey: "subTerm",
};

const provider2 = {
    name: "provider2",
    response: (searchInput) => new Promise((resolve) => setTimeout(resolve, 500, myJSON)),
    treeDataSimpleMode: true,
    labelKey: "http://www.w3.org/2000/01/rdf-schema#label",
    labelValue: (labelKey) => labelKey[0]['@value'],
    valueKey: "@id",
};

const provider3 = {
    name: "provider3",
    response: (searchInput) => new Promise((resolve) => setTimeout(resolve, 800, myJSON2)),
    treeDataSimpleMode: true,
    labelKey: "http://www.w3.org/2000/01/rdf-schema#label",
    labelValue: (labelKey) => labelKey[0]['@value'],
    valueKey: "@id",
};

const provider4 = {
    name: "provider4",
    response: (searchInput) => new Promise((resolve) => setTimeout(resolve, 100, myJSON4)),
    treeDataSimpleMode: false,
    labelKey: "http://www.w3.org/2000/01/rdf-schema#label",
    labelValue: (labelKey) => labelKey[0]['@value'],
    valueKey: "@id",
};

ReactDOM.render(
    <Provider store={store}>
        <IntelligentTreeSelectComponent displayState={false}
                                        displayInfoOnHover={false}
                                        expanded={false}
                                        renderAsTree={true}

                                        treeDataSimpleMode={true}
                                        localOptions={myJSON3}
                                        valueKey={"@id"}
                                        labelKey={"http://www.w3.org/2000/01/rdf-schema#label"}
                                        //labelValue={(labelKey) => labelKey[0]['@value']}
                                        childrenKey={"subTerm"}

                                        providers={[
                                           //provider1,
                                           provider2,
                                           provider3,
                                           provider4,
                                        ]}
                                        />
    </Provider>
    , document.getElementById('intelligent-select-tree-root'));
