'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _events = require('../examples/data/events.json');

var _events2 = _interopRequireDefault(_events);

require('./styles.css');

var _IntelligentTreeSelect = require('./components/IntelligentTreeSelect');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_reactDom2.default.render(_react2.default.createElement(_IntelligentTreeSelect.IntelligentTreeSelect, {
      loadOptions: ({ searchString, optionID, limit, offset }) => new Promise(resolve => setTimeout(resolve, 1500, _events2.default)),
      valueKey: "@id",
      labelKey: "http://www.w3.org/2000/01/rdf-schema#label",
      childrenKey: "subTerm",
      simpleTreeData: true,
      options: _events2.default
}), document.getElementById('app'));