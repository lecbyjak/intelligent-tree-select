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
            this.history.push({searchString:searchString, results:resultsArr, timestamp:Date.now(), valid:true});
        }
    }

    getResultsFromHistory(searchString){
        console.log('history', this.history);
        for (let i=0; i<this.history.length; i++){
            if(this.history[i].valid && this.history[i].searchString.toLowerCase() === searchString.toLowerCase()){
                const now = Date.now();
                let termTimestamp = this.history[i].timestamp;
                const validFor = this.getValidForInSec(this.settings.termLifetime);
                if(((now-termTimestamp)/1000) <= validFor ){
                    return this.history[i].results
                }
                this.history[i].valid = false;
            }
        }
        return []
    }

    getValidForInSec(termLifetime){
        let res = 0;
        res += (isNaN(termLifetime.seconds)? 0:termLifetime.seconds);
        res += (isNaN(termLifetime.minutes)? 0:termLifetime.minutes*60);
        res += (isNaN(termLifetime.hours)? 0:termLifetime.hours*60*60);
        res += (isNaN(termLifetime.days)? 0:termLifetime.days*60*60*24);
        return res
    }

}

export default SearchHistory;