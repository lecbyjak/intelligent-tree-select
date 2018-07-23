'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _events = require('../examples/data/events.json');

var _events2 = _interopRequireDefault(_events);

require('./styles.css');

var _App = require('./components/App');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const provider1 = {
  name: "provider1",
  response: searchInput => new Promise(resolve => setTimeout(resolve, 1500, _events2.default)),
  simpleTreeData: true,
  labelKey: "http://www.w3.org/2000/01/rdf-schema#label",
  valueKey: "@id",
  childrenKey: "subTerm"
};

_reactDom2.default.render(_react2.default.createElement(_App.IntelligentTreeSelect, { simpleTreeData: true,
  localOptions: _events2.default,
  valueKey: "@id",
  labelKey: "http://www.w3.org/2000/01/rdf-schema#label"
  //labelValue={(labelKey) => labelKey[0]['@value']}
  , childrenKey: "subTerm",

  providers: [provider1]
}), document.getElementById('app'));