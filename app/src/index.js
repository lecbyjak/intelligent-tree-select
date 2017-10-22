import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import 'bootstrap/dist/css/bootstrap.css';
import IntelligentSelectTreeInput from './IntelligentSelectTreeInput';
import myJSON from './options.json'

ReactDOM.render(<IntelligentSelectTreeInput filterBy={"test2"}
                                            displayValue={"test"}
                                            displayTermState={true}
                                            displayParent={true}
                                            compactMode={true}
                                            providers={[
                                                {'type':"file", 'destination':myJSON},
                                                {'type':"rawData", 'value':[{'tst':"tse"}, {'asdfsas':'dasfas'}]}
                                            ]}


    />,   document.getElementById('intelligent-select-tree-root'));
