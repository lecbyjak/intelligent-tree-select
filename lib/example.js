'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

require('./css/index.css');

var _App = require('./js/containers/App');

var _redux = require('redux');

var _reducers = require('./js/reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _reactRedux = require('react-redux');

var _reduxLogger = require('redux-logger');

var _events = require('./data/events.json');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var middleware = (0, _redux.applyMiddleware)(_reduxLogger.logger);

//const store = createStore(allReducers, middleware);
var store = (0, _redux.createStore)(_reducers2.default);

var provider1 = {
    name: "provider1",
    response: function response(searchInput) {
        return new _promise2.default(function (resolve) {
            return setTimeout(resolve, 1500, _events2.default);
        });
    },
    simpleTreeData: true,
    labelKey: "http://www.w3.org/2000/01/rdf-schema#label",
    valueKey: "@id",
    childrenKey: "subTerm"
};

_reactDom2.default.render(_react2.default.createElement(
    _reactRedux.Provider,
    { store: store },
    _react2.default.createElement(_App.IntelligentTreeSelectComponent, { simpleTreeData: true,
        localOptions: _events2.default,
        valueKey: "@id",
        labelKey: "http://www.w3.org/2000/01/rdf-schema#label"
        //labelValue={(labelKey) => labelKey[0]['@value']}
        , childrenKey: "subTerm",

        providers: [provider1]
    })
), document.getElementById('intelligent-select-tree-root'));