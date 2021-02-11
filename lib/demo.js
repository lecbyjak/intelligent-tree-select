"use strict";

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _data = _interopRequireDefault(require("../examples/data/data.json"));

var _IntelligentTreeSelect = require("./components/IntelligentTreeSelect");

require("./styles.css");

require("bootstrap/dist/css/bootstrap.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_reactDom.default.render( /*#__PURE__*/_react.default.createElement(_IntelligentTreeSelect.IntelligentTreeSelect //name={"main_search"}
, {
  fetchOptions: ({
    searchString,
    optionID,
    limit,
    offset
  }) => new Promise(resolve => {
    //console.log({searchString, optionID, limit, offset});
    setTimeout(resolve, 1000, [{
      "@id": "http://onto.fel.cvut.cz/ontologies/eccairs/aviation-3.4.0.2/vl-a-390/v-3000000",
      "http://www.w3.org/2000/01/rdf-schema#label": "3000000 - Consequential Events new",
      "http://www.w3.org/2000/01/rdf-schema#comment": "An event evolving from another event.",
      "subTerm": ["http://onto.fel.cvut.cz/ontologies/eccairs/aviation-3.4.0.2/vl-a-390/v-99010132"]
    }]);
  }),
  valueKey: "@id",
  labelKey: "http://www.w3.org/2000/01/rdf-schema#label",
  childrenKey: "subTerm",
  simpleTreeData: true,
  isMenuOpen: true,
  options: _data.default,
  displayInfoOnHover: true,
  onOptionCreate: option => {
    console.log('created', option);
  }
}), document.getElementById('app'));