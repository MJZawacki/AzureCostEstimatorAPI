import { RateTable } from "./RateTable"

import * as fs from 'fs';

import * as config from "config";
import { IRateTableStore } from "./IRateTableStore";
var path = require('path');

let filecache = config.get('filecache') as string; 


export class RateTableFileStore implements IRateTableStore  {

    public async saveRateTable(id: string, rates : RateTable) : Promise<string> {
        this._ratetable = rates;
        // save to file
        let ratestring = JSON.stringify(rates);
        // create directory if not exist
        if (!fs.existsSync(filecache)) {
            // create dir
            fs.mkdirSync(filecache);
        }
        // set rate file
        var ratefile = path.join(filecache, id);
        fs.writeFileSync(ratefile, ratestring, 'utf8');
        return new Promise((resolve, reject) => {
            resolve(ratefile);
        });
    }

    public async getRateTable(id: string) : Promise<RateTable> {
        if (this._ratetable == null) {
            var ratefile = path.join(filecache, id);
            // load from file
            if (fs.existsSync(ratefile)) {
                this._ratetable = new RateTable(fs.readFileSync(ratefile, 'utf8'));
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
