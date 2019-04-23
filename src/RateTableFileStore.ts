import { RateTable } from "./RateTable"

import * as fs from 'fs';

import * as config from "config";
import { IRateTableStore } from "./IRateTableStore";

let filecache = config.get('filecache') as string; 


export class RateTableFileStore implements IRateTableStore  {

    public async saveRateTable(id: string, rates : RateTable) : Promise<string> {
        this._ratetable = rates;
        // save to file
        let ratestring = JSON.stringify(rates);
        fs.writeFileSync(filecache, ratestring, 'utf8');
        return new Promise((resolve, reject) => {
            resolve(filecache);
        });
    }

    public async getRateTable(id: string) : Promise<RateTable> {
        if (this._ratetable == null) {
            // load from file
            if (fs.existsSync(filecache)) {
                this._ratetable = new RateTable(fs.readFileSync(filecache, 'utf8'));
            } else {
                return null;
            }
        }
        return new Promise((resolve, reject) => {
            resolve(this._ratetable);
        });
    }

    private _ratetable : RateTable
}
