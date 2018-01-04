import {optionStateEnum} from "../containers/App";

export default function (state={
    options: [],
    selectedOptions: [],
}, action) {
    switch (action.type){
        case "ADD_SELECTED_OPTIONS":
            return {
                ...state,
                selectedOptions: action.payload
            };
        case "ADD_NEW_OPTIONS":

            let options = action.payload.options.concat(state.options);
            let mergedArr = [];

            //merge options
            while (options.length > 0) {
                let currOption = options.shift();

                //if not array make an array
                if (!Array.isArray(currOption[action.payload.childrenKey])) {
                    if (currOption[action.payload.childrenKey]) currOption[action.payload.childrenKey] = [currOption[action.payload.childrenKey]];
                else currOption[action.payload.childrenKey] = []
                }

                let conflicts = options.filter(object => object[action.payload.valueKey] === currOption[action.payload.valueKey]);
                if (conflicts.length > 0) currOption.state = optionStateEnum.MERGED;
                conflicts.forEach(conflict => {

                    if (!Array.isArray(conflict[action.payload.childrenKey])) {
                        if (conflict[action.payload.childrenKey]) conflict[action.payload.childrenKey] = [conflict[action.payload.childrenKey]];
                    else conflict[action.payload.childrenKey] = []
                    }

                    currOption[action.payload.childrenKey] = currOption[action.payload.childrenKey].concat(conflict[action.payload.childrenKey])
                });
                mergedArr.push(Object.assign({}, ...conflicts.reverse(), currOption));
                conflicts.forEach(conflict => options.splice(
                    options.findIndex(el => el[action.payload.valueKey] === conflict[action.payload.valueKey]), 1)
                );
            }

            return {
                ...state,
                options: mergedArr,
            };
        case  "TOGGLE_EXPANDED_FOR_OPTION":
            const index = state.options.findIndex((obj) => obj[action.payload.valueKey] === action.payload.optionID);
            console.log("TOGGLE_EXPANDED_FOR_OPTION", state.options[index], index, action.payload.optionID);
            state.options[index].expanded = !state.options[index].expanded;
            return {
                ...state,
                options: state.options
            };
        case "SET_EXPANDED_FOR_ALL":
            state.options.forEach(options => options.expanded = action.payload);
            return {
                ...state,
                options: state.options,
            };
        default:
            return state;
    }
}
