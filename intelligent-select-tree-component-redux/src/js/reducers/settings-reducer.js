export default function (state={
    settingsOpened: false,
    expanded: true,
    displayState: true,
    displayInfoOnHover: false,
    renderAsTree: false,
    multi: true,
    labelKey: 'label',
    valueKey: 'value',
    childrenKey: 'children',
}, action) {
    switch (action.type){
        case "TOGGLE_SETTINGS":
            return {
                ...state,
                settingsOpened: !state.settingsOpened,
            };
        case "TOGGLE_EXPANDED":
            return {
                ...state,
                expanded: !state.expanded,
            };
        case "TOGGLE_OPTION_STATE_DISPLAY":
            return {
                ...state,
                displayState: !state.displayState,
            };
        case "TOGGLE_DISPLAY_OPTION_INFO_ON_HOVER":
            return {
                ...state,
                displayInfoOnHover: !state.displayInfoOnHover,
            };
        case "TOGGLE_RENDER_AS_TREE":
            return {
                ...state,
                renderAsTree: !state.renderAsTree,
            };
        case "TOGGLE_MULTISELECT":
            return {
                ...state,
                multi: !state.multi,
            };
        case "INIT_SETTINGS":
            return{
                ...state,
                displayState: action.payload.displayState,
                displayInfoOnHover: action.payload.displayInfoOnHover,
                expanded: action.payload.expanded,
                renderAsTree: action.payload.renderAsTree,
                multi: action.payload.multi,
                labelKey: action.payload.labelKey,
                valueKey: action.payload.valueKey,
                childrenKey: action.payload.childrenKey,
            };
        default:
            return state;
    }
}