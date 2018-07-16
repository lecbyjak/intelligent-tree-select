export function toggleSettings() {
    return {
        type: "TOGGLE_SETTINGS",
    }
}

export function toggleExpanded() {
    return {
        type: "TOGGLE_EXPANDED",
    }
}

export function toggleOptionStateDisplay() {
    return {
        type: "TOGGLE_OPTION_STATE_DISPLAY",
    }
}


export function toggleDisplayOptionInfoOnHover() {
    return {
        type: "TOGGLE_DISPLAY_OPTION_INFO_ON_HOVER",
    }
}

export function toggleRenderAsTree() {
    return {
        type: "TOGGLE_RENDER_AS_TREE",
    }
}

export function initSettings(data) {
    return {
        type: "INIT_SETTINGS",
        payload: data,
    }
}

export function toggleMultiselect() {
    return {
        type: "TOGGLE_MULTISELECT",
    }
}