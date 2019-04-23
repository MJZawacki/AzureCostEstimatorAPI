import { RateTable } from './RateTable'

export interface IRateTableStore {
    saveRateTable(id : string, rates : RateTable) : Promise<string>;
    getRateTable(id : string) : Promise<RateTable>;

}