import { memorySizeOf } from "./memorySizeOfObject"

class SearchHistory {

    constructor(settings) {
        this.settings = settings;
        this.validFor = SearchHistory._getValidForInSec(this.settings.termLifetime);
        this.history = [
            // {searchString:'abc', results:[resultsArr], timestamp:123564789}
        ]
    }

    addToHistory(searchString, resultsArr) {
        if (!this.isInHistory(searchString)) {
            //pushing to the front of an array
            console.log("adding to history: ", searchString, resultsArr)
            this.history.unshift({searchString: searchString, results: resultsArr, timestamp: Date.now(), valid: true});
        }
    }

    invalidateHistory(){
        for (let i =  0; i<this.history.length;i++){
            this.history[i].valid = false
        }
    }

    getResultsFromHistory(searchString) {
        console.log('history', this.history);
        console.log(memorySizeOf(this.history));
        searchString = searchString.toLowerCase();
        const now = Date.now();

        for (let i = 0; i < this.history.length; i++) {
            if (this.history[i].valid && this.history[i].searchString.toLowerCase() === searchString) {
                if (((now - this.history[i].timestamp) / 1000) <= this.validFor) return this.history[i].results;
                this.history[i].valid = false;
            }
        }
        return []
    }

    isInHistory(searchString){
        searchString = searchString.toLowerCase();
        const now = Date.now();

        for (let i = 0; i < this.history.length; i++) {
            if (this.history[i].valid && this.history[i].searchString.toLowerCase() === searchString) {
                if (((now - this.history[i].timestamp) / 1000) <= this.validFor) return true;
                this.history[i].valid = false;
            }
        }
        return false
    }

    static _getValidForInSec(termLifetime) {
        let res = 0;
        res += (isNaN(termLifetime.seconds) ? 0 : termLifetime.seconds);
        res += (isNaN(termLifetime.minutes) ? 0 : termLifetime.minutes * 60);
        res += (isNaN(termLifetime.hours) ? 0 : termLifetime.hours * 60 * 60);
        res += (isNaN(termLifetime.days) ? 0 : termLifetime.days * 60 * 60 * 24);
        return res
    }

}

export default SearchHistory;