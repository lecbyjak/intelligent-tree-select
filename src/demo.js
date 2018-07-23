import React from 'react'
import ReactDOM from 'react-dom'
import myJSON3 from '../examples/data/events.json'
import './styles.css';
import {IntelligentTreeSelect} from './components/containers/App';


const provider1 = {
  name: "provider1",
  response: (searchInput) => new Promise((resolve) => setTimeout(resolve, 1500, myJSON3)),
  simpleTreeData: true,
  labelKey: "http://www.w3.org/2000/01/rdf-schema#label",
  valueKey: "@id",
  childrenKey: "subTerm",
};

ReactDOM.render(
    <IntelligentTreeSelect simpleTreeData={true}
                                    localOptions={myJSON3}
                                    valueKey={"@id"}
                                    labelKey={"http://www.w3.org/2000/01/rdf-schema#label"}
      //labelValue={(labelKey) => labelKey[0]['@value']}
                                    childrenKey={"subTerm"}

                                    providers={[
                                      provider1,
                                    ]}
    />,
  document.getElementById('app')
);


