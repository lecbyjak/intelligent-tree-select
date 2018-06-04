export  function setCurrentSearchInput(value) {
    return {
        type: "SET_CURRENT_SEARCH_INPUT",
        payload: value
    }
}
export function toggleModalWindow() {
    return {
        type: "TOGGLE_MODAL_WINDOW",
    }
}

export function toggleModalWindowButtonTooltip() {
    return {
        type: "TOGGLE_MODAL_WINDOW_BUTTON_TOOLTIP",
    }
}

export function toggleModalFormAdvancedOptions() {
    return {
        type: "TOGGLE_MODAL_FORM_ADVANCED_OPTIONS",
    }
}