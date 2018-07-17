"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.toggleSettings = toggleSettings;
exports.toggleExpanded = toggleExpanded;
exports.toggleOptionStateDisplay = toggleOptionStateDisplay;
exports.toggleDisplayOptionInfoOnHover = toggleDisplayOptionInfoOnHover;
exports.toggleRenderAsTree = toggleRenderAsTree;
exports.initSettings = initSettings;
exports.toggleMultiselect = toggleMultiselect;
function toggleSettings() {
    return {
        type: "TOGGLE_SETTINGS"
    };
}

function toggleExpanded() {
    return {
        type: "TOGGLE_EXPANDED"
    };
}

function toggleOptionStateDisplay() {
    return {
        type: "TOGGLE_OPTION_STATE_DISPLAY"
    };
}

function toggleDisplayOptionInfoOnHover() {
    return {
        type: "TOGGLE_DISPLAY_OPTION_INFO_ON_HOVER"
    };
}

function toggleRenderAsTree() {
    return {
        type: "TOGGLE_RENDER_AS_TREE"
    };
}

function initSettings(data) {
    return {
        type: "INIT_SETTINGS",
        payload: data
    };
}

function toggleMultiselect() {
    return {
        type: "TOGGLE_MULTISELECT"
    };
}