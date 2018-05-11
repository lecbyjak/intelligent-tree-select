import {optionStateEnum} from "../containers/App";

export default function (state = {
    cashedOptions: [],
    selectedOptions: '',
    history: [],
}, action) {

    switch (action.type) {
        case "ADD_TO_HISTORY":
            let newHistory = state.history;
            newHistory.unshift(action.payload);

            return {
                ...state,
                history: newHistory,
            };
        case "ADD_SELECTED_OPTIONS":
            return {
                ...state,
                selectedOptions: action.payload
            };
        case "ADD_CHILDREN_TO_PARENT":
            let childrenID = action.payload.childrenID;
            let parentID = action.payload.parentID;

            let parentOption =  state.cashedOptions.find(x => x[x.providers[0].valueKey] === parentID);
            let children = parentOption[parentOption.providers[0].childrenKey];
            if (children.indexOf(childrenID) === -1 )  children.push(childrenID);

            return {
                ...state,
                cashedOptions: state.cashedOptions,
            };
        case "ADD_NEW_OPTIONS":

            const _toArray = (object) => {
                let childrenKey = object.providers[0].childrenKey;

                if (!Array.isArray(object[childrenKey])) {
                    if (object[childrenKey]) object[childrenKey] = [object[childrenKey]];
                    else object[childrenKey] = []
                }
                return object;
            };

            let options = action.payload.options.concat(state.cashedOptions);
            let mergedArr = [];

            //merge options
            while (options.length > 0) {
                let currOption = options.shift();

                currOption = _toArray(currOption);

                let conflicts = options.filter(object => {
                    return object[object.providers[0].valueKey] === currOption[currOption.providers[0].valueKey]
                });
                conflicts.forEach(conflict => {
                    conflict = _toArray(conflict);
                    let a = currOption[currOption.providers[0].childrenKey];
                    let b = conflict[conflict.providers[0].childrenKey];
                    currOption[currOption.providers[0].childrenKey] = a.concat(b.filter((item) => a.indexOf(item) < 0));
                });
                mergedArr.push(Object.assign({}, ...conflicts.reverse(), currOption));
                if (currOption.providers.length > 0) currOption.state = optionStateEnum.MERGED;
                conflicts.forEach(conflict => options.splice(
                    options.findIndex(el => el[el.providers[0].valueKey] === conflict[conflict.providers[0].valueKey]), 1)
                );
            }

            return {
                ...state,
                cashedOptions: mergedArr,
            };
        case  "TOGGLE_EXPANDED_FOR_OPTION":
            const index = state.cashedOptions.findIndex((obj) => obj[obj.provider[0].valueKey] === action.payload.optionID);
            console.log("TOGGLE_EXPANDED_FOR_OPTION", state.options[index], index, action.payload.optionID);
            state.cashedOptions[index].expanded = !state.options[index].expanded;
            return {
                ...state,
                cashedOptions: state.options
            };
        case "SET_EXPANDED_FOR_ALL":
            state.cashedOptions.forEach(option => option.expanded = action.payload);
            return {
                ...state,
                cashedOptions: state.cashedOptions,
            };
        default:
            return state;
    }
}