'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _data = require('../examples/data/data.json');

var _data2 = _interopRequireDefault(_data);

require('./styles.css');

var _IntelligentTreeSelect = require('./components/IntelligentTreeSelect');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_reactDom2.default.render(_react2.default.createElement(_IntelligentTreeSelect.IntelligentTreeSelect
//name={"main_search"}
, { fetchOptions: ({ searchString, optionID, limit, offset }) => new Promise(resolve => {
    //console.log({searchString, optionID, limit, offset});
    setTimeout(resolve, 1000, _data2.default);
  }),
  valueKey: "@id",
  labelKey: "http://www.w3.org/2000/01/rdf-schema#label",
  childrenKey: "subTerm",
  simpleTreeData: true,
  options: _data2.default
}), document.getElementById('app'));