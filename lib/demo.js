'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _data = require('../examples/data/data.json');

var _data2 = _interopRequireDefault(_data);

var _IntelligentTreeSelect = require('./components/IntelligentTreeSelect');

require('./styles.css');

require('bootstrap/dist/css/bootstrap.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_reactDom2.default.render(_react2.default.createElement(_IntelligentTreeSelect.IntelligentTreeSelect
//name={"main_search"}
, { fetchOptions: ({ searchString, optionID, limit, offset }) => new Promise(resolve => {
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
  options: _data2.default,
  onOptionCreate: option => {
    console.log('created', option);
  }
}), document.getElementById('app'));