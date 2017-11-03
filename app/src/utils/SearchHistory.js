class SearchHistory{

    constructor(settings) {
        this.settings = settings;
        this.history = [
            // {searchString:'abc', results:[resultsArr], timestamp:123564789}
        ]
    }

    addToHistory(searchString, resultsArr){
        let x = this.getResultsFromHistory(searchString);
        if (x.length === 0){
            this.history.push({searchString:searchString, results:resultsArr, timestamp:Date.now()});
        }
    }

    getResultsFromHistory(searchString){
        for (let i=0; i<this.history.length; i++){
            if(this.history[i].searchString.toLowerCase() === searchString.toLowerCase()){
                const now = Date.now();
                let termTimestamp = this.history[i].timestamp;
                const validFor = this.settings.termLifetime;

                //TODO validity of timestamp
                //console.log(now, termTimestamp, validFor);

                return this.history[i].results
            }
        }
        return []
    }


}

export default SearchHistory;