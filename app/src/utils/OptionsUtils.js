class OptionsUtils {

    constructor(settings) {
        this.settings = settings;
        this.options = [];
        this.processedOptions = [];
    }

    mergeOptions(options) {

        options = options.concat(this.options);

        let mergedArr = [];
        while (options.length > 0) {
            let currOption = options.shift();
            let conflicts = options.filter(object => object['@id'] === currOption['@id']);
            if (conflicts.length > 0) currOption['state'] = optionStateEnum.MERGED;

            mergedArr.push(Object.assign({}, ...conflicts.reverse(), currOption));

            conflicts.forEach(conflict => options.splice(
                options.findIndex(el => el['@id'] === conflict['@id']), 1)
            );
        }
        this.options = mergedArr;
        return mergedArr

    }

    processOptions(options) {
        this.processedOptions = options.map(option => {

            let keys = [];
            for (let k in option) keys.push(k);

            let category = (keys.includes('@type')) ? option['@type'] : [];
            let label = option[this.settings.filterBy][0]['@value'];
            let parent = (keys.includes('@parent')) ? option['@parent'] : "";
            let children = (keys.includes('@children')) ? option['@children'] : [];
            let state = (keys.includes('state')) ? option['state'] : optionStateEnum.EXTERNAL;
            let providers = (keys.includes('providers')) ? option['providers'] : ["local data"];

            return {
                id: option['@id'],
                label: label,
                category: category,
                parent: parent,
                children: children,
                state: state,
                providers: providers,
            };
        });
        //console.log('processed', this.processedOptions);
        return this.processedOptions
    }

    addNewOptions(newOptions, provider) {
        for(let i=0; i<newOptions.length;i++){
            newOptions[i]['providers'] = [provider]
        }
        this.processOptions(this.mergeOptions(newOptions));
    }

    getAllOptions() {
        return this.options
    }

    getAllProcessedOptions() {
        return this.processedOptions
    }
}


const optionStateEnum = {
        MERGED: {label: 'Merged', color: 'warning', tooltip: ''},
        EXTERNAL: {label: 'External', color: 'primary', tooltip: ''},
        NEW: {label: 'New', color: 'success', tooltip: 'not verified'},
        LOCAL: {label: 'Local', color: 'secondary', tooltip: ''},
    };

export {OptionsUtils, optionStateEnum};
