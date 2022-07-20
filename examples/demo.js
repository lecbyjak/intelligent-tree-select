import React from "react";
import ReactDOM from "react-dom";

import data from "./data/data.json";
import {IntelligentTreeSelect} from "../src/components/IntelligentTreeSelect";
import "../src/styles.css";
import "bootstrap/dist/css/bootstrap.css";

ReactDOM.render(
  <IntelligentTreeSelect
    //name={"main_search"}
    fetchOptions={({searchString, optionID, limit, offset}) =>
      new Promise((resolve) => {
        //console.log({searchString, optionID, limit, offset});
        setTimeout(resolve, 4000, [
          {
            "@id": "http://onto.fel.cvut.cz/ontologies/eccairs/aviation-3.4.0.2/vl-a-390/v-3000000",
            "http://www.w3.org/2000/01/rdf-schema#label": "3000000 - Consequential Events new",
            "http://www.w3.org/2000/01/rdf-schema#comment": "An event evolving from another event.",
            subTerm: ["http://onto.fel.cvut.cz/ontologies/eccairs/aviation-3.4.0.2/vl-a-390/v-99010132"],
          },
        ]);
      })
    }
    value={["http://onto.fel.cvut.cz/ontologies/eccairs/aviation-3.4.0.2/vl-a-390/v-3000000"]}
    valueKey={"@id"}
    valueIsControlled={false}
    labelKey={"http://www.w3.org/2000/01/rdf-schema#label"}
    childrenKey={"subTerm"}
    simpleTreeData={true}
    options={data}
    isMenuOpen={true}
    displayInfoOnHover={true}
    onOptionCreate={(option) => {
      console.log("created", option);
    }}
  />,
  document.getElementById("app")
);
