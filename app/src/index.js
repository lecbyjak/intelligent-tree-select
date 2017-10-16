import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import IntelligentSelectTreeInput from './IntelligentSelectTreeInput';

ReactDOM.render(<IntelligentSelectTreeInput filterBy={"test2"}
                                            displayvalue={"test"}
                                            displayTermState={true}
                                            displayParent={true}
                                            compactMode={true}
                                            Providers={[
                                                {'type':"file", 'destination':'./source/test.json'},
                                                {'type':"rawData", 'value':[{'tst':"tse"}, {'asdfsas':'dasfas'}]}
                                            ]}


    />,   document.getElementById('intelligent-select-tree-root'));
