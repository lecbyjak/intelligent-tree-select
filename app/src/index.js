import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import 'bootstrap/dist/css/bootstrap.css';
import {IntelligentSelectTreeInput, ProviderTypeEnum} from  "./IntelligentSelectTreeInput";

import myJSON from './options.json'
import myJSON2 from './options2.json'


ReactDOM.render(<IntelligentSelectTreeInput filterBy={"test2"}
                                            displayValue={"test"}
                                            displayTermState={true}
                                            displayParent={true}
                                            compactMode={true}
                                            providers={[
                                                {'type':ProviderTypeEnum.OPTIONS, 'value':myJSON},
                                                {'type':ProviderTypeEnum.OPTIONS, 'value':myJSON2}
                                            ]}


    />,   document.getElementById('intelligent-select-tree-root'));
