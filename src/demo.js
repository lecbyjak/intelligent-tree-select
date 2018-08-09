import React from 'react'
import ReactDOM from 'react-dom'

import data from '../examples/data/data.json'
import './styles.css';
import {IntelligentTreeSelect} from './components/IntelligentTreeSelect';


ReactDOM.render(
  <IntelligentTreeSelect
        //name={"main_search"}
        fetchOptions={({searchString, optionID, limit, offset}) => new Promise((resolve) => {
          //console.log({searchString, optionID, limit, offset});
          setTimeout(resolve, 1000, data)
        })}
        valueKey={"@id"}
        labelKey={"http://www.w3.org/2000/01/rdf-schema#label"}
        childrenKey={"subTerm"}
        simpleTreeData={true}
        options={data}
  />,
  document.getElementById('app')
);


