class Settings{

    constructor(filterBy, termLifetime) {
        this.filterBy = filterBy;
        this.termLifetime = {
                days: 0,
                hours: 0,
                minutes: 30,
                seconds: 0,
            };
        if (/^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/.test(termLifetime)){
            let tmp = /^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/.exec(termLifetime);
            this.termLifetime = {
                days: parseInt(tmp[1], 10),
                hours: parseInt(tmp[2], 10),
                minutes: parseInt(tmp[3], 10),
                seconds: parseInt(tmp[4], 10),
            };
        }else{
            throw new Error("Invalid termLifetime. Expecting format: e.g. 1d10h5m6s ")
        }
    }
}

export default Settings;