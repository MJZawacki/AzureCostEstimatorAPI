import { RateTable } from "./RateTable"

import * as fs from 'fs';

import * as config from "config";

let filecache = config.get('filecache') as string; 


export class RateTableFileStore {

    public saveRateTable(rates : RateTable) {
        this._ratetable = rates;
        // save to file
        let ratestring = JSON.stringify(rates);
        fs.writeFileSync(filecache, ratestring, 'utf8');
    }

    public getRateTable() : RateTable {
        if (this._ratetable == null) {
            // load from file
            if (fs.existsSync(filecache)) {
                this._ratetable = new RateTable(fs.readFileSync(filecache, 'utf8'));
            } else {
                return null;
            }
        }
        return this._ratetable;
    }

    private _ratetable : RateTable
}