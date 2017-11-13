class Settings {

    constructor(filterBy, termLifetime, displayTermState, displayTermCategory, displayParent, compactMode) {
        this._filterBy = filterBy;
        this._termLifetime = termLifetime;
        this._displayTermState = displayTermState;
        this._displayTermCategory = displayTermCategory;
        this._displayParent = displayParent;
        this._compactMode = compactMode;

        //calling setter for termLifetime
        this.termLifetime = termLifetime
    }

    get filterBy() {
        return this._filterBy;
    }

    set filterBy(value) {
        this._filterBy = value;
    }

    get termLifetime() {
        return this._termLifetime;
    }

    set termLifetime(value) {
        this._termLifetime = {
            days: 0,
            hours: 0,
            minutes: 30,
            seconds: 0,
        };
        if (/^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/.test(value)) {
            let tmp = /^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/.exec(value);
            this._termLifetime = {
                days: parseInt(tmp[1], 10),
                hours: parseInt(tmp[2], 10),
                minutes: parseInt(tmp[3], 10),
                seconds: parseInt(tmp[4], 10),
            };
        } else {
            throw new Error("Invalid termLifetime. Expecting format: e.g. 1d10h5m6s ")
        }
    }

    get displayValue() {
        return this._displayValue;
    }

    set displayValue(value) {
        this._displayValue = value;
    }

    get displayTermState() {
        return this._displayTermState;
    }

    set displayTermState(value) {
        this._displayTermState = value;
    }

    get displayTermCategory() {
        return this._displayTermCategory;
    }

    set displayTermCategory(value) {
        this._displayTermCategory = value;
    }

    get displayParent() {
        return this._displayParent;
    }

    set displayParent(value) {
        this._displayParent = value;
    }

    get compactMode() {
        return this._compactMode;
    }

    set compactMode(value) {
        this._compactMode = value;
    }
}

export default Settings;