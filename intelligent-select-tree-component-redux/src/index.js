import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import {IntelligentTreeSelectComponent, ProviderTypeEnum} from './js/containers/App';
import {applyMiddleware, createStore} from 'redux';
import allReducers from './js/reducers'
import {Provider} from 'react-redux'
import {logger} from "redux-logger";

// import myJSON from './data/options.json'
// import myJSON2 from './data/options2.json'
import myJSON3 from './data/events.json'

const middleware = applyMiddleware(logger);

const store = createStore(allReducers, middleware);

ReactDOM.render(
    <Provider store={store}>
        <IntelligentTreeSelectComponent context={"http://www.w3.org/2000/01/rdf-schema"}

                                        displayState={false}
                                        displayInfoOnHover={true}
                                        expanded={true}
                                        renderAsTree={true}

                                        valueKey={"@id"}
                                        labelKey={"http://www.w3.org/2000/01/rdf-schema#label"}
                                        childrenKey={"subTerm"}

                                        providers={[
                                            {'type':ProviderTypeEnum.OPTIONS, 'value':myJSON3},
                                        ]}
                                        />
    </Provider>
    , document.getElementById('intelligent-select-tree-root'));
