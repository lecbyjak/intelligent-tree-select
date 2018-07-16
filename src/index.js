import React from 'react';
import ReactDOM from 'react-dom';
import './App.css'
import {IntelligentTreeSelectComponent} from './js/containers/App';
import {applyMiddleware, createStore} from 'redux';
import allReducers from './js/reducers'
import {Provider} from 'react-redux'
import {logger} from "redux-logger";

import myJSON3 from './data/events.json'

const middleware = applyMiddleware(logger);

//const store = createStore(allReducers, middleware);
const store = createStore(allReducers);

const provider1 = {
    name: "provider1",
    response: (searchInput) => new Promise((resolve) => setTimeout(resolve, 1500, myJSON3)),
    simpleTreeData: true,
    labelKey: "http://www.w3.org/2000/01/rdf-schema#label",
    valueKey: "@id",
    childrenKey: "subTerm",
};

ReactDOM.render(
    <Provider store={store}>
        <IntelligentTreeSelectComponent simpleTreeData={true}
                                        localOptions={myJSON3}
                                        valueKey={"@id"}
                                        labelKey={"http://www.w3.org/2000/01/rdf-schema#label"}
            //labelValue={(labelKey) => labelKey[0]['@value']}
                                        childrenKey={"subTerm"}

                                        providers={[
                                            provider1,
                                        ]}
        />
    </Provider>
    , document.getElementById('intelligent-select-tree-root'));