export function addNewOptions(options, labelKey, valueKey, childrenKey) {
    return {
        type: "ADD_NEW_OPTIONS",
        payload: {
            options,
            labelKey,
            valueKey,
            childrenKey,
        }
    }
}
export function toggleExpanded(optionID, valueKey) {
    return {
        type: "TOGGLE_EXPANDED_FOR_OPTION",
        payload: {
            optionID,
            valueKey
        }
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