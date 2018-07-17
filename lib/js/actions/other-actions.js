"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.setCurrentSearchInput = setCurrentSearchInput;
exports.toggleModalWindow = toggleModalWindow;
exports.toggleModalWindowButtonTooltip = toggleModalWindowButtonTooltip;
exports.toggleModalFormAdvancedOptions = toggleModalFormAdvancedOptions;
function setCurrentSearchInput(value) {
    return {
        type: "SET_CURRENT_SEARCH_INPUT",
        payload: value
    };
}
function toggleModalWindow() {
    return {
        type: "TOGGLE_MODAL_WINDOW"
    };
}

function toggleModalWindowButtonTooltip() {
    return {
        type: "TOGGLE_MODAL_WINDOW_BUTTON_TOOLTIP"
    };
}

function toggleModalFormAdvancedOptions() {
    return {
        type: "TOGGLE_MODAL_FORM_ADVANCED_OPTIONS"
    };
}