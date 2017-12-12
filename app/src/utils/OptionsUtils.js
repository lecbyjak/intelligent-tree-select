class OptionsUtils {

    constructor(settings) {
        this.settings = settings;
        this.options = [];
        this.processedOptions = [];
    }

    _mergeOptions(options) {

        options = options.concat(this.options);

        let mergedArr = [];
        while (options.length > 0) {
            let currOption = options.shift();
            let conflicts = options.filter(object => object['@id'] === currOption['@id']);
            if (conflicts.length > 0) currOption['state'] = optionStateEnum.MERGED;

            currOption['subTerm'] = [currOption['subTerm']];
            conflicts.forEach(conflict => {
                currOption['subTerm'].push(conflict['subTerm'])
            });

            mergedArr.push(Object.assign({}, ...conflicts.reverse(), currOption));

            conflicts.forEach(conflict => options.splice(
                options.findIndex(el => el['@id'] === conflict['@id']), 1)
            );
        }
        this.options = mergedArr;
        return mergedArr

    }

    _processOptions(options) {
        this.processedOptions = options.map(option => {

            let keys = [];
            for (let k in option) keys.push(k);

            let category = (keys.includes('@type')) ? option['@type'] : [];
            let label = option[this.settings.filterBy];
            let parent = (keys.includes('parent')) ? option['parent'] : "";
            let subTerm = (keys.includes('subTerm')) ? option['subTerm'] : [];
            let state = (keys.includes('state')) ? option['state'] : optionStateEnum.EXTERNAL;
            let providers = option['providers'];

            return {
                id: option['@id'],
                label: label,
                category: category,
                parent: parent,
                subTerm: subTerm,
                state: state,
                providers: providers,
            };
        });
        return this.processedOptions
    }

    addNewOptions(newOptions, provider) {
        for (let i = 0; i < newOptions.length; i++) {
            newOptions[i]['providers'] = [provider]
        }
        this._processOptions(this._mergeOptions(newOptions));

        for (let j=0; j<this.processedOptions.length; j++){
            this._processOptionSubTerms(this.processedOptions[j]);
        }

        console.log('processed', this.processedOptions)
    }

    _processOptionSubTerms(currOption) {
        for (let i = 0; i < currOption['subTerm'].length; i++) {
            if (currOption['subTerm'][i]) {
                let currSubTerm = this.getProcessedByID(currOption['subTerm'][i]);
                this._processOptionSubTerms(currSubTerm);
                currSubTerm['parent'] = currOption['id'];
                currOption['subTerm'][i] = currSubTerm;
                this._removeFromProcessedByID(currSubTerm['id'])
            }
            else{
                currOption['subTerm'].splice(i, 1);
            }
        }

    }

    _removeFromProcessedByID(id) {
        for (let i = 0; i < this.processedOptions.length; i++)
            if (this.processedOptions[i]['id'] && this.processedOptions[i]['id'] === id) {
                this.processedOptions.splice(i, 1);
                break;
            }
    }

    getAllOptions() {
        return this.options
    }

    getAllProcessedOptions() {
        //return copy of an array
        return JSON.parse(JSON.stringify(this.processedOptions));
    }

    getProcessedByID(id) {
        for (let i = 0; i < this.processedOptions.length; i++) {
            if (id === this.processedOptions[i].id) return this.processedOptions[i]
        }
        console.log('unable to find term by id:', id)
    }

    getOriginalByID(id) {
        for (let i = 0; i < this.options.length; i++) {
            if (id === this.options[i].id) return this.options[i]
        }
    }
}


const optionStateEnum = {
    MERGED: {label: 'Merged', color: 'warning', tooltip: ''},
    EXTERNAL: {label: 'External', color: 'primary', tooltip: ''},
    NEW: {label: 'New', color: 'success', tooltip: 'not verified'},
    LOCAL: {label: 'Local', color: 'secondary', tooltip: ''},
};

export {OptionsUtils, optionStateEnum};
