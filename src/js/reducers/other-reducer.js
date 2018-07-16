export default function (state={
    currentSearch: "",
    modalWindowVisible: false,
    modalWindowButtonTooltipVisible: false,
    modalFormAdvancedOptionsVisible: false,
}, action) {
    switch (action.type){
        case "SET_CURRENT_SEARCH_INPUT":
            return {
                ...state,
                currentSearch: action.payload,
            };
        case "TOGGLE_MODAL_WINDOW":
            return {
                ...state,
                modalWindowVisible: !state.modalWindowVisible,
                modalFormAdvancedOptionsVisible: false,
            };
        case "TOGGLE_MODAL_WINDOW_BUTTON_TOOLTIP":
            return {
                ...state,
                modalWindowButtonTooltipVisible: !state.modalWindowButtonTooltipVisible,
            };
        case "TOGGLE_MODAL_FORM_ADVANCED_OPTIONS":
            return {
                ...state,
                modalFormAdvancedOptionsVisible: !state.modalFormAdvancedOptionsVisible,
            };
        default:
            return state;
    }
}