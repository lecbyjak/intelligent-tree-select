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

            let options = action.payload.concat(state.options);
            let mergedArr = [];

            while (options.length > 0) {
                let currOption = options.shift();
                let conflicts = options.filter(object => object.id === currOption.id);
                if (conflicts.length > 0) currOption.state = optionStateEnum.MERGED;
                conflicts.forEach(conflict => {
                    currOption.children = currOption.children.concat(conflict.children)
                });
                mergedArr.push(Object.assign({}, ...conflicts.reverse(), currOption));
                conflicts.forEach(conflict => options.splice(
                    options.findIndex(el => el.id === conflict.id), 1)
                );
            }

            //Add parent value to options
            mergedArr.forEach((option) => {
                option.children.forEach((childID) => {
                    const index = mergedArr.findIndex((obj) => obj.id === childID);
                    mergedArr[index].parent = option.id;
                })
            });
            let counter = 0;
            let sortedArr = [];
            mergedArr.forEach((option) => {
                if (!option.parent) {
                    sortedArr = _createGraph(mergedArr, option.id, 0, counter, sortedArr);
                    counter++
                }
            });

            return {
                ...state,
                options: sortedArr,
            };
        case  "TOGGLE_EXPANDED_FOR_OPTION":
            const index = state.options.findIndex((obj) => obj.id === action.payload);
            console.log("TOGGLE_EXPANDED_FOR_OPTION", state.options[index], index, action.payload)
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



function _createGraph(options, key, depth, graph, sortedArr) {
    const index = options.findIndex((obj) => obj.id === key);
    options[index].depth = depth;
    options[index].graph = graph;

    let counter = 0;
    sortedArr.push(options[index]);
    options[index].children.forEach((child) => {
        sortedArr = _createGraph(options, child, depth+1, graph+"-"+counter, sortedArr);
        counter++
    });
    return sortedArr
}
