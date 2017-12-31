import {combineReducers} from 'redux';
import SettingsReducer from './settings-reducer';
import OptionsReducer from './options-reducer';
//import FormReducer from './form-reducer';
import OtherReducer from './other-reducer';
import {reducer as FormReducer} from "redux-form";

const allReducers = combineReducers({
    settings: SettingsReducer,
    options: OptionsReducer,
    form: FormReducer,
    other: OtherReducer
});

export default allReducers;