export function addNewOptions(options) {
    return {
        type: "ADD_NEW_OPTIONS",
        payload: options
    }
}
export function toggleExpanded(optionID) {
    return {
        type: "TOGGLE_EXPANDED_FOR_OPTION",
        payload: optionID
    }
}

export function addSelectedOption(option) {
    return{
        type: "ADD_SELECTED_OPTIONS",
        payload: option
    }
}

export function setExpandedForAll(value) {
    return {
        type: "SET_EXPANDED_FOR_ALL",
        payload: value
    }
}