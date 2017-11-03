import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import 'bootstrap/dist/css/bootstrap.css';
import {IntelligentSelectTreeInput, ProviderTypeEnum} from  "./IntelligentSelectTreeInput";

import myJSON from './options.json'
import myJSON2 from './options2.json'


ReactDOM.render(<IntelligentSelectTreeInput filterBy={"http://www.w3.org/2000/01/rdf-schema#label"}
                                            termLifetime={"5m"}
                                            displayParent={true}
                                            providers={[
                                                {'type':ProviderTypeEnum.OPTIONS, 'value':myJSON},
                                                {'type':ProviderTypeEnum.OPTIONS, 'value':myJSON2}
                                            ]}


    />,   document.getElementById('intelligent-select-tree-root'));
