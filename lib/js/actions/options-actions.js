"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.addNewOptions = addNewOptions;
exports.addChildrenToParent = addChildrenToParent;
exports.toggleExpanded = toggleExpanded;
exports.addSelectedOption = addSelectedOption;
exports.setExpandedForAll = setExpandedForAll;
exports.addToHistory = addToHistory;
function addNewOptions(options) {
    return {
        type: "ADD_NEW_OPTIONS",
        payload: {
            options: options
        }
    };
}
function addChildrenToParent(childrenID, parentID) {
    return {
        type: "ADD_CHILDREN_TO_PARENT",
        payload: {
            childrenID: childrenID,
            parentID: parentID
        }
    };
}

function toggleExpanded(optionID) {
    return {
        type: "TOGGLE_EXPANDED_FOR_OPTION",
        payload: {
            optionID: optionID
        }
    };
}

function addSelectedOption(option) {
    return {
        type: "ADD_SELECTED_OPTIONS",
        payload: option
    };
}

function setExpandedForAll(value) {
    return {
        type: "SET_EXPANDED_FOR_ALL",
        payload: value
    };
}

function addToHistory(searchString, data, validTo) {
    return {
        type: "ADD_TO_HISTORY",
        payload: {
            searchString: searchString,
            data: data,
            validTo: validTo
        }
    };
}