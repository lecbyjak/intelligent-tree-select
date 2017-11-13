class OptionsUtils{

    constructor(settings) {
        this.settings = settings;
        this.options = [];
        this.processedOptions = [];
    }

    mergeOptions(options) {
        let mergedArr = [];
        while (options.length > 0) {
            let currOption = options.shift();
            let conflicts = options.filter(object => object['@id'] === currOption['@id']);

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
            let category = option['@type'];
            let label = option[this.settings.filterBy][0]['@value'];
            return {
                id: option['@id'],
                label: label,
                category: category
            };
        });
        return this.processedOptions
    }

    addNewOptions(newOptions){
        this.options.concat(newOptions);
        this.processOptions(this.mergeOptions(this.options));
    }

    getAllOptions(){
        return this.options
    }

    getAllProcessedOptions(){
        return this.processedOptions
    }
}

export default OptionsUtils;