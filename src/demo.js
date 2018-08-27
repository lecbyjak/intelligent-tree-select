import React from 'react'
import ReactDOM from 'react-dom'

import data from '../examples/data/data.json'
import {IntelligentTreeSelect} from './components/IntelligentTreeSelect';
import './styles.css';
import 'bootstrap/dist/css/bootstrap.css';


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
        isMenuOpen={true}
        options={data}
        //filterComponent={(data)=>{console.log(data); return null}}
        //onOptionCreate={(option) => {console.log('created', option)}}
  />,
  document.getElementById('app')
);


