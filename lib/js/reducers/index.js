'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _redux = require('redux');

var _settingsReducer = require('./settings-reducer');

var _settingsReducer2 = _interopRequireDefault(_settingsReducer);

var _optionsReducer = require('./options-reducer');

var _optionsReducer2 = _interopRequireDefault(_optionsReducer);

var _otherReducer = require('./other-reducer');

var _otherReducer2 = _interopRequireDefault(_otherReducer);

var _reduxForm = require('redux-form');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import FormReducer from './form-reducer';
var allReducers = (0, _redux.combineReducers)({
    settings: _settingsReducer2.default,
    options: _optionsReducer2.default,
    form: _reduxForm.reducer,
    other: _otherReducer2.default
});

exports.default = allReducers;