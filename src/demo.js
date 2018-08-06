import React from 'react'
import ReactDOM from 'react-dom'

import myJSON3 from '../examples/data/events.json'
import './styles.css';
import {IntelligentTreeSelect} from './components/IntelligentTreeSelect';


ReactDOM.render(
  <IntelligentTreeSelect
        loadOptions={({searchString, optionID, limit, offset}) => new Promise((resolve) => setTimeout(resolve, 1500, myJSON3))}
        valueKey={"@id"}
        labelKey={"http://www.w3.org/2000/01/rdf-schema#label"}
        childrenKey={"subTerm"}
        simpleTreeData={true}
        options={myJSON3}
  />,
  document.getElementById('app')
);


